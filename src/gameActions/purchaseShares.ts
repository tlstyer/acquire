import { ActionBase } from './base';
import { ActionPlayTile } from './playTile';
import { GameAction } from '../enums';
import { Game } from '../game';

export class ActionPurchaseShares extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.PurchaseShares);
    }

    prepare(): ActionBase[] | null {
        this.game.drawTiles(this.playerID);
        this.game.determineTileRackTypesForPlayer(this.playerID);

        const nextPlayerID = (this.playerID + 1) % this.game.userIDs.length;
        return [new ActionPlayTile(this.game, nextPlayerID), new ActionPurchaseShares(this.game, nextPlayerID)];
    }

    execute(parameters: any[]) {
        return [];
    }
}
