import { List } from 'immutable';
import {
  defaultGameBoard,
  defaultGameStateHistory,
  defaultSafeChains,
  defaultScoreBoard,
  defaultScoreBoardAvailable,
  defaultScoreBoardChainSize,
  defaultScoreBoardPrice,
  defaultScoreBoardRow,
  defaultTileRack,
  defaultTileRacks,
  defaultTileRackTypes,
  defaultTileRackTypesList,
} from './defaults';
import { GameActionEnum, GameHistoryMessageEnum, ScoreBoardIndexEnum, TileEnum } from './enums';
import { ActionBase } from './gameActions/base';
import { ActionStartGame } from './gameActions/startGame';
import { calculateBonuses, neighboringTilesLookup } from './helpers';
import { GameBoardType, GameMode, PB_GameAction, PB_GameState, PB_GameState_RevealedTileRackTile, PlayerArrangementMode } from './pb';

type GameJSON = [GameMode, PlayerArrangementMode, number | null, number, number[], string[], number, number[], ([any] | [any, number])[]];

export class Game {
  nextTileBagIndex = 0;
  gameBoardTypeCounts: number[];
  protected currentGameState: GameState | null = null;
  gameStateHistory = defaultGameStateHistory;
  gameActionStack: ActionBase[] = [];
  numTurnsWithoutPlayedTiles = 0;

  turnPlayerID = 0;
  tileRacks = defaultTileRacks;
  tileRackTypes = defaultTileRackTypesList;
  gameBoard = defaultGameBoard;
  scoreBoard = defaultScoreBoard;
  scoreBoardAvailable = defaultScoreBoardAvailable;
  scoreBoardChainSize = defaultScoreBoardChainSize;
  scoreBoardPrice = defaultScoreBoardPrice;
  safeChains = defaultSafeChains;

  scoreBoardAtLastNetWorthsUpdate = defaultScoreBoard;
  scoreBoardPriceAtLastNetWorthsUpdate = defaultScoreBoardPrice;

  playerIDWithPlayableTile: number | null = null;

  constructor(
    public gameMode: GameMode,
    public playerArrangementMode: PlayerArrangementMode,
    public tileBag: number[],
    public userIDs: List<number>,
    public usernames: List<string>,
    public hostUserID: number,
    public myUserID: number | null,
  ) {
    // initialize this.gameBoardTypeCounts
    this.gameBoardTypeCounts = new Array(GameBoardType.MAX);
    for (let i = 0; i < GameBoardType.MAX; i++) {
      this.gameBoardTypeCounts[i] = 0;
    }
    this.gameBoardTypeCounts[GameBoardType.NOTHING] = 108;

    // initialize this.gameActionStack
    this.gameActionStack.push(new ActionStartGame(this, userIDs.indexOf(hostUserID)));

    // initialize this.tileRacks, this.tileRackTypes, this.scoreBoard
    for (let playerID = 0; playerID < userIDs.size; playerID++) {
      this.tileRacks = this.tileRacks.push(defaultTileRack);
      this.tileRackTypes = this.tileRacks.push(defaultTileRackTypes);
      this.scoreBoard = this.scoreBoard.push(defaultScoreBoardRow);
    }

    // initialize this.scoreBoardAtLastNetWorthsUpdate
    this.scoreBoardAtLastNetWorthsUpdate = this.scoreBoard;
  }

