import { Connection } from 'sockjs';
import { ErrorCode, GameSetupChange, MessageToClient, MessageToServer, PlayerArrangementMode } from '../common/enums';
import { GameMode } from '../common/pb';
import { Client, ConnectionState, GameData, ServerManager, User } from './serverManager';
import { TestUserDataProvider } from './userDataProvider';

class TestServer {
  connectionListener: ((conn: TestConnection) => any) | null = null;

  on(event: string, listener: (conn: TestConnection) => any) {
    if (event === 'connection') {
      this.connectionListener = listener;
    }
  }

  openConnection(conn: TestConnection) {
    if (this.connectionListener) {
      this.connectionListener(conn);
    }
  }
}

class TestConnection {
  dataListener: ((message: string) => any) | null = null;
  closeListener: (() => void) | null = null;

  readyState = WebSocket.OPEN;

  receivedMessages: any[] = [];

  constructor(public id: string) {}

  on(event: string, listener: any) {
    if (event === 'data') {
      this.dataListener = listener;
    } else if (event === 'close') {
      this.closeListener = listener;
    }
  }

  write(message: string) {
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
  hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
  opponentConnection.sendMessage([MessageToServer.EnterGame, 1]);
  opponentConnection.sendMessage([MessageToServer.JoinGame]);

  hostConnection.sendMessage([MessageToServer.ApproveOfGameSetup]);

  hostConnection.clearReceivedMessages();
  opponentConnection.clearReceivedMessages();
  anotherConnection.clearReceivedMessages();
  opponentConnection.sendMessage([MessageToServer.ApproveOfGameSetup]);

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
  constructor(public clientID: number, public connection: TestConnection, public gameID?: number) {}
}

class UserData {
  constructor(public userID: number, public username: string, public clientDatas: ClientData[]) {}
}

class GameDataData {
  constructor(public gameID: number, public gameDisplayNumber: number, public userIDs: number[]) {}
}

// UCR = Un-Circular-Reference-ified

class UCRClient {
  constructor(public clientID: number, public connection: Connection, public gameID: number | null, public userID: number) {}
}

class UCRUser {
  constructor(public userID: number, public username: string, public clientIDs: Set<number>, public numGames: number) {}
}

class UCRGameData {
  clientIDs = new Set<number>();

