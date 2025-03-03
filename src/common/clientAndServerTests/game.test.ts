import seedrandom from 'seedrandom';
import { type Accessor } from 'solid-js';
import { expect, test } from 'vitest';
import { type Client } from '../../client/client.js';
import { type GameManager, GameManagerStatus } from '../../client/gamesManager.js';
import { GameStatus } from '../../client/helpers.js';
import { type LobbyManager } from '../../client/lobbyManager.js';
import { getExampleGame1 } from '../../client/pages/examples/games.js';
import { type Server } from '../../server/server.js';
import { defaultGameBoard } from '../defaults.js';
import { ActionGameOver } from '../gameActions/gameOver.js';
import { type GameState } from '../gameState.js';
import { PB_GameMode, PB_MessageToServer, PB_PlayerArrangementMode } from '../pb.js';
import { type User } from '../user.js';
import {
  createClientStuffAndConnectToTestServer,
  createServerStuff,
  dummyUser,
  loginAsUser,
  user1,
  user2,
  user3,
  user4,
  user5,
  user6,
  waitForAsyncServerStuff,
} from './common.js';

test('newly created game has correct signals', async () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  await loginAsUser(clientStuff, 1);

  const lobbyManager = clientStuff.client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_2);

  const gameManager = clientStuff.client.connectToGame(
    clientStuff.client.logTime,
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
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  const gameManager = clientStuff.client.connectToGame(clientStuff.client.logTime, 0);

  expect(gameManager.signals.status()).toBe(GameManagerStatus.NotFound);
  expect(gameManager.signals.gameMode()).toBe(PB_GameMode.SINGLES_1);
  expect(gameManager.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.VERSION_1);
  expect(gameManager.signals.users()).toEqual([]);
  expect(gameManager.signals.approvals()).toEqual([]);
  expect(gameManager.signals.hostUser()).toEqual(dummyUser);
});

test('client is disconnected from room upon trying to enter a game that is not found', async () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  clientStuff.client.connectToLobby();
  expect(serverStuff.server.clientIdToClient.get(1)!.room !== undefined);

  clientStuff.client.connectToGame(clientStuff.client.logTime, 0);
  expect(serverStuff.server.clientIdToClient.get(1)!.room === undefined);
});

test('client knows what user IDs and usernames are and were in the game room', async () => {
  const serverStuff = createServerStuff();

  const clientsInGame = new Set<Client>();
  const gameManagersInGame = new Set<GameManager>();

  // clientLobby connects to lobby
  const clientStuffLobby = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby = clientStuffLobby.client.connectToLobby();

  // client1 logs in as "user 1", creates game, connects to game
  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager1 = clientStuff1.client.connectToLobby();
  lobbyManager1.createGame(PB_GameMode.SINGLES_2);
  const gameNumber = lobbyManager1.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  clientsInGame.add(clientStuff1.client);
  gameManagersInGame.add(gameManager1);
  expectUsers(new Map([[1, user1]]), new Set([user1]));

  // client2 connects to game
  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  clientsInGame.add(clientStuff2.client);
  gameManagersInGame.add(gameManager2);
  expectUsers(new Map([[1, user1]]), new Set([user1]));

  // client3 logs in as "user 3", connects to game
  const clientStuff3 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff3, 3);
  const gameManager3 = clientStuff3.client.connectToGame(clientStuff3.client.logTime, gameNumber);
  clientsInGame.add(clientStuff3.client);
  gameManagersInGame.add(gameManager3);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
    ]),
    new Set([user1, user3]),
  );

  // client2 logs in as "user 2"
  await loginAsUser(clientStuff2, 2);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user3, user2]),
  );

  // client3 logs out
  clientStuff3.client.logout();
  await waitForAsyncServerStuff();
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user2]),
  );

  // client3 logs in as "user 2"
  await loginAsUser(clientStuff3, 2);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user2]),
  );

  // client2 logs out
  clientStuff2.client.logout();
  await waitForAsyncServerStuff();
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1, user2]),
  );

  // client3 disconnects
  clientStuff3.clientCommunication.disconnect();
  clientsInGame.delete(clientStuff3.client);
  gameManagersInGame.delete(gameManager3);
  expectUsers(
    new Map([
      [1, user1],
      [3, user3],
      [2, user2],
    ]),
    new Set([user1]),
  );

  // client1 disconnects
  clientStuff1.clientCommunication.disconnect();
  clientsInGame.delete(clientStuff1.client);
  gameManagersInGame.delete(gameManager1);
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

    serverStuff.server.lobbyRoom.createLastStateCheckpoint();
    expect(lobbyManagerLobby.signals.lobbyGames()[0].signals.usersInRoom()).toEqual(
      expectedUsersInRoom,
    );
  }
});