  processGameState(gameState: PB_GameState) {
    const gameAction = gameState.gameAction!;

    let timestamp: number | null = null;
    if (gameState.timestamp !== 0) {
      timestamp = gameState.timestamp;
      if (timestamp !== null) {
        const previousGameState = this.gameStateHistory.get(this.gameStateHistory.size - 1, null);
        if (previousGameState !== null && previousGameState.timestamp !== null) {
          timestamp += previousGameState.timestamp;
        }
      }
    }

    if (gameState.revealedTileRackTiles && gameState.revealedTileRackTiles.length > 0) {
      this.processRevealedTileRackTiles(gameState.revealedTileRackTiles);
    }

    if (gameState.revealedTileBagTiles && gameState.revealedTileBagTiles.length > 0) {
      this.processRevealedTileBagTiles(gameState.revealedTileBagTiles);
    }

    if (gameState.playerIdWithPlayableTilePlusOne) {
      this.processPlayerIDWithPlayableTile(gameState.playerIdWithPlayableTilePlusOne - 1);
    }

    this.doGameAction(gameAction, timestamp);
  }

  processRevealedTileRackTiles(entries: PB_GameState_RevealedTileRackTile[]) {
    const playerIDs: number[] = [];

    this.tileRacks = this.tileRacks.asMutable();

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const tile = entry.tile;
      const playerIdBelongsTo = entry.playerIdBelongsTo;

      let setTile = false;

      if (playerIDs.indexOf(playerIdBelongsTo) === -1) {
        playerIDs.push(playerIdBelongsTo);
      }

      for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        if (this.tileRacks.get(playerIdBelongsTo)!.get(tileIndex, null) === TileEnum.Unknown) {
          this.tileRacks.setIn([playerIdBelongsTo, tileIndex], tile);
          setTile = true;
          break;
        }
      }

