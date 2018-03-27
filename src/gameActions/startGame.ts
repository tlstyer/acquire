import { ActionBase } from './base';
import { ActionPlayTile } from './playTile';
import { ActionPurchaseShares } from './purchaseShares';
import { GameBoardType, GameHistoryMessage, GameAction } from '../enums';
import { Game, GameHistoryMessageData } from '../game';

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
        const positionTiles = this.game.tileBag.slice(0, this.game.userIDs.length);
        this.game.nextTileBagIndex = this.game.userIDs.length;
        positionTiles.sort((a, b) => (a < b ? -1 : 1));
        for (let i = 0; i < positionTiles.length; i++) {
            const tile = positionTiles[i];
            moveData.addNewGloballyKnownTile(tile);
            this.game.setGameBoardPosition(tile, GameBoardType.NothingYet);
            moveData.addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.DrewPositionTile, i, [tile]));
        }

        // start game
        moveData.addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.StartedGame, this.playerID, []));
        for (let playerIndex = 0; playerIndex < this.game.userIDs.length; playerIndex++) {
            this.game.drawTiles(playerIndex);
        }

        this.game.determineTileRackTypesForEverybody();

        return [new ActionPlayTile(this.game, 0), new ActionPurchaseShares(this.game, 0)];
    }
}
