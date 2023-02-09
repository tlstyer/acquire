import { Game } from './game';
import { PB_GameMode, PB_PlayerArrangementMode } from './pb';

type GameJSON = [PB_GameMode, PB_PlayerArrangementMode, number | null, number, number[], string[], number, number[], ([any] | [any, number])[]];

export function gameToJSON(game: Game): GameJSON {
  const gameActions = new Array(game.gameStateHistory.length);
  let lastTimestamp: number | null = null;
  game.gameStateHistory.forEach((gameState, i) => {
    const gameActionData: any[] = [gameState.gameAction];

    const currentTimestamp = gameState.timestamp;
    if (currentTimestamp !== null) {
      if (lastTimestamp === null) {
        gameActionData.push(currentTimestamp);
      } else {
        gameActionData.push(currentTimestamp - lastTimestamp);
      }
    }

    gameActions[i] = gameActionData;
    lastTimestamp = currentTimestamp;
  });

  return [
    game.gameMode,
    game.playerArrangementMode,
    // Time control starting amount (in seconds, null meaning infinite)
    null,
    // Time control increment amount (in seconds)
    0,
    game.userIDs,
    game.usernames,
    game.hostUserID,
    game.tileBag,
    gameActions,
  ];
}

export function gameFromJSON(json: GameJSON) {
  const gameMode = json[0];
  const playerArrangementMode = json[1];
  // const timeControlStartingAmount = json[2];
  // const timeControlIncrementAmount = json[3];
  const userIDs = json[4];
  const usernames = json[5];
  const hostUserID = json[6];
  const tileBag = json[7];
  const gameActions = json[8];

  const game = new Game(gameMode, playerArrangementMode, tileBag, userIDs, usernames, hostUserID, null);

  let lastTimestamp: number | null = null;
  for (let i = 0; i < gameActions.length; i++) {
    const gameAction = gameActions[i];
    const gameActionParameters = gameAction[0];

    let currentTimestamp: number | null = gameAction.length >= 2 ? gameAction[1]! : null;
    if (currentTimestamp !== null && lastTimestamp !== null) {
      currentTimestamp += lastTimestamp;
    }

    game.doGameAction(gameActionParameters, currentTimestamp);

    lastTimestamp = currentTimestamp;
  }

  return game;
}
