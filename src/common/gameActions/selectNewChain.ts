import { GameActionEnum } from '../enums';
import { UserInputError } from '../error';
import { ScoreBoardAdjustment, type Game } from '../game';
import { GameHistoryMessageFormedChain } from '../gameHistoryMessage';
import { PB_GameAction, PB_GameBoardType } from '../pb';
import { ActionBase } from './base';

export class ActionSelectNewChain extends ActionBase {
  constructor(
    game: Game,
    playerID: number,
    public availableChains: PB_GameBoardType[],
    public tile: number,
  ) {
    super(game, playerID, GameActionEnum.SelectNewChain);
  }

  prepare() {
    if (this.availableChains.length === 1) {
      this.createNewChain(this.availableChains[0]);
      return [];
    } else {
      this.game.setGameBoardPosition(this.tile, PB_GameBoardType.NOTHING_YET);
      this.game.determineTileRackTypesForEverybody();
      return null;
    }
  }

  execute(gameAction: PB_GameAction) {
    if (!gameAction.selectNewChain) {
      throw new UserInputError('selectNewChain game action not provided');
    }
    const newChain = gameAction.selectNewChain.chain;
    if (newChain < PB_GameBoardType.LUXOR || newChain > PB_GameBoardType.IMPERIAL) {
      throw new UserInputError('chain is not a valid chain');
    }
    if (this.availableChains.indexOf(newChain) === -1) {
      throw new UserInputError('cannot select chain as the new chain');
    }

    this.createNewChain(newChain);
    return [];
  }

  protected createNewChain(chain: PB_GameBoardType) {
    this.game.fillCells(this.tile, chain);
    this.game.setChainSize(chain, this.game.gameBoardTypeCounts[chain]);
    if (this.game.scoreBoardAvailable[chain] > 0) {
      this.game.adjustPlayerScoreBoardRow(this.playerID, [new ScoreBoardAdjustment(chain, 1)]);
    }

    this.game
      .getCurrentGameState()
      .addGameHistoryMessage(new GameHistoryMessageFormedChain(this.playerID, chain));
  }
}
