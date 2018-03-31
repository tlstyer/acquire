import { ActionBase } from './base';
import { ActionDisposeOfShares } from './disposeOfShares';
import { GameAction, GameBoardType } from '../enums';
import { Game } from '../game';

export class ActionSelectChainToDisposeOfNext extends ActionBase {
    constructor(game: Game, playerID: number, public defunctChains: GameBoardType[], public controllingChain: GameBoardType) {
        super(game, playerID, GameAction.SelectChainToDisposeOfNext);
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
        let actions: ActionBase[] = [];

        const sharesOwned = this.game.getScoreBoardColumnArray(nextChain);
        let playerID = this.playerID;
        do {
            if (sharesOwned[playerID] > 0) {
                actions.push(new ActionDisposeOfShares(this.game, playerID, nextChain, this.controllingChain));
            }
            playerID = (playerID + 1) % this.game.userIDs.length;
        } while (playerID !== this.playerID);

        const remainingDefunctChains = this.defunctChains.filter(c => c !== nextChain);
        if (remainingDefunctChains.length > 0) {
            actions.push(new ActionSelectChainToDisposeOfNext(this.game, this.playerID, remainingDefunctChains, this.controllingChain));
        }

        return actions;
    }
}
