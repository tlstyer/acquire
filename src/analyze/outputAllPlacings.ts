import { calculateFinalTeamScores, calculatePlacings, iterateGamesInDirectory } from './misc';

function main(dirPath: string) {
  for (const game of iterateGamesInDirectory(dirPath, true)) {
    const scores = calculateFinalTeamScores(game);
    const placings = calculatePlacings(scores);

    console.log(game.gameMode, placings.join(','));
  }
}

main(process.argv[2]);
