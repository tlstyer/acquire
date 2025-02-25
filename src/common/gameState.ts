import {
  defaultGameBoard,
  defaultSafeChains,
  defaultScoreBoard,
  defaultScoreBoardAvailable,
  defaultScoreBoardChainSize,
  defaultScoreBoardPrice,
  defaultTileRacks,
  defaultTileRackTypesList,
} from './defaults.js';
import { TileEnum } from './enums.js';
import { type Game } from './game.js';
import { type ActionBase } from './gameActions/base.js';
import { ActionPlayTile } from './gameActions/playTile.js';
import { type GameHistoryMessage } from './gameHistoryMessage.js';
import {
  PB_GameAction,
  PB_GameBoardChanges,
  PB_GameBoardType,
  PB_GameState,
  PB_GameState_RevealedTileRackTile,
} from './pb.js';

const dummyGameAction = PB_GameAction.create();
const dummyPlayerGameStates: PB_GameState[] = [];
const dummyWatcherGameState = PB_GameState.create();

export class GameState {
  playerId = -1;
  gameAction = dummyGameAction;
  timestamp: number | null = null;
  revealedTileRackTiles: PB_GameState_RevealedTileRackTile[] = [];
  revealedTileBagTiles: GameStateTileBagTile[] = [];
  playerIdWithPlayableTile: number | null = null;
  gameHistoryMessages: GameHistoryMessage[] = [];
  nextGameAction: ActionBase;

  turnPlayerId = 0;
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

  gameBoardChanges: PB_GameBoardChanges | null = null;

  constructor(
    public game: Game,
    public previousGameState: GameState | null,
  ) {
    // assign something to this.nextGameAction so it gets set in the constructor
    this.nextGameAction = game.gameActionStack[game.gameActionStack.length - 1];
  }

  setGameAction(playerId: number, gameAction: PB_GameAction, timestamp: number | null) {
    this.playerId = playerId;
    this.gameAction = gameAction;
    this.timestamp = timestamp;
  }

  addTileBagTile(tile: number, playerId: number | null) {
    const gameStateTileBagTile = new GameStateTileBagTile(tile, playerId);
    this.revealedTileBagTiles.push(gameStateTileBagTile);
    this.revealedTileBagTilesLookup.set(tile, gameStateTileBagTile);
  }

  addPlayedTile(tile: number, playerId: number) {
    // if already in the tile bag additions
    if (this.revealedTileBagTilesLookup.has(tile)) {
      // change it to public
      this.revealedTileBagTilesLookup.get(tile)!.playerIdWithPermission = null;
    } else {
      // add it to the tile rack additions
      const revealedTileRackTile = PB_GameState_RevealedTileRackTile.create({
        tile,
        playerIdBelongsTo: playerId,
      });
      this.revealedTileRackTiles.push(revealedTileRackTile);
    }
  }

  addGameBoardChange(tile: number, gameBoardType: PB_GameBoardType) {
    if (this.gameBoardChanges === null) {
      this.gameBoardChanges = PB_GameBoardChanges.create();
    }

    switch (gameBoardType) {
      case PB_GameBoardType.LUXOR: {
        this.gameBoardChanges.luxorTiles.push(tile);
        break;
      }
      case PB_GameBoardType.TOWER: {
        this.gameBoardChanges.towerTiles.push(tile);
        break;
      }
      case PB_GameBoardType.AMERICAN: {
        this.gameBoardChanges.americanTiles.push(tile);
        break;
      }
      case PB_GameBoardType.FESTIVAL: {
        this.gameBoardChanges.festivalTiles.push(tile);
        break;
      }
      case PB_GameBoardType.WORLDWIDE: {
        this.gameBoardChanges.worldwideTiles.push(tile);
        break;
      }
      case PB_GameBoardType.CONTINENTAL: {
        this.gameBoardChanges.continentalTiles.push(tile);
        break;
      }
      case PB_GameBoardType.IMPERIAL: {
        this.gameBoardChanges.imperialTiles.push(tile);
        break;
      }
      case PB_GameBoardType.NOTHING_YET: {
        this.gameBoardChanges.nothingYetTiles.push(tile);
        break;
      }
      case PB_GameBoardType.CANT_PLAY_EVER: {
        this.gameBoardChanges.cantPlayEverTiles.push(tile);
        break;
      }
    }
  }

  addGameHistoryMessage(gameHistoryMessage: GameHistoryMessage) {
    this.gameHistoryMessages.push(gameHistoryMessage);
  }

  endMove() {
    this.turnPlayerId = this.game.turnPlayerId;
    this.tileRacks = this.game.tileRacks;
    this.tileRackTypes = this.game.tileRackTypes;
    this.gameBoard = this.game.gameBoard;
    this.scoreBoard = this.game.scoreBoard;
    this.scoreBoardAvailable = this.game.scoreBoardAvailable;
    this.scoreBoardChainSize = this.game.scoreBoardChainSize;
    this.scoreBoardPrice = this.game.scoreBoardPrice;
    this.safeChains = this.game.safeChains;
    this.nextGameAction = this.game.gameActionStack[this.game.gameActionStack.length - 1];

    if (this.nextGameAction instanceof ActionPlayTile) {
      this.playerIdWithPlayableTile = this.nextGameAction.playerId;
    }

    if (this.revealedTileBagTiles.length > 0) {
      // save some memory
      this.revealedTileBagTilesLookup.clear();
    }
  }

  createPlayerAndWatcherGameStates() {
    this.playerGameStates = new Array(this.game.users.length);
    for (let playerId = 0; playerId < this.playerGameStates.length; playerId++) {
      this.playerGameStates[playerId] = this.createGameState(playerId);
    }

    this.watcherGameState = this.createGameState(-1);
  }

  createGameState(playerId: number) {
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
      if (gameStateTileRackTile.playerIdBelongsTo !== playerId) {
        revealedTileRackTiles.push(gameStateTileRackTile);
      }
    }

    const revealedTileBagTiles: number[] = [];
    for (let i = 0; i < this.revealedTileBagTiles.length; i++) {
      const gameStateTileBagTile = this.revealedTileBagTiles[i];
      revealedTileBagTiles.push(
        gameStateTileBagTile.playerIdWithPermission === null ||
          gameStateTileBagTile.playerIdWithPermission === playerId
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
    if (this.playerIdWithPlayableTile !== null) {
      gameState.playerIdWithPlayableTilePlusOne = this.playerIdWithPlayableTile + 1;
    }

    return gameState;
  }
}

export class GameStateTileBagTile {
  constructor(
    public tile: number,
    public playerIdWithPermission: number | null,
  ) {}
}
