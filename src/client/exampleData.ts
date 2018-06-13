import { List } from 'immutable';
import { defaultMoveDataHistory } from '../common/defaults';
import { GameBoardType, GameHistoryMessage, GameMode, PlayerArrangementMode } from '../common/enums';
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
import { allChains } from './helpers';

export function getDummyGameForGetGameHistory() {
    const game = new Game(GameMode.Singles4, PlayerArrangementMode.ExactOrder, getNewTileBag(), List([2, 3, 5, 8]), List(['Tim', 'Rita', 'Dad', 'Mom']), 8, 3);
    game.doGameAction([], null);
    game.moveDataHistory = defaultMoveDataHistory;

    let moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.TurnBegan, 0, []);
    moveData.timestamp = 1524896229792;
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.DrewPositionTile, 1, [21]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.StartedGame, 2, []);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.DrewTile, 3, [100]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.HasNoPlayableTile, 0, []);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.PlayedTile, 1, [40]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.FormedChain, 2, [0]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.MergedChains, 3, [[1, 2]]);
    moveData.addGameHistoryMessage(GameHistoryMessage.MergedChains, 0, [[3, 4, 5]]);
    moveData.addGameHistoryMessage(GameHistoryMessage.MergedChains, 1, [[0, 1, 2, 6]]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.SelectedMergerSurvivor, 2, [3]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.SelectedChainToDisposeOfNext, 3, [4]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.ReceivedBonus, 0, [5, 25]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.DisposedOfShares, 1, [6, 2, 3]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.CouldNotAffordAnyShares, 2, []);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 3, [[]]);
    moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 0, [[[0, 3]]]);
    moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 1, [[[1, 2], [2, 1]]]);
    moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 2, [[[3, 1], [4, 1], [5, 1]]]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.DrewLastTile, 3, []);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.ReplacedDeadTile, 0, [30]);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.EndedGame, 1, []);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.NoTilesPlayedForEntireRound, null, []);
    game.endCurrentMove();

    moveData = game.getCurrentMoveData();
    moveData.addGameHistoryMessage(GameHistoryMessage.AllTilesPlayed, null, []);
    game.endCurrentMove();

    return game;
}

export function getExampleNextGameActionsArray() {
    const game = new Game(
        GameMode.Singles5,
        PlayerArrangementMode.RandomOrder,
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
        new ActionSelectMergerSurvivor(game, 3, [GameBoardType.Luxor, GameBoardType.Festival, GameBoardType.Continental], 107),
        new ActionSelectChainToDisposeOfNext(game, 0, [GameBoardType.Tower, GameBoardType.American], GameBoardType.Continental),
        new ActionDisposeOfShares(game, 1, GameBoardType.Imperial, GameBoardType.Luxor),
        new ActionPurchaseShares(game, 2),
        new ActionGameOver(game, 3),
    ];
}
