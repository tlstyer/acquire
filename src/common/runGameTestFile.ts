import { GameActionEnum, ScoreBoardIndexEnum, TileEnum } from './enums';
import { UserInputError } from './error';
import { Game } from './game';
import type { ActionBase } from './gameActions/base';
import { ActionDisposeOfShares } from './gameActions/disposeOfShares';
import { ActionGameOver } from './gameActions/gameOver';
import { ActionSelectChainToDisposeOfNext } from './gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from './gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from './gameActions/selectNewChain';
import {
  GameHistoryMessageAllTilesPlayed,
  GameHistoryMessageCouldNotAffordAnyShares,
  GameHistoryMessageDisposedOfShares,
  GameHistoryMessageDrewLastTile,
  GameHistoryMessageDrewPositionTile,
  GameHistoryMessageDrewTile,
  GameHistoryMessageEndedGame,
  GameHistoryMessageFormedChain,
  GameHistoryMessageHasNoPlayableTile,
  GameHistoryMessageMergedChains,
  GameHistoryMessageNoTilesPlayedForEntireRound,
  GameHistoryMessagePlayedTile,
  GameHistoryMessagePurchasedShares,
  GameHistoryMessageReceivedBonus,
  GameHistoryMessageReplacedDeadTile,
  GameHistoryMessageSelectedChainToDisposeOfNext,
  GameHistoryMessageSelectedMergerSurvivor,
  GameHistoryMessageStartedGame,
  GameHistoryMessageTurnBegan,
  type GameHistoryMessage,
} from './gameHistoryMessage';
import { gameToJSON } from './gameSerialization';
import type { GameState, GameStateTileBagTile } from './gameState';
import { getValueOfKey, lowercaseFirstLetter, toTileString, yTileNames } from './helpers';
import {
  PB_GameAction,
  PB_GameAction_DisposeOfShares,
  PB_GameAction_PlayTile,
  PB_GameAction_PurchaseShares,
  PB_GameAction_SelectChainToDisposeOfNext,
  PB_GameAction_SelectMergerSurvivor,
  PB_GameAction_SelectNewChain,
  PB_GameBoardType,
  PB_GameMode,
  PB_GameState_RevealedTileRackTile,
  PB_PlayerArrangementMode,
  type PB_GameState,
} from './pb';

