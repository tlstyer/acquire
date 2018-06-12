import { List } from 'immutable';
import { defaultTileRackTypes } from './defaults';
import { GameAction, GameBoardType, GameHistoryMessage, GameMode, PlayerArrangementMode, ScoreBoardIndex, Tile } from './enums';
import { UserInputError } from './error';
import { Game, GameHistoryMessageData, MoveData, MoveDataTileBagTile, MoveDataTileRackTile } from './game';
import { ActionBase } from './gameActions/base';
import { ActionDisposeOfShares } from './gameActions/disposeOfShares';
import { ActionGameOver } from './gameActions/gameOver';
import { ActionSelectChainToDisposeOfNext } from './gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from './gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from './gameActions/selectNewChain';

export function runGameTestFile(inputLines: string[]) {
    let game: Game | null = null;
    let gameMode = GameMode.Singles1;
    let playerArrangementMode = PlayerArrangementMode.Version1;
    let tileBag: number[] = [];
    const userIDs: number[] = [];
    const usernames: string[] = [];
    let hostUserID = 0;
    let myUserID: number | null = null;

    const outputLines: string[] = [];

    let myPlayerID: number | null = null;
    let lastMoveData: MoveData | null = null;
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
                        // @ts-ignore
                        gameMode = GameMode[value];
                        break;
                    case 'player arrangement mode':
                        // @ts-ignore
                        playerArrangementMode = PlayerArrangementMode[value];
                        break;
                    case 'tile bag':
                        tileBag = fromTilesString(value);

                        const duplicatedTiles = getDuplicatedTiles(tileBag);
                        if (duplicatedTiles.length > 0) {
                            outputLines.push(`duplicated tiles in tile bag: ${toTilesString(duplicatedTiles)}`);
                        }
                        break;
                    case 'user':
                        const userParts = value.split(' ');
                        userIDs.push(parseInt(userParts[0], 10));
                        usernames.push(userParts.slice(1).join(' '));
                        break;
                    case 'host':
                        hostUserID = parseInt(value, 10);
                        break;
                    case 'me':
                        myUserID = value === 'null' ? null : parseInt(value, 10);
                        break;
                    default:
                        outputLines.push(`unrecognized line: ${line}`);
                        break;
                }
            } else {
                outputLines.push(`game mode: ${GameMode[gameMode]}`);
                outputLines.push(`player arrangement mode: ${PlayerArrangementMode[playerArrangementMode]}`);
                if (tileBag.length > 0) {
                    outputLines.push(`tile bag: ${toTilesString(tileBag)}`);
                }
                for (let i = 0; i < userIDs.length; i++) {
                    const userID = userIDs[i];
                    const username = usernames[i];
                    outputLines.push(`user: ${userID} ${username}`);
                }
                outputLines.push(`host: ${hostUserID}`);
                if (myUserID !== null) {
                    outputLines.push(`me: ${myUserID}`);
                }

                game = new Game(gameMode, playerArrangementMode, tileBag, List(userIDs), List(usernames), hostUserID, myUserID);

                if (myUserID !== null) {
                    myPlayerID = userIDs.indexOf(myUserID);
                }
            }
        } else {
            const lineParts = line.split(': ');

            if (lastMoveData !== null) {
                outputLines.push(...getMoveDataLines(lastMoveData, myPlayerID, line !== ''));
                lastMoveData = null;
            }

            if (lineParts[0] === 'revealed tile rack tiles') {
                game.processRevealedTileRackTiles(getArrayFromRevealedTileRackTilesString(lineParts[1]));
            } else if (lineParts[0] === 'revealed tile bag tiles') {
                game.processRevealedTileBagTiles(fromTilesString(lineParts[1]));
            } else if (lineParts[0] === 'player ID with playable tile') {
                game.processPlayerIDWithPlayableTile(parseInt(lineParts[1], 10));
            } else if (lineParts[0] === 'timestamp') {
                timestamp = parseInt(lineParts[1], 10);
            } else if (lineParts[0] === 'action') {
                const actionParts = lineParts[1].split(' ');

                const playerID = parseInt(actionParts[0], 10);

                const userID = game.userIDs.get(playerID, 0);
                const moveIndex = game.moveDataHistory.size;

                const actualGameActionName = game.gameActionStack[game.gameActionStack.length - 1].constructor.name.slice(6);
                // @ts-ignore actualGameActionName is in GameAction
                const actualGameAction = GameAction[actualGameActionName];

                let parameters: any[] = [];
                let usingJSONParameters = false;
                if (actionParts.length > 2) {
                    if (actionParts[2] === '--') {
                        usingJSONParameters = true;
                        try {
                            parameters = JSON.parse(actionParts.slice(3).join(' '));
                        } catch (error) {
                            expect(false).toBe(true);
                        }
                        expect(Array.isArray(parameters)).toBe(true);
                    } else {
                        parameters = fromParameterStrings(actualGameAction, actionParts.slice(2));
                    }
                }

                outputLines.push('');

                try {
                    game.doGameAction(userID, moveIndex, parameters, timestamp);
                    lastMoveData = game.moveDataHistory.get(game.moveDataHistory.size - 1, null);
                } catch (error) {
                    if (error instanceof UserInputError) {
                        let stringParameters = '';
                        if (usingJSONParameters) {
                            stringParameters = ` -- ${JSON.stringify(parameters)}`;
                        } else {
                            const arr = toParameterStrings(actualGameAction, parameters);
                            if (arr.length > 0) {
                                stringParameters = ` ${arr.join(' ')}`;
                            }
                        }

                        if (timestamp !== null) {
                            outputLines.push(`timestamp: ${timestamp}`);
                        }
                        outputLines.push(`action: ${playerID} ${actualGameActionName}${stringParameters}`);
                        outputLines.push(`  error: ${error.message}`);
                    } else {
                        outputLines.push(`line with unknown error: ${line}`);
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
    ['L', GameBoardType.Luxor],
    ['T', GameBoardType.Tower],
    ['A', GameBoardType.American],
    ['F', GameBoardType.Festival],
    ['W', GameBoardType.Worldwide],
    ['C', GameBoardType.Continental],
    ['I', GameBoardType.Imperial],
]);

function fromParameterStrings(gameAction: GameAction, strings: string[]) {
    const parameters: any[] = [];

    switch (gameAction) {
        case GameAction.PlayTile:
            parameters.push(fromTileString(strings[0]));
            break;
        case GameAction.SelectNewChain:
        case GameAction.SelectMergerSurvivor:
        case GameAction.SelectChainToDisposeOfNext:
            parameters.push(abbreviationToGameBoardType.get(strings[0])!);
            break;
        case GameAction.DisposeOfShares:
            parameters.push(...strings.map(s => parseInt(s, 10)));
            break;
        case GameAction.PurchaseShares:
            if (strings[0] === 'x') {
                parameters.push([]);
            } else {
                parameters.push(strings[0].split(',').map(s => abbreviationToGameBoardType.get(s)));
            }
            parameters.push(parseInt(strings[1], 10));
            break;
    }

    return parameters;
}

function toParameterStrings(gameAction: GameAction, parameters: any[]) {
    const strings: any[] = [];

    switch (gameAction) {
        case GameAction.PlayTile:
            strings.push(toTileString(parameters[0]));
            break;
        case GameAction.SelectNewChain:
        case GameAction.SelectMergerSurvivor:
        case GameAction.SelectChainToDisposeOfNext:
            strings.push(gameBoardTypeToCharacter.get(parameters[0])!);
            break;
        case GameAction.DisposeOfShares:
            strings.push(...parameters.map(p => p.toString()));
            break;
        case GameAction.PurchaseShares:
            if (parameters[0].length === 0) {
                strings.push('x');
            } else {
                strings.push(parameters[0].map((p: number) => gameBoardTypeToCharacter.get(p)).join(','));
            }
            strings.push(parameters[1].toString());
            break;
    }

    return strings;
}

const gameBoardStringSpacer = '            ';

function getMoveDataLines(moveData: MoveData, revealedTilesPlayerID: number | null, detailed: boolean) {
    const lines: string[] = [];

    if (revealedTilesPlayerID !== null) {
        const rtrtStr = getRevealedTileRackTilesStringForPlayer(moveData.revealedTileRackTiles, revealedTilesPlayerID);
        if (rtrtStr.length > 0) {
            lines.push(`revealed tile rack tiles: ${rtrtStr}`);
        }

        const rtbtStr = getRevealedTileBagTilesStringForPlayer(moveData.revealedTileBagTiles, revealedTilesPlayerID);
        if (rtbtStr.length > 0) {
            lines.push(`revealed tile bag tiles: ${rtbtStr}`);
        }

        if (moveData.playerIDWithPlayableTile !== null) {
            lines.push(`player ID with playable tile: ${moveData.playerIDWithPlayableTile}`);
        }
    }

    if (moveData.timestamp !== null) {
        lines.push(`timestamp: ${moveData.timestamp}`);
    }

    const arr = toParameterStrings(moveData.gameAction, moveData.gameActionParameters);
    let stringParameters = '';
    if (arr.length > 0) {
        stringParameters = ` ${arr.join(' ')}`;
    }
    lines.push(`action: ${moveData.playerID} ${GameAction[moveData.gameAction]}${stringParameters}`);

    if (detailed) {
        const gameBoardLines = getGameBoardLines(moveData.gameBoard);
        const scoreBoardLines = getScoreBoardLines(
            moveData.scoreBoard,
            moveData.scoreBoardAvailable,
            moveData.scoreBoardChainSize,
            moveData.scoreBoardPrice,
            moveData.nextGameAction instanceof ActionGameOver ? -1 : moveData.turnPlayerID,
            moveData.nextGameAction instanceof ActionGameOver ? -1 : moveData.nextGameAction.playerID,
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
        moveData.tileRacks.forEach((tileRack, playerID) => {
            const tileTypes = moveData.tileRackTypes.get(playerID, defaultTileRackTypes);
            lines.push(`    ${playerID}: ${getTileRackString(tileRack, tileTypes)}`);
        });

        if (moveData.revealedTileRackTiles.length > 0) {
            const str = moveData.revealedTileRackTiles
                .map(trt => {
                    return `${toTileString(trt.tile)}:${trt.playerIDBelongsTo.toString()}`;
                })
                .join(', ');
            lines.push(`  revealed tile rack tiles: ${str}`);
        }

        if (moveData.revealedTileBagTiles.length > 0) {
            const str = moveData.revealedTileBagTiles
                .map(tbt => {
                    return `${toTileString(tbt.tile)}:${tbt.playerIDWithPermission === null ? 'all' : tbt.playerIDWithPermission.toString()}`;
                })
                .join(', ');
            lines.push(`  revealed tile bag tiles: ${str}`);
        }

        if (moveData.playerIDWithPlayableTile !== null) {
            lines.push(`  player ID with playable tile: ${moveData.playerIDWithPlayableTile}`);
        }

        lines.push('  messages:');
        moveData.createPlayerAndWatcherMessages();
        for (let playerID = 0; playerID < moveData.playerMessages.length; playerID++) {
            lines.push(`    ${playerID}: ${JSON.stringify(moveData.playerMessages[playerID])}`);
        }
        lines.push(`    w: ${JSON.stringify(moveData.watcherMessage)}`);

        lines.push('  history messages:');
        moveData.gameHistoryMessages.forEach(ghm => {
            lines.push(`    ${getGameHistoryMessageString(ghm)}`);
        });

        lines.push(`  next action: ${getNextActionString(moveData.nextGameAction)}`);
    }

    return lines;
}

function getRevealedTileRackTilesStringForPlayer(revealedTileRackTiles: MoveDataTileRackTile[], playerID: number) {
    const parts: string[] = [];

    for (let i = 0; i < revealedTileRackTiles.length; i++) {
        const rtrt = revealedTileRackTiles[i];
        if (rtrt.playerIDBelongsTo !== playerID) {
            parts.push(`${toTileString(rtrt.tile)}:${rtrt.playerIDBelongsTo}`);
        }
    }

    return parts.join(', ');
}

function getArrayFromRevealedTileRackTilesString(revealedTileRackTilesString: string) {
    const strParts = revealedTileRackTilesString.split(', ');
    const revealedTileRackTiles: [number, number][] = new Array(strParts.length);

    for (let i = 0; i < strParts.length; i++) {
        const [tileStr, playerIDStr] = strParts[i].split(':');
        revealedTileRackTiles[i] = [fromTileString(tileStr), parseInt(playerIDStr, 10)];
    }

    return revealedTileRackTiles;
}

function getRevealedTileBagTilesStringForPlayer(revealedTileBagTiles: MoveDataTileBagTile[], playerID: number) {
    const parts: string[] = [];

    for (let i = 0; i < revealedTileBagTiles.length; i++) {
        const rtbt = revealedTileBagTiles[i];
        const tile = rtbt.playerIDWithPermission === null || rtbt.playerIDWithPermission === playerID ? rtbt.tile : Tile.Unknown;
        parts.push(toTileString(tile));
    }

    return parts.join(', ');
}

const gameBoardTypeToCharacter = new Map([
    [GameBoardType.Luxor, 'L'],
    [GameBoardType.Tower, 'T'],
    [GameBoardType.American, 'A'],
    [GameBoardType.Festival, 'F'],
    [GameBoardType.Worldwide, 'W'],
    [GameBoardType.Continental, 'C'],
    [GameBoardType.Imperial, 'I'],
    [GameBoardType.Nothing, '·'],
    [GameBoardType.NothingYet, 'O'],
    [GameBoardType.CantPlayEver, '█'],
    [GameBoardType.IHaveThis, 'i'],
    [GameBoardType.WillPutLonelyTileDown, 'l'],
    [GameBoardType.HaveNeighboringTileToo, 'h'],
    [GameBoardType.WillFormNewChain, 'n'],
    [GameBoardType.WillMergeChains, 'm'],
    [GameBoardType.CantPlayNow, 'c'],
]);
function getGameBoardLines(gameBoard: List<List<GameBoardType>>) {
    const lines: string[] = new Array(9);
    const chars: string[] = new Array(12);
    for (let y = 0; y < 9; y++) {
        for (let x = 0; x < 12; x++) {
            chars[x] = gameBoardTypeToCharacter.get(gameBoard.get(y)!.get(x)!)!;
        }
        lines[y] = chars.join('');
    }
    return lines;
}

function getScoreBoardLines(
    scoreBoard: List<List<number>>,
    scoreBoardAvailable: List<number>,
    scoreBoardChainSize: List<number>,
    scoreBoardPrice: List<number>,
    turnPlayerID: number,
    movePlayerID: number,
) {
    const lines: string[] = [];
    lines.push(formatScoreBoardLine(['P', 'L', 'T', 'A', 'F', 'W', 'C', 'I', 'Cash', 'Net']));
    scoreBoard.forEach((row, playerID) => {
        let name: string;
        if (playerID === turnPlayerID) {
            name = 'T';
        } else if (playerID === movePlayerID) {
            name = 'M';
        } else {
            name = '';
        }
        lines.push(formatScoreBoardLine([name, ...row.toArray().map((val, index) => (index <= ScoreBoardIndex.Imperial && val === 0 ? '' : val.toString()))]));
    });
    lines.push(formatScoreBoardLine(['A', ...scoreBoardAvailable.toArray().map(val => val.toString())]));
    lines.push(formatScoreBoardLine(['C', ...scoreBoardChainSize.toArray().map(val => (val === 0 ? '-' : val.toString()))]));
    lines.push(formatScoreBoardLine(['P', ...scoreBoardPrice.toArray().map(val => (val === 0 ? '-' : val.toString()))]));
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

function getTileRackString(tiles: List<number | null>, tileTypes: List<GameBoardType | null>) {
    return tiles
        .map((tile, tileIndex) => {
            if (tile === Tile.Unknown) {
                return '?';
            }

            const tileType = tileTypes.get(tileIndex, 0);
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

const yTileNames = 'ABCDEFGHI';

function toTileString(tile: number) {
    if (tile === Tile.Unknown) {
        return '?';
    } else {
        return `${Math.floor(tile / 9) + 1}${yTileNames[tile % 9]}`;
    }
}

function fromTileString(str: string) {
    if (str === '?') {
        return Tile.Unknown;
    } else {
        const x = parseInt(str.slice(0, str.length - 1), 10) - 1;
        const y = yTileNames.indexOf(str.slice(str.length - 1));
        return x * 9 + y;
    }
}

const ghmsh = (ghmd: GameHistoryMessageData) => {
    return GameHistoryMessage[ghmd.gameHistoryMessage];
};
const ghmshPlayerID = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage]].join(' ');
};
const ghmshPlayerIDTile = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], toTileString(ghmd.parameters[0])].join(' ');
};
const ghmshPlayerIDType = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], GameBoardType[ghmd.parameters[0]][0], ...ghmd.parameters.slice(1)].join(' ');
};
const ghmshMergedChains = (ghmd: GameHistoryMessageData) => {
    return [ghmd.playerID, GameHistoryMessage[ghmd.gameHistoryMessage], ghmd.parameters[0].map((x: GameBoardType) => GameBoardType[x][0]).join(',')].join(' ');
};
const ghmshPurchasedShares = (ghmd: GameHistoryMessageData) => {
    return [
        ghmd.playerID,
        GameHistoryMessage[ghmd.gameHistoryMessage],
        ghmd.parameters[0].length > 0
            ? ghmd.parameters[0].map(([type, count]: [ScoreBoardIndex, number]) => `${count}${GameBoardType[type][0]}`).join(',')
            : 'x',
    ].join(' ');
};

