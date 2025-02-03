import { expect, test } from 'vitest';
import { createClient } from '../../client/client';
import { TestClientCommunication } from '../../client/clientCommunication';
import { type GameManager, GameManagerStatus } from '../../client/gamesManager';
import { type Server } from '../../server/server';
import { type TestServerCommunication } from '../../server/serverCommunication';
import { PB_GameMode, PB_PlayerArrangementMode } from '../pb';
import { createOneClientConnectedToOneServer, waitForAsyncServerStuff } from './common';

test('newly created game has correct signals', async () => {
  const { client } = createOneClientConnectedToOneServer();

  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();

  const lobbyManager = client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_2);

  const gameManager = client.connectToGame(
    client.logTime,
    lobbyManager.signals.createdGameNumber() ?? -1,
  );

  expect(gameManager.signals.status()).toBe(GameManagerStatus.SettingUp);
  expect(gameManager.signals.gameMode()).toBe(PB_GameMode.SINGLES_2);
  expect(gameManager.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
  expect(gameManager.signals.usernames()).toEqual(['user 1', null]);
  expect(gameManager.signals.userIds()).toEqual([1, null]);
  expect(gameManager.signals.approvals()).toEqual([false, false]);
  expect(gameManager.signals.hostUserId()).toBe(1);
});

test('game number of 0 is not found', async () => {
  const { client } = createOneClientConnectedToOneServer();

  const gameManager = client.connectToGame(client.logTime, 0);

  expect(gameManager.signals.status()).toBe(GameManagerStatus.NotFound);
  expect(gameManager.signals.gameMode()).toBe(PB_GameMode.SINGLES_1);
  expect(gameManager.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.VERSION_1);
  expect(gameManager.signals.usernames()).toEqual([]);
  expect(gameManager.signals.userIds()).toEqual([]);
  expect(gameManager.signals.approvals()).toEqual([]);
  expect(gameManager.signals.hostUserId()).toBe(0);
});

test('client is disconnected from room upon trying to enter a game that is not found', async () => {
  const { client, server } = createOneClientConnectedToOneServer();

  client.connectToLobby();
  expect(server.clientIdToClient.get(1)!.room !== undefined);

  client.connectToGame(client.logTime, 0);
  expect(server.clientIdToClient.get(1)!.room === undefined);
});

test('client knows what user IDs and usernames are and were in the game room', async () => {
  const { client, clientCommunication, serverCommunication } =
    createOneClientConnectedToOneServer();

  const gameManagersInGame = new Set<GameManager>();

  // client logs in as "user 1", creates game, connects to game
  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();
  const lobbyManager = client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_2);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager = client.connectToGame(client.logTime, gameNumber);
  gameManagersInGame.add(gameManager);
  expectUserIdsAndUsernames(new Map([[1, 'user 1']]), new Set([1]));

  // client2 connects to game
  const clientCommunication2 = new TestClientCommunication(serverCommunication);
  const client2 = createClient(clientCommunication2, 2);
  clientCommunication2.connect();
  const gameManager2 = client2.connectToGame(client2.logTime, gameNumber);
  gameManagersInGame.add(gameManager2);
  expectUserIdsAndUsernames(new Map([[1, 'user 1']]), new Set([1]));

  // client3 logs in as "user 3", connects to game
  const clientCommunication3 = new TestClientCommunication(serverCommunication);
  const client3 = createClient(clientCommunication3, 2);
  clientCommunication3.connect();
  client3.loginWithPassword('user 3', 'password');
  await waitForAsyncServerStuff();
  const gameManager3 = client3.connectToGame(client3.logTime, gameNumber);
  gameManagersInGame.add(gameManager3);
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
    ]),
    new Set([1, 3]),
  );

  // client2 logs in as "user 2"
  client2.loginWithPassword('user 2', 'password');
  await waitForAsyncServerStuff();
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
      [2, 'user 2'],
    ]),
    new Set([1, 3, 2]),
  );

  // client3 logs out
  client3.logout();
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
      [2, 'user 2'],
    ]),
    new Set([1, 2]),
  );

  // client3 logs in as "user 2"
  client3.loginWithPassword('user 2', 'password');
  await waitForAsyncServerStuff();
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
      [2, 'user 2'],
    ]),
    new Set([1, 2]),
  );

  // client2 logs out
  client2.logout();
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
      [2, 'user 2'],
    ]),
    new Set([1, 2]),
  );

  // client3 disconnects
  clientCommunication3.disconnect();
  gameManagersInGame.delete(gameManager3);
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
      [2, 'user 2'],
    ]),
    new Set([1]),
  );

  // client disconnects
  clientCommunication.disconnect();
  gameManagersInGame.delete(gameManager);
  expectUserIdsAndUsernames(
    new Map([
      [1, 'user 1'],
      [3, 'user 3'],
      [2, 'user 2'],
    ]),
    new Set(),
  );

  function expectUserIdsAndUsernames(
    expectedUserIdToUsername: Map<number, string>,
    expectedUserIdsInRoom: Set<number>,
  ) {
    for (const gameManager of gameManagersInGame) {
      expect(gameManager.signals.userIdToUsername()).toEqual(expectedUserIdToUsername);
      expect(gameManager.signals.userIdsInRoom()).toEqual(expectedUserIdsInRoom);
    }
  }
});

