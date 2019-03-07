import { List } from 'immutable';
import {
  defaultGameBoard,
  defaultMoveDataHistory,
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
import { GameAction, GameBoardType, GameHistoryMessage, GameMode, PlayerArrangementMode, ScoreBoardIndex, Tile } from './enums';
import { ActionBase } from './gameActions/base';
import { ActionStartGame } from './gameActions/startGame';
import { calculateBonuses, neighboringTilesLookup } from './helpers';

type GameJSON = [GameMode, PlayerArrangementMode, number | null, number, number[], string[], number, number[], ([any] | [any, number])[]];

export class Game {
  nextTileBagIndex = 0;
  gameBoardTypeCounts: number[];
  protected currentMoveData: MoveData | null = null;
  moveDataHistory = defaultMoveDataHistory;
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
    this.gameBoardTypeCounts = new Array(GameBoardType.Max);
    for (let i = 0; i < GameBoardType.Max; i++) {
      this.gameBoardTypeCounts[i] = 0;
    }
    this.gameBoardTypeCounts[GameBoardType.Nothing] = 108;

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

  processMoveDataMessage(message: any[]) {
    const gameActionParameters: any[] = message[0];

    let timestamp: number | null = null;
    if (message.length >= 2) {
      timestamp = message[1];
      if (timestamp !== null) {
        const previousMoveData = this.moveDataHistory.get(this.moveDataHistory.size - 1, null);
        if (previousMoveData !== null && previousMoveData.timestamp !== null) {
          timestamp += previousMoveData.timestamp;
        }
      }
    }

    if (message.length >= 3) {
      this.processRevealedTileRackTiles(message[2]);
    }

    if (message.length >= 4) {
      this.processRevealedTileBagTiles(message[3]);
    }

    if (message.length >= 5) {
      this.processPlayerIDWithPlayableTile(message[4]);
    }

    this.doGameAction(gameActionParameters, timestamp);
  }

  processRevealedTileRackTiles(entries: [number, number][]) {
    const playerIDs: number[] = [];

    this.tileRacks = this.tileRacks.asMutable();

    for (let i = 0; i < entries.length; i++) {
      const [tile, playerID] = entries[i];
      let setTile = false;

      if (playerIDs.indexOf(playerID) === -1) {
        playerIDs.push(playerID);
      }

      for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        if (this.tileRacks.get(playerID)!.get(tileIndex, null) === Tile.Unknown) {
          this.tileRacks.setIn([playerID, tileIndex], tile);
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

  doGameAction(parameters: any[], timestamp: number | null) {
    let currentAction = this.gameActionStack[this.gameActionStack.length - 1];

    let newActions: ActionBase[] | null = currentAction.execute(parameters);
    this.getCurrentMoveData().setGameAction(currentAction.playerID, currentAction.gameAction, parameters, timestamp);

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

      this.getCurrentMoveData().addTileBagTile(tile, playerID);

      if (addDrewTileMessage) {
        this.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.DrewTile, playerID, [tile]);
      }

      if (this.nextTileBagIndex === 108) {
        this.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.DrewLastTile, playerID, []);
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
        if (type !== GameBoardType.CantPlayEver) {
          continue;
        }

        this.removeTile(playerID, tileIndex);
        this.setGameBoardPosition(tile, GameBoardType.CantPlayEver);
        this.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.ReplacedDeadTile, playerID, [tile]);
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
    for (let i = 0; i <= GameBoardType.Imperial; i++) {
      if (this.gameBoardTypeCounts[i] === 0) {
        canStartNewChain = true;
        break;
      }
    }

    for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
      const tile = this.tileRacks.get(playerID)!.get(tileIndex, null);
      let tileType = null;

      if (tile !== null && tile !== Tile.Unknown) {
        const borderTiles: number[] = [];
        let borderTypes: GameBoardType[] = [];
        const neighboringTiles = neighboringTilesLookup[tile];
        for (let i = 0; i < neighboringTiles.length; i++) {
          const neighboringTile = neighboringTiles[i];
          borderTiles.push(neighboringTile);
          borderTypes.push(this.gameBoard.get(neighboringTile % 9)!.get(neighboringTile / 9)!);
        }

        borderTypes = borderTypes.filter((type, index) => {
          if (type === GameBoardType.Nothing || type === GameBoardType.CantPlayEver) {
            return false;
          }
          if (borderTypes.indexOf(type) !== index) {
            // exclude this as it is already in the array
            return false;
          }
          return true;
        });
        if (borderTypes.length > 1) {
          borderTypes = borderTypes.filter(type => type !== GameBoardType.NothingYet);
        }

        if (borderTypes.length === 0) {
          tileType = GameBoardType.WillPutLonelyTileDown;
          lonelyTileIndexes.push(tileIndex);
          for (let i = 0; i < borderTiles.length; i++) {
            lonelyTileBorderTiles.add(borderTiles[i]);
          }
        } else if (borderTypes.length === 1) {
          if (borderTypes.indexOf(GameBoardType.NothingYet) !== -1) {
            if (canStartNewChain) {
              tileType = GameBoardType.WillFormNewChain;
            } else {
              tileType = GameBoardType.CantPlayNow;
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
            tileType = GameBoardType.CantPlayEver;
          } else {
            tileType = GameBoardType.WillMergeChains;
          }
        }
      }

      tileTypes.push(tileType);
    }

    if (canStartNewChain) {
      for (let i = 0; i < lonelyTileIndexes.length; i++) {
        const tileIndex = lonelyTileIndexes[i];

        const tileType = tileTypes[tileIndex];
        if (tileType === GameBoardType.WillPutLonelyTileDown) {
          const tile = this.tileRacks.get(playerID)!.get(tileIndex, null);
          if (tile !== null && lonelyTileBorderTiles.has(tile)) {
            tileTypes[tileIndex] = GameBoardType.HaveNeighboringTileToo;
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

    if (previousGameBoardType === GameBoardType.Nothing) {
      this.getCurrentMoveData().addPlayedTile(tile, this.gameActionStack[this.gameActionStack.length - 1].playerID);
    }

    this.gameBoardTypeCounts[previousGameBoardType]--;
    this.gameBoard = this.gameBoard.setIn([tile % 9, tile / 9], gameBoardType);
    this.gameBoardTypeCounts[gameBoardType]++;
  }

  fillCells(tile: number, gameBoardType: GameBoardType) {
    const pending = [tile];
    const found = new Set([tile]);
    const excludedTypes = new Set([GameBoardType.Nothing, GameBoardType.CantPlayEver, gameBoardType]);

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

  getScoreBoardColumnArray(scoreBoardIndex: GameBoardType | ScoreBoardIndex) {
    const column: number[] = new Array(this.userIDs.size);
    for (let playerID = 0; playerID < this.userIDs.size; playerID++) {
      column[playerID] = this.scoreBoard.get(playerID)!.get(scoreBoardIndex)!;
    }
    return column;
  }

  adjustPlayerScoreBoardRow(playerID: number, adjustments: [GameBoardType | ScoreBoardIndex, number][]) {
    let scoreBoard = this.scoreBoard.asMutable();
    let scoreBoardAvailable = this.scoreBoardAvailable.asMutable();

    for (let i = 0; i < adjustments.length; i++) {
      const [scoreBoardIndex, change] = adjustments[i];

      const value = scoreBoard.get(playerID)!.get(scoreBoardIndex)!;
      scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], value + change);

      if (scoreBoardIndex <= ScoreBoardIndex.Imperial) {
        const available = scoreBoardAvailable.get(scoreBoardIndex)!;
        scoreBoardAvailable = scoreBoardAvailable.set(scoreBoardIndex, available - change);
      }
    }

    this.scoreBoard = scoreBoard.asImmutable();
    this.scoreBoardAvailable = scoreBoardAvailable.asImmutable();
  }

  adjustScoreBoardColumn(scoreBoardIndex: ScoreBoardIndex, adjustments: number[]) {
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

  setScoreBoardColumn(scoreBoardIndex: ScoreBoardIndex, values: number[]) {
    let scoreBoard = this.scoreBoard.asMutable();

    for (let playerID = 0; playerID < values.length; playerID++) {
      scoreBoard = scoreBoard.setIn([playerID, scoreBoardIndex], values[playerID]);
    }

    this.scoreBoard = scoreBoard.asImmutable();
  }

  setChainSize(scoreBoardIndex: GameBoardType | ScoreBoardIndex, size: number) {
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
      if (scoreBoardIndex >= ScoreBoardIndex.American) {
        price++;
      }
      if (scoreBoardIndex >= ScoreBoardIndex.Continental) {
        price++;
      }
    }

    this.scoreBoardPrice = this.scoreBoardPrice.set(scoreBoardIndex, price);
  }

  updateNetWorths() {
    if (this.scoreBoard === this.scoreBoardAtLastNetWorthsUpdate && this.scoreBoardPrice === this.scoreBoardPriceAtLastNetWorthsUpdate) {
      return;
    }

    const netWorths = this.getScoreBoardColumnArray(ScoreBoardIndex.Cash);

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

    this.setScoreBoardColumn(ScoreBoardIndex.Net, netWorths);

    this.scoreBoardAtLastNetWorthsUpdate = this.scoreBoard;
    this.scoreBoardPriceAtLastNetWorthsUpdate = this.scoreBoardPrice;
  }

  getCurrentMoveData() {
    if (this.currentMoveData === null) {
      this.currentMoveData = new MoveData(this, this.moveDataHistory.get(this.moveDataHistory.size - 1, null));
    }
    return this.currentMoveData;
  }

  endCurrentMove() {
    this.updateNetWorths();

    this.currentMoveData = this.getCurrentMoveData();
    this.currentMoveData.endMove();
    this.moveDataHistory = this.moveDataHistory.push(this.currentMoveData);
    this.currentMoveData = null;
  }

  toJSON(): GameJSON {
    const gameActions = new Array(this.moveDataHistory.size);
    let lastTimestamp: number | null = null;
    this.moveDataHistory.forEach((moveData, i) => {
      const gameActionData: any[] = [moveData.gameActionParameters];

      const currentTimestamp = moveData.timestamp;
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

const dummyPlayerMessages: any[][] = [];
const dummyWatcherMessage: any[] = [];

export class MoveData {
  playerID = -1;
  gameAction = GameAction.StartGame;
  gameActionParameters: any[] = [];
  timestamp: number | null = null;
  revealedTileRackTiles: MoveDataTileRackTile[] = [];
  revealedTileBagTiles: MoveDataTileBagTile[] = [];
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

  revealedTileBagTilesLookup = new Map<number, MoveDataTileBagTile>();

  playerMessages = dummyPlayerMessages;
  watcherMessage = dummyWatcherMessage;

  constructor(public game: Game, public previousMoveData: MoveData | null) {
    // assign something to this.nextGameAction so it gets set in the constructor
    this.nextGameAction = game.gameActionStack[game.gameActionStack.length - 1];
  }

  setGameAction(playerID: number, gameAction: GameAction, parameters: any[], timestamp: number | null) {
    this.playerID = playerID;
    this.gameAction = gameAction;
    this.gameActionParameters = parameters;
    this.timestamp = timestamp;
  }

  addTileBagTile(tile: number, playerID: number | null) {
    const moveDataTileBagTile = new MoveDataTileBagTile(tile, playerID);
    this.revealedTileBagTiles.push(moveDataTileBagTile);
    this.revealedTileBagTilesLookup.set(tile, moveDataTileBagTile);
  }

  addPlayedTile(tile: number, playerID: number) {
    // if already in the tile bag additions
    if (this.revealedTileBagTilesLookup.has(tile)) {
      // change it to public
      this.revealedTileBagTilesLookup.get(tile)!.playerIDWithPermission = null;
    } else {
      // add it to the tile rack additions
      this.revealedTileRackTiles.push(new MoveDataTileRackTile(tile, playerID));
    }
  }

  addGameHistoryMessage(gameHistoryMessage: GameHistoryMessage, playerID: number | null, parameters: any[]) {
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

    if (this.nextGameAction.gameAction === GameAction.PlayTile) {
      this.playerIDWithPlayableTile = this.nextGameAction.playerID;
    }

    if (this.revealedTileBagTiles.length > 0) {
      // save some memory
      this.revealedTileBagTilesLookup.clear();
    }
  }

  createPlayerAndWatcherMessages() {
    this.playerMessages = new Array(this.game.userIDs.size);
    for (let playerID = 0; playerID < this.playerMessages.length; playerID++) {
      this.playerMessages[playerID] = this.createMessage(playerID);
    }

    this.watcherMessage = this.createMessage(-1);
  }

  createMessage(playerID: number) {
    let timestamp = this.timestamp;
    if (timestamp !== null && this.previousMoveData !== null && this.previousMoveData.timestamp !== null) {
      timestamp -= this.previousMoveData.timestamp;
    }

    const revealedTileRackTiles: [number, number][] = [];
    for (let i = 0; i < this.revealedTileRackTiles.length; i++) {
      const moveDataTileRackTile = this.revealedTileRackTiles[i];
      if (moveDataTileRackTile.playerIDBelongsTo !== playerID) {
        revealedTileRackTiles.push([moveDataTileRackTile.tile, moveDataTileRackTile.playerIDBelongsTo]);
      }
    }

    const revealedTileBagTiles: number[] = [];
    for (let i = 0; i < this.revealedTileBagTiles.length; i++) {
      const moveDataTileBagTile = this.revealedTileBagTiles[i];
      revealedTileBagTiles.push(
        moveDataTileBagTile.playerIDWithPermission === null || moveDataTileBagTile.playerIDWithPermission === playerID
          ? moveDataTileBagTile.tile
          : Tile.Unknown,
      );
    }

    if (this.playerIDWithPlayableTile !== null) {
      return [this.gameActionParameters, timestamp, revealedTileRackTiles, revealedTileBagTiles, this.playerIDWithPlayableTile];
    } else if (revealedTileBagTiles.length > 0) {
      return [this.gameActionParameters, timestamp, revealedTileRackTiles, revealedTileBagTiles];
    } else if (revealedTileRackTiles.length > 0) {
      return [this.gameActionParameters, timestamp, revealedTileRackTiles];
    } else if (timestamp !== null) {
      return [this.gameActionParameters, timestamp];
    } else {
      return [this.gameActionParameters];
    }
  }
}

export class GameHistoryMessageData {
  constructor(public gameHistoryMessage: GameHistoryMessage, public playerID: number | null, public parameters: any[]) {}
}

export class MoveDataTileRackTile {
  constructor(public tile: number, public playerIDBelongsTo: number) {}
}

export class MoveDataTileBagTile {
  constructor(public tile: number, public playerIDWithPermission: number | null) {}
}
