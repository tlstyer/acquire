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
  constructor(game: Game, playerId: number) {
    super(game, playerId, GameActionEnum.StartGame);
  }

  prepare() {
    return null;
  }

  execute() {
    const gameState = this.game.getCurrentGameState();

    // draw position tiles
    const positionTiles: PositionTileData[] = new Array(this.game.userIds.length);
    for (let tileBagIndex = 0; tileBagIndex < positionTiles.length; tileBagIndex++) {
      positionTiles[tileBagIndex] = new PositionTileData(
        this.game.tileBag[tileBagIndex],
        tileBagIndex,
      );
    }
    positionTiles.sort((a, b) => a.tile - b.tile);
    for (let playerId = 0; playerId < positionTiles.length; playerId++) {
      positionTiles[playerId].playerId = playerId;
    }
    positionTiles.sort((a, b) => a.tileBagIndex - b.tileBagIndex);
    for (let i = 0; i < positionTiles.length; i++) {
      const positionTile = positionTiles[i];
      gameState.addTileBagTile(positionTile.tile, null);
      this.game.setGameBoardPosition(positionTile.tile, PB_GameBoardType.NOTHING_YET);
      gameState.addGameHistoryMessage(
        new GameHistoryMessageDrewPositionTile(positionTile.playerId, positionTile.tile),
      );
    }

    this.game.nextTileBagIndex = this.game.userIds.length;

    // start game
    gameState.addGameHistoryMessage(new GameHistoryMessageStartedGame(this.playerId));
    for (let playerId = 0; playerId < this.game.userIds.length; playerId++) {
      this.game.drawTiles(playerId);
    }

    this.game.determineTileRackTypesForEverybody();

    return [new ActionPlayTile(this.game, 0), new ActionPurchaseShares(this.game, 0)];
  }
}

class PositionTileData {
  playerId = 0;

  constructor(
    public tile: number,
    public tileBagIndex: number,
  ) {}
}