  constructor(public gameID: number, public gameDisplayNumber: number, public userIDs: Set<number>) {}
}

type ConnectionIDToUCRClient = Map<string, UCRClient>;
type UserIDToUCRUser = Map<number, UCRUser>;
type GameIDTOUCRGameData = Map<number, UCRGameData>;

function expectClientAndUserAndGameData(serverManager: ServerManager, userDatas: UserData[], gameDataDatas: GameDataData[]) {
  const connectionIDToUCRClient: ConnectionIDToUCRClient = new Map();
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
      const connection: Connection = clientData.connection;
      const gameID = clientData.gameID !== undefined ? clientData.gameID : null;

      connectionIDToUCRClient.set(clientData.connection.id, new UCRClient(clientData.clientID, connection, gameID, userData.userID));
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

  expect(uncircularreferenceifyConnectionIDToClient(serverManager.connectionIDToClient)).toEqual(connectionIDToUCRClient);
  expect(uncircularreferenceifyUserIDToUser(serverManager.userIDToUser)).toEqual(userIDToUCRUser);
  expect(uncircularreferenceifyGameIDToGameData(serverManager.gameIDToGameData)).toEqual(gameIDTOUCRGameData);
  expect(uncircularreferenceifyGameIDToGameData(serverManager.gameDisplayNumberToGameData)).toEqual(gameDisplayNumberTOUCRGameData);
}

function uncircularreferenceifyConnectionIDToClient(connectionIDToClient: Map<string, Client>) {
  const connectionIDToUCRClient: ConnectionIDToUCRClient = new Map();

  connectionIDToClient.forEach((client, connectionID) => {
    const gameID = client.gameData !== null ? client.gameData.id : null;

    connectionIDToUCRClient.set(connectionID, new UCRClient(client.id, client.connection, gameID, client.user.id));
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
  const connection = new TestConnection(username);
  server.openConnection(connection);
  connection.sendMessage([0, username, '', []]);
  await new Promise((resolve) => setTimeout(resolve, 0));

  return connection;
}

function expectClientKickedDueToInvalidMessage(connection: TestConnection) {
  expect(connection.receivedMessages.length).toBe(1);
  expect(connection.receivedMessages[0]).toEqual([[MessageToClient.FatalError, ErrorCode.InvalidMessage]]);
  expect(connection.readyState).toBe(WebSocket.CLOSED);
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

    const connection1 = new TestConnection('connection ID 1');
    server.openConnection(connection1);

    expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1]]));

    const connection2 = new TestConnection('connection ID 2');
    server.openConnection(connection2);

    expect(serverManager.connectionIDToConnectionState).toEqual(
      new Map([
        [connection1.id, ConnectionState.WaitingForFirstMessage],
        [connection2.id, ConnectionState.WaitingForFirstMessage],
      ]),
    );
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(
      new Map([
        [connection1.id, connection1],
        [connection2.id, connection2],
      ]),
    );

    connection1.close();

    expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));

    connection2.close();

    expect(serverManager.connectionIDToConnectionState).toEqual(new Map());
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
  });

  test('closing already closed connection does nothing', () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = new TestConnection('connection ID 1');
    server.openConnection(connection1);

    expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1]]));

    const connection2 = new TestConnection('connection ID 2');
    server.openConnection(connection2);

    expect(serverManager.connectionIDToConnectionState).toEqual(
      new Map([
        [connection1.id, ConnectionState.WaitingForFirstMessage],
        [connection2.id, ConnectionState.WaitingForFirstMessage],
      ]),
    );
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(
      new Map([
        [connection1.id, connection1],
        [connection2.id, connection2],
      ]),
    );

    connection1.close();

    expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));

    connection1.close();

    expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));
  });
});

