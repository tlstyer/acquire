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
    playerID: number,
    public defunctChains: PB_GameBoardType[],
    public controllingChain: PB_GameBoardType,
  ) {
    super(game, playerID, GameActionEnum.SelectChainToDisposeOfNext);
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
        new GameHistoryMessageSelectedChainToDisposeOfNext(this.playerID, chain),
      );

    return this.completeAction(chain);
  }

  protected completeAction(nextChain: PB_GameBoardType) {
    const actions: ActionBase[] = [];

    const sharesOwned = this.game.getScoreBoardColumnArray(nextChain);
    let playerID = this.playerID;
    do {
      if (sharesOwned[playerID] > 0) {
        actions.push(
          new ActionDisposeOfShares(this.game, playerID, nextChain, this.controllingChain),
        );
      }
      playerID = (playerID + 1) % this.game.userIDs.length;
    } while (playerID !== this.playerID);

    const remainingDefunctChains = this.defunctChains.filter((c) => c !== nextChain);
    if (remainingDefunctChains.length > 0) {
      actions.push(
        new ActionSelectChainToDisposeOfNext(
          this.game,
          this.playerID,
          remainingDefunctChains,
          this.controllingChain,
        ),
      );
    }

    return actions;
  }
}
