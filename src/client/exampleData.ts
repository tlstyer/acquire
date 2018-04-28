import { defaultMoveDataHistory } from '../common/defaults';
import { GameHistoryMessage } from '../common/enums';
import { Game } from '../common/game';
import { getNewTileBag } from '../common/helpers';

export function getDummyGameForGetGameHistory() {
    const game = new Game(getNewTileBag(), [2, 3, 5, 8], 8, 3);
    game.doGameAction(8, 0, [], null);
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
