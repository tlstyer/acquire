import path from 'path';
import { type Game } from '../common/game.js';
import {
  calculateFinalTeamScores,
  calculatePlacings,
  determineTeamUserIds,
  getFinalPlayerScores,
  getGameHistoryMessageCounts,
  getMaxGameHistoryMessageCountsPerMove,
  getMaxGameHistoryMessageCountsPerTurn,
  iterateGamesInDirectory,
} from './misc.js';

function main(dirPath: string) {
  for (const { game, filePath } of iterateGamesInDirectory(dirPath, true)) {
    console.log(JSON.stringify(processGame(game, filePath)));
  }
}

function processGame(game: Game, filePath: string) {
  const playerScores = getFinalPlayerScores(game);
  const teamScores = calculateFinalTeamScores(game.gameMode, playerScores);
  const placings = calculatePlacings(teamScores);

  const userIds = game.users.map((user) => user.id);

  return {
    endTimestamp: game.gameStateHistory[game.gameStateHistory.length - 1].timestamp!,
    gameMode: game.gameMode,
    gameId: filePath.split(path.sep).slice(-2).join('-'),
    playerUserIds: userIds,
    playerScores,
    teamUserIds: determineTeamUserIds(game.gameMode, userIds),
    teamScores,
    placings,
    gameHistoryMessageCounts: getGameHistoryMessageCounts(game),
    maxGameHistoryMessageCountsPerTurn: getMaxGameHistoryMessageCountsPerTurn(game),
    maxGameHistoryMessageCountsPerMove: getMaxGameHistoryMessageCountsPerMove(game),
  };
}

export type ProcessedGameDataType = ReturnType<typeof processGame>;

main(process.argv[2]);
