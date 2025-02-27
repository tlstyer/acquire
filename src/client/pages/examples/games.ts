import { defaultGameStateHistory } from '../../../common/defaults.js';
import { Game } from '../../../common/game.js';
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
} from '../../../common/gameHistoryMessage.js';
import { gameFromJSON } from '../../../common/gameSerialization.js';
import { getNewTileBag } from '../../../common/helpers.js';
import { PB_GameAction, PB_GameMode, PB_PlayerArrangementMode } from '../../../common/pb.js';
import { User } from '../../../common/user.js';

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

let game3: Game | undefined;
export function getExampleGame3() {
  if (!game3) {
    game3 = gameFromJSON(gameJson3);
  }
  return game3;
}

let gameForGameHistory: Game | undefined = undefined;
export function getExampleGameForGameHistory() {
  if (!gameForGameHistory) {
    const hostUser = new User(8, 'Mom');
    const myUser = new User(3, 'Rita');
    gameForGameHistory = new Game(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.EXACT_ORDER,
      getNewTileBag(),
      [new User(2, 'Tim'), myUser, new User(5, 'Dad'), hostUser],
      hostUser,
      myUser,
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

// from gameId 1607590987-11045
// has every game history message except: GameHistoryMessageNoTilesPlayedForEntireRound and GameHistoryMessageAllTilesPlayed
const gameJson3 = {
  gameMode: 4,
  playerArrangementMode: 0,
  userIds: [1, 2, 3, 4],
  usernames: ['user 1', 'user 2', 'user 3', 'user 4'],
  hostUserId: 1,
  tileBag: [
    26, 88, 3, 102, 53, 11, 38, 52, 60, 15, 17, 75, 66, 85, 45, 64, 92, 44, 5, 104, 27, 89, 91, 29,
    71, 34, 70, 22, 58, 14, 30, 83, 100, 78, 47, 46, 50, 77, 36, 95, 56, 43, 65, 10, 68, 93, 90, 0,
    9, 31, 18, 101, 21, 2, 55, 49, 99, 24, 63, 19, 28, 103, 48, 67, 13, 20, 106, 51, 107, 105, 79,
    74, 73, 42, 97, 80, 12, 41, 82, 32, 94, 1, 23, 59, 33, 86, 96, 6, 39, 87, 62, 98, 72, 4, 81, 76,
    35, 61, 7, 84, 54, 8, 69, 16, 40, 37, 25, 57,
  ],
  gameActions: [
    { startGame: {} },
    { playTile: { tile: 53 } },
    { playTile: { tile: 17 } },
    { selectNewChain: { chain: 0 } },
    { purchaseShares: { chains: [0, 0, 0], endGame: false } },
    { playTile: { tile: 44 } },
    { selectNewChain: { chain: 1 } },
    { purchaseShares: { chains: [1, 1, 1], endGame: false } },
    { playTile: { tile: 71 } },
    { purchaseShares: { chains: [1, 1, 1], endGame: false } },
    { playTile: { tile: 52 } },
    { purchaseShares: { chains: [0, 0, 0], endGame: false } },
    { playTile: { tile: 66 } },
    { purchaseShares: { chains: [0, 0, 0], endGame: false } },
    { playTile: { tile: 89 } },
    { selectNewChain: { chain: 2 } },
    { purchaseShares: { chains: [2, 2, 2], endGame: false } },
    { playTile: { tile: 91 } },
    { purchaseShares: { chains: [2, 2, 2], endGame: false } },
    { playTile: { tile: 100 } },
    { selectNewChain: { chain: 4 } },
    { purchaseShares: { chains: [4, 4, 4], endGame: false } },
    { playTile: { tile: 75 } },
    { selectNewChain: { chain: 3 } },
    { purchaseShares: { chains: [3, 3, 3], endGame: false } },
    { playTile: { tile: 92 } },
    { purchaseShares: { chains: [3, 3, 3], endGame: false } },
    { playTile: { tile: 70 } },
    { selectNewChain: { chain: 6 } },
    { purchaseShares: { chains: [6, 6, 6], endGame: false } },
    { playTile: { tile: 11 } },
    { purchaseShares: { chains: [6, 6, 6], endGame: false } },
    { playTile: { tile: 78 } },
    { purchaseShares: { chains: [3, 3, 4], endGame: false } },
    { playTile: { tile: 27 } },
    { purchaseShares: { chains: [2, 2, 2], endGame: false } },
    { playTile: { tile: 22 } },
    { purchaseShares: { chains: [2, 6, 6], endGame: false } },
    { playTile: { tile: 38 } },
    { purchaseShares: { chains: [6, 6, 6], endGame: false } },
    { playTile: { tile: 77 } },
    { purchaseShares: { chains: [5, 5, 5], endGame: false } },
    { playTile: { tile: 5 } },
    { purchaseShares: { chains: [5, 5, 5], endGame: false } },
    { playTile: { tile: 46 } },
    { purchaseShares: { chains: [6, 6, 6], endGame: false } },
    { playTile: { tile: 60 } },
    { purchaseShares: { chains: [6, 6, 6], endGame: false } },
    { playTile: { tile: 93 } },
    { purchaseShares: { chains: [5, 5, 5], endGame: false } },
    { playTile: { tile: 30 } },
    { purchaseShares: { chains: [3], endGame: false } },
    { playTile: { tile: 0 } },
    { purchaseShares: { chains: [6, 6], endGame: false } },
    { playTile: { tile: 50 } },
    { purchaseShares: { chains: [0, 0, 0], endGame: false } },
    { playTile: { tile: 43 } },
    { purchaseShares: { chains: [0, 0], endGame: false } },
    { playTile: { tile: 104 } },
    { purchaseShares: { chains: [3, 3, 3], endGame: false } },
    { playTile: { tile: 101 } },
    { purchaseShares: { chains: [], endGame: false } },
    { playTile: { tile: 56 } },
    { purchaseShares: { chains: [0], endGame: false } },
    { playTile: { tile: 64 } },
    { playTile: { tile: 90 } },
    { purchaseShares: { chains: [2], endGame: false } },
    { playTile: { tile: 83 } },
    { purchaseShares: { chains: [], endGame: false } },
    { playTile: { tile: 58 } },
    { playTile: { tile: 85 } },
    { playTile: { tile: 65 } },
    { playTile: { tile: 19 } },
    { purchaseShares: { chains: [], endGame: false } },
    { playTile: { tile: 99 } },
    { playTile: { tile: 103 } },
    { playTile: { tile: 48 } },
    { playTile: { tile: 95 } },
    { purchaseShares: { chains: [], endGame: false } },
    { playTile: { tile: 15 } },
    { playTile: { tile: 63 } },
    { playTile: { tile: 51 } },
    { purchaseShares: { chains: [], endGame: false } },
    { playTile: { tile: 107 } },
    { playTile: { tile: 55 } },
    { playTile: { tile: 79 } },
    { selectMergerSurvivor: { chain: 5 } },
    { selectChainToDisposeOfNext: { chain: 6 } },
    { disposeOfShares: { tradeAmount: 8, sellAmount: 0 } },
    { disposeOfShares: { tradeAmount: 8, sellAmount: 0 } },
    { disposeOfShares: { tradeAmount: 2, sellAmount: 0 } },
    { disposeOfShares: { tradeAmount: 0, sellAmount: 8 } },
    { purchaseShares: { chains: [5, 5, 5], endGame: false } },
    { playTile: { tile: 13 } },
    { selectNewChain: { chain: 6 } },
    { purchaseShares: { chains: [5, 5, 0], endGame: false } },
    { playTile: { tile: 45 } },
    { playTile: { tile: 18 } },
    { purchaseShares: { chains: [2, 2, 2], endGame: false } },
    { playTile: { tile: 42 } },
    { purchaseShares: { chains: [2, 2, 6], endGame: false } },
    { playTile: { tile: 21 } },
    { purchaseShares: { chains: [0], endGame: false } },
    { playTile: { tile: 80 } },
    { playTile: { tile: 47 } },
    { purchaseShares: { chains: [2, 2, 2], endGame: false } },
    { playTile: { tile: 41 } },
    { purchaseShares: { chains: [1, 1, 2], endGame: false } },
    { playTile: { tile: 82 } },
    { playTile: { tile: 32 } },
    { playTile: { tile: 12 } },
    { purchaseShares: { chains: [2, 2, 2], endGame: false } },
    { playTile: { tile: 49 } },
    { disposeOfShares: { tradeAmount: 0, sellAmount: 5 } },
    { disposeOfShares: { tradeAmount: 4, sellAmount: 0 } },
    { purchaseShares: { chains: [5, 6, 6], endGame: false } },
    { playTile: { tile: 23 } },
    { disposeOfShares: { tradeAmount: 0, sellAmount: 2 } },
    { disposeOfShares: { tradeAmount: 0, sellAmount: 0 } },
    { purchaseShares: { chains: [3, 3, 3], endGame: false } },
    { playTile: { tile: 31 } },
    { playTile: { tile: 36 } },
    { disposeOfShares: { tradeAmount: 4, sellAmount: 0 } },
    { disposeOfShares: { tradeAmount: 4, sellAmount: 0 } },
    { purchaseShares: { chains: [3, 4, 4], endGame: false } },
    { playTile: { tile: 6 } },
    { selectNewChain: { chain: 6 } },
    { purchaseShares: { chains: [4, 4, 4], endGame: false } },
    { playTile: { tile: 68 } },
    { purchaseShares: { chains: [6, 6, 6], endGame: false } },
    { playTile: { tile: 87 } },
    { playTile: { tile: 106 } },
    { selectNewChain: { chain: 2 } },
    { purchaseShares: { chains: [2, 4, 4], endGame: false } },
    { playTile: { tile: 98 } },
    { disposeOfShares: { tradeAmount: 0, sellAmount: 1 } },
    { disposeOfShares: { tradeAmount: 0, sellAmount: 6 } },
    { purchaseShares: { chains: [4, 4, 4], endGame: false } },
    { playTile: { tile: 9 } },
    { purchaseShares: { chains: [6, 6, 0], endGame: false } },
    { playTile: { tile: 20 } },
    { playTile: { tile: 94 } },
    { purchaseShares: { chains: [4, 4, 4], endGame: false } },
    { playTile: { tile: 29 } },
    { purchaseShares: { chains: [4, 4, 4], endGame: true } },
  ],
  beginTimestamp: 1608778622456,
  gameActionTimestampOffsets: [
    8303, 4584, 750, 2039, 3642, 987, 3035, 643, 2847, 4857, 2112, 3768, 2260, 2709, 1512, 4320,
    730, 2451, 8500, 4597, 7007, 3950, 1054, 1828, 3242, 5177, 4558, 1130, 1755, 903, 4108, 4643,
    15866, 9780, 6136, 965, 7267, 7500, 9338, 1066, 2290, 9750, 5679, 2806, 6148, 15510, 19823,
    1577, 5967, 6032, 12064, 255, 11317, 1915, 15405, 2069, 5458, 7140, 5256, 4342, 1684, 767, 8162,
    4167, 9046, 9496, 1141, 1732, 5868, 7426, 7272, 5180, 1432, 1216, 808, 6524, 4427, 1375, 4326,
    4208, 4483, 2950, 635, 13772, 909, 6371, 1843, 7013, 22738, 9671, 13910, 4846, 21243, 3340,
    13924, 974, 16527, 6273, 1634, 5899, 11111, 6210, 1013, 9916, 6159, 5039, 5614, 4243, 6310,
    28266, 3729, 14970, 6877, 3319, 3513, 2324, 2851, 1594, 12539, 4248, 9291, 16768, 5755, 22317,
    562, 2000, 2665, 906, 9623, 3820, 14535, 4071, 16056, 637, 3212, 18039, 3894, 1044, 9219, 934,
    7509, 11080, 676, 3301,
  ],
  endTimestamp: 1608779478149,
};