describe('when sending first message', () => {
  describe('gets kicked', () => {
    async function getsKickedWithMessage(inputMessage: any, outputErrorCode: ErrorCode) {
      const { server, userDataProvider } = getServerManagerAndStuff();

      await userDataProvider.createUser('has password', 'password');
      await userDataProvider.createUser('does not have password', null);

      const connection = new TestConnection('connection');
      server.openConnection(connection);
      connection.sendMessage(inputMessage);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(connection.receivedMessages).toEqual([[[MessageToClient.FatalError, outputErrorCode]]]);
      expect(connection.readyState).toBe(WebSocket.CLOSED);
    }

    test('after sending invalid JSON', async () => {
      await getsKickedWithMessage('', ErrorCode.InvalidMessageFormat);
      await getsKickedWithMessage('not json', ErrorCode.InvalidMessageFormat);
    });

    test('after sending a non-array', async () => {
      await getsKickedWithMessage({}, ErrorCode.InvalidMessageFormat);
      await getsKickedWithMessage(null, ErrorCode.InvalidMessageFormat);
    });

    test('after sending an array with the wrong length', async () => {
      await getsKickedWithMessage([1, 2, 3], ErrorCode.InvalidMessageFormat);
      await getsKickedWithMessage([1, 2, 3, 4, 5], ErrorCode.InvalidMessageFormat);
    });

    test('after sending wrong version', async () => {
      await getsKickedWithMessage([-1, 'username', 'password', []], ErrorCode.NotUsingLatestVersion);
      await getsKickedWithMessage([{}, 'username', 'password', []], ErrorCode.NotUsingLatestVersion);
    });

    test('after sending invalid username', async () => {
      await getsKickedWithMessage([0, '', 'password', []], ErrorCode.InvalidUsername);
      await getsKickedWithMessage([0, '123456789012345678901234567890123', 'password', []], ErrorCode.InvalidUsername);
      await getsKickedWithMessage([0, '▲', 'password', []], ErrorCode.InvalidUsername);
    });

    test('after sending invalid password', async () => {
      await getsKickedWithMessage([0, 'username', 0, []], ErrorCode.InvalidMessageFormat);
      await getsKickedWithMessage([0, 'username', {}, []], ErrorCode.InvalidMessageFormat);
    });

    test('after sending invalid game data array', async () => {
      await getsKickedWithMessage([0, 'username', '', 0], ErrorCode.InvalidMessageFormat);
      await getsKickedWithMessage([0, 'username', '', {}], ErrorCode.InvalidMessageFormat);
    });

    test('after not providing password', async () => {
      await getsKickedWithMessage([0, 'has password', '', []], ErrorCode.MissingPassword);
    });

    test('after providing incorrect password', async () => {
      await getsKickedWithMessage([0, 'has password', 'not my password', []], ErrorCode.IncorrectPassword);
    });

    test('after providing a password when test is not set', async () => {
      await getsKickedWithMessage([0, 'does not have password', 'password', []], ErrorCode.ProvidedPassword);
    });

    test('after providing a password when user data does not exist', async () => {
      await getsKickedWithMessage([0, 'no user data', 'password', []], ErrorCode.ProvidedPassword);
    });

    test("after an error from user data provider's lookupUser()", async () => {
      await getsKickedWithMessage([0, 'lookupUser error', 'password', []], ErrorCode.InternalServerError);
    });

    test("after an error from user data provider's createUser()", async () => {
      await getsKickedWithMessage([0, 'createUser error', '', []], ErrorCode.InternalServerError);
    });
  });

  describe('gets logged in', () => {
    async function getsLoggedIn(username: string, password: string, expectedUserID: number) {
      const { serverManager, server, userDataProvider } = getServerManagerAndStuff();

      await userDataProvider.createUser('has password', 'password');
      await userDataProvider.createUser('does not have password', null);

      const connection1 = new TestConnection('connection 1');
      server.openConnection(connection1);
      connection1.sendMessage([0, username, password, []]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      function expectJustConnection1Data() {
        expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.LoggedIn]]));
        expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
        expect(serverManager.clientIDManager.used).toEqual(new Set([1]));
        expectClientAndUserAndGameData(serverManager, [new UserData(expectedUserID, username, [new ClientData(1, connection1)])], []);
        expect(connection1.readyState).toBe(WebSocket.OPEN);
      }
      expectJustConnection1Data();
      expect(connection1.receivedMessages.length).toBe(1);
      expect(connection1.receivedMessages[0]).toEqual([[MessageToClient.Greetings, 1, [[expectedUserID, username, [[1]]]], []]]);

      const connection2 = new TestConnection('connection 2');
      server.openConnection(connection2);
      connection2.sendMessage([0, username, password, []]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(serverManager.connectionIDToConnectionState).toEqual(
        new Map([
          [connection1.id, ConnectionState.LoggedIn],
          [connection2.id, ConnectionState.LoggedIn],
        ]),
      );
      expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
      expect(serverManager.clientIDManager.used).toEqual(new Set([1, 2]));
      expectClientAndUserAndGameData(
        serverManager,
        [new UserData(expectedUserID, username, [new ClientData(1, connection1), new ClientData(2, connection2)])],
        [],
      );
      expect(connection1.readyState).toBe(WebSocket.OPEN);
      expect(connection2.readyState).toBe(WebSocket.OPEN);
      expect(connection1.receivedMessages.length).toBe(2);
      expect(connection1.receivedMessages[1]).toEqual([[MessageToClient.ClientConnected, 2, expectedUserID]]);
      expect(connection2.receivedMessages.length).toBe(1);
      expect(connection2.receivedMessages[0]).toEqual([[MessageToClient.Greetings, 2, [[expectedUserID, username, [[1], [2]]]], []]]);

      connection2.close();

      expectJustConnection1Data();
      expect(connection2.readyState).toBe(WebSocket.CLOSED);
      expect(connection1.receivedMessages.length).toBe(3);
      expect(connection1.receivedMessages[2]).toEqual([[MessageToClient.ClientDisconnected, 2]]);
      expect(connection2.receivedMessages.length).toBe(1);

      connection1.close();

      expect(serverManager.connectionIDToConnectionState).toEqual(new Map([]));
      expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
      expect(serverManager.clientIDManager.used).toEqual(new Set());
      expectClientAndUserAndGameData(serverManager, [], []);
      expect(connection1.readyState).toBe(WebSocket.CLOSED);
      expect(connection1.receivedMessages.length).toBe(3);
      expect(connection2.receivedMessages.length).toBe(1);
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
      connection3.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
      connection3.close();
      connection4.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_3_VS_3]);

      const connection = await connectToServer(server, 'me');

      expect(connection.receivedMessages.length).toBe(1);
      expect(connection.receivedMessages[0]).toEqual([
        [
          MessageToClient.Greetings,
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
      connection1.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_4]);

      const connection2 = await connectToServer(server, '2');
      expect(connection2.receivedMessages).toEqual([
        [
          [
            MessageToClient.Greetings,
            2,
            [
              [1, '1', [[1, 1]]],
              [2, '2', [[2]]],
            ],
            [[0, 10, 1, GameMode.SINGLES_4, PlayerArrangementMode.RandomOrder, 1, [1, 0, 0, 0], [0, 0, 0, 0]]],
          ],
        ],
      ]);
      connection2.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_1]);
      connection2.sendMessage([MessageToServer.ApproveOfGameSetup]);
      connection2.sendMessage([MessageToServer.DoGameAction, 1, 19]);
      connection2.sendMessage([MessageToServer.DoGameAction, 2, 29]);
      connection2.sendMessage([MessageToServer.DoGameAction, 3, 39]);

      const connection3 = await connectToServer(server, '3');
      expect(connection3.receivedMessages).toEqual([
        [
          [
            MessageToClient.Greetings,
            3,
            [
              [1, '1', [[1, 1]]],
              [2, '2', [[2, 2]]],
              [3, '3', [[3]]],
            ],
            [
              [0, 10, 1, GameMode.SINGLES_4, PlayerArrangementMode.RandomOrder, 1, [1, 0, 0, 0], [0, 0, 0, 0]],
              [
                1,
                11,
                2,
                [
                  [[], 1234567903, [], [89, -1, -1, -1, -1, -1, -1], 0],
                  [[19], 2, [[19, 0]], [-1], 0],
                  [[29], 2, [[29, 0]], [-1], 0],
                  [[39], 2, [[39, 0]], [-1], 0],
                ],
                GameMode.SINGLES_1,
                PlayerArrangementMode.RandomOrder,
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
            MessageToClient.Greetings,
            4,
            [
              [1, '1', [[1, 1]]],
              [2, '2', [[2, 2], [4]]],
              [3, '3', [[3]]],
            ],
            [
              [0, 10, 1, GameMode.SINGLES_4, PlayerArrangementMode.RandomOrder, 1, [1, 0, 0, 0], [0, 0, 0, 0]],
              [
                1,
                11,
                2,
                [
                  [[], 1234567903, [], [89, 19, 29, 39, 49, 59, 69], 0],
                  [[19], 2, [], [79], 0],
                  [[29], 2, [], [0], 0],
                  [[39], 2, [], [99], 0],
                ],
                GameMode.SINGLES_1,
                PlayerArrangementMode.RandomOrder,
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
      expect(connection.receivedMessages[1]).toEqual([[MessageToClient.ClientConnected, 2, 2, 'user 2']]);

      await connectToServer(server, 'user 2');

      expect(connection.receivedMessages.length).toBe(3);
      expect(connection.receivedMessages[2]).toEqual([[MessageToClient.ClientConnected, 3, 2]]);
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
    await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame, 1, 2]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame, -1]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame, {}]);
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

    connection2.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);

    expect(serverManager.userIDToUser.get(1)!.numGames).toBe(0);
    expect(serverManager.userIDToUser.get(2)!.numGames).toBe(1);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [2])],
    );

    const gameSetup = serverManager.gameIDToGameData.get(10)!.gameSetup!;
    expect(gameSetup.gameMode).toBe(GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
    expect(gameSetup.hostUserID).toBe(2);
    expect(gameSetup.hostUsername).toBe('user 2');

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [
      [MessageToClient.GameCreated, 10, 1, GameMode.TEAMS_2_VS_2, 2],
      [MessageToClient.ClientEnteredGame, 2, 1],
    ];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows creating a game when currently in a game', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection2.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    connection2.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);

    expect(serverManager.userIDToUser.get(2)!.numGames).toBe(1);
    expect(serverManager.gameIDToGameData.size).toBe(1);
    expect(connection1.receivedMessages.length).toBe(0);
    expect(connection2.receivedMessages.length).toBe(0);
  });
});

