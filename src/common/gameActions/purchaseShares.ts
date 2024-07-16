import { GameActionEnum, ScoreBoardIndexEnum } from '../enums';
import { UserInputError } from '../error';
import { ScoreBoardAdjustment, type Game } from '../game';
import {
  ChainAndCount,
  GameHistoryMessageAllTilesPlayed,
  GameHistoryMessageCouldNotAffordAnyShares,
  GameHistoryMessageEndedGame,
  GameHistoryMessageNoTilesPlayedForEntireRound,
  GameHistoryMessagePurchasedShares,
} from '../gameHistoryMessage';
import { PB_GameAction, PB_GameBoardType } from '../pb';
import { ActionBase } from './base';
import { ActionGameOver } from './gameOver';
import { ActionPlayTile } from './playTile';

export class ActionPurchaseShares extends ActionBase {
  cannotAffordAnyShares = false;
  canEndGame = false;

  constructor(game: Game, playerID: number) {
    super(game, playerID, GameActionEnum.PurchaseShares);
  }

  prepare() {
    // set corresponding score board chain size to 0 if the game board doesn't have any cells of a given type
    for (let type = 0; type <= PB_GameBoardType.IMPERIAL; type++) {
      if (this.game.gameBoardTypeCounts[type] === 0 && this.game.scoreBoardChainSize[type] > 0) {
        this.game.setChainSize(type, 0);
      }
    }

    this.game.determineTileRackTypesForEverybody();

    let hasChainSize = false;
    let hasChainSizeLessThan11 = false;
    let hasChainSizeGreaterThan40 = false;
    let sharesAvailable = false;
    let canPurchaseShares = false;
    const cash = this.game.scoreBoard[this.playerID][ScoreBoardIndexEnum.Cash];
    for (let type = 0; type <= PB_GameBoardType.IMPERIAL; type++) {
      const chainSize = this.game.scoreBoardChainSize[type];
      if (chainSize > 0) {
        hasChainSize = true;
        if (chainSize < 11) {
          hasChainSizeLessThan11 = true;
        }
        if (chainSize > 40) {
          hasChainSizeGreaterThan40 = true;
        }

        const available = this.game.scoreBoardAvailable[type];
        if (available > 0) {
          sharesAvailable = true;

          const price = this.game.scoreBoardPrice[type];
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
        this.game
          .getCurrentGameState()
          .addGameHistoryMessage(new GameHistoryMessageCouldNotAffordAnyShares(this.playerID));
      }
      return this.completeAction(false);
    } else {
      return null;
    }
  }

  execute(gameAction: PB_GameAction) {
    if (!gameAction.purchaseShares) {
      throw new UserInputError('purchaseShares game action not provided');
    }
    const chains = gameAction.purchaseShares.chains;
    if (chains.length > 3) {
      throw new UserInputError('number of chains is larger than 3');
    }
    for (let i = 0; i < chains.length; i++) {
      const chain = chains[i];
      if (chain < PB_GameBoardType.LUXOR || chain > PB_GameBoardType.IMPERIAL) {
        throw new UserInputError('a chain is not a valid chain');
      }
    }
    const endGame = gameAction.purchaseShares.endGame;

    const chainCounts = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < chains.length; i++) {
      chainCounts[chains[i]]++;
    }
    const chainsAndCounts: ChainAndCount[] = [];
    for (let chain = 0; chain < chainCounts.length; chain++) {
      const count = chainCounts[chain];
      if (count > 0) {
        chainsAndCounts.push(new ChainAndCount(chain, count));
      }
    }

    let cost = 0;
    for (let i = 0; i < chainsAndCounts.length; i++) {
      const chainAndCount = chainsAndCounts[i];

      if (this.game.scoreBoardChainSize[chainAndCount.chain] === 0) {
        throw new UserInputError('a requested chain does not exist on the board');
      }
      if (chainAndCount.count > this.game.scoreBoardAvailable[chainAndCount.chain]) {
        throw new UserInputError('more shares requested for a chain than are available');
      }

      cost += this.game.scoreBoardPrice[chainAndCount.chain] * chainAndCount.count;
    }
    if (cost > this.game.scoreBoard[this.playerID][ScoreBoardIndexEnum.Cash]) {
      throw new UserInputError('not enough cash to pay for requested shares');
    }

    if (cost > 0) {
      this.game.adjustPlayerScoreBoardRow(this.playerID, [
        ...chainsAndCounts.map(
          (chainAndCount) => new ScoreBoardAdjustment(chainAndCount.chain, chainAndCount.count),
        ),
        new ScoreBoardAdjustment(ScoreBoardIndexEnum.Cash, -cost),
      ]);
    }

    if (this.cannotAffordAnyShares) {
      this.game
        .getCurrentGameState()
        .addGameHistoryMessage(new GameHistoryMessageCouldNotAffordAnyShares(this.playerID));
    } else {
      this.game
        .getCurrentGameState()
        .addGameHistoryMessage(
          new GameHistoryMessagePurchasedShares(this.playerID, chainsAndCounts),
        );
    }

    return this.completeAction(endGame && this.canEndGame);
  }

  protected completeAction(endGame: boolean): ActionBase[] {
    let allTilesPlayed = this.game.gameBoardTypeCounts[PB_GameBoardType.NOTHING] === 0;
    const noTilesPlayedForEntireRound =
      this.game.numTurnsWithoutPlayedTiles === this.game.userIDs.length;

    if (endGame || allTilesPlayed || noTilesPlayedForEntireRound) {
      if (endGame) {
        this.game
          .getCurrentGameState()
          .addGameHistoryMessage(new GameHistoryMessageEndedGame(this.playerID));
      } else if (allTilesPlayed) {
        this.game
          .getCurrentGameState()
          .addGameHistoryMessage(new GameHistoryMessageAllTilesPlayed());
      } else {
        this.game
          .getCurrentGameState()
          .addGameHistoryMessage(new GameHistoryMessageNoTilesPlayedForEntireRound());
      }

      return [new ActionGameOver(this.game, this.playerID)];
    } else {
      this.game.drawTiles(this.playerID);
      this.game.determineTileRackTypesForPlayer(this.playerID);
      this.game.replaceDeadTiles(this.playerID);

      allTilesPlayed = this.game.gameBoardTypeCounts[PB_GameBoardType.NOTHING] === 0;
      if (allTilesPlayed) {
        this.game
          .getCurrentGameState()
          .addGameHistoryMessage(new GameHistoryMessageAllTilesPlayed());
        return [new ActionGameOver(this.game, this.playerID)];
      }

      const nextPlayerID = (this.playerID + 1) % this.game.userIDs.length;
      return [
        new ActionPlayTile(this.game, nextPlayerID),
        new ActionPurchaseShares(this.game, nextPlayerID),
      ];
    }
  }
}
