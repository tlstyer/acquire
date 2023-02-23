import path from 'path';
import type { Game } from '../common/game';
import {
	GameHistoryMessageReceivedBonus,
	GameHistoryMessageReplacedDeadTile,
} from '../common/gameHistoryMessage';
import {
	calculateFinalTeamScores,
	calculatePlacings,
	determineTeamUserIDs,
	getFinalPlayerScores,
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
		numMergers: game.gameStateHistory.reduce((numMergersSoFar, gameState) => {
			return (
				numMergersSoFar +
				(gameState.gameHistoryMessages.filter(
					(gameHistoryMessage) => gameHistoryMessage instanceof GameHistoryMessageReceivedBonus,
				).length > 0
					? 1
					: 0)
			);
		}, 0),
		mostDeadTilesReplaced: game.gameStateHistory.reduce((mostDeadTilesReplacedSoFar, gameState) => {
			const deadTilesReplaced = gameState.gameHistoryMessages.filter(
				(gameHistoryMessage) => gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile,
			).length;
			return deadTilesReplaced > mostDeadTilesReplacedSoFar
				? deadTilesReplaced
				: mostDeadTilesReplacedSoFar;
		}, 0),
	};
}

export type ProcessGameDataType = ReturnType<typeof processGame>;

main(process.argv[2]);