export function runGameTestFile(inputLines: string[]) {
  let game: Game | null = null;
  let gameMode = PB_GameMode.SINGLES_1;
  let playerArrangementMode = PB_PlayerArrangementMode.VERSION_1;
  let tileBag: number[] = [];
  const userIds: number[] = [];
  const usernames: string[] = [];
  let hostUserId = 0;
  let myUserId: number | null = null;

  const outputLines: string[] = [];

  let myPlayerId: number | null = null;
  let lastGameState: GameState | null = null;
  let timestamp: number | null = null;

  for (let lineNumber = 0; lineNumber < inputLines.length; lineNumber++) {
    const line = inputLines[lineNumber];
    if (game === null) {
      if (line.length > 0) {
        const parts = line.split(': ');
        const key = parts[0];
        const value = parts.slice(1).join(': ');
        switch (key) {
          case 'game mode':
            // @ts-expect-error just go with what's in the test file
            gameMode = PB_GameMode[value];
            break;
          case 'player arrangement mode':
            // @ts-expect-error just go with what's in the test file
            playerArrangementMode = PB_PlayerArrangementMode[value];
            break;
          case 'tile bag': {
            tileBag = fromTilesString(value);

            const duplicatedTiles = getDuplicatedTiles(tileBag);
            if (duplicatedTiles.length > 0) {
              outputLines.push(`duplicated tiles in tile bag: ${toTilesString(duplicatedTiles)}`);
            }
            break;
          }
          case 'user': {
            const userParts = value.split(' ');
            userIds.push(parseInt(userParts[0], 10));
            usernames.push(userParts.slice(1).join(' '));
            break;
          }
          case 'host':
            hostUserId = parseInt(value, 10);
            break;
          case 'me':
            myUserId = value === 'null' ? null : parseInt(value, 10);
            break;
          default:
            outputLines.push(`unrecognized line: ${line}`);
            break;
        }
      } else {
        outputLines.push(`game mode: ${PB_GameMode[gameMode]}`);
        outputLines.push(
          `player arrangement mode: ${PB_PlayerArrangementMode[playerArrangementMode]}`,
        );
        if (tileBag.length > 0) {
          outputLines.push(`tile bag: ${toTilesString(tileBag)}`);
        }
        for (let i = 0; i < userIds.length; i++) {
          const userId = userIds[i];
          const username = usernames[i];
          outputLines.push(`user: ${userId} ${username}`);
        }
        outputLines.push(`host: ${hostUserId}`);
        if (myUserId !== null) {
          outputLines.push(`me: ${myUserId}`);
        }

        game = new Game(
          gameMode,
          playerArrangementMode,
          tileBag,
          userIds,
          usernames,
          hostUserId,
          myUserId,
        );

        if (myUserId !== null) {
          myPlayerId = userIds.indexOf(myUserId);
        }
      }
    } else {
      const lineParts = line.split(': ');

      if (lastGameState !== null) {
        outputLines.push(...getGameStateLines(lastGameState, myPlayerId, line !== ''));
        lastGameState = null;
      }

      if (lineParts[0] === 'revealed tile rack tiles') {
        game.processRevealedTileRackTiles(getArrayFromRevealedTileRackTilesString(lineParts[1]));
      } else if (lineParts[0] === 'revealed tile bag tiles') {
        game.processRevealedTileBagTiles(fromTilesString(lineParts[1]));
      } else if (lineParts[0] === 'player ID with playable tile') {
        game.processPlayerIdWithPlayableTile(parseInt(lineParts[1], 10));
      } else if (lineParts[0] === 'timestamp') {
        timestamp = parseInt(lineParts[1], 10);
      } else if (lineParts[0] === 'action') {
        const actionParts = lineParts[1].split(' ');

        const actualGameActionName =
          game.gameActionStack[game.gameActionStack.length - 1].constructor.name.slice(6);
        // @ts-expect-error actualGameActionName is in PB_GameAction
        const actualGameAction: GameActionEnum = GameActionEnum[actualGameActionName];

        let gameAction: PB_GameAction;
        let usingJSONParameters = false;
        if (actionParts.length > 2) {
          if (actionParts[2] === '--') {
            usingJSONParameters = true;
            const json = actionParts.slice(3).join(' ');
            try {
              gameAction = PB_GameAction.create({
                [lowercaseFirstLetter(actualGameActionName)]: JSON.parse(json),
              });
            } catch {
              throw new Error('invalid action JSON');
            }
          } else {
            gameAction = fromParameterStrings(actualGameAction, actionParts.slice(2));
          }
        } else {
          gameAction = PB_GameAction.create({
            [lowercaseFirstLetter(actualGameActionName)]: {},
          });
        }

        outputLines.push('');

        try {
          game.doGameAction(gameAction, timestamp);
          lastGameState =
            game.gameStateHistory.length > 0
              ? game.gameStateHistory[game.gameStateHistory.length - 1]
              : null;
        } catch (error) {
          if (error instanceof UserInputError) {
            let stringParameters = '';
            if (usingJSONParameters) {
              stringParameters = ` -- ${JSON.stringify(getValueOfKey(gameAction))}`;
            } else {
              const arr = toParameterStrings(gameAction);
              if (arr.length > 0) {
                stringParameters = ` ${arr.join(' ')}`;
              }
            }

            if (timestamp !== null) {
              outputLines.push(`timestamp: ${timestamp}`);
            }
            outputLines.push(
              `action: ${
                game.gameStateHistory[game.gameStateHistory.length - 1].nextGameAction.playerId
              } ${actualGameActionName}${stringParameters}`,
            );
            outputLines.push(`  error: ${error.message}`);
          } else {
            outputLines.push(`line with unknown error: ${line}`);
            // @ts-expect-error the test would fail regardless of whether error has a toString() method. this makes the test easier to fix.
            outputLines.push(`  unknown error: ${error.toString()}`);
            if (error instanceof Error) {
              outputLines.push(`  stack trace: ${error.stack}`);
            }
          }
        }

        timestamp = null;
      } else if (line === 'Game JSON:') {
        break;
      }
    }
  }

  if (game !== null) {
    outputLines.push('');
    outputLines.push('Game JSON:');
    outputLines.push(...getFormattedGameJSONLines(game));
  }

  outputLines.push('');

  return { outputLines, game };
}

