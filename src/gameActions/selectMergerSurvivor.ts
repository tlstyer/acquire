import { ActionBase } from './base';
import { GameHistoryMessage, GameAction, GameBoardType, ScoreBoardIndex } from '../enums';
import { Game, GameHistoryMessageData } from '../game';
import { calculateBonuses } from '../helpers';
import { ActionDisposeOfShares } from './disposeOfShares';
import { ActionSelectChainToDisposeOfNext } from './selectChainToDisposeOfNext';

export class ActionSelectMergerSurvivor extends ActionBase {
    chainsBySize: GameBoardType[][];

    constructor(game: Game, playerID: number, public chains: GameBoardType[], public tile: number) {
        super(game, playerID, GameAction.SelectMergerSurvivor);

        let sizeToChains: { [key: number]: GameBoardType[] } = {};
        let sizes: number[] = [];
        for (let i = 0; i < chains.length; i++) {
            const chain = chains[i];
            const size = this.game.gameBoardTypeCounts[chain];
            if (!sizeToChains[size]) {
                sizeToChains[size] = [];
                sizes.push(size);
            }
            sizeToChains[size].push(chain);
        }

        sizes.sort((a, b) => (a < b ? 1 : -1));

        const chainsBySize = new Array(sizes.length);
        for (let i = 0; i < sizes.length; i++) {
            const size = sizes[i];
            chainsBySize[i] = sizeToChains[size];
        }

        this.chainsBySize = chainsBySize;

        this.parameters.push(this.chainsBySize[0], tile);
    }

    prepare() {
        this.game.getCurrentMoveData().addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.MergedChains, this.playerID, [this.chains]));

        if (this.chainsBySize[0].length === 1) {
            return this.completeAction(this.chainsBySize[0][0]);
        } else {
            return null;
        }
    }

    execute(parameters: any[]) {
        return null;
    }

    protected completeAction(controllingChain: GameBoardType): ActionBase[] {
        const moveData = this.game.getCurrentMoveData();

        this.game.fillCells(this.tile, controllingChain);
        // @ts-ignore
        this.game.setChainSize(controllingChain, this.game.gameBoardTypeCounts[controllingChain]);
        this.game.determineTileRackTypesForEverybody();

        // pay bonuses
        let bonuses: number[] = new Array(this.game.userIDs.length);
        for (let playerID = 0; playerID < bonuses.length; playerID++) {
            bonuses[playerID] = 0;
        }

        for (let i = 0; i < this.chains.length; i++) {
            const chain = this.chains[i];
            if (chain !== controllingChain) {
                const chainBonuses = calculateBonuses(this.game.getScoreBoardColumnArray(chain), this.game.scoreBoardPrice.get(chain, 0));
                for (let j = 0; j < chainBonuses.length; j++) {
                    const chainBonus = chainBonuses[j];
                    bonuses[chainBonus.playerID] += chainBonus.amount;
                    moveData.addGameHistoryMessage(
                        new GameHistoryMessageData(GameHistoryMessage.ReceivedBonus, chainBonus.playerID, [chain, chainBonus.amount])
                    );
                }
            }
        }
        this.game.adjustScoreBoardColumn(ScoreBoardIndex.Cash, bonuses);

        this.chainsBySize[0] = this.chainsBySize[0].filter(c => c !== controllingChain);

        let actions: ActionBase[] = [];
        for (let i = 0; i < this.chainsBySize.length; i++) {
            const chains = this.chainsBySize[i];
            actions.push(new ActionSelectChainToDisposeOfNext(this.game, this.playerID, chains, controllingChain));
        }

        return actions;
    }
}
