import { List } from 'immutable';
import { defaultGameStateHistory } from '../common/defaults';
import { GameHistoryMessageEnum } from '../common/enums';
import { Game } from '../common/game';
import { ActionDisposeOfShares } from '../common/gameActions/disposeOfShares';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { ActionPlayTile } from '../common/gameActions/playTile';
import { ActionPurchaseShares } from '../common/gameActions/purchaseShares';
import { ActionSelectChainToDisposeOfNext } from '../common/gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from '../common/gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from '../common/gameActions/selectNewChain';
import { ActionStartGame } from '../common/gameActions/startGame';
import { getNewTileBag } from '../common/helpers';
import { PB_GameAction, PB_GameBoardType, PB_GameMode, PB_PlayerArrangementMode } from '../common/pb';
import { allChains } from './helpers';

export function getDummyGameForGetGameHistory() {
  const game = new Game(
    PB_GameMode.SINGLES_4,
    PB_PlayerArrangementMode.EXACT_ORDER,
    getNewTileBag(),
    List([2, 3, 5, 8]),
    List(['Tim', 'Rita', 'Dad', 'Mom']),
    8,
    3,
  );
  game.doGameAction(PB_GameAction.create({ startGame: {} }), null);
  game.gameStateHistory = defaultGameStateHistory;

  let gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.TurnBegan, 0, []);
  gameState.timestamp = 1524896229792;
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.DrewPositionTile, 1, [21]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.StartedGame, 2, []);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.DrewTile, 3, [100]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.HasNoPlayableTile, 0, []);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.PlayedTile, 1, [40]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.FormedChain, 2, [0]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.MergedChains, 3, [[1, 2]]);
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.MergedChains, 0, [[3, 4, 5]]);
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.MergedChains, 1, [[0, 1, 2, 6]]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.SelectedMergerSurvivor, 2, [3]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.SelectedChainToDisposeOfNext, 3, [4]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.ReceivedBonus, 0, [5, 25]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.DisposedOfShares, 1, [6, 2, 3]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.CouldNotAffordAnyShares, 2, []);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.PurchasedShares, 3, [[]]);
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.PurchasedShares, 0, [[[0, 3]]]);
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.PurchasedShares, 1, [
    [
      [1, 2],
      [2, 1],
    ],
  ]);
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.PurchasedShares, 2, [
    [
      [3, 1],
      [4, 1],
      [5, 1],
    ],
  ]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.DrewLastTile, 3, []);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.ReplacedDeadTile, 0, [30]);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.EndedGame, 1, []);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.NoTilesPlayedForEntireRound, null, []);
  game.endCurrentMove();

  gameState = game.getCurrentGameState();
  gameState.addGameHistoryMessage(GameHistoryMessageEnum.AllTilesPlayed, null, []);
  game.endCurrentMove();

  return game;
}

export function getExampleNextGameActionsArray() {
  const game = new Game(
    PB_GameMode.SINGLES_5,
    PB_PlayerArrangementMode.RANDOM_ORDER,
    [],
    List([1, 2, 3, 4, 5]),
    List(['Tim', 'Rita', 'Dad', 'Mom', 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME']),
    1,
    6,
  );
  return [
    new ActionStartGame(game, 4),
    new ActionStartGame(game, 0),
    new ActionPlayTile(game, 1),
    new ActionSelectNewChain(game, 2, allChains, 107),
    new ActionSelectMergerSurvivor(game, 3, [PB_GameBoardType.LUXOR, PB_GameBoardType.FESTIVAL, PB_GameBoardType.CONTINENTAL], 107),
    new ActionSelectChainToDisposeOfNext(game, 0, [PB_GameBoardType.TOWER, PB_GameBoardType.AMERICAN], PB_GameBoardType.CONTINENTAL),
    new ActionDisposeOfShares(game, 1, PB_GameBoardType.IMPERIAL, PB_GameBoardType.LUXOR),
    new ActionPurchaseShares(game, 2),
    new ActionGameOver(game, 3),
  ];
}