      if (!setTile) {
        throw new Error('no unknown tile found in player tile rack');
      }
    }

    this.tileRacks = this.tileRacks.asImmutable();

    for (let i = 0; i < playerIDs.length; i++) {
      const playerID = playerIDs[i];
      this.determineTileRackTypesForPlayer(playerID);
    }
  }

  processRevealedTileBagTiles(entries: number[]) {
    this.tileBag.push(...entries);
  }

  processPlayerIDWithPlayableTile(playerIDWithPlayableTile: number) {
    this.playerIDWithPlayableTile = playerIDWithPlayableTile;
  }

  doGameAction(gameAction: PB_GameAction, timestamp: number | null) {
    let currentAction = this.gameActionStack[this.gameActionStack.length - 1];

    let newActions: ActionBase[] | null = currentAction.execute(gameAction);
    this.getCurrentGameState().setGameAction(currentAction.playerID, currentAction.gameAction, gameAction, timestamp);

    while (newActions !== null) {
      this.gameActionStack.pop();
      this.gameActionStack.push(...newActions.reverse());
      currentAction = this.gameActionStack[this.gameActionStack.length - 1];
      newActions = currentAction.prepare();
    }

    this.playerIDWithPlayableTile = null;

    this.endCurrentMove();
  }

  drawTiles(playerID: number) {
    const addDrewTileMessage = this.myUserID === null || this.myUserID === this.userIDs.get(playerID)!;

    for (let i = 0; i < 6; i++) {
      if (this.tileRacks.get(playerID)!.get(i, null) !== null) {
        continue;
      }

      if (this.nextTileBagIndex >= this.tileBag.length) {
        if (this.tileBag.length < 108) {
          throw new Error('missing tiles from tile bag');
        }
        return;
      }

      const tile = this.tileBag[this.nextTileBagIndex++];
      this.tileRacks = this.tileRacks.setIn([playerID, i], tile);

      this.getCurrentGameState().addTileBagTile(tile, playerID);

      if (addDrewTileMessage) {
        this.getCurrentGameState().addGameHistoryMessage(GameHistoryMessageEnum.DrewTile, playerID, [tile]);
      }

      if (this.nextTileBagIndex === 108) {
        this.getCurrentGameState().addGameHistoryMessage(GameHistoryMessageEnum.DrewLastTile, playerID, []);
      }
    }
  }

  removeTile(playerID: number, tileIndex: number) {
    this.tileRacks = this.tileRacks.setIn([playerID, tileIndex], null);
    this.tileRackTypes = this.tileRackTypes.setIn([playerID, tileIndex], null);
  }

  replaceDeadTiles(playerID: number) {
    let replacedADeadTile = false;
    do {
      replacedADeadTile = false;
      const tileRack = this.tileRacks.get(playerID)!;
      const tileRackTypes = this.tileRackTypes.get(playerID)!;
      for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        const tile = tileRack.get(tileIndex, null);
        if (tile === null) {
          continue;
        }

        const type = tileRackTypes.get(tileIndex, null);
        if (type !== GameBoardType.CANT_PLAY_EVER) {
          continue;
        }

        this.removeTile(playerID, tileIndex);
        this.setGameBoardPosition(tile, GameBoardType.CANT_PLAY_EVER);
        this.getCurrentGameState().addGameHistoryMessage(GameHistoryMessageEnum.ReplacedDeadTile, playerID, [tile]);
        this.drawTiles(playerID);
        this.determineTileRackTypesForPlayer(playerID);
        replacedADeadTile = true;
        // replace one tile at a time
        break;
      }
    } while (replacedADeadTile);
  }

  determineTileRackTypesForEverybody() {
    for (let playerID = 0; playerID < this.userIDs.size; playerID++) {
      this.determineTileRackTypesForPlayer(playerID);
    }
  }

  determineTileRackTypesForPlayer(playerID: number) {
    const tileTypes: (GameBoardType | null)[] = [];
    const lonelyTileIndexes: number[] = [];
    const lonelyTileBorderTiles = new Set<number>();

    let canStartNewChain = false;
    for (let i = 0; i <= GameBoardType.IMPERIAL; i++) {
      if (this.gameBoardTypeCounts[i] === 0) {
        canStartNewChain = true;
        break;
      }
    }

    for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
      const tile = this.tileRacks.get(playerID)!.get(tileIndex, null);
      let tileType = null;

      if (tile !== null && tile !== TileEnum.Unknown) {
        const borderTiles: number[] = [];
        let borderTypes: GameBoardType[] = [];
        const neighboringTiles = neighboringTilesLookup[tile];
        for (let i = 0; i < neighboringTiles.length; i++) {
          const neighboringTile = neighboringTiles[i];
          borderTiles.push(neighboringTile);
          borderTypes.push(this.gameBoard.get(neighboringTile % 9)!.get(neighboringTile / 9)!);
        }

        borderTypes = borderTypes.filter((type, index) => {
          if (type === GameBoardType.NOTHING || type === GameBoardType.CANT_PLAY_EVER) {
            return false;
          }
          if (borderTypes.indexOf(type) !== index) {
            // exclude this as it is already in the array
            return false;
          }
          return true;
        });
        if (borderTypes.length > 1) {
          borderTypes = borderTypes.filter((type) => type !== GameBoardType.NOTHING_YET);
        }

        if (borderTypes.length === 0) {
          tileType = GameBoardType.WILL_PUT_LONELY_TILE_DOWN;
          lonelyTileIndexes.push(tileIndex);
          for (let i = 0; i < borderTiles.length; i++) {
            lonelyTileBorderTiles.add(borderTiles[i]);
          }
        } else if (borderTypes.length === 1) {
          if (borderTypes.indexOf(GameBoardType.NOTHING_YET) !== -1) {
            if (canStartNewChain) {
              tileType = GameBoardType.WILL_FORM_NEW_CHAIN;
            } else {
              tileType = GameBoardType.CANT_PLAY_NOW;
            }
          } else {
            tileType = borderTypes[0];
          }
        } else {
          let safeCount = 0;
          for (let i = 0; i < borderTypes.length; i++) {
            if (this.gameBoardTypeCounts[borderTypes[i]] >= 11) {
              safeCount++;
            }
          }

          if (safeCount >= 2) {
            tileType = GameBoardType.CANT_PLAY_EVER;
          } else {
            tileType = GameBoardType.WILL_MERGE_CHAINS;
          }
        }
      }

      tileTypes.push(tileType);
    }

    if (canStartNewChain) {
      for (let i = 0; i < lonelyTileIndexes.length; i++) {
        const tileIndex = lonelyTileIndexes[i];

        const tileType = tileTypes[tileIndex];
        if (tileType === GameBoardType.WILL_PUT_LONELY_TILE_DOWN) {
          const tile = this.tileRacks.get(playerID)!.get(tileIndex, null);
          if (tile !== null && lonelyTileBorderTiles.has(tile)) {
            tileTypes[tileIndex] = GameBoardType.HAVE_NEIGHBORING_TILE_TOO;
          }
        }
      }
    }

    const tileRackTypes = this.tileRackTypes.asMutable();
    for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
      tileRackTypes.setIn([playerID, tileIndex], tileTypes[tileIndex]);
    }
    this.tileRackTypes = tileRackTypes.asImmutable();
  }

  setGameBoardPosition(tile: number, gameBoardType: GameBoardType) {
    const previousGameBoardType = this.gameBoard.get(tile % 9)!.get(tile / 9)!;

    if (previousGameBoardType === GameBoardType.NOTHING) {
      this.getCurrentGameState().addPlayedTile(tile, this.gameActionStack[this.gameActionStack.length - 1].playerID);
    }

    this.gameBoardTypeCounts[previousGameBoardType]--;
    this.gameBoard = this.gameBoard.setIn([tile % 9, tile / 9], gameBoardType);
    this.gameBoardTypeCounts[gameBoardType]++;
  }

  fillCells(tile: number, gameBoardType: GameBoardType) {
    const pending = [tile];
    const found = new Set([tile]);
    const excludedTypes = new Set([GameBoardType.NOTHING, GameBoardType.CANT_PLAY_EVER, gameBoardType]);

    this.gameBoard = this.gameBoard.asMutable();

    let t = pending.pop();
    while (t !== undefined) {
      this.setGameBoardPosition(t, gameBoardType);

      const neighboringTiles = neighboringTilesLookup[t];
      for (let i = 0; i < neighboringTiles.length; i++) {
        const neighboringTile = neighboringTiles[i];
        if (!found.has(neighboringTile) && !excludedTypes.has(this.gameBoard.get(neighboringTile % 9)!.get(neighboringTile / 9)!)) {
          pending.push(neighboringTile);
          found.add(neighboringTile);
        }
      }

      t = pending.pop();
    }

    this.gameBoard = this.gameBoard.asImmutable();
  }

  getScoreBoardColumnArray(scoreBoardIndex: GameBoardType | ScoreBoardIndexEnum) {
    const column: number[] = new Array(this.userIDs.size);
    for (let playerID = 0; playerID < this.userIDs.size; playerID++) {
      column[playerID] = this.scoreBoard.get(playerID)!.get(scoreBoardIndex)!;
    }
    return column;
  }

  adjustPlayerScoreBoardRow(playerID: number, adjustments: [GameBoardType | ScoreBoardIndexEnum, number][]) {
    let scoreBoard = this.scoreBoard.asMutable();
    let scoreBoardAvailable = this.scoreBoardAvailable.asMutable();

    for (let i = 0; i < adjustments.length; i++) {
      const [scoreBoardIndex, change] = adjustments[i];

      const value = scoreBoard.get(playerID)!.get(scoreBoardIndex)!;
      scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], value + change);

      if (scoreBoardIndex <= ScoreBoardIndexEnum.Imperial) {
        const available = scoreBoardAvailable.get(scoreBoardIndex)!;
        scoreBoardAvailable = scoreBoardAvailable.set(scoreBoardIndex, available - change);
      }
    }

    this.scoreBoard = scoreBoard.asImmutable();
    this.scoreBoardAvailable = scoreBoardAvailable.asImmutable();
  }

  adjustScoreBoardColumn(scoreBoardIndex: ScoreBoardIndexEnum, adjustments: number[]) {
    let scoreBoard = this.scoreBoard.asMutable();

    for (let playerID = 0; playerID < adjustments.length; playerID++) {
      const change = adjustments[playerID];
      if (change !== 0) {
        const value = scoreBoard.get(playerID)!.get(scoreBoardIndex)!;
        scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], value + change);
      }
    }

    this.scoreBoard = scoreBoard.asImmutable();
  }

  setScoreBoardColumn(scoreBoardIndex: ScoreBoardIndexEnum, values: number[]) {
    let scoreBoard = this.scoreBoard.asMutable();

    for (let playerID = 0; playerID < values.length; playerID++) {
      scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], values[playerID]);
    }

    this.scoreBoard = scoreBoard.asImmutable();
  }

  setChainSize(scoreBoardIndex: GameBoardType | ScoreBoardIndexEnum, size: number) {
    this.scoreBoardChainSize = this.scoreBoardChainSize.set(scoreBoardIndex, size);

    if (size >= 11) {
      this.safeChains = this.safeChains.set(scoreBoardIndex, true);
    }

    let price = 0;
    if (size > 0) {
      if (size < 11) {
        price = Math.min(size, 6);
      } else {
        price = Math.min(Math.floor((size - 1) / 10) + 6, 10);
      }
      if (scoreBoardIndex >= ScoreBoardIndexEnum.American) {
        price++;
      }
      if (scoreBoardIndex >= ScoreBoardIndexEnum.Continental) {
        price++;
      }
    }

    this.scoreBoardPrice = this.scoreBoardPrice.set(scoreBoardIndex, price);
  }

  updateNetWorths() {
    if (this.scoreBoard === this.scoreBoardAtLastNetWorthsUpdate && this.scoreBoardPrice === this.scoreBoardPriceAtLastNetWorthsUpdate) {
      return;
    }

    const netWorths = this.getScoreBoardColumnArray(ScoreBoardIndexEnum.Cash);

    this.scoreBoardPrice.forEach((price, chain) => {
      if (price > 0) {
        const sharesOwned = this.getScoreBoardColumnArray(chain);
        for (let playerID = 0; playerID < sharesOwned.length; playerID++) {
          const numShares = sharesOwned[playerID];
          netWorths[playerID] += numShares * price;
        }
        if (this.gameBoardTypeCounts[chain] > 0) {
          const bonuses = calculateBonuses(sharesOwned, price);
          for (let i = 0; i < bonuses.length; i++) {
            const bonus = bonuses[i];
            netWorths[bonus.playerID] += bonus.amount;
          }
        }
      }
    });

    this.setScoreBoardColumn(ScoreBoardIndexEnum.Net, netWorths);

    this.scoreBoardAtLastNetWorthsUpdate = this.scoreBoard;
    this.scoreBoardPriceAtLastNetWorthsUpdate = this.scoreBoardPrice;
  }

  getCurrentGameState() {
    if (this.currentGameState === null) {
      this.currentGameState = new GameState(this, this.gameStateHistory.get(this.gameStateHistory.size - 1, null));
    }
    return this.currentGameState;
  }

  endCurrentMove() {
    this.updateNetWorths();

    this.currentGameState = this.getCurrentGameState();
    this.currentGameState.endMove();
    this.gameStateHistory = this.gameStateHistory.push(this.currentGameState);
    this.currentGameState = null;
  }

  toJSON(): GameJSON {
    const gameActions = new Array(this.gameStateHistory.size);
    let lastTimestamp: number | null = null;
    this.gameStateHistory.forEach((gameState, i) => {
      const gameActionData: any[] = [gameState.gameAction];

      const currentTimestamp = gameState.timestamp;
      if (currentTimestamp !== null) {
        if (lastTimestamp === null) {
          gameActionData.push(currentTimestamp);
        } else {
          gameActionData.push(currentTimestamp - lastTimestamp);
        }
      }

      gameActions[i] = gameActionData;
      lastTimestamp = currentTimestamp;
    });

    return [
      this.gameMode,
      this.playerArrangementMode,
      // Time control starting amount (in seconds, null meaning infinite)
      null,
      // Time control increment amount (in seconds)
      0,
      this.userIDs.toJS(),
      this.usernames.toJS(),
      this.hostUserID,
      this.tileBag,
      gameActions,
    ];
  }

  static fromJSON(json: GameJSON) {
    const gameMode = json[0];
    const playerArrangementMode = json[1];
    // const timeControlStartingAmount = json[2];
    // const timeControlIncrementAmount = json[3];
    const userIDs = json[4];
    const usernames = json[5];
    const hostUserID = json[6];
    const tileBag = json[7];
    const gameActions = json[8];

    const game = new Game(gameMode, playerArrangementMode, tileBag, List(userIDs), List(usernames), hostUserID, null);

    let lastTimestamp: number | null = null;
    for (let i = 0; i < gameActions.length; i++) {
      const gameAction = gameActions[i];
      const gameActionParameters = gameAction[0];

      let currentTimestamp: number | null = gameAction.length >= 2 ? gameAction[1]! : null;
      if (currentTimestamp !== null && lastTimestamp !== null) {
        currentTimestamp += lastTimestamp;
      }

      game.doGameAction(gameActionParameters, currentTimestamp);

      lastTimestamp = currentTimestamp;
    }

    return game;
  }
}

