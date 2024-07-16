import { defaultGameStateHistory } from '../../common/defaults';
import { Game } from '../../common/game';
import {
  ChainAndCount,
  GameHistoryMessageAllTilesPlayed,
  GameHistoryMessageCouldNotAffordAnyShares,
  GameHistoryMessageDisposedOfShares,
  GameHistoryMessageDrewLastTile,
  GameHistoryMessageDrewPositionTile,
  GameHistoryMessageDrewTile,
  GameHistoryMessageEndedGame,
  GameHistoryMessageFormedChain,
  GameHistoryMessageHasNoPlayableTile,
  GameHistoryMessageMergedChains,
  GameHistoryMessageNoTilesPlayedForEntireRound,
  GameHistoryMessagePlayedTile,
  GameHistoryMessagePurchasedShares,
  GameHistoryMessageReceivedBonus,
  GameHistoryMessageReplacedDeadTile,
  GameHistoryMessageSelectedChainToDisposeOfNext,
  GameHistoryMessageSelectedMergerSurvivor,
  GameHistoryMessageStartedGame,
  GameHistoryMessageTurnBegan,
} from '../../common/gameHistoryMessage';
import { gameFromJSON } from '../../common/gameSerialization';
import { getNewTileBag } from '../../common/helpers';
import { PB_GameAction, PB_GameMode, PB_PlayerArrangementMode } from '../../common/pb';

let game1: Game | undefined;
export function getExampleGame1() {
  if (!game1) {
    game1 = gameFromJSON(gameJson1);
  }
  return game1;
}

let game2: Game | undefined;
export function getExampleGame2() {
  if (!game2) {
    game2 = gameFromJSON(gameJson2);
  }
  return game2;
}

let gameForGameHistory: Game | undefined = undefined;
export function getExampleGameForGameHistory() {
  if (!gameForGameHistory) {
    gameForGameHistory = new Game(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.EXACT_ORDER,
      getNewTileBag(),
      [2, 3, 5, 8],
      ['Tim', 'Rita', 'Dad', 'Mom'],
      8,
      3,
    );
    gameForGameHistory.doGameAction(
      PB_GameAction.create({
        startGame: {},
      }),
      null,
    );
    gameForGameHistory.gameStateHistory = defaultGameStateHistory;

    let gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageTurnBegan(0));
    gameState.timestamp = 1524896229792;
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageDrewPositionTile(1, 21));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageStartedGame(2));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageDrewTile(3, 100));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageHasNoPlayableTile(0));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessagePlayedTile(1, 40));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageFormedChain(2, 0));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageMergedChains(3, [1, 2]));
    gameState.addGameHistoryMessage(new GameHistoryMessageMergedChains(0, [3, 4, 5]));
    gameState.addGameHistoryMessage(new GameHistoryMessageMergedChains(1, [0, 1, 2, 6]));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageSelectedMergerSurvivor(2, 3));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageSelectedChainToDisposeOfNext(3, 4));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageReceivedBonus(0, 5, 25));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageDisposedOfShares(1, 6, 2, 3));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageCouldNotAffordAnyShares(2));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessagePurchasedShares(3, []));
    gameState.addGameHistoryMessage(
      new GameHistoryMessagePurchasedShares(0, [new ChainAndCount(0, 3)]),
    );
    gameState.addGameHistoryMessage(
      new GameHistoryMessagePurchasedShares(1, [new ChainAndCount(1, 2), new ChainAndCount(2, 1)]),
    );
    gameState.addGameHistoryMessage(
      new GameHistoryMessagePurchasedShares(2, [
        new ChainAndCount(3, 1),
        new ChainAndCount(4, 1),
        new ChainAndCount(5, 1),
      ]),
    );
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageDrewLastTile(3));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageReplacedDeadTile(0, 30));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageEndedGame(1));
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageNoTilesPlayedForEntireRound());
    gameForGameHistory.endCurrentMove();

    gameState = gameForGameHistory.getCurrentGameState();
    gameState.addGameHistoryMessage(new GameHistoryMessageAllTilesPlayed());
    gameForGameHistory.endCurrentMove();
  }

  return gameForGameHistory;
}