test('game setup example 1', async () => {
  const serverStuff = createServerStuff();

  const lobbyManagers = new Set<LobbyManager>();
  const gameManagersAndUserAccessors = new Set<GameManagerAndUserAccessor>();

  const clientStuffLobby1 = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby1 = clientStuffLobby1.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobby1);

  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager1 = clientStuff1.client.connectToLobby();
  lobbyManager1.createGame(PB_GameMode.SINGLES_4);
  const gameNumber = lobbyManager1.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager1, clientStuff1.client.signals.user),
  );
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager2, clientStuff2.client.signals.user),
  );
  gameManager2.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff3 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff3, 3);
  const gameManager3 = clientStuff3.client.connectToGame(clientStuff3.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager3, clientStuff3.client.signals.user),
  );
  gameManager3.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff4 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff4, 4);
  const gameManager4 = clientStuff4.client.connectToGame(clientStuff4.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager4, clientStuff4.client.signals.user),
  );
  gameManager4.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager3.gameSetupActions.standUp();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_2_VS_2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.changePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.swapPositions(0, 3);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.kickUser(2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff5 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff5, 5);
  const gameManager5 = clientStuff5.client.connectToGame(clientStuff5.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager5, clientStuff5.client.signals.user),
  );
  gameManager5.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff6 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff6, 6);
  const gameManager6 = clientStuff6.client.connectToGame(clientStuff6.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager6, clientStuff6.client.signals.user),
  );
  gameManager6.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager4.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager6.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  serverStuff.server.lobbyRoom.createLastStateCheckpoint();

  const clientStuffLobby2 = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby2 = clientStuffLobby2.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobby2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuffAnon = createClientStuffAndConnectToTestServer(serverStuff);
  const gameManagerAnon = clientStuffAnon.client.connectToGame(
    clientStuffAnon.client.logTime,
    gameNumber,
  );
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManagerAnon, clientStuffAnon.client.signals.user),
  );
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.TEAMS_2_VS_2);
  expect(gameManager1.signals.playerArrangementMode()).toBe(PB_PlayerArrangementMode.EXACT_ORDER);
  expect(gameManager1.signals.hostUser()).toEqual(user1);
  expect(gameManager1.signals.users()).toEqual([user4, user5, user6, user1]);
  expect(gameManager1.signals.usersWithoutNulls()).toEqual([user4, user5, user6, user1]);
  expect(gameManager1.signals.approvals()).toEqual([true, true, true, true]);
  expect(gameManager1.signals.hostUser()).toEqual(user1);
});