const dummyGameAction = PB_GameAction.create();
const dummyPlayerGameStates: PB_GameState[] = [];
const dummyWatcherGameState = PB_GameState.create();

export class GameState {
  playerID = -1;
  gameActionEnum = GameActionEnum.StartGame;
  gameAction = dummyGameAction;
  timestamp: number | null = null;
  revealedTileRackTiles: PB_GameState_RevealedTileRackTile[] = [];
  revealedTileBagTiles: GameStateTileBagTile[] = [];
  playerIDWithPlayableTile: number | null = null;
  gameHistoryMessages: GameHistoryMessageData[] = [];
  nextGameAction: ActionBase;

  turnPlayerID = 0;
  tileRacks = defaultTileRacks;
  tileRackTypes = defaultTileRackTypesList;
  gameBoard = defaultGameBoard;
  scoreBoard = defaultScoreBoard;
  scoreBoardAvailable = defaultScoreBoardAvailable;
  scoreBoardChainSize = defaultScoreBoardChainSize;
  scoreBoardPrice = defaultScoreBoardPrice;
  safeChains = defaultSafeChains;

  revealedTileBagTilesLookup = new Map<number, GameStateTileBagTile>();

  playerGameStates = dummyPlayerGameStates;
  watcherGameState = dummyWatcherGameState;

