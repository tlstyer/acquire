import {
  defaultGameBoard,
  defaultSafeChains,
  defaultScoreBoard,
  defaultScoreBoardAvailable,
  defaultScoreBoardChainSize,
  defaultScoreBoardPrice,
  defaultTileRacks,
  defaultTileRackTypesList,
} from './defaults';
import { GameActionEnum, TileEnum } from './enums';
import type { Game } from './game';
import type { ActionBase } from './gameActions/base';
import type { GameHistoryMessage } from './gameHistoryMessage';
import {
  PB_GameAction,
  PB_GameBoardType,
  PB_GameState,
  PB_GameState_RevealedTileRackTile,
} from './pb';

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
  gameHistoryMessages: GameHistoryMessage[] = [];
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

  gameBoardChangeGameBoardType: PB_GameBoardType | undefined = undefined;
  gameBoardChangeTiles: number[] = [];
  gameBoardCantPlayEverTiles: number[] = [];

  constructor(public game: Game, public previousGameState: GameState | null) {
    // assign something to this.nextGameAction so it gets set in the constructor
    this.nextGameAction = game.gameActionStack[game.gameActionStack.length - 1];
  }

  setGameAction(
    playerID: number,
    gameActionEnum: GameActionEnum,
    gameAction: PB_GameAction,
    timestamp: number | null,
  ) {
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
      const revealedTileRackTile = PB_GameState_RevealedTileRackTile.create({
        tile,
        playerIdBelongsTo: playerID,
      });
      this.revealedTileRackTiles.push(revealedTileRackTile);
    }
  }

  addGameBoardChange(tile: number, gameBoardType: PB_GameBoardType) {
    if (gameBoardType === PB_GameBoardType.CANT_PLAY_EVER) {
      this.gameBoardCantPlayEverTiles.push(tile);
    } else {
      if (this.gameBoardChangeGameBoardType !== undefined) {
        if (gameBoardType !== this.gameBoardChangeGameBoardType) {
          throw new Error(
            'different gameBoardType than other game board changes for this game state',
          );
        }
      } else {
        this.gameBoardChangeGameBoardType = gameBoardType;
      }

      this.gameBoardChangeTiles.push(tile);
    }
  }

  addGameHistoryMessage(gameHistoryMessage: GameHistoryMessage) {
    this.gameHistoryMessages.push(gameHistoryMessage);
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
    this.playerGameStates = new Array(this.game.userIDs.length);
    for (let playerID = 0; playerID < this.playerGameStates.length; playerID++) {
      this.playerGameStates[playerID] = this.createGameState(playerID);
    }

    this.watcherGameState = this.createGameState(-1);
  }

  createGameState(playerID: number) {
    let timestamp = this.timestamp;
    if (
      timestamp !== null &&
      this.previousGameState !== null &&
      this.previousGameState.timestamp !== null
    ) {
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
        gameStateTileBagTile.playerIDWithPermission === null ||
          gameStateTileBagTile.playerIDWithPermission === playerID
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

export class GameStateTileBagTile {
  constructor(public tile: number, public playerIDWithPermission: number | null) {}
}
