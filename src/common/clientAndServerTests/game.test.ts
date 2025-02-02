import { expect, test } from 'vitest';
import { GameManagerStatus } from '../../client/gamesManager';
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