  constructor(public game: Game, public previousGameState: GameState | null) {
    // assign something to this.nextGameAction so it gets set in the constructor
    this.nextGameAction = game.gameActionStack[game.gameActionStack.length - 1];
  }

  setGameAction(playerID: number, gameActionEnum: GameActionEnum, gameAction: PB_GameAction, timestamp: number | null) {
    this.playerID = playerID;
    this.gameActionEnum = gameActionEnum;
    this.gameAction = gameAction;
    this.timestamp = timestamp;
  }

  addTileBagTile(tile: number, playerID: number | null) {
    const gameStateTileBagTile = new GameStateTileBagTile(tile, playerID);
    this.revealedTileBagTiles.push(gameStateTileBagTile);
    this.revealedTileBagTilesLookup.set(tile, gameStateTileBagTile);
  }

  addPlayedTile(tile: number, playerID: number) {
    // if already in the tile bag additions
    if (this.revealedTileBagTilesLookup.has(tile)) {
      // change it to public
      this.revealedTileBagTilesLookup.get(tile)!.playerIDWithPermission = null;
    } else {
      // add it to the tile rack additions
      const revealedTileRackTile = PB_GameState_RevealedTileRackTile.create({ tile, playerIdBelongsTo: playerID });
      this.revealedTileRackTiles.push(revealedTileRackTile);
    }
  }