// from src/common/gameTestFiles/other/no tiles played for entire round.txt
const gameJson1 = {
  gameMode: 'SINGLES_2',
  userIds: [3, 4],
  usernames: ['Erin', 'Frank'],
  hostUserId: 4,
  tileBag: [
    90, 78, 9, 60, 34, 15, 21, 64, 62, 55, 41, 8, 105, 35, 74, 59, 0, 11, 24, 101, 43, 102, 95, 10,
    53, 84, 30, 83, 1, 79, 17, 70, 13, 88, 97, 23, 14, 91, 40, 85, 29, 87, 103, 67, 2, 80, 7, 98,
    99,
  ],
  gameActions: [
    { startGame: {} },
    { playTile: { tile: 9 } },
    { playTile: { tile: 8 } },
    { playTile: { tile: 64 } },
    { playTile: { tile: 55 } },
    { selectNewChain: { chain: 'IMPERIAL' } },
    { purchaseShares: {} },
    { playTile: {} },
    { selectNewChain: { chain: 'CONTINENTAL' } },
    { purchaseShares: { chains: ['IMPERIAL'] } },
    { playTile: { tile: 62 } },
    { purchaseShares: { chains: ['CONTINENTAL'] } },
    { playTile: { tile: 15 } },
    { purchaseShares: {} },
    { playTile: { tile: 105 } },
    { purchaseShares: {} },
    { playTile: { tile: 24 } },
    { selectNewChain: { chain: 'WORLDWIDE' } },
    { purchaseShares: { chains: ['WORLDWIDE'] } },
    { playTile: { tile: 102 } },
    { purchaseShares: { chains: ['WORLDWIDE'] } },
    { playTile: { tile: 34 } },
    { purchaseShares: {} },
    { playTile: { tile: 101 } },
    { selectNewChain: { chain: 'AMERICAN' } },
    { purchaseShares: {} },
    { playTile: { tile: 53 } },
    { selectNewChain: { chain: 'FESTIVAL' } },
    { purchaseShares: { chains: ['AMERICAN', 'FESTIVAL', 'WORLDWIDE'] } },
    { playTile: { tile: 10 } },
    { purchaseShares: { chains: ['FESTIVAL', 'IMPERIAL', 'AMERICAN'] } },
    { playTile: { tile: 43 } },
    { selectNewChain: { chain: 'TOWER' } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 83 } },
    { purchaseShares: { chains: ['TOWER', 'FESTIVAL', 'WORLDWIDE'] } },
    { playTile: { tile: 74 } },
    { purchaseShares: { chains: ['IMPERIAL', 'AMERICAN', 'FESTIVAL'] } },
    { playTile: { tile: 59 } },
    { purchaseShares: { chains: ['LUXOR', 'WORLDWIDE', 'FESTIVAL'] } },
    { playTile: { tile: 30 } },
    { purchaseShares: { chains: ['LUXOR', 'FESTIVAL', 'WORLDWIDE'] } },
    { playTile: { tile: 84 } },
    { purchaseShares: { chains: ['AMERICAN', 'IMPERIAL', 'FESTIVAL'] } },
    { playTile: { tile: 1 } },
    { purchaseShares: { chains: ['AMERICAN', 'IMPERIAL'] } },
    { playTile: { tile: 35 } },
    { purchaseShares: { chains: ['AMERICAN', 'WORLDWIDE'] } },
    { playTile: { tile: 97 } },
    { purchaseShares: { chains: ['AMERICAN'] } },
    { playTile: { tile: 41 } },
    { purchaseShares: { chains: ['AMERICAN'] } },
    { playTile: { tile: 13 } },
    { purchaseShares: { chains: ['AMERICAN'] } },
    { playTile: { tile: 11 } },
    { purchaseShares: { chains: ['AMERICAN'] } },
    { playTile: { tile: 95 } },
    { purchaseShares: { chains: ['AMERICAN', 'WORLDWIDE'] } },
    { playTile: { tile: 85 } },
    { purchaseShares: { chains: ['WORLDWIDE'] } },
    { playTile: { tile: 14 } },
    { playTile: { tile: 70 } },
    { playTile: { tile: 103 } },
    { playTile: { tile: 67 } },
    { playTile: { tile: 2 } },
    { playTile: { tile: 80 } },
    { playTile: { tile: 23 } },
  ],
};

