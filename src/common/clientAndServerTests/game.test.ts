import { expect, test } from 'vitest';
import { createClient } from '../../client/client';
import { TestClientCommunication } from '../../client/clientCommunication';
import { type GameManager, GameManagerStatus } from '../../client/gamesManager';
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