  addGameHistoryMessage(gameHistoryMessage: GameHistoryMessageEnum, playerID: number | null, parameters: any[]) {
    this.gameHistoryMessages.push(new GameHistoryMessageData(gameHistoryMessage, playerID, parameters));
  }

  endMove() {
    this.turnPlayerID = this.game.turnPlayerID;
    this.tileRacks = this.game.tileRacks;
    this.tileRackTypes = this.game.tileRackTypes;
    this.gameBoard = this.game.gameBoard;
    this.scoreBoard = this.game.scoreBoard;
    this.scoreBoardAvailable = this.game.scoreBoardAvailable;
    this.scoreBoardChainSize = this.game.scoreBoardChainSize;
    this.scoreBoardPrice = this.game.scoreBoardPrice;
    this.safeChains = this.game.safeChains;
    this.nextGameAction = this.game.gameActionStack[this.game.gameActionStack.length - 1];

    if (this.nextGameAction.gameAction === GameActionEnum.PlayTile) {
      this.playerIDWithPlayableTile = this.nextGameAction.playerID;
    }

    if (this.revealedTileBagTiles.length > 0) {
      // save some memory
      this.revealedTileBagTilesLookup.clear();
    }
  }

  createPlayerAndWatcherGameStates() {
    this.playerGameStates = new Array(this.game.userIDs.size);
    for (let playerID = 0; playerID < this.playerGameStates.length; playerID++) {
      this.playerGameStates[playerID] = this.createGameState(playerID);
    }

    this.watcherGameState = this.createGameState(-1);
  }

