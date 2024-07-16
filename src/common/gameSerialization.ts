import { Game } from './game';
import { ActionGameOver } from './gameActions/gameOver';
import { PB_GameAction, PB_GameReview } from './pb';

export function gameToJSON(game: Game): any {
  return PB_GameReview.toJson(gameToProtocolBuffer(game));
}

export function gameFromJSON(json: any) {
  return gameFromProtocolBuffer(PB_GameReview.fromJson(json));
}

export function gameToProtocolBuffer(game: Game) {
  const gameReview = PB_GameReview.create({
    gameMode: game.gameMode,
    playerArrangementMode: game.playerArrangementMode,
    userIds: game.userIDs,
    usernames: game.usernames,
    hostUserId: game.hostUserID,
    tileBag: game.tileBag,
  });

  if (game.gameStateHistory.length > 0) {
    const gameActions: PB_GameAction[] = new Array(game.gameStateHistory.length);
    const gameActionTimestampOffsets: number[] = new Array(game.gameStateHistory.length - 1);
    let allGameStatesHaveTimestamps = true;
    let lastTimestamp: number | null = null;
    game.gameStateHistory.forEach((gameState, i) => {
      gameActions[i] = gameState.gameAction;

      const currentTimestamp = gameState.timestamp;
      if (currentTimestamp !== null) {
        if (lastTimestamp !== null) {
          gameActionTimestampOffsets[i - 1] = currentTimestamp - lastTimestamp;
        }
      } else {
        allGameStatesHaveTimestamps = false;
      }

      lastTimestamp = currentTimestamp;
    });

    gameReview.gameActions = gameActions;

    const firstGameState = game.gameStateHistory[0];
    if (firstGameState.timestamp) {
      gameReview.beginTimestamp = firstGameState.timestamp;
    }

    if (allGameStatesHaveTimestamps) {
      gameReview.gameActionTimestampOffsets = gameActionTimestampOffsets;
    }

    const lastGameState = game.gameStateHistory[game.gameStateHistory.length - 1];
    if (lastGameState.timestamp && lastGameState.nextGameAction instanceof ActionGameOver) {
      gameReview.endTimestamp = lastGameState.timestamp;
    }
  }

  return gameReview;
}

export function gameFromProtocolBuffer(gameReview: PB_GameReview) {
  const game = new Game(
    gameReview.gameMode,
    gameReview.playerArrangementMode,
    gameReview.tileBag,
    gameReview.userIds,
    gameReview.usernames,
    gameReview.hostUserId,
    null,
  );

  const gameActions = gameReview.gameActions;
  const hasGameActionTimestampOffsets = gameReview.gameActionTimestampOffsets.length > 0;
  const lastGameActionIndex = gameActions.length - 1;
  let lastTimestamp: number | null = null;

  for (let i = 0; i < gameActions.length; i++) {
    const gameAction = gameActions[i];

    let currentTimestamp: number | null = null;
    if (i === 0) {
      if (gameReview.beginTimestamp) {
        currentTimestamp = gameReview.beginTimestamp;
      }
    } else if (hasGameActionTimestampOffsets) {
      if (lastTimestamp) {
        currentTimestamp = lastTimestamp + gameReview.gameActionTimestampOffsets[i - 1];
      }
    } else if (i === lastGameActionIndex) {
      if (gameReview.endTimestamp) {
        currentTimestamp = gameReview.endTimestamp;
      }
    }

    game.doGameAction(gameAction, currentTimestamp);

    lastTimestamp = currentTimestamp;
  }

  return game;
}