const gameHistoryMessageStringHandlers = new Map([
    [GameHistoryMessage.TurnBegan, ghmshPlayerID],
    [GameHistoryMessage.DrewPositionTile, ghmshPlayerIDTile],
    [GameHistoryMessage.StartedGame, ghmshPlayerID],
    [GameHistoryMessage.DrewTile, ghmshPlayerIDTile],
    [GameHistoryMessage.HasNoPlayableTile, ghmshPlayerID],
    [GameHistoryMessage.PlayedTile, ghmshPlayerIDTile],
    [GameHistoryMessage.FormedChain, ghmshPlayerIDType],
    [GameHistoryMessage.MergedChains, ghmshMergedChains],
    [GameHistoryMessage.SelectedMergerSurvivor, ghmshPlayerIDType],
    [GameHistoryMessage.SelectedChainToDisposeOfNext, ghmshPlayerIDType],
    [GameHistoryMessage.ReceivedBonus, ghmshPlayerIDType],
    [GameHistoryMessage.DisposedOfShares, ghmshPlayerIDType],
    [GameHistoryMessage.CouldNotAffordAnyShares, ghmshPlayerID],
    [GameHistoryMessage.PurchasedShares, ghmshPurchasedShares],
    [GameHistoryMessage.DrewLastTile, ghmshPlayerID],
    [GameHistoryMessage.ReplacedDeadTile, ghmshPlayerIDTile],
    [GameHistoryMessage.EndedGame, ghmshPlayerID],
    [GameHistoryMessage.NoTilesPlayedForEntireRound, ghmsh],
    [GameHistoryMessage.AllTilesPlayed, ghmsh],
]);
function getGameHistoryMessageString(gameHistoryMessage: GameHistoryMessageData) {
    return gameHistoryMessageStringHandlers.get(gameHistoryMessage.gameHistoryMessage)!(gameHistoryMessage);
}