  createGameState(playerID: number) {
    let timestamp = this.timestamp;
    if (timestamp !== null && this.previousGameState !== null && this.previousGameState.timestamp !== null) {
      timestamp -= this.previousGameState.timestamp;
    }

    const revealedTileRackTiles: PB_GameState_RevealedTileRackTile[] = [];
    for (let i = 0; i < this.revealedTileRackTiles.length; i++) {
      const gameStateTileRackTile = this.revealedTileRackTiles[i];
      if (gameStateTileRackTile.playerIdBelongsTo !== playerID) {
        revealedTileRackTiles.push(gameStateTileRackTile);
      }
    }

    const revealedTileBagTiles: number[] = [];
    for (let i = 0; i < this.revealedTileBagTiles.length; i++) {
      const gameStateTileBagTile = this.revealedTileBagTiles[i];
      revealedTileBagTiles.push(
        gameStateTileBagTile.playerIDWithPermission === null || gameStateTileBagTile.playerIDWithPermission === playerID
          ? gameStateTileBagTile.tile
          : TileEnum.Unknown,
      );
    }

    const gameState = PB_GameState.create();

    gameState.gameAction = this.gameAction;
    if (timestamp !== null) {
      gameState.timestamp = timestamp;
    }
    if (revealedTileRackTiles.length > 0) {
      gameState.revealedTileRackTiles = revealedTileRackTiles;
    }
    if (revealedTileBagTiles.length > 0) {
      gameState.revealedTileBagTiles = revealedTileBagTiles;
    }
    if (this.playerIDWithPlayableTile !== null) {
      gameState.playerIdWithPlayableTilePlusOne = this.playerIDWithPlayableTile + 1;
    }

    return gameState;
  }
}

export class GameHistoryMessageData {
  constructor(public gameHistoryMessage: GameHistoryMessageEnum, public playerID: number | null, public parameters: any[]) {}
}

export class GameStateTileBagTile {
  constructor(public tile: number, public playerIDWithPermission: number | null) {}
}
