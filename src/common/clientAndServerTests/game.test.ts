import { expect, test } from 'vitest';
import { type Client, createClient } from '../../client/client';
import { TestClientCommunication } from '../../client/clientCommunication';
import { type GameManager, GameManagerStatus } from '../../client/gamesManager';
import { type Server } from '../../server/server';
import { type TestServerCommunication } from '../../server/serverCommunication';
import { PB_GameMode, PB_PlayerArrangementMode } from '../pb';
import { User } from '../user';
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
  expect(gameManager.signals.users()).toEqual([user1, null]);
  expect(gameManager.signals.approvals()).toEqual([false, false]);
  expect(gameManager.signals.hostUser()).toEqual(user1);
});

test('game number of 0 is not found', async () => {
  const { client } = createOneClientConnectedToOneServer();

  const gameManager = client.connectToGame(client.logTime, 0);

  expect(gameManager.signals.status()).toBe(GameManagerStatus.NotFound);
  expect(gameManager.signals.gameMode()).toBe(PB_GameMode.SINGLES_1);
  expect(gameManager.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.VERSION_1);
  expect(gameManager.signals.users()).toEqual([]);
  expect(gameManager.signals.approvals()).toEqual([]);
  expect(gameManager.signals.hostUser()).toEqual(dummyUser);
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

  const clientsInGame = new Set<Client>();
  const gameManagersInGame = new Set<GameManager>();

  // client logs in as "user 1", creates game, connects to game
  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();
  const lobbyManager = client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_2);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager = client.connectToGame(client.logTime, gameNumber);
  clientsInGame.add(client);
  gameManagersInGame.add(gameManager);
  expectUsers(new Map([[1, user1]]), new Set([user1]));

  // client2 connects to game
  const clientCommunication2 = new TestClientCommunication(serverCommunication);
  const client2 = createClient(clientCommunication2, 2);
  clientCommunication2.connect();
  const gameManager2 = client2.connectToGame(client2.logTime, gameNumber);
  clientsInGame.add(client2);
  gameManagersInGame.add(gameManager2);
  expectUsers(new Map([[1, user1]]), new Set([user1]));

  // client3 logs in as "user 3", connects to game
  const clientCommunication3 = new TestClientCommunication(serverCommunication);
  const client3 = createClient(clientCommunication3, 2);
  clientCommunication3.connect();
  client3.loginWithPassword('user 3', 'password');
  await waitForAsyncServerStuff();
  const gameManager3 = client3.connectToGame(client3.logTime, gameNumber);
  clientsInGame.add(client3);
  gameManagersInGame.add(gameManager3);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
    ]),
    new Set([user1, user3]),
  );

  // client2 logs in as "user 2"
  client2.loginWithPassword('user 2', 'password');
  await waitForAsyncServerStuff();
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user3, user2]),
  );

  // client3 logs out
  client3.logout();
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user2]),
  );

  // client3 logs in as "user 2"
  client3.loginWithPassword('user 2', 'password');
  await waitForAsyncServerStuff();
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user2]),
  );

  // client2 logs out
  client2.logout();
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user2]),
  );

  // client3 disconnects
  clientCommunication3.disconnect();
  clientsInGame.delete(client3);
  gameManagersInGame.delete(gameManager3);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1]),
  );

  // client disconnects
  clientCommunication.disconnect();
  clientsInGame.delete(client);
  gameManagersInGame.delete(gameManager);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set(),
  );

  function expectUsers(expectedUserIdToUser: Map<number, User>, expectedUsersInRoom: Set<User>) {
    for (const client of clientsInGame) {
      expect(client.userIdToUser).toEqual(expectedUserIdToUser);
    }

    for (const gameManager of gameManagersInGame) {
      expect(gameManager.signals.usersInRoom()).toEqual(expectedUsersInRoom);
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
  expect(gameManager1.signals.hostUser()).toEqual(user1);
  expect(gameManager1.signals.users()).toEqual([user4, user5, user6, user1]);
  expect(gameManager1.signals.usersWithoutNulls()).toEqual([]); // not set during game setup
  expect(gameManager1.signals.approvals()).toEqual([true, true, true, true]);
  expect(gameManager1.signals.hostUser()).toEqual(user1);
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
  expect(gameManager1.signals.users()).toEqual([user1, null, null, null]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.users()).toEqual([user1, null, null, null, null, null]);
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
  expect(gameManager1.signals.users()).toEqual([user1, user2, user3, user4, user5, user6]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.swapPositions(0, 5);
  expect(gameManager1.signals.users()).toEqual([user6, user2, user3, user4, user5, user1]);
  expectEqualGameSetups(gameManager1, server);

  gameManager6.gameSetupActions.standUp();
  gameManager4.gameSetupActions.standUp();
  expect(gameManager1.signals.users()).toEqual([null, user2, user3, null, user5, user1]);
  expectEqualGameSetups(gameManager1, server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.playerArrangementMode()).toEqual(
    PB_PlayerArrangementMode.RANDOM_ORDER,
  );
  expect(gameManager1.signals.users()).toEqual([user5, user2, user3, user1]);
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
  expect(clientGameSetupLiteSignals.users()).toEqual(serverGameSetup.users);
  expect(clientGameSetupLiteSignals.approvals()).toEqual(serverGameSetup.approvals);
  expect(clientGameSetupLiteSignals.hostUser()).toEqual(serverGameSetup.hostUser);
}

const user1 = new User(1, 'user 1');
const user2 = new User(2, 'user 2');
const user3 = new User(3, 'user 3');
const user4 = new User(4, 'user 4');
const user5 = new User(5, 'user 5');
const user6 = new User(6, 'user 6');
const dummyUser = new User(-1, '?');
