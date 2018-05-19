import { GameAction, GameBoardType, GameHistoryMessage } from '../enums';
import { Game } from '../game';
import { ActionBase } from './base';
import { ActionPlayTile } from './playTile';
import { ActionPurchaseShares } from './purchaseShares';

export class ActionStartGame extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.StartGame);
    }

    prepare() {
        return null;
    }

    execute(parameters: any[]) {
        const moveData = this.game.getCurrentMoveData();

        // draw position tiles
        const positionTiles: PositionTileData[] = new Array(this.game.userIDs.size);
        for (let tileBagIndex = 0; tileBagIndex < positionTiles.length; tileBagIndex++) {
            positionTiles[tileBagIndex] = new PositionTileData(this.game.tileBag[tileBagIndex], tileBagIndex);
        }
        positionTiles.sort((a, b) => (a.tile < b.tile ? -1 : 1));
        for (let playerID = 0; playerID < positionTiles.length; playerID++) {
            positionTiles[playerID].playerID = playerID;
        }
        positionTiles.sort((a, b) => (a.tileBagIndex < b.tileBagIndex ? -1 : 1));
        for (let i = 0; i < positionTiles.length; i++) {
            const positionTile = positionTiles[i];
            moveData.addTileBagTile(positionTile.tile, null);
            this.game.setGameBoardPosition(positionTile.tile, GameBoardType.NothingYet);
            moveData.addGameHistoryMessage(GameHistoryMessage.DrewPositionTile, positionTile.playerID, [positionTile.tile]);
        }

        this.game.nextTileBagIndex = this.game.userIDs.size;

        // start game
        moveData.addGameHistoryMessage(GameHistoryMessage.StartedGame, this.playerID, []);
        for (let playerID = 0; playerID < this.game.userIDs.size; playerID++) {
            this.game.drawTiles(playerID);
        }

        this.game.determineTileRackTypesForEverybody();

        return [new ActionPlayTile(this.game, 0), new ActionPurchaseShares(this.game, 0)];
    }
}

class PositionTileData {
    playerID = 0;

    constructor(public tile: number, public tileBagIndex: number) {}
}
