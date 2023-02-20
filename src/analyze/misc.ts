import fs from 'fs';
import path from 'path';
import { ScoreBoardIndexEnum } from '../common/enums';
import { Game } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { gameFromProtocolBuffer } from '../common/gameSerialization';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../common/helpers';
import { PB_GameReview } from '../common/pb';

export function* iterateGamesInDirectory(dirPath: string, completedGamesOnly = false) {
  for (const file of fs.readdirSync(dirPath)) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      iterateGamesInDirectory(filePath, completedGamesOnly);
    } else if (stats.isFile()) {
      const gameReviewFileContents = fs.readFileSync(filePath);
      const game = gameFromProtocolBuffer(PB_GameReview.fromBinary(gameReviewFileContents));
      const includeGame = completedGamesOnly ? game.gameActionStack.length === 1 && game.gameActionStack[0] instanceof ActionGameOver : true;

      if (includeGame) {
        yield game;
      }
    }
  }
}

export function updateReviewGamePBBinary(gameReviewFileContents: Buffer) {
  const pathToFile = path.join(__dirname, '../../src/client/reviewGamePBBinary.ts');

  const currentContents = fs.readFileSync(pathToFile).toString();
  const desiredContents = `export const reviewGamePBBinary = new Uint8Array(${JSON.stringify([...gameReviewFileContents])});\n`;

  if (desiredContents !== currentContents) {
    fs.writeFileSync(pathToFile, desiredContents);
  }
}

export function calculateFinalTeamScores(game: Game) {
  const numTeams = gameModeToNumPlayers.get(game.gameMode)! / gameModeToTeamSize.get(game.gameMode)!;
  const scores: number[] = new Array(numTeams);
  scores.fill(0);

  for (let playerID = 0; playerID < game.scoreBoard.length; playerID++) {
    const teamID = playerID % numTeams;
    scores[teamID] += game.scoreBoard[playerID][ScoreBoardIndexEnum.Net];
  }

  return scores;
}

export function calculatePlacings(scores: number[]) {
  const scoreAndTeamIDArray = scores.map((score, teamID) => [score, teamID]);
  scoreAndTeamIDArray.sort((a, b) => b[0] - a[0]);

  let lastScore = 0;
  let lastPlacing = 0;
  const placingAndTeamIDArray = scoreAndTeamIDArray.map((scoreAndTeamID, index) => {
    const [score, teamID] = scoreAndTeamID;
    const placing = score === lastScore ? lastPlacing : index + 1;
    lastScore = score;
    lastPlacing = placing;
    return [placing, teamID];
  });

  placingAndTeamIDArray.sort((a, b) => a[1] - b[1]);

  const placings = placingAndTeamIDArray.map((placingAndTeamID) => placingAndTeamID[0]);

  return placings;
}