describe('enter game', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage([MessageToServer.EnterGame]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.EnterGame, 1, 2]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.EnterGame, -1]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.EnterGame, {}]);
  });

  test('sends MessageToClient.ClientEnteredGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage([MessageToServer.EnterGame, 1]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.ClientEnteredGame, 2, 1]];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows entering a game when currently in a game', async () => {
    const { server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    const connection3 = await connectToServer(server, 'user 3');
    connection1.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection2.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_3]);
    connection3.sendMessage([MessageToServer.EnterGame, 2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();
    connection3.clearReceivedMessages();

    connection1.sendMessage([MessageToServer.EnterGame, 1]);
    connection1.sendMessage([MessageToServer.EnterGame, 2]);
    connection2.sendMessage([MessageToServer.EnterGame, 1]);
    connection2.sendMessage([MessageToServer.EnterGame, 2]);
    connection3.sendMessage([MessageToServer.EnterGame, 1]);
    connection3.sendMessage([MessageToServer.EnterGame, 2]);

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
    await expectKicksClientDueToInvalidMessage([MessageToServer.ExitGame, 1]);
    await expectKicksClientDueToInvalidMessage([MessageToServer.ExitGame, {}]);
  });

  test('sends MessageToClient.ClientExitedGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection2.sendMessage([MessageToServer.EnterGame, 1]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage([MessageToServer.ExitGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.ClientExitedGame, 2]];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows exiting a game when not in a game', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage([MessageToServer.ExitGame]);

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

    connection.sendMessage([MessageToServer.JoinGame]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.JoinGame, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    otherConnection.sendMessage([MessageToServer.JoinGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.UserAdded, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('unjoin game', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.UnjoinGame]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.UnjoinGame, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.TEAMS_2_VS_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    otherConnection.sendMessage([MessageToServer.UnjoinGame]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.UserRemoved, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('approve of game setup', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.ApproveOfGameSetup]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.ApproveOfGameSetup, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    otherConnection.sendMessage([MessageToServer.ApproveOfGameSetup]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.UserApprovedOfGameSetup, 2]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('change game mode', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.ChangeGameMode, GameMode.SINGLES_3]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to change game mode', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.ChangeGameMode, GameMode.SINGLES_3]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServer.ChangeGameMode]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServer.ChangeGameMode, GameMode.SINGLES_3]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.GameModeChanged, GameMode.SINGLES_3]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('change player arrangement mode', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.ChangePlayerArrangementMode, PlayerArrangementMode.ExactOrder]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to change player arrangement mode', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.ChangePlayerArrangementMode, PlayerArrangementMode.ExactOrder]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServer.ChangePlayerArrangementMode]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_4]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServer.ChangePlayerArrangementMode, PlayerArrangementMode.ExactOrder]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.PlayerArrangementModeChanged, PlayerArrangementMode.ExactOrder]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('swap positions', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.SwapPositions, 0, 1]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to swap positions', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.SwapPositions, 0, 1]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServer.SwapPositions]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_4]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServer.SwapPositions, 0, 1]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.PositionsSwapped, 0, 1]];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('kick user', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.KickUser, 2]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to kick user', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage([MessageToServer.KickUser, 2]);

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('kicks client when the host and sending invalid message', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_3]);
    hostConnection.clearReceivedMessages();

    hostConnection.sendMessage([MessageToServer.KickUser]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_4]);
    otherConnection.sendMessage([MessageToServer.EnterGame, 1]);
    otherConnection.sendMessage([MessageToServer.JoinGame]);
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage([MessageToServer.KickUser, 2]);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [[MessageToClient.GameSetupChanged, 1, GameSetupChange.UserKicked, 2]];
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

    const expectedGameStartedMessage = [MessageToClient.GameStarted, 1, [2, 1]];
    expect(hostConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      [MessageToClient.GameActionDone, 1, [], Date.now(), [], [89, 19, -1, -1, -1, -1, -1, -1, 0, 99, 11, 12, 13, 14], 0],
    ]);
    expect(opponentConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      [MessageToClient.GameActionDone, 1, [], Date.now(), [], [89, 19, 29, 39, 49, 59, 69, 79, -1, -1, -1, -1, -1, -1], 0],
    ]);
    expect(anotherConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      [MessageToClient.GameActionDone, 1, [], Date.now(), [], [89, 19, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1], 0],
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

    connection.sendMessage([MessageToServer.DoGameAction, 2, []]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('does nothing when in game setup', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.sendMessage([MessageToServer.CreateGame, GameMode.SINGLES_2]);
    connection.clearReceivedMessages();

    connection.sendMessage([MessageToServer.DoGameAction, 2, []]);

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message when parameters array is too short', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServer.DoGameAction]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('kicks client due to invalid message when move history size is not an integer', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServer.DoGameAction, null]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('kicks client due to invalid message when move history size is negative', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServer.DoGameAction, -1]);

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('does nothing when move history size is less than the move history size of the game', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServer.DoGameAction, 0]);

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test('does nothing when move history size is greater than the move history size of the game', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServer.DoGameAction, 2]);

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test("does nothing when not player's turn", async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage([MessageToServer.DoGameAction, 1]);

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message when providing invalid game action parameters', async () => {
    const { opponentConnection } = await getServerManagerAndStuffAfterGameStarted();

    opponentConnection.sendMessage([MessageToServer.DoGameAction, 1, 108]);

    expectClientKickedDueToInvalidMessage(opponentConnection);
  });

  test('does game action when providing valid game action parameters', async () => {
    const { hostConnection, opponentConnection, anotherConnection } = await getServerManagerAndStuffAfterGameStarted();

    Date.now = () => 1234567890 + 1000;

    opponentConnection.sendMessage([MessageToServer.DoGameAction, 1, 29]);

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(opponentConnection.receivedMessages.length).toBe(1);
    expect(anotherConnection.receivedMessages.length).toBe(1);

    expect(hostConnection.receivedMessages[0]).toEqual([[MessageToClient.GameActionDone, 1, [29], 1000, [[29, 0]], [-1], 1]]);
    expect(opponentConnection.receivedMessages[0]).toEqual([[MessageToClient.GameActionDone, 1, [29], 1000, [], [15], 1]]);
    expect(anotherConnection.receivedMessages[0]).toEqual([[MessageToClient.GameActionDone, 1, [29], 1000, [[29, 0]], [-1], 1]]);
  });
});
