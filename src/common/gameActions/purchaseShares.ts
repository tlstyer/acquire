import { defaultScoreBoardRow } from '../defaults';
import { GameAction, GameBoardType, GameHistoryMessage, ScoreBoardIndex } from '../enums';
import { UserInputError } from '../error';
import { Game } from '../game';
import { ActionBase } from './base';
import { ActionGameOver } from './gameOver';
import { ActionPlayTile } from './playTile';

export class ActionPurchaseShares extends ActionBase {
    cannotAffordAnyShares = false;
    canEndGame = false;

    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.PurchaseShares);
    }

    prepare() {
        // set corresponding score board chain size to 0 if the game board doesn't have any cells of a given type
        for (let type = 0; type <= GameBoardType.Imperial; type++) {
            if (this.game.gameBoardTypeCounts[type] === 0 && this.game.scoreBoardChainSize.get(type, 0) > 0) {
                this.game.setChainSize(type, 0);
            }
        }

        this.game.determineTileRackTypesForEverybody();

        let hasChainSize = false;
        let hasChainSizeLessThan11 = false;
        let hasChainSizeGreaterThan40 = false;
        let sharesAvailable = false;
        let canPurchaseShares = false;
        const cash = this.game.scoreBoard.get(this.playerID, defaultScoreBoardRow).get(ScoreBoardIndex.Cash, 0);
        for (let type = 0; type <= GameBoardType.Imperial; type++) {
            const chainSize = this.game.scoreBoardChainSize.get(type, 0);
            if (chainSize > 0) {
                hasChainSize = true;
                if (chainSize < 11) {
                    hasChainSizeLessThan11 = true;
                }
                if (chainSize > 40) {
                    hasChainSizeGreaterThan40 = true;
                }

                const available = this.game.scoreBoardAvailable.get(type, 0);
                if (available > 0) {
                    sharesAvailable = true;

                    const price = this.game.scoreBoardPrice.get(type, 0);
                    if (price <= cash) {
                        canPurchaseShares = true;
                    }
                }
            }
        }
        this.cannotAffordAnyShares = sharesAvailable && !canPurchaseShares;
        this.canEndGame = hasChainSize && (!hasChainSizeLessThan11 || hasChainSizeGreaterThan40);

        if (!canPurchaseShares && !this.canEndGame) {
            if (this.cannotAffordAnyShares) {
                this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.CouldNotAffordAnyShares, this.playerID, []);
            }
            return this.completeAction(false);
        } else {
            return null;
        }
    }

    execute(parameters: any[]) {
        if (parameters.length !== 2) {
            throw new UserInputError('did not get exactly 2 parameters');
        }
        const chains: number[] = parameters[0];
        if (!Array.isArray(chains)) {
            throw new UserInputError('chains parameter is not an array');
        }
        if (chains.length > 3) {
            throw new UserInputError('length of chains parameter is larger than 3');
        }
        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];
            if (!Number.isInteger(chain) || chain < GameBoardType.Luxor || chain > GameBoardType.Imperial) {
                throw new UserInputError('a chain parameter is not a valid chain');
            }
        }
        const endGame: number = parameters[1];
        if (endGame !== 0 && endGame !== 1) {
            throw new UserInputError('end game parameter is not 0 or 1');
        }

        const chainCounts = [0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < chains.length; i++) {
            chainCounts[chains[i]]++;
        }
        const chainsAndCounts: [ScoreBoardIndex, number][] = [];
        for (let chain = 0; chain < chainCounts.length; chain++) {
            const count = chainCounts[chain];
            if (count > 0) {
                chainsAndCounts.push([chain, count]);
            }
        }

        let cost = 0;
        for (let i = 0; i < chainsAndCounts.length; i++) {
            const [chain, count] = chainsAndCounts[i];

            if (this.game.scoreBoardChainSize.get(chain, 0) === 0) {
                throw new UserInputError('a requested chain does not exist on the board');
            }
            if (count > this.game.scoreBoardAvailable.get(chain, 0)) {
                throw new UserInputError('more shares requested for a chain than are available');
            }

            cost += this.game.scoreBoardPrice.get(chain, 0) * count;
        }
        if (cost > this.game.scoreBoard.get(this.playerID, defaultScoreBoardRow).get(ScoreBoardIndex.Cash, 0)) {
            throw new UserInputError('not enough cash to pay for requested shares');
        }

        if (cost > 0) {
            this.game.adjustPlayerScoreBoardRow(this.playerID, [...chainsAndCounts, [ScoreBoardIndex.Cash, -cost]]);
        }

        if (this.cannotAffordAnyShares) {
            this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.CouldNotAffordAnyShares, this.playerID, []);
        } else {
            this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.PurchasedShares, this.playerID, [chainsAndCounts]);
        }

        return this.completeAction(endGame === 1 && this.canEndGame);
    }

    protected completeAction(endGame: boolean): ActionBase[] {
        let allTilesPlayed = this.game.gameBoardTypeCounts[GameBoardType.Nothing] === 0;
        const noTilesPlayedForEntireRound = this.game.numTurnsWithoutPlayedTiles === this.game.userIDs.size;

        if (endGame || allTilesPlayed || noTilesPlayedForEntireRound) {
            if (endGame) {
                this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.EndedGame, this.playerID, []);
            } else if (allTilesPlayed) {
                this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.AllTilesPlayed, null, []);
            } else {
                this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.NoTilesPlayedForEntireRound, null, []);
            }

            return [new ActionGameOver(this.game, this.playerID)];
        } else {
            this.game.drawTiles(this.playerID);
            this.game.determineTileRackTypesForPlayer(this.playerID);
            this.game.replaceDeadTiles(this.playerID);

            allTilesPlayed = this.game.gameBoardTypeCounts[GameBoardType.Nothing] === 0;
            if (allTilesPlayed) {
                this.game.getCurrentMoveData().addGameHistoryMessage(GameHistoryMessage.AllTilesPlayed, null, []);
                return [new ActionGameOver(this.game, this.playerID)];
            }

            const nextPlayerID = (this.playerID + 1) % this.game.userIDs.size;
            return [new ActionPlayTile(this.game, nextPlayerID), new ActionPurchaseShares(this.game, nextPlayerID)];
        }
    }
}