test('game setup example 2', async () => {
  const serverStuff = createServerStuff();

  const lobbyManagers = new Set<LobbyManager>();
  const gameManagersAndUserAccessors = new Set<GameManagerAndUserAccessor>();

  const clientStuffLobby1 = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby1 = clientStuffLobby1.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobby1);

  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager = clientStuff1.client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_4);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager1, clientStuff1.client.signals.user),
  );
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.users()).toEqual([user1, null, null, null]);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.users()).toEqual([user1, null, null, null, null, null]);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager2, clientStuff2.client.signals.user),
  );
  gameManager2.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff3 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff3, 3);
  const gameManager3 = clientStuff3.client.connectToGame(clientStuff3.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager3, clientStuff3.client.signals.user),
  );
  gameManager3.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff4 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff4, 4);
  const gameManager4 = clientStuff4.client.connectToGame(clientStuff4.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager4, clientStuff4.client.signals.user),
  );
  gameManager4.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff5 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff5, 5);
  const gameManager5 = clientStuff5.client.connectToGame(clientStuff5.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager5, clientStuff5.client.signals.user),
  );
  gameManager5.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff6 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff6, 6);
  const gameManager6 = clientStuff6.client.connectToGame(clientStuff6.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager6, clientStuff6.client.signals.user),
  );
  gameManager6.gameSetupActions.sitDown();
  expect(gameManager1.signals.users()).toEqual([user1, user2, user3, user4, user5, user6]);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.swapPositions(0, 5);
  expect(gameManager1.signals.users()).toEqual([user6, user2, user3, user4, user5, user1]);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager6.gameSetupActions.standUp();
  gameManager4.gameSetupActions.standUp();
  expect(gameManager1.signals.users()).toEqual([null, user2, user3, null, user5, user1]);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.playerArrangementMode()).toEqual(
    PB_PlayerArrangementMode.RANDOM_ORDER,
  );
  expect(gameManager1.signals.users()).toEqual([user5, user2, user3, user1]);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager2.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager3.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager1.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  serverStuff.server.lobbyRoom.createLastStateCheckpoint();

  const clientStuffLobby2 = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby2 = clientStuffLobby2.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobby2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuffAnon = createClientStuffAndConnectToTestServer(serverStuff);
  const gameManagerAnon = clientStuffAnon.client.connectToGame(
    clientStuffAnon.client.logTime,
    gameNumber,
  );
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManagerAnon, clientStuffAnon.client.signals.user),
  );
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);
});

test('users in room is correct in lobby and in game room', async () => {
  const serverStuff = createServerStuff();

  const lobbyManagers = new Set<LobbyManager>();
  const gameManagersAndUserAccessors = new Set<GameManagerAndUserAccessor>();

  // anonymous client enters lobby
  const clientStuffLobbyAnon1 = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobbyAnon1 = clientStuffLobbyAnon1.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobbyAnon1);

  // user 1 creates game, enters game room, and starts game
  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager1a = clientStuff1.client.connectToLobby();
  lobbyManager1a.createGame(PB_GameMode.SINGLES_1);
  const gameNumber = lobbyManager1a.signals.createdGameNumber() ?? -1;
  const gameManager1a = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManager1a.gameSetupActions.approve();
  const gameManagerAndUserAccessor1a = new GameManagerAndUserAccessor(
    gameManager1a,
    clientStuff1.client.signals.user,
  );
  gameManagersAndUserAccessors.add(gameManagerAndUserAccessor1a);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user 2 enters game room
  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  const gameManagerAndUserAccessor2 = new GameManagerAndUserAccessor(
    gameManager2,
    clientStuff2.client.signals.user,
  );
  gameManagersAndUserAccessors.add(gameManagerAndUserAccessor2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user 1 leaves game room and enters lobby
  const lobbyManager1b = clientStuff1.client.connectToLobby();
  lobbyManagers.add(lobbyManager1b);
  gameManagersAndUserAccessors.delete(gameManagerAndUserAccessor1a);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user 2 leaves game room and enters lobby
  const lobbyManager2 = clientStuff2.client.connectToLobby();
  lobbyManagers.add(lobbyManager2);
  gameManagersAndUserAccessors.delete(gameManagerAndUserAccessor2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user 1 enters game room
  const gameManager1b = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  lobbyManagers.delete(lobbyManager1b);
  const gameManagerAndUserAccessor1b = new GameManagerAndUserAccessor(
    gameManager1b,
    clientStuff1.client.signals.user,
  );
  gameManagersAndUserAccessors.add(gameManagerAndUserAccessor1b);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);
});

