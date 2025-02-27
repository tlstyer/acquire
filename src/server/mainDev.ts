import 'dotenv/config';
import { createClient } from '../client/client.js';
import { type GameManager } from '../client/gamesManager.js';
import {
  getExampleGame1,
  getExampleGame2,
  getExampleGame3,
} from '../client/pages/examples/games.js';
import { WebSocketClientCommunication } from '../client/webSocketClientCommunication.js';
import { type Game } from '../common/game.js';
import { gameModeToNumPlayers, parseDecimalInteger } from '../common/helpers.js';
import { PB_PlayerArrangementMode } from '../common/pb.js';
import { Server } from './server.js';
import { TestUserDataProvider } from './userDataProvider.js';
import { WebSocketServerCommunication } from './webSocketServerCommunication.js';

async function main() {
  const serverCommunication = new WebSocketServerCommunication();
  const userDataProvider = new TestUserDataProvider();

  const logTime = Math.floor(Date.now() / 1000);

  const server = new Server(
    serverCommunication,
    userDataProvider,
    parseDecimalInteger(process.env.VITE_VERSION) ?? 0,
    logTime,
  );
  serverCommunication.begin();

  for (let userId = 1; userId <= 7; userId++) {
    userDataProvider.createUser(`user ${userId}`, 'password');
  }

  let count = 0;
  setInterval(() => {
    count++;
    if (count === 120) {
      server.lobbyRoom.createLastStateCheckpoint();
      count = 0;
    } else {
      server.lobbyRoom.sendQueuedEvents();
    }
  }, 500);

  replayGame(getExampleGame1(), server);
  await sleep(10);
  replayGame(getExampleGame2(), server);
  await sleep(10);
  replayGame(getExampleGame3(), server);
  await sleep(10);
}

async function replayGame(game: Game, server: Server) {
  const clientStuffs: ClientStuff[] = [];
  const gameManagers: GameManager[] = [];

  const numPlayers = gameModeToNumPlayers.get(game.gameMode)!;
  let gameNumber = -1;

  for (let playerId = 0; playerId < numPlayers; playerId++) {
    const clientStuff = await loginAsUser(playerId + 1);
    clientStuffs.push(clientStuff);

    if (playerId === 0) {
      const lobbyManager = clientStuff.client.connectToLobby();
      await sleep(10);

      lobbyManager.createGame(game.gameMode);
      await sleep(10);
      gameNumber = lobbyManager.signals.createdGameNumber()!;

      const gameManager = clientStuff.client.connectToGame(clientStuff.client.logTime, gameNumber);
      gameManagers.push(gameManager);
      await sleep(10);

      gameManager.gameSetupActions.changePlayerArrangementMode(
        PB_PlayerArrangementMode.EXACT_ORDER,
      );
      await sleep(10);
    } else {
      const gameManager = clientStuff.client.connectToGame(clientStuff.client.logTime, gameNumber);
      gameManagers.push(gameManager);
      await sleep(10);

      gameManager.gameSetupActions.sitDown();
      await sleep(10);
    }
  }

  const gameRoom = server.gameRoomsManager.gameNumberToGameRoom.get(gameNumber)!;

  gameRoom.getNewTileBag = () => game.tileBag;
  gameRoom.dateNow = () => game.gameStateHistory[0].timestamp;

  for (const gameManager of gameManagers) {
    gameManager.gameSetupActions.approve();
    await sleep(10);
  }

  for (let i = 1; i < game.gameStateHistory.length; i++) {
    const gameState = game.gameStateHistory[i];

    gameRoom.dateNow = () => gameState.timestamp;
    const gameManager = gameManagers[gameState.playerId];

    const action = Object.keys(gameState.gameAction)[0];
    // @ts-expect-error action is a key of gameState.gameAction
    const parameters = Object.values(gameState.gameAction[action]);

    // @ts-expect-error action and parameters are correct
    gameManager.gameActions[action](...parameters);
    await sleep(250);
  }

  for (const clientStuff of clientStuffs) {
    clientStuff.clientCommunication.end();
  }

  await sleep(10);

  server.lobbyRoom.createLastStateCheckpoint();

  for (let i = 0; i < 5; i++) {
    console.log();
  }
}

type ClientStuff = Awaited<ReturnType<typeof loginAsUser>>;

async function loginAsUser(userId: number) {
  const clientCommunication = new WebSocketClientCommunication();
  clientCommunication.begin();

  const client = createClient(
    clientCommunication,
    parseDecimalInteger(process.env.VITE_VERSION) ?? 0,
  );

  client.loginWithPassword(`user ${userId}`, 'password');
  await sleep(10);

  return {
    clientCommunication,
    client,
  };
}

async function sleep(milliseconds: number) {
  await new Promise((resolve) => setTimeout(resolve, milliseconds));
}

main();
