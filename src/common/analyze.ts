import fs from 'fs';
import path from 'path';
import { GameHistoryMessageEnum } from './enums';
import { gameFromProtocolBuffer } from './gameSerialization';
import { PB_GameReview } from './pb';
import { getGameHistoryMessageString } from './runGameTestFile';

function main(gameFilePath: string) {
  const gameReviewFileContents = fs.readFileSync(gameFilePath);
  const game = gameFromProtocolBuffer(PB_GameReview.fromBinary(gameReviewFileContents));

  for (let i = 0; i < game.gameStateHistory.length; i++) {
    console.log(i);

    const gameState = game.gameStateHistory[i];
    for (const gameHistoryMessage of gameState.gameHistoryMessages) {
      console.log(getGameHistoryMessageString(gameHistoryMessage));
    }
  }

  console.log();
  console.log();
  console.log();

  for (let i = 0; i < game.gameStateHistory.length; i++) {
    const gameState = game.gameStateHistory[i];
    const mergedChains = gameState.gameHistoryMessages.filter((m) => m.gameHistoryMessage === GameHistoryMessageEnum.ReceivedBonus).length > 0;

    if (mergedChains) {
      console.log(i);

      for (const gameHistoryMessage of gameState.gameHistoryMessages) {
        console.log(getGameHistoryMessageString(gameHistoryMessage));
      }
    }
  }

  updateReviewGamePBBinary(gameReviewFileContents);
}

function updateReviewGamePBBinary(gameReviewFileContents: Buffer) {
  const pathToFile = path.join(__dirname, '../../src/client/reviewGamePBBinary.ts');

  const currentContents = fs.readFileSync(pathToFile).toString();
  const desiredContents = `export const reviewGamePBBinary = new Uint8Array(${JSON.stringify([...gameReviewFileContents])});\n`;

  if (desiredContents !== currentContents) {
    fs.writeFileSync(pathToFile, desiredContents);
  }
}

main(process.argv[2]);
