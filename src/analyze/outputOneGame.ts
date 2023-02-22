import fs from 'fs';
import { GameHistoryMessageEnum } from '../common/enums';
import { gameFromProtocolBuffer } from '../common/gameSerialization';
import { PB_GameReview } from '../common/pb';
import { getGameHistoryMessageString } from '../common/runGameTestFile';
import { updateReviewGamePBBinary } from './misc';

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
				(m) => m.gameHistoryMessage === GameHistoryMessageEnum.ReceivedBonus,
			).length > 0;

		if (mergedChains) {
			console.log(i);

			for (const gameHistoryMessage of gameState.gameHistoryMessages) {
				console.log(getGameHistoryMessageString(gameHistoryMessage));
			}
		}
	}

	updateReviewGamePBBinary(gameReviewFileContents);
}

main(process.argv[2]);
