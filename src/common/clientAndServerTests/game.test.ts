import { expect, test } from 'vitest';
import { type Client } from '../../client/client.js';
import { type GameManager, GameManagerStatus } from '../../client/gamesManager.js';
import { GameStatus } from '../../client/helpers.js';
import { type LobbyManager } from '../../client/lobbyManager.js';
import { type Server } from '../../server/server.js';
import { defaultGameBoard } from '../defaults.js';
import { PB_GameMode, PB_PlayerArrangementMode } from '../pb.js';
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
  const gameManagers = new Set<GameManager>();

  const clientStuffLobby = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby = clientStuffLobby.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobby);

  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager1 = clientStuff1.client.connectToLobby();
  lobbyManager1.createGame(PB_GameMode.SINGLES_4);
  const gameNumber = lobbyManager1.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManagers.add(gameManager1);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  gameManagers.add(gameManager2);
  gameManager2.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff3 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff3, 3);
  const gameManager3 = clientStuff3.client.connectToGame(clientStuff3.client.logTime, gameNumber);
  gameManagers.add(gameManager3);
  gameManager3.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff4 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff4, 4);
  const gameManager4 = clientStuff4.client.connectToGame(clientStuff4.client.logTime, gameNumber);
  gameManagers.add(gameManager4);
  gameManager4.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager3.gameSetupActions.standUp();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_2_VS_2);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.changePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.swapPositions(0, 3);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.kickUser(2);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff5 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff5, 5);
  const gameManager5 = clientStuff5.client.connectToGame(clientStuff5.client.logTime, gameNumber);
  gameManagers.add(gameManager5);
  gameManager5.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff6 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff6, 6);
  const gameManager6 = clientStuff6.client.connectToGame(clientStuff6.client.logTime, gameNumber);
  gameManagers.add(gameManager6);
  gameManager6.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager4.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager6.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

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
  const gameManagers = new Set<GameManager>();

  const clientStuffLobby = createClientStuffAndConnectToTestServer(serverStuff);
  const lobbyManagerLobby = clientStuffLobby.client.connectToLobby();
  lobbyManagers.add(lobbyManagerLobby);

  const clientStuff1 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff1, 1);
  const lobbyManager = clientStuff1.client.connectToLobby();
  lobbyManager.createGame(PB_GameMode.SINGLES_4);
  const gameNumber = lobbyManager.signals.createdGameNumber() ?? -1;
  const gameManager1 = clientStuff1.client.connectToGame(clientStuff1.client.logTime, gameNumber);
  gameManagers.add(gameManager1);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.users()).toEqual([user1, null, null, null]);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.gameMode()).toBe(PB_GameMode.TEAMS_3_VS_3);
  expect(gameManager1.signals.users()).toEqual([user1, null, null, null, null, null]);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff2 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff2, 2);
  const gameManager2 = clientStuff2.client.connectToGame(clientStuff2.client.logTime, gameNumber);
  gameManagers.add(gameManager2);
  gameManager2.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff3 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff3, 3);
  const gameManager3 = clientStuff3.client.connectToGame(clientStuff3.client.logTime, gameNumber);
  gameManagers.add(gameManager3);
  gameManager3.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff4 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff4, 4);
  const gameManager4 = clientStuff4.client.connectToGame(clientStuff4.client.logTime, gameNumber);
  gameManagers.add(gameManager4);
  gameManager4.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff5 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff5, 5);
  const gameManager5 = clientStuff5.client.connectToGame(clientStuff5.client.logTime, gameNumber);
  gameManagers.add(gameManager5);
  gameManager5.gameSetupActions.sitDown();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  const clientStuff6 = createClientStuffAndConnectToTestServer(serverStuff);
  await loginAsUser(clientStuff6, 6);
  const gameManager6 = clientStuff6.client.connectToGame(clientStuff6.client.logTime, gameNumber);
  gameManagers.add(gameManager6);
  gameManager6.gameSetupActions.sitDown();
  expect(gameManager1.signals.users()).toEqual([user1, user2, user3, user4, user5, user6]);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.swapPositions(0, 5);
  expect(gameManager1.signals.users()).toEqual([user6, user2, user3, user4, user5, user1]);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager6.gameSetupActions.standUp();
  gameManager4.gameSetupActions.standUp();
  expect(gameManager1.signals.users()).toEqual([null, user2, user3, null, user5, user1]);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.changeGameMode(PB_GameMode.SINGLES_4);
  expect(gameManager1.signals.playerArrangementMode()).toEqual(
    PB_PlayerArrangementMode.RANDOM_ORDER,
  );
  expect(gameManager1.signals.users()).toEqual([user5, user2, user3, user1]);
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager5.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager2.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager3.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);

  gameManager1.gameSetupActions.approve();
  expectEqualGameStuff(lobbyManagers, gameManagers, serverStuff.server);
});