// from src/common/gameTestFiles/other/all tiles played.txt
const gameJson2 = {
  gameMode: 'SINGLES_2',
  userIds: [4, 8],
  usernames: ['Frank', 'Dave'],
  hostUserId: 8,
  tileBag: [
    101, 10, 12, 18, 50, 39, 21, 13, 80, 6, 35, 14, 70, 36, 59, 51, 76, 74, 43, 105, 63, 95, 83, 65,
    107, 33, 104, 86, 7, 8, 44, 48, 102, 93, 67, 49, 91, 98, 57, 66, 84, 19, 52, 103, 99, 100, 5,
    29, 54, 97, 92, 34, 25, 15, 27, 62, 9, 47, 58, 38, 85, 40, 11, 73, 79, 1, 22, 46, 42, 28, 89,
    31, 82, 71, 64, 90, 2, 68, 78, 69, 60, 4, 77, 53, 20, 30, 26, 56, 32, 55, 23, 17, 96, 94, 72,
    81, 88, 41, 106, 37, 3, 16, 61, 75, 24, 0, 87, 45,
  ],
  gameActions: [
    { startGame: {} },
    { playTile: { tile: 12 } },
    { playTile: { tile: 6 } },
    { playTile: { tile: 13 } },
    { selectNewChain: { chain: 'CONTINENTAL' } },
    { purchaseShares: { chains: ['CONTINENTAL', 'CONTINENTAL', 'CONTINENTAL'] } },
    { playTile: { tile: 80 } },
    { purchaseShares: { chains: ['CONTINENTAL', 'CONTINENTAL', 'CONTINENTAL'] } },
    { playTile: { tile: 21 } },
    { purchaseShares: { chains: ['CONTINENTAL'] } },
    { playTile: { tile: 35 } },
    { purchaseShares: {} },
    { playTile: { tile: 59 } },
    { purchaseShares: {} },
    { playTile: { tile: 36 } },
    { purchaseShares: {} },
    { playTile: { tile: 50 } },
    { selectNewChain: { chain: 'IMPERIAL' } },
    { purchaseShares: { chains: ['IMPERIAL'] } },
    { playTile: { tile: 95 } },
    { purchaseShares: { chains: ['IMPERIAL', 'IMPERIAL'] } },
    { playTile: { tile: 39 } },
    { purchaseShares: { chains: ['IMPERIAL'] } },
    { playTile: { tile: 65 } },
    { purchaseShares: {} },
    { playTile: { tile: 18 } },
    { purchaseShares: {} },
    { playTile: { tile: 74 } },
    { selectNewChain: { chain: 'AMERICAN' } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN', 'AMERICAN'] } },
    { playTile: { tile: 104 } },
    { selectNewChain: {} },
    { purchaseShares: { chains: ['LUXOR', 'LUXOR', 'AMERICAN'] } },
    { playTile: { tile: 70 } },
    { purchaseShares: { chains: ['LUXOR', 'LUXOR', 'LUXOR'] } },
    { playTile: { tile: 7 } },
    { selectNewChain: { chain: 'FESTIVAL' } },
    { purchaseShares: { chains: ['LUXOR', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 33 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 44 } },
    { selectNewChain: { chain: 'WORLDWIDE' } },
    { purchaseShares: { chains: ['WORLDWIDE', 'LUXOR', 'FESTIVAL'] } },
    { playTile: { tile: 48 } },
    { purchaseShares: { chains: ['WORLDWIDE', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 83 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 93 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 76 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 49 } },
    { selectMergerSurvivor: { chain: 'IMPERIAL' } },
    { disposeOfShares: {} },
    { disposeOfShares: {} },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 67 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 14 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'WORLDWIDE'] } },
    { playTile: { tile: 43 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 8 } },
    { playTile: { tile: 63 } },
    { playTile: { tile: 98 } },
    { playTile: { tile: 52 } },
    { playTile: { tile: 51 } },
    { disposeOfShares: {} },
    { disposeOfShares: {} },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 102 } },
    { purchaseShares: { chains: ['WORLDWIDE', 'WORLDWIDE', 'WORLDWIDE'] } },
    { playTile: { tile: 100 } },
    { purchaseShares: { chains: ['LUXOR', 'LUXOR', 'LUXOR'] } },
    { playTile: { tile: 99 } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN', 'AMERICAN'] } },
    { playTile: { tile: 29 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 84 } },
    { disposeOfShares: {} },
    { disposeOfShares: {} },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 19 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'LUXOR'] } },
    { playTile: { tile: 57 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 105 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 5 } },
    { disposeOfShares: { tradeAmount: 10 } },
    { disposeOfShares: { tradeAmount: 12 } },
    { purchaseShares: { chains: ['LUXOR', 'LUXOR', 'AMERICAN'] } },
    { playTile: { tile: 15 } },
    { purchaseShares: { chains: ['LUXOR', 'LUXOR', 'LUXOR'] } },
    { playTile: { tile: 107 } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN', 'AMERICAN'] } },
    { playTile: { tile: 62 } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN', 'AMERICAN'] } },
    { playTile: { tile: 25 } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN', 'AMERICAN'] } },
    { playTile: { tile: 97 } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN', 'AMERICAN'], endGame: true } },
    { playTile: { tile: 27 } },
    { purchaseShares: { chains: ['AMERICAN', 'AMERICAN'] } },
    { playTile: { tile: 34 } },
    { purchaseShares: { chains: ['WORLDWIDE', 'WORLDWIDE', 'WORLDWIDE'] } },
    { playTile: { tile: 58 } },
    { disposeOfShares: { tradeAmount: 12 } },
    { disposeOfShares: { tradeAmount: 12 } },
    { purchaseShares: { chains: ['LUXOR', 'LUXOR', 'LUXOR'] } },
    { playTile: { tile: 103 } },
    { disposeOfShares: { tradeAmount: 10 } },
    { disposeOfShares: { tradeAmount: 10 } },
    { purchaseShares: { chains: ['WORLDWIDE', 'WORLDWIDE', 'WORLDWIDE'] } },
    { playTile: { tile: 11 } },
    { disposeOfShares: { tradeAmount: 12 } },
    { disposeOfShares: {} },
    { purchaseShares: { chains: ['IMPERIAL', 'IMPERIAL', 'IMPERIAL'] } },
    { playTile: { tile: 79 } },
    { selectNewChain: { chain: 'AMERICAN' } },
    { purchaseShares: { chains: ['IMPERIAL', 'IMPERIAL', 'IMPERIAL'] } },
    { playTile: { tile: 54 } },
    { selectNewChain: { chain: 'TOWER' } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'FESTIVAL'] } },
    { playTile: { tile: 73 } },
    { purchaseShares: { chains: ['TOWER', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 42 } },
    { purchaseShares: { chains: ['IMPERIAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 38 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 22 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 40 } },
    { purchaseShares: { chains: ['FESTIVAL'] } },
    { playTile: { tile: 9 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 90 } },
    { playTile: { tile: 2 } },
    { purchaseShares: { chains: ['FESTIVAL', 'FESTIVAL', 'FESTIVAL'] } },
    { playTile: { tile: 82 } },
    { playTile: { tile: 89 } },
    { selectMergerSurvivor: { chain: 'FESTIVAL' } },
    { disposeOfShares: { sellAmount: 1 } },
    { disposeOfShares: { tradeAmount: 10 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 86 } },
    { purchaseShares: { chains: ['IMPERIAL', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 71 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'WORLDWIDE'] } },
    { playTile: { tile: 69 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 78 } },
    { purchaseShares: { chains: ['TOWER', 'TOWER', 'TOWER'] } },
    { playTile: { tile: 64 } },
    { disposeOfShares: { sellAmount: 6 } },
    { disposeOfShares: { sellAmount: 12 } },
    { purchaseShares: {} },
    { playTile: { tile: 23 } },
    { purchaseShares: {} },
    { playTile: { tile: 94 } },
    { purchaseShares: {} },
    { playTile: { tile: 1 } },
    { purchaseShares: {} },
    { playTile: { tile: 88 } },
    { purchaseShares: {} },
    { playTile: { tile: 55 } },
    { purchaseShares: {} },
    { playTile: { tile: 46 } },
    { purchaseShares: {} },
    { playTile: { tile: 72 } },
    { purchaseShares: {} },
    { playTile: { tile: 26 } },
    { purchaseShares: {} },
    { playTile: {} },
    { purchaseShares: {} },
    { playTile: { tile: 3 } },
    { purchaseShares: {} },
    { playTile: { tile: 41 } },
    { purchaseShares: {} },
    { playTile: { tile: 4 } },
    { purchaseShares: {} },
    { playTile: { tile: 92 } },
    { purchaseShares: {} },
    { purchaseShares: {} },
    { playTile: { tile: 91 } },
    { purchaseShares: {} },
    { purchaseShares: {} },
    { playTile: { tile: 81 } },
    { purchaseShares: {} },
  ],
};
