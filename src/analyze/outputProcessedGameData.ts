import path from 'path';
import { GameHistoryMessageEnum } from '../common/enums';
import { Game } from '../common/game';
import { calculateFinalTeamScores, calculatePlacings, determineTeamUserIDs, getFinalPlayerScores, iterateGamesInDirectory } from './misc';

function main(dirPath: string) {
  for (const { game, filePath } of iterateGamesInDirectory(dirPath, true)) {
    console.log(JSON.stringify(processGame(game, filePath)));
  }
}

function processGame(game: Game, filePath: string) {
  const playerScores = getFinalPlayerScores(game);
  const teamScores = calculateFinalTeamScores(game.gameMode, playerScores);
  const placings = calculatePlacings(teamScores);

  return {
    endTimestamp: game.gameStateHistory[game.gameStateHistory.length - 1].timestamp!,
    gameMode: game.gameMode,
    gameID: filePath.split(path.sep).slice(-2).join(path.sep),
    playerUserIDs: game.userIDs,
    playerScores,
    teamUserIDs: determineTeamUserIDs(game.gameMode, game.userIDs),
    teamScores,
    placings,
    numMergers: game.gameStateHistory.reduce((numMergersSoFar, gameState) => {
      return (
        numMergersSoFar + (gameState.gameHistoryMessages.filter((ghmd) => ghmd.gameHistoryMessage === GameHistoryMessageEnum.ReceivedBonus).length > 0 ? 1 : 0)
      );
    }, 0),
    mostDeadTilesReplaced: game.gameStateHistory.reduce((mostDeadTilesReplacedSoFar, gameState) => {
      const deadTilesReplaced = gameState.gameHistoryMessages.filter((ghmd) => ghmd.gameHistoryMessage === GameHistoryMessageEnum.ReplacedDeadTile).length;
      return deadTilesReplaced > mostDeadTilesReplacedSoFar ? deadTilesReplaced : mostDeadTilesReplacedSoFar;
    }, 0),
  };
}

export type ProcessGameDataType = ReturnType<typeof processGame>;

main(process.argv[2]);