function expectEqualGameStuff(
  lobbyManagers: Set<LobbyManager>,
  gameManagers: Set<GameManager>,
  server: Server,
) {
  server.lobbyRoom.sendQueuedEvents();

  const gameRoom = server.gameRoomsManager.gameNumberToGameRoom.get(1)!;

  for (const lobbyManager of lobbyManagers) {
    const lobbyManagerGame = lobbyManager.signals.lobbyGames()[0];
    const lobbyManagerGameSignals = lobbyManagerGame.signals;

    if (gameRoom.gameSetup) {
      expect(lobbyManagerGame.hostUser).toEqual(gameRoom.gameSetup.hostUser);
      expect(lobbyManagerGameSignals.gameBoard()).toEqual(defaultGameBoard);
      expect(lobbyManagerGameSignals.users()).toEqual(gameRoom.gameSetup.users);
      expect(lobbyManagerGameSignals.gameMode()).toEqual(gameRoom.gameSetup.gameMode);
      expect(lobbyManagerGameSignals.gameStatus()).toEqual(GameStatus.SETTING_UP);
    } else if (gameRoom.game) {
      expect(lobbyManagerGame.hostUser).toEqual(gameRoom.game.hostUser);
      expect(lobbyManagerGameSignals.gameBoard()).toEqual(gameRoom.game.gameBoard);
      expect(lobbyManagerGameSignals.users()).toEqual(gameRoom.game.users);
      expect(lobbyManagerGameSignals.gameMode()).toEqual(gameRoom.game.gameMode);
      expect(lobbyManagerGameSignals.gameStatus()).toEqual(GameStatus.IN_PROGRESS);
    } else {
      throw new Error('gameRoom does not have gameSetup or game');
    }
  }

  for (const gameManager of gameManagers) {
    const gameManagerSignals = gameManager.signals;

    if (gameRoom.gameSetup) {
      expect(gameManagerSignals.gameMode()).toEqual(gameRoom.gameSetup.gameMode);
      expect(gameManagerSignals.playerArrangementMode()).toEqual(
        gameRoom.gameSetup.playerArrangementMode,
      );
      expect(gameManagerSignals.users()).toEqual(gameRoom.gameSetup.users);
      expect(gameManagerSignals.approvals()).toEqual(gameRoom.gameSetup.approvals);
      expect(gameManagerSignals.hostUser()).toEqual(gameRoom.gameSetup.hostUser);
    } else if (gameRoom.game) {
      expect(gameManagerSignals.gameMode()).toEqual(gameRoom.game.gameMode);
      expect(gameManagerSignals.playerArrangementMode()).toEqual(
        gameRoom.game.playerArrangementMode,
      );
      expect(gameManagerSignals.users()).toEqual(gameRoom.game.users);
      expect(gameManagerSignals.usersWithoutNulls()).toEqual(gameRoom.game.users);
      expect(gameManagerSignals.hostUser()).toEqual(gameRoom.game.hostUser);
    } else {
      throw new Error('gameRoom does not have gameSetup or game');
    }
  }
}
