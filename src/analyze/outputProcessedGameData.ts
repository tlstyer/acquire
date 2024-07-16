import path from 'path';
import type { Game } from '../common/game';
import {
  calculateFinalTeamScores,
  calculatePlacings,
  determineTeamUserIDs,
  getFinalPlayerScores,
  getGameHistoryMessageCounts,
  getMaxGameHistoryMessageCountsPerMove,
  getMaxGameHistoryMessageCountsPerTurn,
  iterateGamesInDirectory,
} from './misc';

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
    gameID: filePath.split(path.sep).slice(-2).join('-'),
    playerUserIDs: game.userIDs,
    playerScores,
    teamUserIDs: determineTeamUserIDs(game.gameMode, game.userIDs),
    teamScores,
    placings,
    gameHistoryMessageCounts: getGameHistoryMessageCounts(game),
    maxGameHistoryMessageCountsPerTurn: getMaxGameHistoryMessageCountsPerTurn(game),
    maxGameHistoryMessageCountsPerMove: getMaxGameHistoryMessageCountsPerMove(game),
  };
}

export type ProcessedGameDataType = ReturnType<typeof processGame>;

main(process.argv[2]);
