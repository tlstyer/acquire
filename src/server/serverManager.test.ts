import * as WebSocket from 'ws';
import { GameSetupChangeEnum, MessageToClientEnum, MessageToServerEnum } from '../common/enums';
import { ErrorCode, GameAction, GameMode, PlayerArrangementMode } from '../common/pb';
import { ConnectionState, GameData, ServerManager, User } from './serverManager';
import { TestUserDataProvider } from './userDataProvider';

class TestServer {
  connectionListener: ((conn: TestWebSocket) => any) | null = null;

  on(event: string, listener: (conn: TestWebSocket) => any) {
    if (event === 'connection') {
      this.connectionListener = listener;
    }
  }

  openConnection(conn: TestWebSocket) {
    if (this.connectionListener) {
      this.connectionListener(conn);
    }
  }
}

class TestWebSocket {
  dataListener: ((message: string) => any) | null = null;
  closeListener: (() => void) | null = null;

  readyState = WebSocket.OPEN;

  receivedMessages: any[] = [];

  constructor(public id: string) {}

  on(event: string, listener: any) {
    if (event === 'message') {
      this.dataListener = listener;
    } else if (event === 'close') {
      this.closeListener = listener;
    }
  }

  send(message: string) {
    this.receivedMessages.push(JSON.parse(message));
  }

  sendMessage(message: any) {
    if (this.dataListener) {
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      }
      this.dataListener(message);
    }
  }

  close() {
    this.readyState = WebSocket.CLOSED;
    if (this.closeListener) {
      this.closeListener();
    }
  }

  clearReceivedMessages() {
    this.receivedMessages = [];
  }
}

function getServerManagerAndStuff() {
  const server = new TestServer();
  const userDataProvider = new TestUserDataProvider();
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const serverManager = new ServerManager(server, userDataProvider, 10, (message: string) => {
    // do nothing
  });
  serverManager.manage();

  return { serverManager, server, userDataProvider };
}

async function getServerManagerAndStuffAfterAllApprovedOfGameSetup() {
  const { serverManager, server } = getServerManagerAndStuff();
  Date.now = () => 1234567890;
  Math.random = () => 0.1;

  const hostConnection = await connectToServer(server, 'host');
  const opponentConnection = await connectToServer(server, 'opponent');
  const anotherConnection = await connectToServer(server, 'another');
  hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
  opponentConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
  opponentConnection.sendMessage([MessageToServerEnum.JoinGame]);

  hostConnection.sendMessage([MessageToServerEnum.ApproveOfGameSetup]);

  hostConnection.clearReceivedMessages();
  opponentConnection.clearReceivedMessages();
  anotherConnection.clearReceivedMessages();
  opponentConnection.sendMessage([MessageToServerEnum.ApproveOfGameSetup]);

  return {
    serverManager,
    hostConnection,
    opponentConnection,
    anotherConnection,
  };
}

async function getServerManagerAndStuffAfterGameStarted() {
  const { serverManager, hostConnection, opponentConnection, anotherConnection } = await getServerManagerAndStuffAfterAllApprovedOfGameSetup();

  hostConnection.clearReceivedMessages();
  opponentConnection.clearReceivedMessages();
  anotherConnection.clearReceivedMessages();

  return {
    serverManager,
    hostConnection,
    opponentConnection,
    anotherConnection,
  };
}

class ClientData {
  constructor(public clientID: number, public webSocket: TestWebSocket, public gameID?: number) {}
}

class UserData {
  constructor(public userID: number, public username: string, public clientDatas: ClientData[]) {}
}

class GameDataData {
  constructor(public gameID: number, public gameDisplayNumber: number, public userIDs: number[]) {}
}

// UCR = Un-Circular-Reference-ified

class UCRClient {
  constructor(public clientID: number, public webSocket: WebSocket, public gameID: number | null, public userID: number) {}
}

class UCRUser {
  constructor(public userID: number, public username: string, public clientIDs: Set<number>, public numGames: number) {}
}

class UCRGameData {
  clientIDs = new Set<number>();

  constructor(public gameID: number, public gameDisplayNumber: number, public userIDs: Set<number>) {}
}

type WebSocketIDToUCRClient = Map<number, UCRClient>;
type UserIDToUCRUser = Map<number, UCRUser>;
type GameIDTOUCRGameData = Map<number, UCRGameData>;

