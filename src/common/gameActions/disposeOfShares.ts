import { defaultScoreBoardRow } from '../defaults';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from '../enums';
import { UserInputError } from '../error';
import { Game } from '../game';
import { ActionBase } from './base';

export class ActionDisposeOfShares extends ActionBase {
    sharesOwnedInDefunctChain: number;
    sharesAvailableInControllingChain = 0;

    constructor(game: Game, playerID: number, public defunctChain: GameBoardType, public controllingChain: GameBoardType) {
        super(game, playerID, GameAction.DisposeOfShares);

        this.sharesOwnedInDefunctChain = this.game.scoreBoard.get(playerID, defaultScoreBoardRow).get(defunctChain, 0);
    }

    prepare() {
        this.sharesAvailableInControllingChain = this.game.scoreBoardAvailable.get(this.controllingChain, 0);

        return null;
    }

    execute(parameters: any[]) {
        if (parameters.length !== 2) {
            throw new UserInputError('did not get exactly 2 parameters');
        }
        const tradeAmount: number = parameters[0];
        const sellAmount: number = parameters[1];
        if (!Number.isInteger(tradeAmount) || tradeAmount < 0) {
            throw new UserInputError('trade amount is not an integer >= 0');
        }
        if (!Number.isInteger(sellAmount) || sellAmount < 0) {
            throw new UserInputError('sell amount is not an integer >= 0');
        }
        if (tradeAmount % 2 !== 0) {
            throw new UserInputError('trade amount is not a multiple of 2');
        }
        if (tradeAmount / 2 > this.sharesAvailableInControllingChain) {
            throw new UserInputError('cannot trade for more shares than are available');
        }
        if (tradeAmount + sellAmount > this.sharesOwnedInDefunctChain) {
            throw new UserInputError('cannot trade and sell more shares than owned');
        }

        if (tradeAmount > 0 || sellAmount > 0) {
            const adjustments: [GameBoardType | ScoreBoardIndex, number][] = [[this.defunctChain, -tradeAmount - sellAmount]];
            if (tradeAmount > 0) {
                adjustments.push([this.controllingChain, tradeAmount / 2]);
            }
            if (sellAmount > 0) {
                adjustments.push([ScoreBoardIndex.Cash, sellAmount * this.game.scoreBoardPrice.get(this.defunctChain, 0)]);
            }
            this.game.adjustPlayerScoreBoardRow(this.playerID, adjustments);
        }

        this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.DisposedOfShares, this.playerID, [this.defunctChain, tradeAmount, sellAmount]);

        return [];
    }
}