test('game action permissions', async () => {
  Math.random = seedrandom('random');

  const serverStuff = createServerStuff();

  const lobbyManagers = new Set<LobbyManager>();
  const gameManagersAndUserAccessors = new Set<GameManagerAndUserAccessor>();

  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager = clientStuff1.client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_2);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager1, clientStuff1.client.signals.user),
  );
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager2, clientStuff2.client.signals.user),
  );
  gameManager2.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuffAnon1 = createClientStuffAndConnectToTestServer(serverStuff);
  const gameManagerAnon1 = clientStuffAnon1.client.connectToGame(
    clientStuffAnon1.client.logTime,
    gameNumber,
  );
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManagerAnon1, clientStuffAnon1.client.signals.user),
  );

  gameManager1.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  gameManager2.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // anonymous client tries to do a move
  clientStuff1.clientCommunication.communicatedMessages.length = 0;
  clientStuff2.clientCommunication.communicatedMessages.length = 0;
  clientStuffAnon1.clientCommunication.communicatedMessages.length = 0;
  gameManagerAnon1.gameActions.playTile(1);
  expect(clientStuff1.clientCommunication.communicatedMessages.length).toBe(0);
  expect(clientStuff2.clientCommunication.communicatedMessages.length).toBe(0);
  expect(clientStuffAnon1.clientCommunication.communicatedMessages.length).toBe(1);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user in game tries to do a game action with a missing gameAction message
  clientStuff1.clientCommunication.communicatedMessages.length = 0;
  clientStuff2.clientCommunication.communicatedMessages.length = 0;
  clientStuffAnon1.clientCommunication.communicatedMessages.length = 0;
  clientStuff1.clientCommunication.sendMessage(
    PB_MessageToServer.toBinary({
      game: {
        gameAction: {
          numberOfGameStates: 1,
        },
      },
    }),
  );
  expect(clientStuff1.clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientStuff2.clientCommunication.communicatedMessages.length).toBe(0);
  expect(clientStuffAnon1.clientCommunication.communicatedMessages.length).toBe(0);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user tries to do a correct game action when it is not their turn
  clientStuff1.clientCommunication.communicatedMessages.length = 0;
  clientStuff2.clientCommunication.communicatedMessages.length = 0;
  clientStuffAnon1.clientCommunication.communicatedMessages.length = 0;
  gameManager1.gameActions.playTile(44);
  expect(clientStuff1.clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientStuff2.clientCommunication.communicatedMessages.length).toBe(0);
  expect(clientStuffAnon1.clientCommunication.communicatedMessages.length).toBe(0);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user tries to do a correct game action when it is their turn but number of game states is wrong
  clientStuff1.clientCommunication.communicatedMessages.length = 0;
  clientStuff2.clientCommunication.communicatedMessages.length = 0;
  clientStuffAnon1.clientCommunication.communicatedMessages.length = 0;
  clientStuff2.clientCommunication.sendMessage(
    PB_MessageToServer.toBinary({
      game: {
        gameAction: {
          numberOfGameStates: 2,
          gameAction: {
            playTile: {
              tile: 44,
            },
          },
        },
      },
    }),
  );
  expect(clientStuff1.clientCommunication.communicatedMessages.length).toBe(0);
  expect(clientStuff2.clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientStuffAnon1.clientCommunication.communicatedMessages.length).toBe(0);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // user correctly does a game action when it is their turn
  clientStuff1.clientCommunication.communicatedMessages.length = 0;
  clientStuff2.clientCommunication.communicatedMessages.length = 0;
  clientStuffAnon1.clientCommunication.communicatedMessages.length = 0;
  gameManager2.gameActions.playTile(44);
  expect(clientStuff1.clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientStuff2.clientCommunication.communicatedMessages.length).toBe(2);
  expect(clientStuffAnon1.clientCommunication.communicatedMessages.length).toBe(1);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);
});

test('lobby is told when a game completes', async () => {
  const { serverStuff, lobbyManagers, gameManagersAndUserAccessors, gameToReplay } =
    await prepareToReplayExampleGame();

  for (let i = 1; i < gameToReplay.gameStateHistory.length; i++) {
    replayGameState(gameToReplay.gameStateHistory[i], gameManagersAndUserAccessors);
  }
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);
});

