import { ActionBase } from './base';
import { GameAction } from '../enums';
import { Game } from '../game';

export class ActionPurchaseShares extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.PurchaseShares);
    }

    prepare() {
        return null;
    }

    execute(parameters: any[]) {
        return [];
    }
}
