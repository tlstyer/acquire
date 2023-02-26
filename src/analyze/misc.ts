import fs from 'fs';
import path from 'path';
import { ScoreBoardIndexEnum } from '../common/enums';
import type { Game } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import {
	GameHistoryMessageAllTilesPlayed,
	GameHistoryMessageCouldNotAffordAnyShares,
	GameHistoryMessageDisposedOfShares,
	GameHistoryMessageDrewLastTile,
	GameHistoryMessageDrewPositionTile,
	GameHistoryMessageDrewTile,
	GameHistoryMessageEndedGame,
	GameHistoryMessageFormedChain,
	GameHistoryMessageHasNoPlayableTile,
	GameHistoryMessageMergedChains,
	GameHistoryMessageNoTilesPlayedForEntireRound,
	GameHistoryMessagePlayedTile,
	GameHistoryMessagePurchasedShares,
	GameHistoryMessageReceivedBonus,
	GameHistoryMessageReplacedDeadTile,
	GameHistoryMessageSelectedChainToDisposeOfNext,
	GameHistoryMessageSelectedMergerSurvivor,
	GameHistoryMessageStartedGame,
	GameHistoryMessageTurnBegan,
	type GameHistoryMessage,
} from '../common/gameHistoryMessage';
import { gameFromProtocolBuffer } from '../common/gameSerialization';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../common/helpers';
import { PB_GameMode, PB_GameReview } from '../common/pb';

export function* iterateGamesInDirectory(dirPath: string, completedGamesOnly = false) {
	for (const file of fs.readdirSync(dirPath)) {
		const filePath = path.join(dirPath, file);
		const stats = fs.statSync(filePath);

		if (stats.isDirectory()) {
			iterateGamesInDirectory(filePath, completedGamesOnly);
		} else if (stats.isFile()) {
			const gameReviewFileContents = fs.readFileSync(filePath);
			const game = gameFromProtocolBuffer(PB_GameReview.fromBinary(gameReviewFileContents));
			const includeGame = completedGamesOnly
				? game.gameActionStack.length === 1 && game.gameActionStack[0] instanceof ActionGameOver
				: true;

			if (includeGame) {
				yield { game, filePath };
			}
		}
	}
}

export function determineTeamUserIDs(gameMode: PB_GameMode, userIDs: number[]) {
	const numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;
	const grouped: number[][] = new Array(numTeams);
	for (let teamID = 0; teamID < grouped.length; teamID++) {
		grouped[teamID] = [];
	}

	for (let playerID = 0; playerID < userIDs.length; playerID++) {
		const teamID = playerID % numTeams;
		grouped[teamID].push(userIDs[playerID]);
	}

	return grouped;
}

export function getFinalPlayerScores(game: Game) {
	return game.scoreBoard.map((row) => row[ScoreBoardIndexEnum.Net]);
}

export function calculateFinalTeamScores(gameMode: PB_GameMode, finalPlayerScores: number[]) {
	const numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;
	const scores: number[] = new Array(numTeams);
	scores.fill(0);

	for (let playerID = 0; playerID < finalPlayerScores.length; playerID++) {
		const teamID = playerID % numTeams;
		scores[teamID] += finalPlayerScores[playerID];
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

export function getGameHistoryMessageCounts(game: Game) {
	const gameHistoryMessageCounts = new GameHistoryMessageCounts();

	for (const gameState of game.gameStateHistory) {
		gameHistoryMessageCounts.ingestMessages(gameState.gameHistoryMessages);
	}

	return gameHistoryMessageCounts;
}

class GameHistoryMessageCounts {
	turnBegan = 0;
	drewPositionTile = 0;
	startedGame = 0;
	drewTile = 0;
	hasNoPlayableTile = 0;
	playedTile = 0;
	formedChain = 0;
	mergedChains = 0;
	selectedMergerSurvivor = 0;
	selectedChainToDisposeOfNext = 0;
	receivedBonus = 0;
	disposedOfShares = 0;
	couldNotAffordAnyShares = 0;
	purchasedShares = 0;
	drewLastTile = 0;
	replacedDeadTile = 0;
	endedGame = 0;
	noTilesPlayedForEntireRound = 0;
	allTilesPlayed = 0;

	ingestMessage(gameHistoryMessage: GameHistoryMessage) {
		if (gameHistoryMessage instanceof GameHistoryMessageTurnBegan) {
			this.turnBegan++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile) {
			this.drewPositionTile++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageStartedGame) {
			this.startedGame++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageDrewTile) {
			this.drewTile++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile) {
			this.hasNoPlayableTile++;
		} else if (gameHistoryMessage instanceof GameHistoryMessagePlayedTile) {
			this.playedTile++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageFormedChain) {
			this.formedChain++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageMergedChains) {
			this.mergedChains++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor) {
			this.selectedMergerSurvivor++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext) {
			this.selectedChainToDisposeOfNext++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageReceivedBonus) {
			this.receivedBonus++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares) {
			this.disposedOfShares++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares) {
			this.couldNotAffordAnyShares++;
		} else if (gameHistoryMessage instanceof GameHistoryMessagePurchasedShares) {
			this.purchasedShares++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageDrewLastTile) {
			this.drewLastTile++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile) {
			this.replacedDeadTile++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageEndedGame) {
			this.endedGame++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageNoTilesPlayedForEntireRound) {
			this.noTilesPlayedForEntireRound++;
		} else if (gameHistoryMessage instanceof GameHistoryMessageAllTilesPlayed) {
			this.allTilesPlayed++;
		}
	}

	ingestMessages(gameHistoryMessages: GameHistoryMessage[]) {
		for (let i = 0; i < gameHistoryMessages.length; i++) {
			this.ingestMessage(gameHistoryMessages[i]);
		}
	}
}