function expectClientAndUserAndGameData(serverManager: ServerManager, userDatas: UserData[], gameDataDatas: GameDataData[]) {
  const webSocketIDToUCRClient: WebSocketIDToUCRClient = new Map();
  const userIDToUCRUser: UserIDToUCRUser = new Map();
  const gameIDTOUCRGameData: GameIDTOUCRGameData = new Map();
  const gameDisplayNumberTOUCRGameData: GameIDTOUCRGameData = new Map();

  gameDataDatas.forEach((gameDataData) => {
    const ucrGameData = new UCRGameData(gameDataData.gameID, gameDataData.gameDisplayNumber, new Set(gameDataData.userIDs));

    gameIDTOUCRGameData.set(gameDataData.gameID, ucrGameData);
    gameDisplayNumberTOUCRGameData.set(gameDataData.gameDisplayNumber, ucrGameData);
  });

  userDatas.forEach((userData) => {
    const clientIDs = new Set<number>();

    userData.clientDatas.forEach((clientData) => {
      // @ts-ignore
      const webSocket: WebSocket = clientData.webSocket;
      const gameID = clientData.gameID !== undefined ? clientData.gameID : null;

      webSocketIDToUCRClient.set(serverManager.webSocketToID.get(webSocket)!, new UCRClient(clientData.clientID, webSocket, gameID, userData.userID));
      if (clientData.gameID !== undefined) {
        gameIDTOUCRGameData.get(clientData.gameID)!.clientIDs.add(clientData.clientID);
      }

      clientIDs.add(clientData.clientID);
    });

    userIDToUCRUser.set(userData.userID, new UCRUser(userData.userID, userData.username, clientIDs, 0));
  });

  gameDataDatas.forEach((gameDataData) => {
    gameDataData.userIDs.forEach((userID) => {
      const ucrUser = userIDToUCRUser.get(userID);

      if (ucrUser !== undefined) {
        ucrUser.numGames++;
      } else {
        fail('user in a game but not in users map');
      }
    });
  });

  expect(uncircularreferenceifyWebSocketIDToUCRClient(serverManager)).toEqual(webSocketIDToUCRClient);
  expect(uncircularreferenceifyUserIDToUser(serverManager.userIDToUser)).toEqual(userIDToUCRUser);
  expect(uncircularreferenceifyGameIDToGameData(serverManager.gameIDToGameData)).toEqual(gameIDTOUCRGameData);
  expect(uncircularreferenceifyGameIDToGameData(serverManager.gameDisplayNumberToGameData)).toEqual(gameDisplayNumberTOUCRGameData);
}

function uncircularreferenceifyWebSocketIDToUCRClient(serverManager: ServerManager) {
  const connectionIDToUCRClient: WebSocketIDToUCRClient = new Map();

  serverManager.webSocketToClient.forEach((client) => {
    const gameID = client.gameData !== null ? client.gameData.id : null;

    connectionIDToUCRClient.set(serverManager.webSocketToID.get(client.webSocket)!, new UCRClient(client.id, client.webSocket, gameID, client.user.id));
  });

  return connectionIDToUCRClient;
}

function uncircularreferenceifyUserIDToUser(userIDToUser: Map<number, User>) {
  const userIDToUCRUser: UserIDToUCRUser = new Map();

  userIDToUser.forEach((user, userID) => {
    const clientIDs = new Set<number>();

    user.clients.forEach((client) => {
      clientIDs.add(client.id);
    });

    userIDToUCRUser.set(userID, new UCRUser(user.id, user.name, clientIDs, user.numGames));
  });

  return userIDToUCRUser;
}

function uncircularreferenceifyGameIDToGameData(gameIDToGameData: Map<number, GameData>) {
  const gameIDTOUCRGameData: GameIDTOUCRGameData = new Map();

  gameIDToGameData.forEach((gameData, gameID) => {
    let userIDs: Set<number>;
    if (gameData.gameSetup !== null) {
      userIDs = gameData.gameSetup.userIDsSet;
    } else {
      userIDs = new Set(gameData.game!.userIDs);
    }

    const ucrGameData = new UCRGameData(gameData.id, gameData.displayNumber, userIDs);

    gameData.clients.forEach((client) => {
      ucrGameData.clientIDs.add(client.id);
    });

    gameIDTOUCRGameData.set(gameID, ucrGameData);
  });

  return gameIDTOUCRGameData;
}

