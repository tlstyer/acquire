import { GameActionEnum, ScoreBoardIndexEnum } from '../enums';
import { UserInputError } from '../error';
import type { Game } from '../game';
import {
  GameHistoryMessageMergedChains,
  GameHistoryMessageReceivedBonus,
  GameHistoryMessageSelectedMergerSurvivor,
} from '../gameHistoryMessage';
import { calculateBonuses } from '../helpers';
import { PB_GameAction, PB_GameBoardType } from '../pb';
import { ActionBase } from './base';
import { ActionSelectChainToDisposeOfNext } from './selectChainToDisposeOfNext';

export class ActionSelectMergerSurvivor extends ActionBase {
  chainsBySize: PB_GameBoardType[][];

  constructor(
    game: Game,
    playerID: number,
    public chains: PB_GameBoardType[],
    public tile: number,
  ) {
    super(game, playerID, GameActionEnum.SelectMergerSurvivor);

    const sizeToChains = new Map<number, PB_GameBoardType[]>();
    const sizes: number[] = [];
    for (let i = 0; i < chains.length; i++) {
      const chain = chains[i];
      const size = this.game.gameBoardTypeCounts[chain];

      let chainsOfThisSize = sizeToChains.get(size);
      if (chainsOfThisSize === undefined) {
        chainsOfThisSize = [];
        sizeToChains.set(size, chainsOfThisSize);
        sizes.push(size);
      }

      chainsOfThisSize.push(chain);
    }

    sizes.sort((a, b) => b - a);

    const chainsBySize: PB_GameBoardType[][] = new Array(sizes.length);
    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      chainsBySize[i] = sizeToChains.get(size)!;
    }

    this.chainsBySize = chainsBySize;
  }

  prepare() {
    this.game
      .getCurrentGameState()
      .addGameHistoryMessage(new GameHistoryMessageMergedChains(this.playerID, this.chains));

    if (this.chainsBySize[0].length === 1) {
      return this.completeAction(this.chainsBySize[0][0]);
    } else {
      this.game.setGameBoardPosition(this.tile, PB_GameBoardType.NOTHING_YET);
      this.game.determineTileRackTypesForEverybody();
      return null;
    }
  }

  execute(gameAction: PB_GameAction) {
    if (!gameAction.selectMergerSurvivor) {
      throw new UserInputError('selectMergerSurvivor game action not provided');
    }
    const chain = gameAction.selectMergerSurvivor.chain;
    if (chain < PB_GameBoardType.LUXOR || chain > PB_GameBoardType.IMPERIAL) {
      throw new UserInputError('chain is not a valid chain');
    }
    if (this.chainsBySize[0].indexOf(chain) === -1) {
      throw new UserInputError('cannot select chain as the controlling chain');
    }

    this.game
      .getCurrentGameState()
      .addGameHistoryMessage(new GameHistoryMessageSelectedMergerSurvivor(this.playerID, chain));

    return this.completeAction(chain);
  }

  protected completeAction(controllingChain: PB_GameBoardType) {
    const gameState = this.game.getCurrentGameState();

    this.game.fillCells(this.tile, controllingChain);
    this.game.setChainSize(controllingChain, this.game.gameBoardTypeCounts[controllingChain]);
    this.game.determineTileRackTypesForEverybody();

    // pay bonuses
    const bonuses: number[] = new Array(this.game.userIDs.length);
    bonuses.fill(0);

    for (let i = 0; i < this.chains.length; i++) {
      const chain = this.chains[i];
      if (chain !== controllingChain) {
        const chainBonuses = calculateBonuses(
          this.game.getScoreBoardColumnArray(chain),
          this.game.scoreBoardPrice[chain],
        );
        for (let j = 0; j < chainBonuses.length; j++) {
          const chainBonus = chainBonuses[j];
          bonuses[chainBonus.playerID] += chainBonus.amount;
          gameState.addGameHistoryMessage(
            new GameHistoryMessageReceivedBonus(chainBonus.playerID, chain, chainBonus.amount),
          );
        }
      }
    }
    this.game.adjustScoreBoardColumn(ScoreBoardIndexEnum.Cash, bonuses);

    const actions: ActionBase[] = [];
    for (let i = 0; i < this.chainsBySize.length; i++) {
      let chains = this.chainsBySize[i];
      if (i === 0) {
        chains = chains.filter((c) => c !== controllingChain);
      }

      if (chains.length > 0) {
        actions.push(
          new ActionSelectChainToDisposeOfNext(this.game, this.playerID, chains, controllingChain),
        );
      }
    }

    return actions;
  }
}
