import { describe, expect, test } from 'vitest';
import { createClient } from '../../client/client';
import { TestClientCommunication } from '../../client/clientCommunication';
import { GameStatus } from '../../client/helpers';
import { GameRoom } from '../../server/gameRoom';
import { GameSetup } from '../gameSetup';
import { PB_GameMode, PB_MessageToClient, PB_MessageToServer } from '../pb';
import { User } from '../user';
import {
  createOneClientConnectedToOneServer,
  userIdToTestUserData,
  waitForAsyncServerStuff,
} from './common';

test('connect to lobby in its initial state', () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();
  clientCommunication.communicatedMessages.length = 0;

  const lobbyManager = client.connectToLobby();

  expect(lobbyManager.lastEventIndex).toBe(2);
  expect(clientCommunication.communicatedMessages.length).toBe(2);
  expect(clientCommunication.communicatedMessages[0].sentMessage).toEqual(
    PB_MessageToServer.create({
      lobby: {
        connect: {
          lastEventIndex: 0,
        },
      },
    }),
  );
  expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
    PB_MessageToClient.create({
      lobby: {
        lastStateCheckpoint: {
          lastEventIndex: 2,
        },
      },
    }),
  );
  clientCommunication.communicatedMessages.length = 0;

  expect([...server.lobbyRoom.clients].map((c) => c.clientId)).toEqual([1]);

  clientCommunication.disconnect();

  expect(server.lobbyRoom.clients.size).toBe(0);

  clientCommunication.connect();

  expect(lobbyManager.lastEventIndex).toBe(2);
  expect(clientCommunication.communicatedMessages.length).toBe(3);
  expect(clientCommunication.communicatedMessages[1].sentMessage).toEqual(
    PB_MessageToServer.create({
      lobby: {
        connect: {
          lastEventIndex: 2,
        },
      },
    }),
  );
  expect(clientCommunication.communicatedMessages[2].receivedMessage).toEqual(
    PB_MessageToClient.create({
      lobby: {},
    }),
  );
  clientCommunication.communicatedMessages.length = 0;

  expect([...server.lobbyRoom.clients].map((c) => c.clientId)).toEqual([2]);
});