async function connectToServer(server: TestServer, username: string) {
  const webSocket = new TestWebSocket(username);
  server.openConnection(webSocket);
  webSocket.sendMessage([0, username, '', []]);
  await new Promise((resolve) => setTimeout(resolve, 0));

  return webSocket;
}

function expectClientKickedDueToInvalidMessage(webSocket: TestWebSocket) {
  expect(webSocket.receivedMessages.length).toBe(1);
  expect(webSocket.receivedMessages[0]).toEqual([[MessageToClientEnum.FatalError, ErrorCode.INVALID_MESSAGE]]);
  expect(webSocket.readyState).toBe(WebSocket.CLOSED);
}

async function expectKicksClientDueToInvalidMessage(message: any[]) {
  const { server } = getServerManagerAndStuff();

  const connection = await connectToServer(server, 'user 1');
  connection.clearReceivedMessages();

  connection.sendMessage(message);

  expectClientKickedDueToInvalidMessage(connection);
}

describe('when not sending first message', () => {
  test('can open connections and then close them', () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const webSocket1 = new TestWebSocket('connection ID 1');
    server.openConnection(webSocket1);

    expect(serverManager.webSocketToConnectionState).toEqual(new Map([[webSocket1, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket1]));

    const webSocket2 = new TestWebSocket('connection ID 2');
    server.openConnection(webSocket2);

    expect(serverManager.webSocketToConnectionState).toEqual(
      new Map([
        [webSocket1, ConnectionState.WaitingForFirstMessage],
        [webSocket2, ConnectionState.WaitingForFirstMessage],
      ]),
    );
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket1, webSocket2]));

    webSocket1.close();

    expect(serverManager.webSocketToConnectionState).toEqual(new Map([[webSocket2, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket2]));

    webSocket2.close();

    expect(serverManager.webSocketToConnectionState).toEqual(new Map());
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set());
  });

  test('closing already closed connection does nothing', () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const webSocket1 = new TestWebSocket('connection ID 1');
    server.openConnection(webSocket1);

    expect(serverManager.webSocketToConnectionState).toEqual(new Map([[webSocket1, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket1]));

    const webSocket2 = new TestWebSocket('connection ID 2');
    server.openConnection(webSocket2);

    expect(serverManager.webSocketToConnectionState).toEqual(
      new Map([
        [webSocket1, ConnectionState.WaitingForFirstMessage],
        [webSocket2, ConnectionState.WaitingForFirstMessage],
      ]),
    );
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket1, webSocket2]));

    webSocket1.close();

    expect(serverManager.webSocketToConnectionState).toEqual(new Map([[webSocket2, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket2]));

    webSocket1.close();

    expect(serverManager.webSocketToConnectionState).toEqual(new Map([[webSocket2, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.preLoggedInWebSockets).toEqual(new Set([webSocket2]));
  });
});

