import { GameAction, GameBoardType, GameHistoryMessage } from '../enums';
import { UserInputError } from '../error';
import { Game, GameHistoryMessageData } from '../game';
import { ActionBase } from './base';
import { ActionDisposeOfShares } from './disposeOfShares';

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
        if (parameters.length !== 1) {
            throw new UserInputError('did not get exactly 1 parameter');
        }
        const nextChain: GameBoardType = parameters[0];
        if (!Number.isInteger(nextChain)) {
            throw new UserInputError('parameter is not an integer');
        }
        if (nextChain < GameBoardType.Luxor || nextChain > GameBoardType.Imperial) {
            throw new UserInputError('parameter provided is not a valid chain');
        }
        if (this.defunctChains.indexOf(nextChain) === -1) {
            throw new UserInputError('cannot select chain provided as the next chain');
        }

        this.game
            .getCurrentMoveData()
            .addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.SelectedChainToDisposeOfNext, this.playerID, [nextChain]));

        return this.completeAction(nextChain);
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