test('users are added and removed', async () => {
  const { client, clientCommunication, server, serverCommunication } =
    createOneClientConnectedToOneServer();

  // first client logs in and connects to lobby

  client.loginWithToken('user 3', userIdToTestUserData[3].passwordHash);
  await waitForAsyncServerStuff();
  const lobbyManager = client.connectToLobby();
  clientCommunication.communicatedMessages.length = 0;

  const expectedUserIdToUser = new Map([[3, new User(3, 'user 3')]]);
  expect(client.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManager.signals.users().length).toBe(0);

  server.lobbyRoom.sendQueuedEvents();

  expect(clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual({
    lobby: { events: [{ addUserToLobby: { userId: 3, username: 'user 3' } }] },
  });
  expect(client.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManager.signals.users()).toEqual([user3]);

  // another client connects to lobby and then logs in

  const clientCommunication4 = new TestClientCommunication(serverCommunication);
  const client4 = createClient(clientCommunication4, 2);
  clientCommunication4.connect();
  clientCommunication4.communicatedMessages.length = 0;

  const lobbyManager4 = client4.connectToLobby();

  expect(clientCommunication4.communicatedMessages.length).toBe(2);
  expect(clientCommunication4.communicatedMessages[1].receivedMessage).toEqual({
    lobby: {
      lastStateCheckpoint: { games: [], users: [], lastEventIndex: 2 },
      events: [{ addUserToLobby: { userId: 3, username: 'user 3' } }],
    },
  });

  client4.loginWithToken('user 4', userIdToTestUserData[4].passwordHash);
  await waitForAsyncServerStuff();
  clientCommunication.communicatedMessages.length = 0;
  clientCommunication4.communicatedMessages.length = 0;

  server.lobbyRoom.sendQueuedEvents();

  expect(clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientCommunication4.communicatedMessages.length).toBe(1);
  const expectedAddUserToLobbyMessage = {
    lobby: { events: [{ addUserToLobby: { userId: 4, username: 'user 4' } }] },
  };
  expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual(
    expectedAddUserToLobbyMessage,
  );
  expect(clientCommunication4.communicatedMessages[0].receivedMessage).toEqual(
    expectedAddUserToLobbyMessage,
  );
  expectedUserIdToUser.set(4, new User(4, 'user 4'));
  expect(client.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManager.signals.users()).toEqual([user3, user4]);
  expect(client4.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManager4.signals.users()).toEqual([user3, user4]);

  // client logs out

  client.logout();
  clientCommunication.communicatedMessages.length = 0;
  clientCommunication4.communicatedMessages.length = 0;

  server.lobbyRoom.sendQueuedEvents();

  expect(clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientCommunication4.communicatedMessages.length).toBe(1);
  const expectedRemoveUserFromLobbyMessage = {
    lobby: { events: [{ removeUserFromLobby: { userId: 3 } }] },
  };
  expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual(
    expectedRemoveUserFromLobbyMessage,
  );
  expect(clientCommunication4.communicatedMessages[0].receivedMessage).toEqual(
    expectedRemoveUserFromLobbyMessage,
  );
  expect(client.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManager.signals.users()).toEqual([user4]);
  expect(client4.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManager4.signals.users()).toEqual([user4]);

  // anonymous client 1 connects to lobby

  const clientCommunicationAnon1 = new TestClientCommunication(serverCommunication);
  const clientAnon1 = createClient(clientCommunicationAnon1, 2);
  clientCommunicationAnon1.connect();
  clientCommunicationAnon1.communicatedMessages.length = 0;

  const lobbyManagerAnon1 = clientAnon1.connectToLobby();

  expect(clientCommunicationAnon1.communicatedMessages.length).toBe(2);
  expect(clientCommunicationAnon1.communicatedMessages[1].receivedMessage).toEqual({
    lobby: {
      lastStateCheckpoint: { games: [], users: [], lastEventIndex: 2 },
      events: [
        { addUserToLobby: { userId: 3, username: 'user 3' } },
        { addUserToLobby: { userId: 4, username: 'user 4' } },
        { removeUserFromLobby: { userId: 3 } },
      ],
    },
  });
  expect(clientAnon1.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManagerAnon1.signals.users()).toEqual([user4]);

  // create last state checkpoint

  server.lobbyRoom.createLastStateCheckpoint();

  // anonymous client 2 connects to lobby

  const clientCommunicationAnon2 = new TestClientCommunication(serverCommunication);
  const clientAnon2 = createClient(clientCommunicationAnon2, 2);
  clientCommunicationAnon2.connect();
  clientCommunicationAnon2.communicatedMessages.length = 0;

  const lobbyManagerAnon2 = clientAnon2.connectToLobby();

  expect(clientCommunicationAnon2.communicatedMessages.length).toBe(2);
  expect(clientCommunicationAnon2.communicatedMessages[1].receivedMessage).toEqual({
    lobby: {
      lastStateCheckpoint: {
        games: [],
        users: [
          { userId: 4, username: 'user 4', isInLobby: true, gameDisplayNumbersWherePresent: [] },
        ],
        lastEventIndex: 5,
      },
      events: [],
    },
  });
  expectedUserIdToUser.delete(3);
  expect(clientAnon2.userIdToUser).toEqual(expectedUserIdToUser);
  expect(lobbyManagerAnon2.signals.users()).toEqual([user4]);
});

describe('create game', () => {
  test('cannot if not logged in', async () => {
    const { client, clientCommunication } = createOneClientConnectedToOneServer();

    const lobbyManager = client.connectToLobby();

    clientCommunication.communicatedMessages.length = 0;

    lobbyManager.createGame(PB_GameMode.TEAMS_3_VS_3);

    expect(clientCommunication.communicatedMessages.length).toBe(1);
  });

  test('cannot if not in lobby', async () => {
    const { client, clientCommunication } = createOneClientConnectedToOneServer();

    const lobbyManager = client.connectToLobby();
    client.connectToGame(0, 0);

    client.loginWithToken('user 3', userIdToTestUserData[3].passwordHash);
    await waitForAsyncServerStuff();

    clientCommunication.communicatedMessages.length = 0;

    lobbyManager.createGame(PB_GameMode.TEAMS_3_VS_3);

    expect(clientCommunication.communicatedMessages.length).toBe(1);
  });

  describe('cannot if passing invalid game mode', () => {
    runTest('that is too small', PB_GameMode.SINGLES_1 - 1);
    runTest('that is too big', PB_GameMode.TEAMS_3_VS_3 + 1);

    function runTest(description: string, gameMode: number) {
      test(description, async () => {
        const { client, clientCommunication } = createOneClientConnectedToOneServer();

        client.loginWithToken('user 3', userIdToTestUserData[3].passwordHash);
        await waitForAsyncServerStuff();
        const lobbyManager = client.connectToLobby();

        clientCommunication.communicatedMessages.length = 0;

        lobbyManager.createGame(gameMode);

        expect(clientCommunication.communicatedMessages.length).toBe(1);
      });
    }
  });

  test('can if passing valid game mode', async () => {
    const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

    client.loginWithToken('user 3', userIdToTestUserData[3].passwordHash);
    await waitForAsyncServerStuff();
    const lobbyManager = client.connectToLobby();
    server.lobbyRoom.sendQueuedEvents();

    clientCommunication.communicatedMessages.length = 0;

    lobbyManager.createGame(PB_GameMode.TEAMS_3_VS_3);

    expect(clientCommunication.communicatedMessages.length).toBe(2);
    expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual({
      lobby: {
        events: [],
        createGameResponse: { gameNumber: 1 },
      },
    });

    clientCommunication.communicatedMessages.length = 0;

    server.lobbyRoom.sendQueuedEvents();

    expect(clientCommunication.communicatedMessages.length).toBe(1);
    expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual({
      lobby: {
        events: [
          { gameCreated: { gameNumber: 1, gameDisplayNumber: 1, gameMode: 9, hostUserId: 3 } },
        ],
      },
    });

    const gameRoom = server.gameRoomsManager.gameNumberToGameRoom.get(1);
    expect(gameRoom).toBeInstanceOf(GameRoom);
    expect(gameRoom!.gameSetup).toBeInstanceOf(GameSetup);
    expect(gameRoom!.game).toBe(undefined);
  });

  test("client's lobby manager correctly processes event", async () => {
    const { client, server } = createOneClientConnectedToOneServer();
    client.loginWithToken('user 3', userIdToTestUserData[3].passwordHash);
    await waitForAsyncServerStuff();
    const lobbyManager = client.connectToLobby();
    lobbyManager.createGame(PB_GameMode.TEAMS_3_VS_3);
    server.lobbyRoom.sendQueuedEvents();

    const lobbyGame = lobbyManager.gameDisplayNumberToLobbyGame.get(1)!;
    expect(lobbyGame.gameNumber).toBe(1);
    expect(lobbyGame.gameDisplayNumber).toBe(1);
    expect(lobbyGame.signals.gameMode()).toBe(PB_GameMode.TEAMS_3_VS_3);
    expect(lobbyGame.signals.users()).toEqual([
      new User(3, 'user 3'),
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(lobbyGame.signals.gameStatus()).toBe(GameStatus.SETTING_UP);
  });

  describe("client's lobby manager correctly processes last state checkpoint", () => {
    runTest(true);
    runTest(false);

    function runTest(hostUserStillConnected: boolean) {
      test(
        hostUserStillConnected ? 'when host still connected' : 'when host disconnected',
        async () => {
          const { client, clientCommunication, server, serverCommunication } =
            createOneClientConnectedToOneServer();
          client.loginWithToken('user 3', userIdToTestUserData[3].passwordHash);
          await waitForAsyncServerStuff();
          const lobbyManager = client.connectToLobby();
          lobbyManager.createGame(PB_GameMode.TEAMS_3_VS_3);
          if (!hostUserStillConnected) {
            clientCommunication.disconnect();
          }
          server.lobbyRoom.createLastStateCheckpoint();

          const clientCommunicationAnon1 = new TestClientCommunication(serverCommunication);
          const clientAnon1 = createClient(clientCommunicationAnon1, 2);
          clientCommunicationAnon1.connect();
          clientCommunicationAnon1.communicatedMessages.length = 0;
          const lobbyManagerAnon1 = clientAnon1.connectToLobby();

          const lobbyGame = lobbyManagerAnon1.gameDisplayNumberToLobbyGame.get(1)!;
          expect(lobbyGame.gameNumber).toBe(1);
          expect(lobbyGame.gameDisplayNumber).toBe(1);
          expect(lobbyGame.signals.gameMode()).toBe(PB_GameMode.TEAMS_3_VS_3);
          expect(lobbyGame.signals.users()).toEqual([
            new User(3, 'user 3'),
            null,
            null,
            null,
            null,
            null,
          ]);
          expect(lobbyGame.signals.gameStatus()).toBe(GameStatus.SETTING_UP);
        },
      );
    }
  });
});

const user3 = new User(3, 'user 3');
const user4 = new User(4, 'user 4');