describe('when sending first message', () => {
  describe('gets kicked', () => {
    async function getsKickedWithMessage(inputMessage: any, outputErrorCode: ErrorCode) {
      const { server, userDataProvider } = getServerManagerAndStuff();

      await userDataProvider.createUser('has password', 'password');
      await userDataProvider.createUser('does not have password', null);

      const webSocket = new TestWebSocket('connection');
      server.openConnection(webSocket);
      webSocket.sendMessage(inputMessage);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(webSocket.receivedMessages).toEqual([[[MessageToClientEnum.FatalError, outputErrorCode]]]);
      expect(webSocket.readyState).toBe(WebSocket.CLOSED);
    }

    test('after sending invalid JSON', async () => {
      await getsKickedWithMessage('', ErrorCode.INVALID_MESSAGE_FORMAT);
      await getsKickedWithMessage('not json', ErrorCode.INVALID_MESSAGE_FORMAT);
    });

    test('after sending a non-array', async () => {
      await getsKickedWithMessage({}, ErrorCode.INVALID_MESSAGE_FORMAT);
      await getsKickedWithMessage(null, ErrorCode.INVALID_MESSAGE_FORMAT);
    });

    test('after sending an array with the wrong length', async () => {
      await getsKickedWithMessage([1, 2, 3], ErrorCode.INVALID_MESSAGE_FORMAT);
      await getsKickedWithMessage([1, 2, 3, 4, 5], ErrorCode.INVALID_MESSAGE_FORMAT);
    });

    test('after sending wrong version', async () => {
      await getsKickedWithMessage([-1, 'username', 'password', []], ErrorCode.NOT_USING_LATEST_VERSION);
      await getsKickedWithMessage([{}, 'username', 'password', []], ErrorCode.NOT_USING_LATEST_VERSION);
    });

    test('after sending invalid username', async () => {
      await getsKickedWithMessage([0, '', 'password', []], ErrorCode.INVALID_USERNAME);
      await getsKickedWithMessage([0, '123456789012345678901234567890123', 'password', []], ErrorCode.INVALID_USERNAME);
      await getsKickedWithMessage([0, '▲', 'password', []], ErrorCode.INVALID_USERNAME);
    });

    test('after sending invalid password', async () => {
      await getsKickedWithMessage([0, 'username', 0, []], ErrorCode.INVALID_MESSAGE_FORMAT);
      await getsKickedWithMessage([0, 'username', {}, []], ErrorCode.INVALID_MESSAGE_FORMAT);
    });

    test('after sending invalid game data array', async () => {
      await getsKickedWithMessage([0, 'username', '', 0], ErrorCode.INVALID_MESSAGE_FORMAT);
      await getsKickedWithMessage([0, 'username', '', {}], ErrorCode.INVALID_MESSAGE_FORMAT);
    });

    test('after not providing password', async () => {
      await getsKickedWithMessage([0, 'has password', '', []], ErrorCode.MISSING_PASSWORD);
    });

    test('after providing incorrect password', async () => {
      await getsKickedWithMessage([0, 'has password', 'not my password', []], ErrorCode.INCORRECT_PASSWORD);
    });

    test('after providing a password when test is not set', async () => {
      await getsKickedWithMessage([0, 'does not have password', 'password', []], ErrorCode.PROVIDED_PASSWORD);
    });

    test('after providing a password when user data does not exist', async () => {
      await getsKickedWithMessage([0, 'no user data', 'password', []], ErrorCode.PROVIDED_PASSWORD);
    });

    test("after an error from user data provider's lookupUser()", async () => {
      await getsKickedWithMessage([0, 'lookupUser error', 'password', []], ErrorCode.INTERNAL_SERVER_ERROR);
    });

    test("after an error from user data provider's createUser()", async () => {
      await getsKickedWithMessage([0, 'createUser error', '', []], ErrorCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('gets logged in', () => {
    async function getsLoggedIn(username: string, password: string, expectedUserID: number) {
      const { serverManager, server, userDataProvider } = getServerManagerAndStuff();

      await userDataProvider.createUser('has password', 'password');
      await userDataProvider.createUser('does not have password', null);

      const webSocket1 = new TestWebSocket('connection 1');
      server.openConnection(webSocket1);
      webSocket1.sendMessage([0, username, password, []]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      function expectJustConnection1Data() {
        expect(serverManager.webSocketToConnectionState).toEqual(new Map([[webSocket1, ConnectionState.LoggedIn]]));
        expect(serverManager.preLoggedInWebSockets).toEqual(new Set());
        expect(serverManager.clientIDManager.used).toEqual(new Set([1]));
        expectClientAndUserAndGameData(serverManager, [new UserData(expectedUserID, username, [new ClientData(1, webSocket1)])], []);
        expect(webSocket1.readyState).toBe(WebSocket.OPEN);
      }
      expectJustConnection1Data();
      expect(webSocket1.receivedMessages.length).toBe(1);
      expect(webSocket1.receivedMessages[0]).toEqual([[MessageToClientEnum.Greetings, 1, [[expectedUserID, username, [[1]]]], []]]);

      const webSocket2 = new TestWebSocket('connection 2');
      server.openConnection(webSocket2);
      webSocket2.sendMessage([0, username, password, []]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(serverManager.webSocketToConnectionState).toEqual(
        new Map([
          [webSocket1, ConnectionState.LoggedIn],
          [webSocket2, ConnectionState.LoggedIn],
        ]),
      );
      expect(serverManager.preLoggedInWebSockets).toEqual(new Set());
      expect(serverManager.clientIDManager.used).toEqual(new Set([1, 2]));
      expectClientAndUserAndGameData(
        serverManager,
        [new UserData(expectedUserID, username, [new ClientData(1, webSocket1), new ClientData(2, webSocket2)])],
        [],
      );
      expect(webSocket1.readyState).toBe(WebSocket.OPEN);
      expect(webSocket2.readyState).toBe(WebSocket.OPEN);
      expect(webSocket1.receivedMessages.length).toBe(2);
      expect(webSocket1.receivedMessages[1]).toEqual([[MessageToClientEnum.ClientConnected, 2, expectedUserID]]);
      expect(webSocket2.receivedMessages.length).toBe(1);
      expect(webSocket2.receivedMessages[0]).toEqual([[MessageToClientEnum.Greetings, 2, [[expectedUserID, username, [[1], [2]]]], []]]);

      webSocket2.close();

      expectJustConnection1Data();
      expect(webSocket2.readyState).toBe(WebSocket.CLOSED);
      expect(webSocket1.receivedMessages.length).toBe(3);
      expect(webSocket1.receivedMessages[2]).toEqual([[MessageToClientEnum.ClientDisconnected, 2]]);
      expect(webSocket2.receivedMessages.length).toBe(1);

      webSocket1.close();

      expect(serverManager.webSocketToConnectionState).toEqual(new Map([]));
      expect(serverManager.preLoggedInWebSockets).toEqual(new Set());
      expect(serverManager.clientIDManager.used).toEqual(new Set());
      expectClientAndUserAndGameData(serverManager, [], []);
      expect(webSocket1.readyState).toBe(WebSocket.CLOSED);
      expect(webSocket1.receivedMessages.length).toBe(3);
      expect(webSocket2.receivedMessages.length).toBe(1);
    }

    test('after providing correct password', async () => {
      await getsLoggedIn('has password', 'password', 1);
    });

    test('after not providing a password when test is not set', async () => {
      await getsLoggedIn('does not have password', '', 2);
    });

    test('after not providing a password when user data does not exist', async () => {
      await getsLoggedIn('no user data', '', 3);
    });

    test('MessageToClient.Greetings message is correct (1)', async () => {
      const { serverManager, server } = getServerManagerAndStuff();

      await connectToServer(server, 'user 1');
      await connectToServer(server, 'user 2');
      await connectToServer(server, 'user 2');
      const connection3 = await connectToServer(server, 'user 3');
      const connection4 = await connectToServer(server, 'user 4');
      await connectToServer(server, 'user 1');
      connection3.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
      connection3.close();
      connection4.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_3_VS_3]);

      const connection = await connectToServer(server, 'me');

      expect(connection.receivedMessages.length).toBe(1);
      expect(connection.receivedMessages[0]).toEqual([
        [
          MessageToClientEnum.Greetings,
          7,
          [
            [1, 'user 1', [[1], [6]]],
            [2, 'user 2', [[2], [3]]],
            [3, 'user 3'],
            [4, 'user 4', [[5, 2]]],
            [5, 'me', [[7]]],
          ],
          [
            [0, 10, 1, ...serverManager.gameDisplayNumberToGameData.get(1)!.gameSetup!.toJSON()],
            [0, 11, 2, ...serverManager.gameDisplayNumberToGameData.get(2)!.gameSetup!.toJSON()],
          ],
        ],
      ]);
    });

    test('MessageToClient.Greetings message is correct (2)', async () => {
      const { server } = getServerManagerAndStuff();

      let now = 1234567890;
      Date.now = () => now++;
      Math.random = () => 0.1;

      const connection1 = await connectToServer(server, '1');
      connection1.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_4]);

      const connection2 = await connectToServer(server, '2');
      expect(connection2.receivedMessages).toEqual([
        [
          [
            MessageToClientEnum.Greetings,
            2,
            [
              [1, '1', [[1, 1]]],
              [2, '2', [[2]]],
            ],
            [[0, 10, 1, GameMode.SINGLES_4, PlayerArrangementMode.RANDOM_ORDER, 1, [1, 0, 0, 0], [0, 0, 0, 0]]],
          ],
        ],
      ]);
      connection2.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_1]);
      connection2.sendMessage([MessageToServerEnum.ApproveOfGameSetup]);
      connection2.sendMessage([MessageToServerEnum.DoGameAction, 1, GameAction.fromObject({ playTile: { tile: 19 } })]);
      connection2.sendMessage([MessageToServerEnum.DoGameAction, 2, GameAction.fromObject({ playTile: { tile: 29 } })]);
      connection2.sendMessage([MessageToServerEnum.DoGameAction, 3, GameAction.fromObject({ playTile: { tile: 39 } })]);

      const connection3 = await connectToServer(server, '3');
      expect(connection3.receivedMessages).toEqual([
        [
          [
            MessageToClientEnum.Greetings,
            3,
            [
              [1, '1', [[1, 1]]],
              [2, '2', [[2, 2]]],
              [3, '3', [[3]]],
            ],
            [
              [0, 10, 1, GameMode.SINGLES_4, PlayerArrangementMode.RANDOM_ORDER, 1, [1, 0, 0, 0], [0, 0, 0, 0]],
              [
                1,
                11,
                2,
                [
                  [GameAction.fromObject({ startGame: {} }), 1234567903, [], [89, -1, -1, -1, -1, -1, -1], 0],
                  [GameAction.fromObject({ playTile: { tile: 19 } }), 2, [[19, 0]], [-1], 0],
                  [GameAction.fromObject({ playTile: { tile: 29 } }), 2, [[29, 0]], [-1], 0],
                  [GameAction.fromObject({ playTile: { tile: 39 } }), 2, [[39, 0]], [-1], 0],
                ],
                GameMode.SINGLES_1,
                PlayerArrangementMode.RANDOM_ORDER,
                2,
                [2],
              ],
            ],
          ],
        ],
      ]);

      const connection2b = await connectToServer(server, '2');
      expect(connection2b.receivedMessages).toEqual([
        [
          [
            MessageToClientEnum.Greetings,
            4,
            [
              [1, '1', [[1, 1]]],
              [2, '2', [[2, 2], [4]]],
              [3, '3', [[3]]],
            ],
            [
              [0, 10, 1, GameMode.SINGLES_4, PlayerArrangementMode.RANDOM_ORDER, 1, [1, 0, 0, 0], [0, 0, 0, 0]],
              [
                1,
                11,
                2,
                [
                  [GameAction.fromObject({ startGame: {} }), 1234567903, [], [89, 19, 29, 39, 49, 59, 69], 0],
                  [GameAction.fromObject({ playTile: { tile: 19 } }), 2, [], [79], 0],
                  [GameAction.fromObject({ playTile: { tile: 29 } }), 2, [], [0], 0],
                  [GameAction.fromObject({ playTile: { tile: 39 } }), 2, [], [99], 0],
                ],
                GameMode.SINGLES_1,
                PlayerArrangementMode.RANDOM_ORDER,
                2,
                [2],
              ],
            ],
          ],
        ],
      ]);
    });

    test('username parameter is excluded if already known in MessageToClient.ClientConnected message', async () => {
      const { server } = getServerManagerAndStuff();

      const connection = await connectToServer(server, 'user 1');
      await connectToServer(server, 'user 2');

      expect(connection.receivedMessages.length).toBe(2);
      expect(connection.receivedMessages[1]).toEqual([[MessageToClientEnum.ClientConnected, 2, 2, 'user 2']]);

      await connectToServer(server, 'user 2');

      expect(connection.receivedMessages.length).toBe(3);
      expect(connection.receivedMessages[2]).toEqual([[MessageToClientEnum.ClientConnected, 3, 2]]);
    });
  });
});

describe('after logging in', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage([]);
    await expectKicksClientDueToInvalidMessage([{}]);
    await expectKicksClientDueToInvalidMessage([-1, 1, 2, 3]);
  });
});