function getDuplicatedTiles(tileBag: number[]) {
  const tiles = new Set<number>();
  const duplicatedTiles = new Set<number>();
  for (let i = 0; i < tileBag.length; i++) {
    const tile = tileBag[i];
    if (tiles.has(tile)) {
      duplicatedTiles.add(tile);
    }
    tiles.add(tile);
  }

  return [...duplicatedTiles.values()];
}

const abbreviationToGameBoardType = new Map([
  ['L', PB_GameBoardType.LUXOR],
  ['T', PB_GameBoardType.TOWER],
  ['A', PB_GameBoardType.AMERICAN],
  ['F', PB_GameBoardType.FESTIVAL],
  ['W', PB_GameBoardType.WORLDWIDE],
  ['C', PB_GameBoardType.CONTINENTAL],
  ['I', PB_GameBoardType.IMPERIAL],
]);

function fromParameterStrings(gameActionEnum: GameActionEnum, strings: string[]) {
  const gameAction = PB_GameAction.create();

  switch (gameActionEnum) {
    case GameActionEnum.PlayTile: {
      gameAction.playTile = PB_GameAction_PlayTile.create({
        tile: fromTileString(strings[0]),
      });
      break;
    }
    case GameActionEnum.SelectNewChain: {
      gameAction.selectNewChain = PB_GameAction_SelectNewChain.create({
        chain: abbreviationToGameBoardType.get(strings[0]),
      });
      break;
    }
    case GameActionEnum.SelectMergerSurvivor: {
      gameAction.selectMergerSurvivor = PB_GameAction_SelectMergerSurvivor.create({
        chain: abbreviationToGameBoardType.get(strings[0]),
      });
      break;
    }
    case GameActionEnum.SelectChainToDisposeOfNext: {
      gameAction.selectChainToDisposeOfNext = PB_GameAction_SelectChainToDisposeOfNext.create({
        chain: abbreviationToGameBoardType.get(strings[0]),
      });
      break;
    }
    case GameActionEnum.DisposeOfShares: {
      gameAction.disposeOfShares = PB_GameAction_DisposeOfShares.create({
        tradeAmount: parseInt(strings[0], 10),
        sellAmount: parseInt(strings[1], 10),
      });
      break;
    }
    case GameActionEnum.PurchaseShares: {
      gameAction.purchaseShares = PB_GameAction_PurchaseShares.create({
        chains:
          strings[0] !== 'x'
            ? strings[0].split(',').map((s) => abbreviationToGameBoardType.get(s)!)
            : undefined,
        endGame: strings[1] === '1',
      });
      break;
    }
  }

  return gameAction;
}

function toParameterStrings(gameAction: PB_GameAction) {
  const strings: string[] = [];

  if (gameAction.playTile) {
    strings.push(toTileString(gameAction.playTile.tile));
  } else if (gameAction.selectNewChain) {
    strings.push(gameBoardTypeToCharacter.get(gameAction.selectNewChain.chain)!);
  } else if (gameAction.selectMergerSurvivor) {
    strings.push(gameBoardTypeToCharacter.get(gameAction.selectMergerSurvivor.chain)!);
  } else if (gameAction.selectChainToDisposeOfNext) {
    strings.push(gameBoardTypeToCharacter.get(gameAction.selectChainToDisposeOfNext.chain)!);
  } else if (gameAction.disposeOfShares) {
    strings.push(gameAction.disposeOfShares.tradeAmount?.toString());
    strings.push(gameAction.disposeOfShares.sellAmount?.toString());
  } else if (gameAction.purchaseShares) {
    if (gameAction.purchaseShares.chains.length === 0) {
      strings.push('x');
    } else {
      strings.push(
        gameAction.purchaseShares.chains
          .map((p: number) => gameBoardTypeToCharacter.get(p))
          .join(','),
      );
    }
    strings.push(gameAction.purchaseShares.endGame ? '1' : '0');
  }

  return strings;
}

const gameBoardStringSpacer = '            ';

