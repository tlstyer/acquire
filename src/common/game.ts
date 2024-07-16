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
import { ScoreBoardIndexEnum, TileEnum } from './enums';
import type { ActionBase } from './gameActions/base';
import { ActionStartGame } from './gameActions/startGame';
import {
  GameHistoryMessageDrewLastTile,
  GameHistoryMessageDrewTile,
  GameHistoryMessageReplacedDeadTile,
} from './gameHistoryMessage';
import { GameState } from './gameState';
import { calculateBonuses, neighboringTilesLookup } from './helpers';
import {
  PB_GameAction,
  PB_GameBoardType,
  PB_GameMode,
  PB_GameState,
  PB_GameState_RevealedTileRackTile,
  PB_PlayerArrangementMode,
} from './pb';

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
    public gameMode: PB_GameMode,
    public playerArrangementMode: PB_PlayerArrangementMode,
    public tileBag: number[],
    public userIDs: number[],
    public usernames: string[],
    public hostUserID: number,
    public myUserID: number | null,
  ) {
    // initialize this.gameBoardTypeCounts
    this.gameBoardTypeCounts = new Array(PB_GameBoardType.MAX);
    this.gameBoardTypeCounts.fill(0);
    this.gameBoardTypeCounts[PB_GameBoardType.NOTHING] = 108;

    // initialize this.gameActionStack
    this.gameActionStack.push(new ActionStartGame(this, userIDs.indexOf(hostUserID)));

    // initialize this.tileRacks, this.tileRackTypes, this.scoreBoard
    this.tileRacks = [];
    this.tileRackTypes = [];
    this.scoreBoard = [];
    for (let playerID = 0; playerID < userIDs.length; playerID++) {
      this.tileRacks.push(defaultTileRack);
      this.tileRackTypes.push(defaultTileRackTypes);
      this.scoreBoard.push(defaultScoreBoardRow);
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
        const previousGameState =
          this.gameStateHistory.length > 0
            ? this.gameStateHistory[this.gameStateHistory.length - 1]
            : null;
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

    this.tileRacks = [...this.tileRacks];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const tile = entry.tile;
      const playerIdBelongsTo = entry.playerIdBelongsTo;

      let setTile = false;

      if (playerIDs.indexOf(playerIdBelongsTo) === -1) {
        playerIDs.push(playerIdBelongsTo);
      }

      for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        if (this.tileRacks[playerIdBelongsTo][tileIndex] === TileEnum.Unknown) {
          this.tileRacks[playerIdBelongsTo] = [...this.tileRacks[playerIdBelongsTo]];
          this.tileRacks[playerIdBelongsTo][tileIndex] = tile;

          setTile = true;
          break;
        }
      }

      if (!setTile) {
        throw new Error('no unknown tile found in player tile rack');
      }
    }

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
    this.getCurrentGameState().setGameAction(
      currentAction.playerID,
      currentAction.gameAction,
      gameAction,
      timestamp,
    );

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
    const addDrewTileMessage = this.myUserID === null || this.myUserID === this.userIDs[playerID];

    for (let i = 0; i < 6; i++) {
      if (this.tileRacks[playerID][i] !== null) {
        continue;
      }

      if (this.nextTileBagIndex >= this.tileBag.length) {
        if (this.tileBag.length < 108) {
          throw new Error('missing tiles from tile bag');
        }
        return;
      }

      const tile = this.tileBag[this.nextTileBagIndex++];

      this.tileRacks = [...this.tileRacks];
      this.tileRacks[playerID] = [...this.tileRacks[playerID]];
      this.tileRacks[playerID][i] = tile;

      this.getCurrentGameState().addTileBagTile(tile, playerID);

      if (addDrewTileMessage) {
        this.getCurrentGameState().addGameHistoryMessage(
          new GameHistoryMessageDrewTile(playerID, tile),
        );
      }

      if (this.nextTileBagIndex === 108) {
        this.getCurrentGameState().addGameHistoryMessage(
          new GameHistoryMessageDrewLastTile(playerID),
        );
      }
    }
  }

  removeTile(playerID: number, tileIndex: number) {
    this.tileRacks = [...this.tileRacks];
    this.tileRacks[playerID] = [...this.tileRacks[playerID]];
    this.tileRacks[playerID][tileIndex] = null;

    this.tileRackTypes = [...this.tileRackTypes];
    this.tileRackTypes[playerID] = [...this.tileRackTypes[playerID]];
    this.tileRackTypes[playerID][tileIndex] = null;
  }

  replaceDeadTiles(playerID: number) {
    let replacedADeadTile = false;
    do {
      replacedADeadTile = false;
      const tileRack = this.tileRacks[playerID];
      const tileRackTypes = this.tileRackTypes[playerID];
      for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        const tile = tileRack[tileIndex];
        if (tile === null) {
          continue;
        }

        const type = tileRackTypes[tileIndex];
        if (type !== PB_GameBoardType.CANT_PLAY_EVER) {
          continue;
        }

        this.removeTile(playerID, tileIndex);
        this.setGameBoardPosition(tile, PB_GameBoardType.CANT_PLAY_EVER);
        this.getCurrentGameState().addGameHistoryMessage(
          new GameHistoryMessageReplacedDeadTile(playerID, tile),
        );
        this.drawTiles(playerID);
        this.determineTileRackTypesForPlayer(playerID);
        replacedADeadTile = true;
        // replace one tile at a time
        break;
      }
    } while (replacedADeadTile);
  }

  determineTileRackTypesForEverybody() {
    for (let playerID = 0; playerID < this.userIDs.length; playerID++) {
      this.determineTileRackTypesForPlayer(playerID);
    }
  }

  determineTileRackTypesForPlayer(playerID: number) {
    const tileTypes: (PB_GameBoardType | null)[] = [];
    const lonelyTileIndexes: number[] = [];
    const lonelyTileBorderTiles = new Set<number>();

    let canStartNewChain = false;
    for (let i = 0; i <= PB_GameBoardType.IMPERIAL; i++) {
      if (this.gameBoardTypeCounts[i] === 0) {
        canStartNewChain = true;
        break;
      }
    }

    for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
      const tile = this.tileRacks[playerID][tileIndex];
      let tileType = null;

      if (tile !== null && tile !== TileEnum.Unknown) {
        const borderTiles: number[] = [];
        let borderTypes: PB_GameBoardType[] = [];
        const neighboringTiles = neighboringTilesLookup[tile];
        for (let i = 0; i < neighboringTiles.length; i++) {
          const neighboringTile = neighboringTiles[i];
          borderTiles.push(neighboringTile.tile);
          borderTypes.push(this.gameBoard[neighboringTile.y][neighboringTile.x]);
        }

        borderTypes = borderTypes.filter((type, index) => {
          if (type === PB_GameBoardType.NOTHING || type === PB_GameBoardType.CANT_PLAY_EVER) {
            return false;
          }
          if (borderTypes.indexOf(type) !== index) {
            // exclude this as it is already in the array
            return false;
          }
          return true;
        });
        if (borderTypes.length > 1) {
          borderTypes = borderTypes.filter((type) => type !== PB_GameBoardType.NOTHING_YET);
        }

        if (borderTypes.length === 0) {
          tileType = PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN;
          lonelyTileIndexes.push(tileIndex);
          for (let i = 0; i < borderTiles.length; i++) {
            lonelyTileBorderTiles.add(borderTiles[i]);
          }
        } else if (borderTypes.length === 1) {
          if (borderTypes.indexOf(PB_GameBoardType.NOTHING_YET) !== -1) {
            if (canStartNewChain) {
              tileType = PB_GameBoardType.WILL_FORM_NEW_CHAIN;
            } else {
              tileType = PB_GameBoardType.CANT_PLAY_NOW;
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
            tileType = PB_GameBoardType.CANT_PLAY_EVER;
          } else {
            tileType = PB_GameBoardType.WILL_MERGE_CHAINS;
          }
        }
      }

      tileTypes.push(tileType);
    }

    if (canStartNewChain) {
      for (let i = 0; i < lonelyTileIndexes.length; i++) {
        const tileIndex = lonelyTileIndexes[i];

        const tileType = tileTypes[tileIndex];
        if (tileType === PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN) {
          const tile = this.tileRacks[playerID][tileIndex];
          if (tile !== null && lonelyTileBorderTiles.has(tile)) {
            tileTypes[tileIndex] = PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO;
          }
        }
      }
    }

    this.tileRackTypes = [...this.tileRackTypes];
    this.tileRackTypes[playerID] = tileTypes;
  }

  setGameBoardPosition(tile: number, gameBoardType: PB_GameBoardType) {
    const y = tile % 9;
    const x = (tile - y) / 9;

    const previousGameBoardType = this.gameBoard[y][x];

    if (previousGameBoardType === PB_GameBoardType.NOTHING) {
      this.getCurrentGameState().addPlayedTile(
        tile,
        this.gameActionStack[this.gameActionStack.length - 1].playerID,
      );
    }

    this.getCurrentGameState().addGameBoardChange(tile, gameBoardType);

    this.gameBoardTypeCounts[previousGameBoardType]--;

    this.gameBoard = [...this.gameBoard];
    this.gameBoard[y] = [...this.gameBoard[y]];
    this.gameBoard[y][x] = gameBoardType;

    this.gameBoardTypeCounts[gameBoardType]++;
  }

  fillCells(tile: number, gameBoardType: PB_GameBoardType) {
    const pending = [tile];
    const found = new Set([tile]);
    const excludedTypes = new Set([
      PB_GameBoardType.NOTHING,
      PB_GameBoardType.CANT_PLAY_EVER,
      gameBoardType,
    ]);

    let t = pending.pop();
    while (t !== undefined) {
      this.setGameBoardPosition(t, gameBoardType);

      const neighboringTiles = neighboringTilesLookup[t];
      for (let i = 0; i < neighboringTiles.length; i++) {
        const neighboringTile = neighboringTiles[i];

        if (
          !found.has(neighboringTile.tile) &&
          !excludedTypes.has(this.gameBoard[neighboringTile.y][neighboringTile.x])
        ) {
          pending.push(neighboringTile.tile);
          found.add(neighboringTile.tile);
        }
      }

      t = pending.pop();
    }
  }

  getScoreBoardColumnArray(scoreBoardIndex: PB_GameBoardType | ScoreBoardIndexEnum) {
    const column: number[] = new Array(this.userIDs.length);
    for (let playerID = 0; playerID < this.userIDs.length; playerID++) {
      column[playerID] = this.scoreBoard[playerID][scoreBoardIndex];
    }
    return column;
  }

  adjustPlayerScoreBoardRow(playerID: number, adjustments: ScoreBoardAdjustment[]) {
    this.scoreBoard = [...this.scoreBoard];
    this.scoreBoard[playerID] = [...this.scoreBoard[playerID]];
    this.scoreBoardAvailable = [...this.scoreBoardAvailable];

    for (let i = 0; i < adjustments.length; i++) {
      const adjustment = adjustments[i];

      this.scoreBoard[playerID][adjustment.scoreBoardIndex] += adjustment.change;

      if (adjustment.scoreBoardIndex <= ScoreBoardIndexEnum.Imperial) {
        this.scoreBoardAvailable[adjustment.scoreBoardIndex] -= adjustment.change;
      }
    }
  }

  adjustScoreBoardColumn(scoreBoardIndex: ScoreBoardIndexEnum, adjustments: number[]) {
    this.scoreBoard = [...this.scoreBoard];

    for (let playerID = 0; playerID < adjustments.length; playerID++) {
      const change = adjustments[playerID];
      if (change !== 0) {
        this.scoreBoard[playerID] = [...this.scoreBoard[playerID]];
        this.scoreBoard[playerID][scoreBoardIndex] += change;
      }
    }
  }

  setScoreBoardColumn(scoreBoardIndex: ScoreBoardIndexEnum, values: number[]) {
    this.scoreBoard = [...this.scoreBoard];

    for (let playerID = 0; playerID < values.length; playerID++) {
      if (this.scoreBoard[playerID][scoreBoardIndex] !== values[playerID]) {
        this.scoreBoard[playerID] = [...this.scoreBoard[playerID]];
        this.scoreBoard[playerID][scoreBoardIndex] = values[playerID];
      }
    }
  }

  setChainSize(scoreBoardIndex: PB_GameBoardType | ScoreBoardIndexEnum, size: number) {
    this.scoreBoardChainSize = [...this.scoreBoardChainSize];
    this.scoreBoardChainSize[scoreBoardIndex] = size;

    if (size >= 11 && !this.safeChains[scoreBoardIndex]) {
      this.safeChains = [...this.safeChains];
      this.safeChains[scoreBoardIndex] = true;
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

    this.scoreBoardPrice = [...this.scoreBoardPrice];
    this.scoreBoardPrice[scoreBoardIndex] = price;
  }

  updateNetWorths() {
    if (
      this.scoreBoard === this.scoreBoardAtLastNetWorthsUpdate &&
      this.scoreBoardPrice === this.scoreBoardPriceAtLastNetWorthsUpdate
    ) {
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
      this.currentGameState = new GameState(
        this,
        this.gameStateHistory.length > 0
          ? this.gameStateHistory[this.gameStateHistory.length - 1]
          : null,
      );
    }
    return this.currentGameState;
  }

  endCurrentMove() {
    this.updateNetWorths();

    this.currentGameState = this.getCurrentGameState();
    this.currentGameState.endMove();
    this.gameStateHistory = [...this.gameStateHistory, this.currentGameState];
    this.currentGameState = null;
  }
}

export class ScoreBoardAdjustment {
  constructor(
    public scoreBoardIndex: PB_GameBoardType | ScoreBoardIndexEnum,
    public change: number,
  ) {}
}