describe('create game', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.CreateGame]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.CreateGame, 1, 2]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.CreateGame, -1]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.CreateGame, {}]);
  });

  test('sends MessageToClient.GameCreated and MessageToClient.ClientEnteredGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [],
    );

    connection2.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);

    expect(serverManager.userIDToUser.get(1)!.numGames).toBe(0);
    expect(serverManager.userIDToUser.get(2)!.numGames).toBe(1);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [2])],
    );

    const gameSetup = serverManager.gameIDToGameData.get(10)!.gameSetup!;
    expect(gameSetup.gameMode).toBe(GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.hostUserID).toBe(2);
    expect(gameSetup.hostUsername).toBe('user 2');

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [
      [MessageToClientEnum.GameCreated, 10, 1, GameMode.TEAMS_2_VS_2, 2],
      [MessageToClientEnum.ClientEnteredGame, 2, 1],
    ];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows creating a game when currently in a game', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection2.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    connection2.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);

    expect(serverManager.userIDToUser.get(2)!.numGames).toBe(1);
    expect(serverManager.gameIDToGameData.size).toBe(1);
    expect(connection1.receivedMessages.length).toBe(0);
    expect(connection2.receivedMessages.length).toBe(0);
  });
});

describe('enter game', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.EnterGame]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.EnterGame, 1, 2]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.EnterGame, -1]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.EnterGame, {}]);
  });

  test('sends MessageToClient.ClientEnteredGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage([MessageToServerEnum.EnterGame, 1]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.ClientEnteredGame, 2, 1]];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows entering a game when currently in a game', async () => {
    const { server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    const connection3 = await connectToServer(server, 'user 3');
    connection1.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection2.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_3]);
    connection3.sendMessage([MessageToServerEnum.EnterGame, 2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();
    connection3.clearReceivedMessages();

    connection1.sendMessage([MessageToServerEnum.EnterGame, 1]);
    connection1.sendMessage([MessageToServerEnum.EnterGame, 2]);
    connection2.sendMessage([MessageToServerEnum.EnterGame, 1]);
    connection2.sendMessage([MessageToServerEnum.EnterGame, 2]);
    connection3.sendMessage([MessageToServerEnum.EnterGame, 1]);
    connection3.sendMessage([MessageToServerEnum.EnterGame, 2]);

    expect(connection1.receivedMessages.length).toBe(0);
    expect(connection2.receivedMessages.length).toBe(0);
    expect(connection3.receivedMessages.length).toBe(0);
    expect(connection1.readyState).toBe(WebSocket.OPEN);
    expect(connection2.readyState).toBe(WebSocket.OPEN);
    expect(connection3.readyState).toBe(WebSocket.OPEN);
  });
});

