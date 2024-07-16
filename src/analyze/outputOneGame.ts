import fs from 'fs';
import { GameHistoryMessageReceivedBonus } from '../common/gameHistoryMessage';
import { gameFromProtocolBuffer } from '../common/gameSerialization';
import { PB_GameReview } from '../common/pb';
import { getGameHistoryMessageString } from '../common/runGameTestFile';

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
    const mergedChains =
      gameState.gameHistoryMessages.filter(
        (gameHistoryMessage) => gameHistoryMessage instanceof GameHistoryMessageReceivedBonus,
      ).length > 0;

    if (mergedChains) {
      console.log(i);

      for (const gameHistoryMessage of gameState.gameHistoryMessages) {
        console.log(getGameHistoryMessageString(gameHistoryMessage));
      }
    }
  }
}

main(process.argv[2]);