test('game setup example 1', async () => {
  const {
    gameManager1,
    gameManager2,
    gameManager3,
    gameManager4,
    gameManager5,
    gameManager6,
    server,
  } = await createManyUsersConnectedToOneServerAndConnectedToOneGame();

  gameManager2.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager3.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager4.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager3.gameSetupActions.standUp();
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_2_VS_2);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.swapPositions(0, 3);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.kickUser(2);
  expectEqualGameSetups(gameManager1, server);

  gameManager5.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager6.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  gameManager4.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  gameManager6.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.TEAMS_2_VS_2);
  expect(gameManager1.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.EXACT_ORDER);
  expect(gameManager1.signals.hostUserId()).toBe(1);
  expect(gameManager1.signals.usernames()).toEqual(['user 4', 'user 5', 'user 6', 'user 1']);
  expect(gameManager1.signals.usernamesWithoutNulls()).toEqual([
    'user 4',
    'user 5',
    'user 6',
    'user 1',
  ]);
  expect(gameManager1.signals.userIds()).toEqual([4, 5, 6, 1]);
  expect(gameManager1.signals.approvals()).toEqual([true, true, true, true]);
  expect(gameManager1.signals.hostUserId()).toEqual(1);
});

test('game setup example 2', async () => {
  const {
    gameManager1,
    gameManager2,
    gameManager3,
    gameManager4,
    gameManager5,
    gameManager6,
    server,
  } = await createManyUsersConnectedToOneServerAndConnectedToOneGame();

  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.userIds()).toEqual([1, null, null, null]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.userIds()).toEqual([1, null, null, null, null, null]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);
  expectEqualGameSetups(gameManager1, server);

  gameManager2.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager3.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager4.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager5.gameSetupActions.sitDown();
  expectEqualGameSetups(gameManager1, server);

  gameManager6.gameSetupActions.sitDown();
  expect(gameManager1.signals.userIds()).toEqual([1, 2, 3, 4, 5, 6]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.swapPositions(0, 5);
  expect(gameManager1.signals.userIds()).toEqual([6, 2, 3, 4, 5, 1]);
  expectEqualGameSetups(gameManager1, server);

  gameManager6.gameSetupActions.standUp();
  gameManager4.gameSetupActions.standUp();
  expect(gameManager1.signals.userIds()).toEqual([null, 2, 3, null, 5, 1]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.playerArrangementMode()).toEqual(
    PB_PlayerArrangementMode.RANDOM_ORDER,
  );
  expect(gameManager1.signals.userIds()).toEqual([5, 2, 3, 1]);
  expectEqualGameSetups(gameManager1, server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  gameManager2.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  gameManager3.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.approve();
  expectEqualGameSetups(gameManager1, server);
});

async function createManyUsersConnectedToOneServerAndConnectedToOneGame() {
  const { client, server, serverCommunication } = createOneClientConnectedToOneServer();

  // users 1 through 6 connect to game
  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();
  const lobbyManager = client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_4);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager1 = client.connectToGame(client.logTime, gameNumber);

  const gameManager2 = await connectToServerAndLoginAndConnectToGame(
    serverCommunication,
    gameNumber,
    'user 2',
  );
  const gameManager3 = await connectToServerAndLoginAndConnectToGame(
    serverCommunication,
    gameNumber,
    'user 3',
  );
  const gameManager4 = await connectToServerAndLoginAndConnectToGame(
    serverCommunication,
    gameNumber,
    'user 4',
  );
  const gameManager5 = await connectToServerAndLoginAndConnectToGame(
    serverCommunication,
    gameNumber,
    'user 5',
  );
  const gameManager6 = await connectToServerAndLoginAndConnectToGame(
    serverCommunication,
    gameNumber,
    'user 6',
  );

  return {
    gameManager1,
    gameManager2,
    gameManager3,
    gameManager4,
    gameManager5,
    gameManager6,
    server,
  };
}

async function connectToServerAndLoginAndConnectToGame(
  serverCommunication: TestServerCommunication,
  gameNumber: number,
  username: string,
) {
  const clientCommunicationNew = new TestClientCommunication(serverCommunication);
  const clientNew = createClient(clientCommunicationNew, 2);
  clientCommunicationNew.connect();
  clientNew.loginWithPassword(username, 'password');
  await waitForAsyncServerStuff();
  const gameManagerNew = clientNew.connectToGame(clientNew.logTime, gameNumber);
  return gameManagerNew;
}

function expectEqualGameSetups(gameManager: GameManager, server: Server) {
  const clientGameSetupLiteSignals = gameManager.signals;
  const serverGameSetup = server.gameRoomsManager.gameNumberToGameRoom.get(1)!.gameSetup!;

  expect(clientGameSetupLiteSignals.gameMode()).toEqual(serverGameSetup.gameMode);
  expect(clientGameSetupLiteSignals.playerArrangementMode()).toEqual(
    serverGameSetup.playerArrangementMode,
  );
  expect(clientGameSetupLiteSignals.usernames()).toEqual(serverGameSetup.usernames);
  expect(clientGameSetupLiteSignals.usernamesWithoutNulls()).toEqual(
    serverGameSetup.usernames.map((username) => username ?? ''),
  );
  expect(clientGameSetupLiteSignals.userIds()).toEqual(serverGameSetup.userIds);
  expect(clientGameSetupLiteSignals.approvals()).toEqual(serverGameSetup.approvals);
  expect(clientGameSetupLiteSignals.hostUserId()).toEqual(serverGameSetup.hostUserId);
}
