import { calculateFinalTeamScores, calculatePlacings, iterateGamesInDirectory } from './misc';

function main(dirPath: string) {
  for (const { game, filePath } of iterateGamesInDirectory(dirPath, true)) {
    const scores = calculateFinalTeamScores(game);
    const placings = calculatePlacings(scores);

    console.log(game.gameMode, placings.join(','), filePath);
  }
}

main(process.argv[2]);