test('game manager signals are correct when a user in a game logs in or out', async () => {
  const {
    serverStuff,
    lobbyManagers,
    clientStuff1,
    clientStuff2,
    gameManagersAndUserAccessors,
    gameNumber,
    gameToReplay,
  } = await prepareToReplayExampleGame();

  replayGameState(gameToReplay.gameStateHistory[1], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // connect to server and game
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);
  const gameManager = clientStuff.client.connectToGame(clientStuff.client.logTime, gameNumber);
  const gameManagerAndUserAccessor = new GameManagerAndUserAccessor(
    gameManager,
    clientStuff.client.signals.user,
  );
  gameManagersAndUserAccessors.add(gameManagerAndUserAccessor);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[2], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // login as user 3
  await loginAsUser(clientStuff, 3);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[3], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // logout
  clientStuff.client.logout();
  await waitForAsyncServerStuff();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[4], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // login as user 2
  await loginAsUser(clientStuff, 2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[5], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // logout
  clientStuff.client.logout();
  await waitForAsyncServerStuff();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[6], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // login as user 1
  await loginAsUser(clientStuff, 1);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[7], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // disconnect from server
  clientStuff.clientCommunication.disconnect();
  await waitForAsyncServerStuff();
  gameManagersAndUserAccessors.delete(gameManagerAndUserAccessor);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[8], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // reconnect to server
  clientStuff.clientCommunication.connect();
  await waitForAsyncServerStuff();
  gameManagersAndUserAccessors.add(gameManagerAndUserAccessor);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // client2 logs out
  clientStuff2.client.logout();
  await waitForAsyncServerStuff();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[9], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // client1 logs out
  clientStuff1.client.logout();
  await waitForAsyncServerStuff();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // client logs out
  clientStuff.client.logout();
  await waitForAsyncServerStuff();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // client1 logs in as a different player
  await loginAsUser(clientStuff1, 2);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[10], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  // client2 logs in as a different player
  await loginAsUser(clientStuff2, 1);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  replayGameState(gameToReplay.gameStateHistory[11], gameManagersAndUserAccessors);
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);
});

async function prepareToReplayExampleGame() {
  const serverStuff = createServerStuff();

  const lobbyManagers = new Set<LobbyManager>();
  const gameManagersAndUserAccessors = new Set<GameManagerAndUserAccessor>();

  const clientStuffLobbyAnon1 = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobbyAnon1 = clientStuffLobbyAnon1.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobbyAnon1);

  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager = clientStuff1.client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_2);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager1, clientStuff1.client.signals.user),
  );
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  gameManagersAndUserAccessors.add(
    new GameManagerAndUserAccessor(gameManager2, clientStuff2.client.signals.user),
  );
  gameManager2.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  const gameToReplay = getExampleGame1();

  const gameRoom = serverStuff.server.gameRoomsManager.gameNumberToGameRoom.get(gameNumber)!;
  gameRoom.getNewTileBag = () => gameToReplay.tileBag;

  gameManager1.gameSetupActions.approve();
  gameManager2.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagersAndUserAccessors, serverStuff.server);

  return {
    serverStuff,
    lobbyManagers,
    clientStuff1,
    clientStuff2,
    gameManagersAndUserAccessors,
    gameNumber,
    gameToReplay,
  };
}

function replayGameState(
  gameState: GameState,
  gameManagersAndUserAccessors: Set<GameManagerAndUserAccessor>,
) {
  for (const gameManagerAndUserAccessor of gameManagersAndUserAccessors) {
    const gameManager = gameManagerAndUserAccessor.gameManager;

    if (gameManager.signals.myPlayerId() === gameState.playerId) {
      const action = Object.keys(gameState.gameAction)[0];
      // @ts-expect-error action is a key of gameState.gameAction
      const parameters = Object.values(gameState.gameAction[action]);

      // @ts-expect-error action and parameters are correct
      gameManager.gameActions[action](...parameters);

      return;
    }
  }

  throw new Error('player not in room');
}

class GameManagerAndUserAccessor {
  constructor(
    public gameManager: GameManager,
    public userAccessor: Accessor<User | null>,
  ) {}
}