function getGameStateLines(
  gameState: GameState,
  revealedTilesPlayerId: number | null,
  detailed: boolean,
) {
  const lines: string[] = [];

  if (revealedTilesPlayerId !== null) {
    const rtrtStr = getRevealedTileRackTilesStringForPlayer(
      gameState.revealedTileRackTiles,
      revealedTilesPlayerId,
    );
    if (rtrtStr.length > 0) {
      lines.push(`revealed tile rack tiles: ${rtrtStr}`);
    }

    const rtbtStr = getRevealedTileBagTilesStringForPlayer(
      gameState.revealedTileBagTiles,
      revealedTilesPlayerId,
    );
    if (rtbtStr.length > 0) {
      lines.push(`revealed tile bag tiles: ${rtbtStr}`);
    }

    if (gameState.playerIdWithPlayableTile !== null) {
      lines.push(`player ID with playable tile: ${gameState.playerIdWithPlayableTile}`);
    }
  }

  if (gameState.timestamp !== null) {
    lines.push(`timestamp: ${gameState.timestamp}`);
  }

  const arr = toParameterStrings(gameState.gameAction);
  let stringParameters = '';
  if (arr.length > 0) {
    stringParameters = ` ${arr.join(' ')}`;
  }
  lines.push(
    `action: ${gameState.playerId} ${GameActionEnum[gameState.gameActionEnum]}${stringParameters}`,
  );

  if (detailed) {
    const gameBoardLines = getGameBoardLines(gameState.gameBoard);
    const scoreBoardLines = getScoreBoardLines(
      gameState.scoreBoard,
      gameState.scoreBoardAvailable,
      gameState.scoreBoardChainSize,
      gameState.scoreBoardPrice,
      gameState.nextGameAction instanceof ActionGameOver ? -1 : gameState.turnPlayerId,
      gameState.nextGameAction instanceof ActionGameOver ? -1 : gameState.nextGameAction.playerId,
    );
    const numLines = Math.max(gameBoardLines.length, scoreBoardLines.length);
    for (let i = 0; i < numLines; i++) {
      const lineParts = [];
      lineParts.push(i < gameBoardLines.length ? gameBoardLines[i] : gameBoardStringSpacer);
      if (i < scoreBoardLines.length) {
        lineParts.push('  ');
        lineParts.push(scoreBoardLines[i]);
      }
      lines.push(`  ${lineParts.join('')}`);
    }

    lines.push('  tile racks:');
    gameState.tileRacks.forEach((tileRack, playerId) => {
      const tileTypes = gameState.tileRackTypes[playerId];
      lines.push(`    ${playerId}: ${getTileRackString(tileRack, tileTypes)}`);
    });

    if (gameState.revealedTileRackTiles.length > 0) {
      const str = gameState.revealedTileRackTiles
        .map((trt) => `${toTileString(trt.tile)}:${trt.playerIdBelongsTo.toString()}`)
        .join(', ');
      lines.push(`  revealed tile rack tiles: ${str}`);
    }

    if (gameState.revealedTileBagTiles.length > 0) {
      const str = gameState.revealedTileBagTiles
        .map(
          (tbt) =>
            `${toTileString(tbt.tile)}:${
              tbt.playerIdWithPermission === null ? 'all' : tbt.playerIdWithPermission.toString()
            }`,
        )
        .join(', ');
      lines.push(`  revealed tile bag tiles: ${str}`);
    }

    if (gameState.playerIdWithPlayableTile !== null) {
      lines.push(`  player ID with playable tile: ${gameState.playerIdWithPlayableTile}`);
    }

    lines.push('  messages:');
    gameState.createPlayerAndWatcherGameStates();
    for (let playerId = 0; playerId < gameState.playerGameStates.length; playerId++) {
      lines.push(
        `    ${playerId}: ${formatPlayerOrWatcherGameState(gameState.playerGameStates[playerId])}`,
      );
    }
    lines.push(`    w: ${formatPlayerOrWatcherGameState(gameState.watcherGameState)}`);

    lines.push('  history messages:');
    gameState.gameHistoryMessages.forEach((ghm) => {
      lines.push(`    ${getGameHistoryMessageString(ghm)}`);
    });

    lines.push(`  next action: ${getNextActionString(gameState.nextGameAction)}`);
  }

  return lines;
}

function getRevealedTileRackTilesStringForPlayer(
  revealedTileRackTiles: PB_GameState_RevealedTileRackTile[],
  playerId: number,
) {
  const parts: string[] = [];

  for (let i = 0; i < revealedTileRackTiles.length; i++) {
    const rtrt = revealedTileRackTiles[i];
    if (rtrt.playerIdBelongsTo !== playerId) {
      parts.push(`${toTileString(rtrt.tile)}:${rtrt.playerIdBelongsTo}`);
    }
  }

  return parts.join(', ');
}

