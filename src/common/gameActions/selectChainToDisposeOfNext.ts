import { GameActionEnum, GameHistoryMessageEnum } from '../enums';
import { UserInputError } from '../error';
import { Game } from '../game';
import { GameBoardType, PB_GameAction } from '../pb';
import { ActionBase } from './base';
import { ActionDisposeOfShares } from './disposeOfShares';

export class ActionSelectChainToDisposeOfNext extends ActionBase {
  constructor(game: Game, playerID: number, public defunctChains: GameBoardType[], public controllingChain: GameBoardType) {
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
    if (chain < GameBoardType.LUXOR || chain > GameBoardType.IMPERIAL) {
      throw new UserInputError('chain is not a valid chain');
    }
    if (this.defunctChains.indexOf(chain) === -1) {
      throw new UserInputError('cannot select chain as the next chain');
    }

    this.game.getCurrentGameState().addGameHistoryMessage(GameHistoryMessageEnum.SelectedChainToDisposeOfNext, this.playerID, [chain]);

    return this.completeAction(chain);
  }

  protected completeAction(nextChain: GameBoardType) {
    const actions: ActionBase[] = [];

    const sharesOwned = this.game.getScoreBoardColumnArray(nextChain);
    let playerID = this.playerID;
    do {
      if (sharesOwned[playerID] > 0) {
        actions.push(new ActionDisposeOfShares(this.game, playerID, nextChain, this.controllingChain));
      }
      playerID = (playerID + 1) % this.game.userIDs.size;
    } while (playerID !== this.playerID);

    const remainingDefunctChains = this.defunctChains.filter((c) => c !== nextChain);
    if (remainingDefunctChains.length > 0) {
      actions.push(new ActionSelectChainToDisposeOfNext(this.game, this.playerID, remainingDefunctChains, this.controllingChain));
    }

    return actions;
  }
}
