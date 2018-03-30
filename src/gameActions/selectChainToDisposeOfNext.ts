import { ActionBase } from './base';
import { GameAction, GameBoardType } from '../enums';
import { Game } from '../game';

export class ActionSelectChainToDisposeOfNext extends ActionBase {
    constructor(game: Game, playerID: number, public defunctChains: GameBoardType[], public controllingChain: GameBoardType) {
        super(game, playerID, GameAction.SelectChainToDisposeOfNext);

        this.parameters.push(defunctChains);
    }

    prepare() {
        if (this.defunctChains.length === 1) {
            return this.completeAction(this.defunctChains[0]);
        } else {
            return null;
        }
    }

    execute(parameters: any[]) {
        return [];
    }

    protected completeAction(nextChain: GameBoardType) {
        return null;
    }
}
