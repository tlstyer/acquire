import fs from 'fs';
import path from 'path';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { gameFromProtocolBuffer } from '../common/gameSerialization';
import { PB_GameReview } from '../common/pb';
import { calculateFinalTeamScores, calculatePlacings } from './misc';

function processDirectory(dirPath: string) {
  for (const file of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      processDirectory(filePath);
    } else if (stats.isFile()) {
      const gameReviewFileContents = fs.readFileSync(filePath);
      const game = gameFromProtocolBuffer(PB_GameReview.fromBinary(gameReviewFileContents));

      if (game.gameActionStack.length === 1 && game.gameActionStack[0] instanceof ActionGameOver) {
        const scores = calculateFinalTeamScores(game);
        const placings = calculatePlacings(scores);

        console.log(game.gameMode, placings.join(','));
      }
    }
  }
}

processDirectory(process.argv[2]);