function getNextActionString(action: ActionBase) {
    const nextPlayerID = action.playerID;
    const nextActionName = action.constructor.name.slice(6);

    const parts = [nextPlayerID.toString(), nextActionName];

    if (action instanceof ActionSelectNewChain) {
        parts.push(action.availableChains.map((x: GameBoardType) => GameBoardType[x][0]).join(','));
    } else if (action instanceof ActionSelectMergerSurvivor) {
        parts.push(action.chainsBySize[0].map((x: GameBoardType) => GameBoardType[x][0]).join(','));
    } else if (action instanceof ActionSelectChainToDisposeOfNext) {
        parts.push(action.defunctChains.map((x: GameBoardType) => GameBoardType[x][0]).join(','));
    } else if (action instanceof ActionDisposeOfShares) {
        parts.push(GameBoardType[action.defunctChain][0]);
    }

    return parts.join(' ');
}

function getFormattedGameJSONLines(game: Game) {
    const [
        gameMode,
        playerArrangementMode,
        timeControlStartingAmount,
        timeControlIncrementAmount,
        userIDs,
        usernames,
        hostUserID,
        tileBag,
        gameActions,
    ] = game.toJSON();

    const lines: string[] = [];

    lines.push('[');

    lines.push(`  ${JSON.stringify(gameMode)},`);
    lines.push(`  ${JSON.stringify(playerArrangementMode)},`);
    lines.push(`  ${JSON.stringify(timeControlStartingAmount)},`);
    lines.push(`  ${JSON.stringify(timeControlIncrementAmount)},`);
    lines.push(`  ${JSON.stringify(userIDs)},`);
    lines.push(`  ${JSON.stringify(usernames)},`);
    lines.push(`  ${JSON.stringify(hostUserID)},`);
    lines.push(`  ${JSON.stringify(tileBag)},`);

    lines.push('  [');

    const lastGameActionIndex = gameActions.length - 1;
    for (let i = 0; i < gameActions.length; i++) {
        const gameAction = gameActions[i];

        const json = JSON.stringify(gameAction).replace(/,(\d+)\]$/g, ', $1]');
        const possibleTrailingComma = i !== lastGameActionIndex ? ',' : '';
        lines.push(`    ${json}${possibleTrailingComma}`);
    }

    lines.push('  ]');

    lines.push(']');

    return lines;
}
