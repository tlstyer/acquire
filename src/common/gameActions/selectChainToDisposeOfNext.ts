import { GameActionEnum } from '../enums';
import { UserInputError } from '../error';
import type { Game } from '../game';
import { GameHistoryMessageSelectedChainToDisposeOfNext } from '../gameHistoryMessage';
import { PB_GameAction, PB_GameBoardType } from '../pb';
import { ActionBase } from './base';
import { ActionDisposeOfShares } from './disposeOfShares';

export class ActionSelectChainToDisposeOfNext extends ActionBase {
  constructor(
    game: Game,
    playerId: number,
    public defunctChains: PB_GameBoardType[],
    public controllingChain: PB_GameBoardType,
  ) {
    super(game, playerId, GameActionEnum.SelectChainToDisposeOfNext);
  }

  prepare() {
    if (this.defunctChains.length === 1) {
      return this.completeAction(this.defunctChains[0]);
    } else {
      return null;
    }
  }

  execute(gameAction: PB_GameAction) {
    if (!gameAction.selectChainToDisposeOfNext) {
      throw new UserInputError('selectChainToDisposeOfNext game action not provided');
    }
    const chain = gameAction.selectChainToDisposeOfNext.chain;
    if (chain < PB_GameBoardType.LUXOR || chain > PB_GameBoardType.IMPERIAL) {
      throw new UserInputError('chain is not a valid chain');
    }
    if (this.defunctChains.indexOf(chain) === -1) {
      throw new UserInputError('cannot select chain as the next chain');
    }

    this.game
      .getCurrentGameState()
      .addGameHistoryMessage(
        new GameHistoryMessageSelectedChainToDisposeOfNext(this.playerId, chain),
      );

    return this.completeAction(chain);
  }

  protected completeAction(nextChain: PB_GameBoardType) {
    const actions: ActionBase[] = [];

    const sharesOwned = this.game.getScoreBoardColumnArray(nextChain);
    let playerId = this.playerId;
    do {
      if (sharesOwned[playerId] > 0) {
        actions.push(
          new ActionDisposeOfShares(this.game, playerId, nextChain, this.controllingChain),
        );
      }
      playerId = (playerId + 1) % this.game.userIds.length;
    } while (playerId !== this.playerId);

    const remainingDefunctChains = this.defunctChains.filter((c) => c !== nextChain);
    if (remainingDefunctChains.length > 0) {
      actions.push(
        new ActionSelectChainToDisposeOfNext(
          this.game,
          this.playerId,
          remainingDefunctChains,
          this.controllingChain,
        ),
      );
    }

    return actions;
  }
}