function expectEqualGameStuff(
  lobbyManagers: Set<LobbyManager>,
  gameManagersAndUserAccessors: Set<GameManagerAndUserAccessor>,
  server: Server,
) {
  server.lobbyRoom.sendQueuedEvents();

  const gameRoom = server.gameRoomsManager.gameNumberToGameRoom.get(1)!;
  const usersInGameRoom = new Set(gameRoom.userToClients.keys());

  for (const lobbyManager of lobbyManagers) {
    const lobbyManagerGame = lobbyManager.signals.lobbyGames()[0];
    const lobbyManagerGameSignals = lobbyManagerGame.signals;

    expect(lobbyManagerGameSignals.usersInRoom()).toEqual(usersInGameRoom);

    if (gameRoom.gameSetup) {
      const gameSetup = gameRoom.gameSetup;

      expect(lobbyManagerGame.hostUser).toEqual(gameSetup.hostUser);
      expect(lobbyManagerGameSignals.gameBoard()).toEqual(defaultGameBoard);
      expect(lobbyManagerGameSignals.users()).toEqual(gameSetup.users);
      expect(lobbyManagerGameSignals.gameMode()).toEqual(gameSetup.gameMode);
      expect(lobbyManagerGameSignals.gameStatus()).toEqual(GameStatus.SETTING_UP);
    } else if (gameRoom.game) {
      const game = gameRoom.game;

      expect(lobbyManagerGame.hostUser).toEqual(game.hostUser);
      expect(lobbyManagerGameSignals.gameBoard()).toEqual(game.gameBoard);
      expect(lobbyManagerGameSignals.users()).toEqual(game.users);
      expect(lobbyManagerGameSignals.gameMode()).toEqual(game.gameMode);
      expect(lobbyManagerGameSignals.gameStatus()).toEqual(
        game.gameActionStack.length === 1 && game.gameActionStack[0] instanceof ActionGameOver
          ? GameStatus.COMPLETED
          : GameStatus.IN_PROGRESS,
      );
    } else {
      throw new Error('gameRoom does not have gameSetup or game');
    }
  }

  for (const gameManagerAndUserAccessor of gameManagersAndUserAccessors) {
    const gameManagerSignals = gameManagerAndUserAccessor.gameManager.signals;

    expect(gameManagerSignals.usersInRoom()).toEqual(usersInGameRoom);

    if (gameRoom.gameSetup) {
      const gameSetup = gameRoom.gameSetup;

      expect(gameManagerSignals.gameMode()).toEqual(gameSetup.gameMode);
      expect(gameManagerSignals.playerArrangementMode()).toEqual(gameSetup.playerArrangementMode);
      expect(gameManagerSignals.users()).toEqual(gameSetup.users);
      expect(gameManagerSignals.approvals()).toEqual(gameSetup.approvals);
      expect(gameManagerSignals.hostUser()).toEqual(gameSetup.hostUser);
    } else if (gameRoom.game) {
      const game = gameRoom.game;

      expect(gameManagerSignals.gameMode()).toEqual(game.gameMode);
      expect(gameManagerSignals.playerArrangementMode()).toEqual(game.playerArrangementMode);
      expect(gameManagerSignals.users()).toEqual(game.users);
      expect(gameManagerSignals.usersWithoutNulls()).toEqual(game.users);
      expect(gameManagerSignals.hostUser()).toEqual(game.hostUser);

      const user = gameManagerAndUserAccessor.userAccessor();
      let playerId = -1;
      if (user) {
        for (let pid = 0; pid < game.users.length; pid++) {
          const u = game.users[pid];
          if (u.id === user.id) {
            playerId = pid;
            break;
          }
        }
      }

      expect(
        gameManagerSignals.gameStateHistory().map((gameState) => {
          if (gameState.playerGameStates.length === 0) {
            gameState.createPlayerAndWatcherGameStates();
          }
          return playerId >= 0 ? gameState.playerGameStates[playerId] : gameState.watcherGameState;
        }),
      ).toEqual(
        game.gameStateHistory.map((gs) =>
          playerId >= 0 ? gs.playerGameStates[playerId] : gs.watcherGameState,
        ),
      );
    } else {
      throw new Error('gameRoom does not have gameSetup or game');
    }
  }
}