describe('exit game', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.ExitGame, 1]);
    await expectKicksClientDueToInvalidMessage([MessageToServerEnum.ExitGame, {}]);
  });

  test('sends MessageToClient.ClientExitedGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection2.sendMessage([MessageToServerEnum.EnterGame, 1]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage([MessageToServerEnum.ExitGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.ClientExitedGame, 2]];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows exiting a game when not in a game', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage([MessageToServerEnum.ExitGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(0);
    expect(connection2.receivedMessages.length).toBe(0);
    expect(connection1.readyState).toBe(WebSocket.OPEN);
    expect(connection2.readyState).toBe(WebSocket.OPEN);
  });
});

describe('join game', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.JoinGame]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.JoinGame, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.UserAdded, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('unjoin game', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.UnjoinGame]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.UnjoinGame, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    otherConnection.sendMessage([MessageToServerEnum.UnjoinGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.UserRemoved, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('approve of game setup', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.ApproveOfGameSetup]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.ApproveOfGameSetup, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    otherConnection.sendMessage([MessageToServerEnum.ApproveOfGameSetup]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.UserApprovedOfGameSetup, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('change game mode', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.ChangeGameMode, GameMode.SINGLES_3]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to change game mode', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.ChangeGameMode, GameMode.SINGLES_3]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServerEnum.ChangeGameMode]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServerEnum.ChangeGameMode, GameMode.SINGLES_3]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.GameModeChanged, GameMode.SINGLES_3]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('change player arrangement mode', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.ChangePlayerArrangementMode, PlayerArrangementMode.EXACT_ORDER]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to change player arrangement mode', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.ChangePlayerArrangementMode, PlayerArrangementMode.EXACT_ORDER]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServerEnum.ChangePlayerArrangementMode]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_4]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServerEnum.ChangePlayerArrangementMode, PlayerArrangementMode.EXACT_ORDER]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.PlayerArrangementModeChanged, PlayerArrangementMode.EXACT_ORDER]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('swap positions', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.SwapPositions, 0, 1]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to swap positions', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.SwapPositions, 0, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServerEnum.SwapPositions]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_4]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServerEnum.SwapPositions, 0, 1]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.PositionsSwapped, 0, 1]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('kick user', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.KickUser, 2]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to kick user', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServerEnum.KickUser, 2]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServerEnum.KickUser]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_4]);
    otherConnection.sendMessage([MessageToServerEnum.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServerEnum.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServerEnum.KickUser, 2]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClientEnum.GameSetupChanged, 1, GameSetupChangeEnum.UserKicked, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('all approve of game setup', () => {
  test('sends MessageToClient.GameStarted and MessageToClient.GameActionDone', async () => {
    const { serverManager, hostConnection, opponentConnection, anotherConnection } = await getServerManagerAndStuffAfterAllApprovedOfGameSetup();

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(opponentConnection.receivedMessages.length).toBe(1);
    expect(anotherConnection.receivedMessages.length).toBe(1);

    expectClientAndUserAndGameData(
      serverManager,
      [
        new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]),
        new UserData(2, 'opponent', [new ClientData(2, opponentConnection, 10)]),
        new UserData(3, 'another', [new ClientData(3, anotherConnection)]),
      ],
      [new GameDataData(10, 1, [1, 2])],
    );

    const expectedGameStartedMessage = [MessageToClientEnum.GameStarted, 1, [2, 1]];
    expect(hostConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      [
        MessageToClientEnum.GameActionDone,
        1,
        GameAction.fromObject({ startGame: {} }),
        Date.now(),
        [],
        [89, 19, -1, -1, -1, -1, -1, -1, 0, 99, 11, 12, 13, 14],
        0,
      ],
    ]);
    expect(opponentConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      [
        MessageToClientEnum.GameActionDone,
        1,
        GameAction.fromObject({ startGame: {} }),
        Date.now(),
        [],
        [89, 19, 29, 39, 49, 59, 69, 79, -1, -1, -1, -1, -1, -1],
        0,
      ],
    ]);
    expect(anotherConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      [
        MessageToClientEnum.GameActionDone,
        1,
        GameAction.fromObject({ startGame: {} }),
        Date.now(),
        [],
        [89, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
        0,
      ],
    ]);

    const gameData = serverManager.gameDisplayNumberToGameData.get(1)!;
    expect(gameData.gameSetup).toBe(null);
    expect(gameData.game).not.toBe(null);
  });
});

