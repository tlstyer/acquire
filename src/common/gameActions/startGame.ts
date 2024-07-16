import { GameActionEnum } from '../enums';
import type { Game } from '../game';
import {
  GameHistoryMessageDrewPositionTile,
  GameHistoryMessageStartedGame,
} from '../gameHistoryMessage';
import { PB_GameBoardType } from '../pb';
import { ActionBase } from './base';
import { ActionPlayTile } from './playTile';
import { ActionPurchaseShares } from './purchaseShares';

export class ActionStartGame extends ActionBase {
  constructor(game: Game, playerID: number) {
    super(game, playerID, GameActionEnum.StartGame);
  }

  prepare() {
    return null;
  }

  execute() {
    const gameState = this.game.getCurrentGameState();

    // draw position tiles
    const positionTiles: PositionTileData[] = new Array(this.game.userIDs.length);
    for (let tileBagIndex = 0; tileBagIndex < positionTiles.length; tileBagIndex++) {
      positionTiles[tileBagIndex] = new PositionTileData(
        this.game.tileBag[tileBagIndex],
        tileBagIndex,
      );
    }
    positionTiles.sort((a, b) => a.tile - b.tile);
    for (let playerID = 0; playerID < positionTiles.length; playerID++) {
      positionTiles[playerID].playerID = playerID;
    }
    positionTiles.sort((a, b) => a.tileBagIndex - b.tileBagIndex);
    for (let i = 0; i < positionTiles.length; i++) {
      const positionTile = positionTiles[i];
      gameState.addTileBagTile(positionTile.tile, null);
      this.game.setGameBoardPosition(positionTile.tile, PB_GameBoardType.NOTHING_YET);
      gameState.addGameHistoryMessage(
        new GameHistoryMessageDrewPositionTile(positionTile.playerID, positionTile.tile),
      );
    }

    this.game.nextTileBagIndex = this.game.userIDs.length;

    // start game
    gameState.addGameHistoryMessage(new GameHistoryMessageStartedGame(this.playerID));
    for (let playerID = 0; playerID < this.game.userIDs.length; playerID++) {
      this.game.drawTiles(playerID);
    }

    this.game.determineTileRackTypesForEverybody();

    return [new ActionPlayTile(this.game, 0), new ActionPurchaseShares(this.game, 0)];
  }
}

class PositionTileData {
  playerID = 0;

  constructor(
    public tile: number,
    public tileBagIndex: number,
  ) {}
}