function formatPlayerOrWatcherGameState(gameState: PB_GameState) {
  return JSON.stringify({
    gameAction: gameState.gameAction,
    timestamp: gameState.timestamp !== 0 ? gameState.timestamp : undefined,
    revealedTileRackTiles:
      gameState.revealedTileRackTiles.length > 0 ? gameState.revealedTileRackTiles : undefined,
    revealedTileBagTiles:
      gameState.revealedTileBagTiles.length > 0 ? gameState.revealedTileBagTiles : undefined,
    playerIdWithPlayableTilePlusOne:
      gameState.playerIdWithPlayableTilePlusOne >= 1
        ? gameState.playerIdWithPlayableTilePlusOne
        : undefined,
  });
}

function getArrayFromRevealedTileRackTilesString(revealedTileRackTilesString: string) {
  const strParts = revealedTileRackTilesString.split(', ');
  const revealedTileRackTiles: PB_GameState_RevealedTileRackTile[] = new Array(strParts.length);

  for (let i = 0; i < strParts.length; i++) {
    const [tileStr, playerIdStr] = strParts[i].split(':');

    const revealedTileRackTile = PB_GameState_RevealedTileRackTile.create({
      tile: fromTileString(tileStr),
      playerIdBelongsTo: parseInt(playerIdStr, 10),
    });

    revealedTileRackTiles[i] = revealedTileRackTile;
  }

  return revealedTileRackTiles;
}

function getRevealedTileBagTilesStringForPlayer(
  revealedTileBagTiles: GameStateTileBagTile[],
  playerId: number,
) {
  const parts: string[] = [];

  for (let i = 0; i < revealedTileBagTiles.length; i++) {
    const rtbt = revealedTileBagTiles[i];
    const tile =
      rtbt.playerIdWithPermission === null || rtbt.playerIdWithPermission === playerId
        ? rtbt.tile
        : TileEnum.Unknown;
    parts.push(toTileString(tile));
  }

  return parts.join(', ');
}

const gameBoardTypeToCharacter = new Map([
  [PB_GameBoardType.LUXOR, 'L'],
  [PB_GameBoardType.TOWER, 'T'],
  [PB_GameBoardType.AMERICAN, 'A'],
  [PB_GameBoardType.FESTIVAL, 'F'],
  [PB_GameBoardType.WORLDWIDE, 'W'],
  [PB_GameBoardType.CONTINENTAL, 'C'],
  [PB_GameBoardType.IMPERIAL, 'I'],
  [PB_GameBoardType.NOTHING, '·'],
  [PB_GameBoardType.NOTHING_YET, 'O'],
  [PB_GameBoardType.CANT_PLAY_EVER, '█'],
  [PB_GameBoardType.I_HAVE_THIS, 'i'],
  [PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN, 'l'],
  [PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO, 'h'],
  [PB_GameBoardType.WILL_FORM_NEW_CHAIN, 'n'],
  [PB_GameBoardType.WILL_MERGE_CHAINS, 'm'],
  [PB_GameBoardType.CANT_PLAY_NOW, 'c'],
]);
function getGameBoardLines(gameBoard: PB_GameBoardType[][]) {
  const lines: string[] = new Array(9);
  const chars: string[] = new Array(12);
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 12; x++) {
      chars[x] = gameBoardTypeToCharacter.get(gameBoard[y][x])!;
    }
    lines[y] = chars.join('');
  }
  return lines;
}

function getScoreBoardLines(
  scoreBoard: number[][],
  scoreBoardAvailable: number[],
  scoreBoardChainSize: number[],
  scoreBoardPrice: number[],
  turnPlayerId: number,
  movePlayerId: number,
) {
  const lines: string[] = [];
  lines.push(formatScoreBoardLine(['P', 'L', 'T', 'A', 'F', 'W', 'C', 'I', 'Cash', 'Net']));
  scoreBoard.forEach((row, playerId) => {
    let name: string;
    if (playerId === turnPlayerId) {
      name = 'T';
    } else if (playerId === movePlayerId) {
      name = 'M';
    } else {
      name = '';
    }
    lines.push(
      formatScoreBoardLine([
        name,
        ...row.map((val, index) =>
          index <= ScoreBoardIndexEnum.Imperial && val === 0 ? '' : val.toString(),
        ),
      ]),
    );
  });
  lines.push(formatScoreBoardLine(['A', ...scoreBoardAvailable.map((val) => val.toString())]));
  lines.push(
    formatScoreBoardLine([
      'C',
      ...scoreBoardChainSize.map((val) => (val === 0 ? '-' : val.toString())),
    ]),
  );
  lines.push(
    formatScoreBoardLine([
      'P',
      ...scoreBoardPrice.map((val) => (val === 0 ? '-' : val.toString())),
    ]),
  );
  return lines;
}

