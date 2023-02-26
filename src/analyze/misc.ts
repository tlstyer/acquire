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
	const gameHistoryMessageCounts = {
		turnBegan: 0,
		drewPositionTile: 0,
		startedGame: 0,
		drewTile: 0,
		hasNoPlayableTile: 0,
		playedTile: 0,
		formedChain: 0,
		mergedChains: 0,
		selectedMergerSurvivor: 0,
		selectedChainToDisposeOfNext: 0,
		receivedBonus: 0,
		disposedOfShares: 0,
		couldNotAffordAnyShares: 0,
		purchasedShares: 0,
		drewLastTile: 0,
		replacedDeadTile: 0,
		endedGame: 0,
		noTilesPlayedForEntireRound: 0,
		allTilesPlayed: 0,
	};

	for (const gameState of game.gameStateHistory) {
		for (const gameHistoryMessage of gameState.gameHistoryMessages) {
			if (gameHistoryMessage instanceof GameHistoryMessageTurnBegan) {
				gameHistoryMessageCounts.turnBegan++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile) {
				gameHistoryMessageCounts.drewPositionTile++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageStartedGame) {
				gameHistoryMessageCounts.startedGame++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageDrewTile) {
				gameHistoryMessageCounts.drewTile++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile) {
				gameHistoryMessageCounts.hasNoPlayableTile++;
			} else if (gameHistoryMessage instanceof GameHistoryMessagePlayedTile) {
				gameHistoryMessageCounts.playedTile++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageFormedChain) {
				gameHistoryMessageCounts.formedChain++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageMergedChains) {
				gameHistoryMessageCounts.mergedChains++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor) {
				gameHistoryMessageCounts.selectedMergerSurvivor++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext) {
				gameHistoryMessageCounts.selectedChainToDisposeOfNext++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageReceivedBonus) {
				gameHistoryMessageCounts.receivedBonus++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares) {
				gameHistoryMessageCounts.disposedOfShares++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares) {
				gameHistoryMessageCounts.couldNotAffordAnyShares++;
			} else if (gameHistoryMessage instanceof GameHistoryMessagePurchasedShares) {
				gameHistoryMessageCounts.purchasedShares++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageDrewLastTile) {
				gameHistoryMessageCounts.drewLastTile++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile) {
				gameHistoryMessageCounts.replacedDeadTile++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageEndedGame) {
				gameHistoryMessageCounts.endedGame++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageNoTilesPlayedForEntireRound) {
				gameHistoryMessageCounts.noTilesPlayedForEntireRound++;
			} else if (gameHistoryMessage instanceof GameHistoryMessageAllTilesPlayed) {
				gameHistoryMessageCounts.allTilesPlayed++;
			}
		}
	}

	return gameHistoryMessageCounts;
}
