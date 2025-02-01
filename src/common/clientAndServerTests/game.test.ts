import { expect, test } from 'vitest';
import { PB_GameMode, PB_PlayerArrangementMode } from '../pb';
import { createOneClientConnectedToOneServer, waitForAsyncServerStuff } from './common';

test('newly created game has correct signals', async () => {
  const { client } = createOneClientConnectedToOneServer();

  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();

  client.connectToLobby();
  client.lobbyManager.createGame(PB_GameMode.SINGLES_2);

  const gameManager = client.connectToGame(
    client.logTime,
    client.lobbyManager.signals.createdGameNumber() ?? -1,
  );

  expect(gameManager.signals.connected()).toBe(true);
  expect(gameManager.signals.gameMode()).toBe(PB_GameMode.SINGLES_2);
  expect(gameManager.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
  expect(gameManager.signals.usernames()).toEqual(['user 1', null]);
  expect(gameManager.signals.userIds()).toEqual([1, null]);
  expect(gameManager.signals.approvals()).toEqual([false, false]);
  expect(gameManager.signals.hostUserId()).toBe(1);
});