const scoreBoardColumnWidths = [1, 2, 2, 2, 2, 2, 2, 2, 4, 4];
function formatScoreBoardLine(entries: string[]) {
  const lineParts = entries.map((entry, index) => {
    const numSpacesToAdd = scoreBoardColumnWidths[index] - entry.length;
    if (numSpacesToAdd > 0) {
      entry = ' '.repeat(numSpacesToAdd) + entry;
    }
    return entry;
  });
  return lineParts.join(' ');
}

function getTileRackString(tiles: (number | null)[], tileTypes: (PB_GameBoardType | null)[]) {
  return tiles
    .map((tile, tileIndex) => {
      if (tile === TileEnum.Unknown) {
        return '?';
      }

      const tileType = tileTypes[tileIndex];
      if (tile !== null && tileType !== null) {
        return `${toTileString(tile)}(${gameBoardTypeToCharacter.get(tileType)})`;
      } else {
        return 'none';
      }
    })
    .join(' ');
}

function toTilesString(tiles: number[]) {
  return tiles.map(toTileString).join(', ');
}

function fromTilesString(str: string) {
  return str.split(', ').map(fromTileString);
}

function fromTileString(str: string) {
  if (str === '?') {
    return TileEnum.Unknown;
  } else {
    const x = parseInt(str.slice(0, str.length - 1), 10) - 1;
    const y = yTileNames.indexOf(str.slice(str.length - 1));
    return x * 9 + y;
  }
}

