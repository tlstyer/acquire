import fs from 'fs';
import path from 'path';
import readline from 'readline';
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
import type { ProcessedGameDataType } from './outputProcessedGameData';

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

function* iterateTurns(game: Game) {
  let gameHistoryMessages: GameHistoryMessage[] = [];

  for (const gameState of game.gameStateHistory) {
    for (const gameHistoryMessage of gameState.gameHistoryMessages) {
      if (gameHistoryMessage instanceof GameHistoryMessageTurnBegan) {
        yield gameHistoryMessages;
        gameHistoryMessages = [];
      }

      gameHistoryMessages.push(gameHistoryMessage);
    }
  }

  yield gameHistoryMessages;
}

export async function* iterateProcessedGameData(processedGameDataFilePath: string) {
  const rl = readline.createInterface({
    input: fs.createReadStream(processedGameDataFilePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const processedGameData: ProcessedGameDataType = JSON.parse(line);

    yield processedGameData;
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

export function getMaxGameHistoryMessageCountsPerTurn(game: Game) {
  const maxGameHistoryMessageCountsPerTurn = new GameHistoryMessageCounts();

  for (const gameHistoryMessages of iterateTurns(game)) {
    const gameHistoryMessageCounts = new GameHistoryMessageCounts();
    gameHistoryMessageCounts.ingestMessages(gameHistoryMessages);

    maxGameHistoryMessageCountsPerTurn.setToMaxOfThisAndOther(gameHistoryMessageCounts);
  }

  return maxGameHistoryMessageCountsPerTurn;
}

export function getMaxGameHistoryMessageCountsPerMove(game: Game) {
  const maxGameHistoryMessageCountsPerMove = new GameHistoryMessageCounts();

  for (const gameState of game.gameStateHistory) {
    const gameHistoryMessageCounts = new GameHistoryMessageCounts();
    gameHistoryMessageCounts.ingestMessages(gameState.gameHistoryMessages);

    maxGameHistoryMessageCountsPerMove.setToMaxOfThisAndOther(gameHistoryMessageCounts);
  }

  return maxGameHistoryMessageCountsPerMove;
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

  setToMaxOfThisAndOther(other: GameHistoryMessageCounts) {
    this.turnBegan = Math.max(this.turnBegan, other.turnBegan);
    this.drewPositionTile = Math.max(this.drewPositionTile, other.drewPositionTile);
    this.startedGame = Math.max(this.startedGame, other.startedGame);
    this.drewTile = Math.max(this.drewTile, other.drewTile);
    this.hasNoPlayableTile = Math.max(this.hasNoPlayableTile, other.hasNoPlayableTile);
    this.playedTile = Math.max(this.playedTile, other.playedTile);
    this.formedChain = Math.max(this.formedChain, other.formedChain);
    this.mergedChains = Math.max(this.mergedChains, other.mergedChains);
    this.selectedMergerSurvivor = Math.max(
      this.selectedMergerSurvivor,
      other.selectedMergerSurvivor,
    );
    this.selectedChainToDisposeOfNext = Math.max(
      this.selectedChainToDisposeOfNext,
      other.selectedChainToDisposeOfNext,
    );
    this.receivedBonus = Math.max(this.receivedBonus, other.receivedBonus);
    this.disposedOfShares = Math.max(this.disposedOfShares, other.disposedOfShares);
    this.couldNotAffordAnyShares = Math.max(
      this.couldNotAffordAnyShares,
      other.couldNotAffordAnyShares,
    );
    this.purchasedShares = Math.max(this.purchasedShares, other.purchasedShares);
    this.drewLastTile = Math.max(this.drewLastTile, other.drewLastTile);
    this.replacedDeadTile = Math.max(this.replacedDeadTile, other.replacedDeadTile);
    this.endedGame = Math.max(this.endedGame, other.endedGame);
    this.noTilesPlayedForEntireRound = Math.max(
      this.noTilesPlayedForEntireRound,
      other.noTilesPlayedForEntireRound,
    );
    this.allTilesPlayed = Math.max(this.allTilesPlayed, other.allTilesPlayed);
  }
}

export class MovingAverage {
  slidingWindow: number[];
  nextEntryIndex = 0;
  sum = 0;

  constructor(public length: number) {
    this.slidingWindow = new Array(length);
    this.slidingWindow.fill(0);
  }

  includeNewEntry(entry: number) {
    this.sum += entry - this.slidingWindow[this.nextEntryIndex];
    this.slidingWindow[this.nextEntryIndex] = entry;
    this.nextEntryIndex = (this.nextEntryIndex + 1) % this.length;
  }

  getAverage() {
    return this.sum / this.length;
  }
}