describe('do game action', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.DoGameAction, 2, []]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('does nothing when in game setup', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.sendMessage([MessageToServerEnum.CreateGame, GameMode.SINGLES_2]);
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServerEnum.DoGameAction, 2, []]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message when parameters array is too short', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServerEnum.DoGameAction]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('kicks client due to invalid message when move history size is not an integer', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServerEnum.DoGameAction, null]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('kicks client due to invalid message when move history size is negative', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServerEnum.DoGameAction, -1]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('does nothing when move history size is less than the move history size of the game', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServerEnum.DoGameAction, 0]);

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test('does nothing when move history size is greater than the move history size of the game', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServerEnum.DoGameAction, 2]);

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test("does nothing when not player's turn", async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServerEnum.DoGameAction, 1]);

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message when providing invalid game action parameters', async () => {
    const { opponentConnection } = await getServerManagerAndStuffAfterGameStarted();

    opponentConnection.sendMessage([MessageToServerEnum.DoGameAction, 1, 108]);

    expectClientKickedDueToInvalidMessage(opponentConnection);
  });

  test('does game action when providing valid game action parameters', async () => {
    const { hostConnection, opponentConnection, anotherConnection } = await getServerManagerAndStuffAfterGameStarted();

    Date.now = () => 1234567890 + 1000;

    const gameAction = GameAction.fromObject({ playTile: { tile: 29 } });

    opponentConnection.sendMessage([MessageToServerEnum.DoGameAction, 1, gameAction]);

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(opponentConnection.receivedMessages.length).toBe(1);
    expect(anotherConnection.receivedMessages.length).toBe(1);

    expect(hostConnection.receivedMessages[0]).toEqual([[MessageToClientEnum.GameActionDone, 1, gameAction, 1000, [[29, 0]], [-1], 1]]);
    expect(opponentConnection.receivedMessages[0]).toEqual([[MessageToClientEnum.GameActionDone, 1, gameAction, 1000, [], [15], 1]]);
    expect(anotherConnection.receivedMessages[0]).toEqual([[MessageToClientEnum.GameActionDone, 1, gameAction, 1000, [[29, 0]], [-1], 1]]);
  });
});