export function getGameHistoryMessageString(gameHistoryMessage: GameHistoryMessage) {
  let parts: (number | string)[];

  if (gameHistoryMessage instanceof GameHistoryMessageTurnBegan) {
    parts = [gameHistoryMessage.playerId, 'TurnBegan'];
  } else if (gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile) {
    parts = [
      gameHistoryMessage.playerId,
      'DrewPositionTile',
      toTileString(gameHistoryMessage.tile),
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageStartedGame) {
    parts = [gameHistoryMessage.playerId, 'StartedGame'];
  } else if (gameHistoryMessage instanceof GameHistoryMessageDrewTile) {
    parts = [gameHistoryMessage.playerId, 'DrewTile', toTileString(gameHistoryMessage.tile)];
  } else if (gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile) {
    parts = [gameHistoryMessage.playerId, 'HasNoPlayableTile'];
  } else if (gameHistoryMessage instanceof GameHistoryMessagePlayedTile) {
    parts = [gameHistoryMessage.playerId, 'PlayedTile', toTileString(gameHistoryMessage.tile)];
  } else if (gameHistoryMessage instanceof GameHistoryMessageFormedChain) {
    parts = [
      gameHistoryMessage.playerId,
      'FormedChain',
      PB_GameBoardType[gameHistoryMessage.chain][0],
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageMergedChains) {
    parts = [
      gameHistoryMessage.playerId,
      'MergedChains',
      gameHistoryMessage.chains.map((chain) => PB_GameBoardType[chain][0]).join(','),
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor) {
    parts = [
      gameHistoryMessage.playerId,
      'SelectedMergerSurvivor',
      PB_GameBoardType[gameHistoryMessage.chain][0],
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext) {
    parts = [
      gameHistoryMessage.playerId,
      'SelectedChainToDisposeOfNext',
      PB_GameBoardType[gameHistoryMessage.chain][0],
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageReceivedBonus) {
    parts = [
      gameHistoryMessage.playerId,
      'ReceivedBonus',
      PB_GameBoardType[gameHistoryMessage.chain][0],
      gameHistoryMessage.amount,
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares) {
    parts = [
      gameHistoryMessage.playerId,
      'DisposedOfShares',
      PB_GameBoardType[gameHistoryMessage.chain][0],
      gameHistoryMessage.tradeAmount,
      gameHistoryMessage.sellAmount,
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares) {
    parts = [gameHistoryMessage.playerId, 'CouldNotAffordAnyShares'];
  } else if (gameHistoryMessage instanceof GameHistoryMessagePurchasedShares) {
    parts = [
      gameHistoryMessage.playerId,
      'PurchasedShares',
      gameHistoryMessage.chainsAndCounts.length > 0
        ? gameHistoryMessage.chainsAndCounts
            .map(
              (chainAndCount) =>
                `${chainAndCount.count}${PB_GameBoardType[chainAndCount.chain][0]}`,
            )
            .join(',')
        : 'x',
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageDrewLastTile) {
    parts = [gameHistoryMessage.playerId, 'DrewLastTile'];
  } else if (gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile) {
    parts = [
      gameHistoryMessage.playerId,
      'ReplacedDeadTile',
      toTileString(gameHistoryMessage.tile),
    ];
  } else if (gameHistoryMessage instanceof GameHistoryMessageEndedGame) {
    parts = [gameHistoryMessage.playerId, 'EndedGame'];
  } else if (gameHistoryMessage instanceof GameHistoryMessageNoTilesPlayedForEntireRound) {
    parts = ['NoTilesPlayedForEntireRound'];
  } else if (gameHistoryMessage instanceof GameHistoryMessageAllTilesPlayed) {
    parts = ['AllTilesPlayed'];
  } else {
    parts = [];
  }

  return parts.join(' ');
}

function getNextActionString(action: ActionBase) {
  const nextPlayerId = action.playerId;
  const nextActionName = action.constructor.name.slice(6);

  const parts = [nextPlayerId.toString(), nextActionName];

  if (action instanceof ActionSelectNewChain) {
    parts.push(
      action.availableChains.map((x: PB_GameBoardType) => PB_GameBoardType[x][0]).join(','),
    );
  } else if (action instanceof ActionSelectMergerSurvivor) {
    parts.push(
      action.chainsBySize[0].map((x: PB_GameBoardType) => PB_GameBoardType[x][0]).join(','),
    );
  } else if (action instanceof ActionSelectChainToDisposeOfNext) {
    parts.push(action.defunctChains.map((x: PB_GameBoardType) => PB_GameBoardType[x][0]).join(','));
  } else if (action instanceof ActionDisposeOfShares) {
    parts.push(PB_GameBoardType[action.defunctChain][0]);
  }

  return parts.join(' ');
}

function getFormattedGameJSONLines(game: Game) {
  const json = gameToJSON(game)!;

  const entries: string[] = [];

  if (json.gameMode) {
    entries.push(`  "gameMode": ${JSON.stringify(json.gameMode)}`);
  }
  if (json.playerArrangementMode) {
    entries.push(`  "playerArrangementMode": ${JSON.stringify(json.playerArrangementMode)}`);
  }
  if (json.userIds) {
    entries.push(`  "userIds": ${JSON.stringify(json.userIds)}`);
  }
  if (json.usernames) {
    entries.push(`  "usernames": ${JSON.stringify(json.usernames)}`);
  }
  if (json.hostUserId) {
    entries.push(`  "hostUserId": ${JSON.stringify(json.hostUserId)}`);
  }
  if (json.tileBag) {
    entries.push(`  "tileBag": ${JSON.stringify(json.tileBag)}`);
  }
  if (json.gameActions) {
    const gameActions = json.gameActions;
    const lastGameActionIndex = gameActions.length - 1;

    const lines = [`  "gameActions": [`];
    for (let i = 0; i < gameActions.length; i++) {
      lines.push(`    ${JSON.stringify(gameActions[i])}${i !== lastGameActionIndex ? ',' : ''}`);
    }
    lines.push('  ]');

    entries.push(lines.join('\n'));
  }
  if (json.beginTimestamp) {
    entries.push(`  "beginTimestamp": ${JSON.stringify(json.beginTimestamp)}`);
  }
  if (json.gameActionTimestampOffsets) {
    entries.push(
      `  "gameActionTimestampOffsets": ${JSON.stringify(json.gameActionTimestampOffsets)}`,
    );
  }
  if (json.endTimestamp) {
    entries.push(`  "endTimestamp": ${JSON.stringify(json.endTimestamp)}`);
  }

  return ['{', ...entries.join(',\n').split('\n'), '}'];
}
