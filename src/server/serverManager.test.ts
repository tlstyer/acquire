import * as WebSocket from 'ws';
import { TileEnum } from '../common/enums';
import { setupTextDecoderAndTextEncoder } from '../common/nodeSpecificStuff';
import {
  PB_ErrorCode,
  PB_GameAction,
  PB_GameBoardType,
  PB_GameMode,
  PB_GameStatus,
  PB_MessagesToClient,
  PB_MessageToClient,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { ConnectionState, GameData, ServerManager, User } from './serverManager';
import { TestUserDataProvider } from './userDataProvider';

setupTextDecoderAndTextEncoder();

Math.random = () => 0.1;

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
  dataListener: ((message: Uint8Array) => any) | null = null;
  closeListener: (() => void) | null = null;

  readyState = WebSocket.OPEN;

  receivedMessages: PB_MessageToClient[][] = [];

  constructor(public id: string) {}

  on(event: string, listener: any) {
    if (event === 'message') {
      this.dataListener = listener;
    } else if (event === 'close') {
      this.closeListener = listener;
    }
  }

  send(message: Uint8Array) {
    this.receivedMessages.push(PB_MessagesToClient.fromBinary(message).messagesToClient);
  }

  sendMessage(messageToServer: PB_MessageToServer) {
    if (this.dataListener) {
      this.dataListener(PB_MessageToServer.toBinary(messageToServer));
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

function messageLogin(version: number, username: string, password: string) {
  return PB_MessageToServer.create({ login: { version, username, password } });
}

function messageCreateGame(gameMode: PB_GameMode) {
  return PB_MessageToServer.create({ createGame: { gameMode } });
}

function messageEnterGame(gameDisplayNumber: number, gameStateHistorySize: number) {
  return PB_MessageToServer.create({ enterGame: { gameDisplayNumber, gameStateHistorySize } });
}

function messageExitGame() {
  return PB_MessageToServer.create({ exitGame: {} });
}

function messageJoinGame() {
  return PB_MessageToServer.create({ doGameSetupAction: { joinGame: {} } });
}

function messageUnjoinGame() {
  return PB_MessageToServer.create({ doGameSetupAction: { unjoinGame: {} } });
}

function messageApproveOfGameSetup() {
  return PB_MessageToServer.create({ doGameSetupAction: { approveOfGameSetup: {} } });
}

function messageChangeGameMode(gameMode: PB_GameMode) {
  return PB_MessageToServer.create({ doGameSetupAction: { changeGameMode: { gameMode } } });
}

function messageChangePlayerArrangementMode(playerArrangementMode: PB_PlayerArrangementMode) {
  return PB_MessageToServer.create({ doGameSetupAction: { changePlayerArrangementMode: { playerArrangementMode } } });
}

function messageSwapPositions(position1: number, position2: number) {
  return PB_MessageToServer.create({ doGameSetupAction: { swapPositions: { position1, position2 } } });
}

function messageKickUser(userId: number) {
  return PB_MessageToServer.create({ doGameSetupAction: { kickUser: { userId } } });
}

function messageDoGameAction(gameStateHistorySize: number, gameAction?: PB_GameAction) {
  return PB_MessageToServer.create({ doGameAction: { gameStateHistorySize, gameAction } });
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
  const watcherConnection = await connectToServer(server, 'watcher');
  const anotherConnection = await connectToServer(server, 'another');
  hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
  opponentConnection.sendMessage(messageEnterGame(1, 0));
  opponentConnection.sendMessage(messageJoinGame());
  watcherConnection.sendMessage(messageEnterGame(1, 0));

  hostConnection.sendMessage(messageApproveOfGameSetup());

  hostConnection.clearReceivedMessages();
  opponentConnection.clearReceivedMessages();
  watcherConnection.clearReceivedMessages();
  anotherConnection.clearReceivedMessages();
  opponentConnection.sendMessage(messageApproveOfGameSetup());

  return {
    serverManager,
    hostConnection,
    opponentConnection,
    watcherConnection,
    anotherConnection,
  };
}

async function getServerManagerAndStuffAfterGameStarted() {
  const {
    serverManager,
    hostConnection,
    opponentConnection,
    watcherConnection,
    anotherConnection,
  } = await getServerManagerAndStuffAfterAllApprovedOfGameSetup();

  hostConnection.clearReceivedMessages();
  opponentConnection.clearReceivedMessages();
  watcherConnection.clearReceivedMessages();
  anotherConnection.clearReceivedMessages();

  return {
    serverManager,
    hostConnection,
    opponentConnection,
    watcherConnection,
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
  webSocket.sendMessage(messageLogin(0, username, ''));
  await new Promise((resolve) => setTimeout(resolve, 0));

  return webSocket;
}

function expectClientKickedDueToInvalidMessage(webSocket: TestWebSocket) {
  expect(webSocket.receivedMessages.length).toBe(1);
  expect(webSocket.receivedMessages[0]).toEqual([
    PB_MessageToClient.create({
      fatalError: {
        errorCode: PB_ErrorCode.INVALID_MESSAGE,
      },
    }),
  ]);
  expect(webSocket.readyState).toBe(WebSocket.CLOSED);
}

async function expectKicksClientDueToInvalidMessage(message: any) {
  const { server } = getServerManagerAndStuff();

  const connection = await connectToServer(server, 'user 1');

  Date.now = () => 1234567890 + 1000;
  connection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_1));
  connection.sendMessage(messageApproveOfGameSetup());
  connection.sendMessage(messageDoGameAction(1, { playTile: { tile: 29 } }));
  connection.sendMessage(messageExitGame());

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
    async function getsKickedWithMessage(messageToServer: any, outputErrorCode: PB_ErrorCode) {
      const { server, userDataProvider } = getServerManagerAndStuff();

      await userDataProvider.createUser('has password', 'password');
      await userDataProvider.createUser('does not have password', null);

      const webSocket = new TestWebSocket('connection');
      server.openConnection(webSocket);
      webSocket.sendMessage(messageToServer);

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(webSocket.receivedMessages.length).toBe(1);
      expect(webSocket.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          fatalError: {
            errorCode: outputErrorCode,
          },
        }),
      ]);
      expect(webSocket.readyState).toBe(WebSocket.CLOSED);
    }

    test('after sending invalid message', async () => {
      await getsKickedWithMessage({}, PB_ErrorCode.INVALID_MESSAGE_FORMAT);
    });

    test('after sending wrong version', async () => {
      await getsKickedWithMessage(messageLogin(-1, 'username', 'password'), PB_ErrorCode.NOT_USING_LATEST_VERSION);
    });

    test('after sending invalid username', async () => {
      await getsKickedWithMessage(messageLogin(0, '', 'password'), PB_ErrorCode.INVALID_USERNAME);
      await getsKickedWithMessage(messageLogin(0, '123456789012345678901234567890123', 'password'), PB_ErrorCode.INVALID_USERNAME);
      await getsKickedWithMessage(messageLogin(0, '▲', 'password'), PB_ErrorCode.INVALID_USERNAME);
    });

    test('after not providing password', async () => {
      await getsKickedWithMessage(messageLogin(0, 'has password', ''), PB_ErrorCode.MISSING_PASSWORD);
    });

    test('after providing incorrect password', async () => {
      await getsKickedWithMessage(messageLogin(0, 'has password', 'not my password'), PB_ErrorCode.INCORRECT_PASSWORD);
    });

    test('after providing a password when test is not set', async () => {
      await getsKickedWithMessage(messageLogin(0, 'does not have password', 'password'), PB_ErrorCode.PROVIDED_PASSWORD);
    });

    test('after providing a password when user data does not exist', async () => {
      await getsKickedWithMessage(messageLogin(0, 'no user data', 'password'), PB_ErrorCode.PROVIDED_PASSWORD);
    });

    test("after an error from user data provider's lookupUser()", async () => {
      await getsKickedWithMessage(messageLogin(0, 'lookupUser error', 'password'), PB_ErrorCode.INTERNAL_SERVER_ERROR);
    });

    test("after an error from user data provider's createUser()", async () => {
      await getsKickedWithMessage(messageLogin(0, 'createUser error', ''), PB_ErrorCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('gets logged in', () => {
    async function getsLoggedIn(username: string, password: string, expectedUserID: number) {
      const { serverManager, server, userDataProvider } = getServerManagerAndStuff();

      await userDataProvider.createUser('has password', 'password');
      await userDataProvider.createUser('does not have password', null);

      const webSocket1 = new TestWebSocket('connection 1');
      server.openConnection(webSocket1);
      webSocket1.sendMessage(messageLogin(0, username, password));
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
      expect(webSocket1.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          greetings: {
            clientId: 1,
            users: [
              {
                userId: expectedUserID,
                username,
                clients: [
                  {
                    clientId: 1,
                  },
                ],
              },
            ],
          },
        }),
      ]);

      const webSocket2 = new TestWebSocket('connection 2');
      server.openConnection(webSocket2);
      webSocket2.sendMessage(messageLogin(0, username, password));
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
      expect(webSocket1.receivedMessages[1]).toEqual([
        PB_MessageToClient.create({
          clientConnected: {
            clientId: 2,
            userId: expectedUserID,
          },
        }),
      ]);
      expect(webSocket2.receivedMessages.length).toBe(1);
      expect(webSocket2.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          greetings: {
            clientId: 2,
            users: [
              {
                userId: expectedUserID,
                username,
                clients: [
                  {
                    clientId: 1,
                  },
                  {
                    clientId: 2,
                  },
                ],
              },
            ],
          },
        }),
      ]);

      webSocket2.close();

      expectJustConnection1Data();
      expect(webSocket2.readyState).toBe(WebSocket.CLOSED);
      expect(webSocket1.receivedMessages.length).toBe(3);
      expect(webSocket1.receivedMessages[2]).toEqual([
        PB_MessageToClient.create({
          clientDisconnected: {
            clientId: 2,
          },
        }),
      ]);
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
      connection3.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
      connection3.close();
      connection4.sendMessage(messageCreateGame(PB_GameMode.TEAMS_3_VS_3));

      const connection = await connectToServer(server, 'me');

      expect(connection.receivedMessages.length).toBe(1);
      expect(connection.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          greetings: {
            clientId: 7,
            users: [
              { userId: 1, username: 'user 1', clients: [{ clientId: 1 }, { clientId: 6 }] },
              { userId: 2, username: 'user 2', clients: [{ clientId: 2 }, { clientId: 3 }] },
              { userId: 3, username: 'user 3' },
              { userId: 4, username: 'user 4', clients: [{ clientId: 5, gameDisplayNumber: 2 }] },
              { userId: 5, username: 'me', clients: [{ clientId: 7 }] },
            ],
            games: [
              { ...serverManager.gameDisplayNumberToGameData.get(1)!.gameSetup!.toGameData(), gameId: 10, gameDisplayNumber: 1 },
              { ...serverManager.gameDisplayNumberToGameData.get(2)!.gameSetup!.toGameData(), gameId: 11, gameDisplayNumber: 2 },
            ],
          },
        }),
      ]);
    });

    test('MessageToClient.Greetings message is correct (2)', async () => {
      const { serverManager, server } = getServerManagerAndStuff();

      let now = 1234567890;
      Date.now = () => now++;

      const connection1 = await connectToServer(server, '1');
      connection1.sendMessage(messageCreateGame(PB_GameMode.SINGLES_4));

      const connection2 = await connectToServer(server, '2');
      expect(connection2.receivedMessages.length).toBe(1);
      expect(connection2.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          greetings: {
            clientId: 2,
            users: [
              { userId: 1, username: '1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
              { userId: 2, username: '2', clients: [{ clientId: 2 }] },
            ],
            games: [
              {
                gameId: 10,
                gameDisplayNumber: 1,
                gameMode: PB_GameMode.SINGLES_4,
                playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
                positions: [{ userId: 1, isHost: true }, {}, {}, {}],
              },
            ],
          },
        }),
      ]);
      connection2.sendMessage(messageCreateGame(PB_GameMode.SINGLES_1));
      connection2.sendMessage(messageApproveOfGameSetup());
      connection2.sendMessage(messageDoGameAction(1, { playTile: { tile: 19 } }));
      connection2.sendMessage(messageDoGameAction(2, { playTile: { tile: 29 } }));
      connection2.sendMessage(messageDoGameAction(3, { playTile: { tile: 39 } }));

      const connection3 = await connectToServer(server, '3');
      expect(connection3.receivedMessages.length).toBe(1);
      expect(connection3.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          greetings: {
            clientId: 3,
            users: [
              { userId: 1, username: '1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
              { userId: 2, username: '2', clients: [{ clientId: 2, gameDisplayNumber: 2 }] },
              { userId: 3, username: '3', clients: [{ clientId: 3 }] },
            ],
            games: [
              {
                gameId: 10,
                gameDisplayNumber: 1,
                gameStatus: PB_GameStatus.SETTING_UP,
                gameMode: PB_GameMode.SINGLES_4,
                playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
                positions: [{ userId: 1, isHost: true }, {}, {}, {}],
              },
              {
                gameId: 11,
                gameDisplayNumber: 2,
                gameStatus: PB_GameStatus.IN_PROGRESS,
                gameMode: PB_GameMode.SINGLES_1,
                playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
                positions: [{ userId: 2, isHost: true }],
                gameBoard: serverManager.gameIDToGameData.get(11)?.game?.gameBoard.toJS().flat(),
              },
            ],
          },
        }),
      ]);

      const connection2b = await connectToServer(server, '2');
      expect(connection2b.receivedMessages.length).toBe(1);
      expect(connection2b.receivedMessages[0]).toEqual([
        PB_MessageToClient.create({
          greetings: {
            clientId: 4,
            users: [
              { userId: 1, username: '1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
              { userId: 2, username: '2', clients: [{ clientId: 2, gameDisplayNumber: 2 }, { clientId: 4 }] },
              { userId: 3, username: '3', clients: [{ clientId: 3 }] },
            ],
            games: [
              {
                gameId: 10,
                gameDisplayNumber: 1,
                gameStatus: PB_GameStatus.SETTING_UP,
                gameMode: PB_GameMode.SINGLES_4,
                playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
                positions: [{ userId: 1, isHost: true }, {}, {}, {}],
              },
              {
                gameId: 11,
                gameDisplayNumber: 2,
                gameStatus: PB_GameStatus.IN_PROGRESS,
                gameMode: PB_GameMode.SINGLES_1,
                playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
                positions: [{ userId: 2, isHost: true }],
                gameBoard: serverManager.gameIDToGameData.get(11)?.game?.gameBoard.toJS().flat(),
              },
            ],
          },
        }),
      ]);
    });

    test('username parameter is excluded if already known in MessageToClient.ClientConnected message', async () => {
      const { server } = getServerManagerAndStuff();

      const connection = await connectToServer(server, 'user 1');
      await connectToServer(server, 'user 2');

      expect(connection.receivedMessages.length).toBe(2);
      expect(connection.receivedMessages[1]).toEqual([
        PB_MessageToClient.create({
          clientConnected: {
            clientId: 2,
            userId: 2,
            username: 'user 2',
          },
        }),
      ]);

      await connectToServer(server, 'user 2');

      expect(connection.receivedMessages.length).toBe(3);
      expect(connection.receivedMessages[2]).toEqual([
        PB_MessageToClient.create({
          clientConnected: {
            clientId: 3,
            userId: 2,
          },
        }),
      ]);
    });
  });
});

describe('after logging in', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage({});
  });
});

describe('create game', () => {
  test('kicks client due to invalid message', async () => {
    await expectKicksClientDueToInvalidMessage(messageCreateGame(0));
    await expectKicksClientDueToInvalidMessage(messageCreateGame(-1));
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

    connection2.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));

    expect(serverManager.userIDToUser.get(1)!.numGames).toBe(0);
    expect(serverManager.userIDToUser.get(2)!.numGames).toBe(1);

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [2])],
    );

    const gameSetup = serverManager.gameIDToGameData.get(10)!.gameSetup!;
    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.hostUserID).toBe(2);
    expect(gameSetup.hostUsername).toBe('user 2');

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameCreated: {
          gameId: 10,
          gameDisplayNumber: 1,
          gameMode: PB_GameMode.TEAMS_2_VS_2,
          hostClientId: 2,
        },
      }),
      PB_MessageToClient.create({
        clientEnteredGame: {
          clientId: 2,
          gameDisplayNumber: 1,
        },
      }),
    ];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows creating a game when currently in a game', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection2.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    connection2.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));

    expect(serverManager.userIDToUser.get(2)!.numGames).toBe(1);
    expect(serverManager.gameIDToGameData.size).toBe(1);
    expect(connection1.receivedMessages.length).toBe(0);
    expect(connection2.receivedMessages.length).toBe(0);
  });
});

describe('enter game', () => {
  test('kicks client due to invalid message', async () => {
    // invalid gameDisplayNumber
    await expectKicksClientDueToInvalidMessage(messageEnterGame(0, 0));
    await expectKicksClientDueToInvalidMessage(messageEnterGame(-1, 0));

    // invalid gameStateHistorySize
    await expectKicksClientDueToInvalidMessage(messageEnterGame(1, -1));
    await expectKicksClientDueToInvalidMessage(messageEnterGame(1, 3));
  });

  test('sends MessageToClient.ClientEnteredGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage(messageEnterGame(1, 0));

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        clientEnteredGame: {
          clientId: 2,
          gameDisplayNumber: 1,
        },
      }),
    ];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('GameActionDone messages are sent', async () => {
    const { server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');

    Date.now = () => 1234567890;
    connection1.sendMessage(messageCreateGame(PB_GameMode.SINGLES_1));
    connection1.sendMessage(messageApproveOfGameSetup());
    connection1.sendMessage(messageDoGameAction(1, { playTile: { tile: 29 } }));
    connection1.sendMessage(messageExitGame());

    connection1.clearReceivedMessages();

    const gameActions = [
      PB_MessageToClient.create({
        gameActionDone: {
          timestamp: 1234567890,
          revealedTileRackTiles: [],
          revealedTileBagTiles: [89, TileEnum.Unknown, TileEnum.Unknown, TileEnum.Unknown, TileEnum.Unknown, TileEnum.Unknown, TileEnum.Unknown],
          playerIdWithPlayableTilePlusOne: 1,
          gameAction: {
            startGame: {},
          },
        },
      }),
      PB_MessageToClient.create({
        gameActionDone: {
          timestamp: 0,
          revealedTileRackTiles: [
            {
              tile: 29,
              playerIdBelongsTo: 0,
            },
          ],
          revealedTileBagTiles: [TileEnum.Unknown],
          playerIdWithPlayableTilePlusOne: 1,
          gameAction: {
            playTile: {
              tile: 29,
            },
          },
        },
      }),
    ];

    connection1.sendMessage(messageEnterGame(1, 2));
    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection1.receivedMessages[0]).toEqual([
      {
        clientEnteredGame: {
          clientId: 1,
          gameDisplayNumber: 1,
        },
      },
    ]);

    connection1.clearReceivedMessages();

    const connection2 = await connectToServer(server, 'user 2');
    connection2.clearReceivedMessages();
    connection2.sendMessage(messageEnterGame(1, 1));
    expect(connection2.receivedMessages[0]).toEqual([
      {
        clientEnteredGame: {
          clientId: 2,
          gameDisplayNumber: 1,
        },
      },
      gameActions[1],
    ]);

    const connection3 = await connectToServer(server, 'user 3');
    connection3.clearReceivedMessages();
    connection3.sendMessage(messageEnterGame(1, 0));
    expect(connection3.receivedMessages[0]).toEqual([
      {
        clientEnteredGame: {
          clientId: 3,
          gameDisplayNumber: 1,
        },
      },
      gameActions[0],
      gameActions[1],
    ]);
  });

  test('disallows entering a game when currently in a game', async () => {
    const { server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    const connection3 = await connectToServer(server, 'user 3');
    connection1.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    connection2.sendMessage(messageCreateGame(PB_GameMode.SINGLES_3));
    connection3.sendMessage(messageEnterGame(2, 0));
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();
    connection3.clearReceivedMessages();

    connection1.sendMessage(messageEnterGame(1, 0));
    connection1.sendMessage(messageEnterGame(2, 0));
    connection2.sendMessage(messageEnterGame(1, 0));
    connection2.sendMessage(messageEnterGame(2, 0));
    connection3.sendMessage(messageEnterGame(1, 0));
    connection3.sendMessage(messageEnterGame(2, 0));

    expect(connection1.receivedMessages.length).toBe(0);
    expect(connection2.receivedMessages.length).toBe(0);
    expect(connection3.receivedMessages.length).toBe(0);
    expect(connection1.readyState).toBe(WebSocket.OPEN);
    expect(connection2.readyState).toBe(WebSocket.OPEN);
    expect(connection3.readyState).toBe(WebSocket.OPEN);
  });
});

describe('exit game', () => {
  test('sends MessageToClient.ClientExitedGame when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    connection2.sendMessage(messageEnterGame(1, 0));
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage(messageExitGame());

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(connection1.receivedMessages.length).toBe(1);
    expect(connection2.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        clientExitedGame: {
          clientId: 2,
        },
      }),
    ];
    expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
    expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
  });

  test('disallows exiting a game when not in a game', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const connection1 = await connectToServer(server, 'user 1');
    const connection2 = await connectToServer(server, 'user 2');
    connection1.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    connection1.clearReceivedMessages();
    connection2.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'user 1', [new ClientData(1, connection1, 10)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
      [new GameDataData(10, 1, [1])],
    );

    connection2.sendMessage(messageExitGame());

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

    connection.sendMessage(messageJoinGame());

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    otherConnection.sendMessage(messageJoinGame());

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            userAdded: {
              userId: 2,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('unjoin game', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage(messageUnjoinGame());

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.TEAMS_2_VS_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    otherConnection.sendMessage(messageJoinGame());
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    otherConnection.sendMessage(messageUnjoinGame());

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            userRemoved: {
              userId: 2,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('approve of game setup', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage(messageApproveOfGameSetup());

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    otherConnection.sendMessage(messageJoinGame());
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    otherConnection.sendMessage(messageApproveOfGameSetup());

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            userApprovedOfGameSetup: {
              userId: 2,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('change game mode', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage(messageChangeGameMode(PB_GameMode.SINGLES_3));

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to change game mode', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage(messageChangeGameMode(PB_GameMode.SINGLES_3));

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    otherConnection.sendMessage(messageJoinGame());
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage(messageChangeGameMode(PB_GameMode.SINGLES_3));

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            gameModeChanged: {
              gameMode: PB_GameMode.SINGLES_3,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('change player arrangement mode', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage(messageChangePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER));

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to change player arrangement mode', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage(messageChangePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER));

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_4));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    otherConnection.sendMessage(messageJoinGame());
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage(messageChangePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER));

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            playerArrangementModeChanged: {
              playerArrangementMode: PB_PlayerArrangementMode.EXACT_ORDER,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('swap positions', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage(messageSwapPositions(0, 1));

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to swap positions', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage(messageSwapPositions(0, 1));

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_4));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    otherConnection.sendMessage(messageJoinGame());
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage(messageSwapPositions(0, 1));

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            positionsSwapped: {
              position1: 0,
              position2: 1,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('kick user', () => {
  test('does nothing when not in a game room', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.clearReceivedMessages();

    connection.sendMessage(messageKickUser(2));

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client when not the host and trying to kick user', async () => {
    const { server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    otherConnection.sendMessage(messageKickUser(2));

    expectClientKickedDueToInvalidMessage(otherConnection);
  });

  test('sends MessageToClient.GameSetupChanged when successful', async () => {
    const { serverManager, server } = getServerManagerAndStuff();

    const hostConnection = await connectToServer(server, 'host');
    const otherConnection = await connectToServer(server, 'other');
    hostConnection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_4));
    otherConnection.sendMessage(messageEnterGame(1, 0));
    otherConnection.sendMessage(messageJoinGame());
    hostConnection.clearReceivedMessages();
    otherConnection.clearReceivedMessages();

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    hostConnection.sendMessage(messageKickUser(2));

    expectClientAndUserAndGameData(
      serverManager,
      [new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]), new UserData(2, 'other', [new ClientData(2, otherConnection, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(otherConnection.receivedMessages.length).toBe(1);

    const expectedMessage = [
      PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: 1,
          gameSetupChange: {
            userKicked: {
              userId: 2,
            },
          },
        },
      }),
    ];
    expect(hostConnection.receivedMessages[0]).toEqual(expectedMessage);
    expect(otherConnection.receivedMessages[0]).toEqual(expectedMessage);
  });
});

describe('all approve of game setup', () => {
  test('sends MessageToClient.GameStarted, MessageToClient.GameBoardChanged, and MessageToClient.GameActionDone', async () => {
    const {
      serverManager,
      hostConnection,
      opponentConnection,
      watcherConnection,
      anotherConnection,
    } = await getServerManagerAndStuffAfterAllApprovedOfGameSetup();

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(opponentConnection.receivedMessages.length).toBe(1);
    expect(anotherConnection.receivedMessages.length).toBe(1);

    expectClientAndUserAndGameData(
      serverManager,
      [
        new UserData(1, 'host', [new ClientData(1, hostConnection, 10)]),
        new UserData(2, 'opponent', [new ClientData(2, opponentConnection, 10)]),
        new UserData(3, 'watcher', [new ClientData(3, watcherConnection, 10)]),
        new UserData(4, 'another', [new ClientData(4, anotherConnection)]),
      ],
      [new GameDataData(10, 1, [1, 2])],
    );

    const expectedGameStartedMessage = PB_MessageToClient.create({
      gameStarted: {
        gameDisplayNumber: 1,
        userIds: [2, 1],
      },
    });

    expect(hostConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction: { startGame: {} },
          timestamp: Date.now(),
          revealedTileBagTiles: [
            89,
            19,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            0,
            99,
            11,
            12,
            13,
            14,
          ],
          playerIdWithPlayableTilePlusOne: 1,
        },
      }),
    ]);
    expect(opponentConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction: { startGame: {} },
          timestamp: Date.now(),
          revealedTileBagTiles: [
            89,
            19,
            29,
            39,
            49,
            59,
            69,
            79,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
          ],
          playerIdWithPlayableTilePlusOne: 1,
        },
      }),
    ]);
    expect(watcherConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction: { startGame: {} },
          timestamp: Date.now(),
          revealedTileBagTiles: [
            89,
            19,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
            TileEnum.Unknown,
          ],
          playerIdWithPlayableTilePlusOne: 1,
        },
      }),
    ]);
    expect(anotherConnection.receivedMessages[0]).toEqual([
      expectedGameStartedMessage,
      PB_MessageToClient.create({
        gameBoardChanged: {
          gameDisplayNumber: 1,
          gameBoardType: PB_GameBoardType.NOTHING_YET,
          tiles: [89, 19],
        },
      }),
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

    connection.sendMessage(messageDoGameAction(2, undefined));

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('does nothing when in game setup', async () => {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user');
    connection.sendMessage(messageCreateGame(PB_GameMode.SINGLES_2));
    connection.clearReceivedMessages();

    connection.sendMessage(messageDoGameAction(2, {}));

    expect(connection.receivedMessages.length).toBe(0);
    expect(connection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message when move history size is negative', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage(messageDoGameAction(-1, {}));

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('kicks client due to invalid message when no game action is included', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage(messageDoGameAction(0, undefined));

    expectClientKickedDueToInvalidMessage(hostConnection);
  });

  test('does nothing when move history size is less than the move history size of the game', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage(messageDoGameAction(0, {}));

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test('does nothing when move history size is greater than the move history size of the game', async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage(messageDoGameAction(2, {}));

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test("does nothing when not player's turn", async () => {
    const { hostConnection } = await getServerManagerAndStuffAfterGameStarted();

    hostConnection.sendMessage(messageDoGameAction(1, {}));

    expect(hostConnection.receivedMessages.length).toBe(0);
    expect(hostConnection.readyState).toBe(WebSocket.OPEN);
  });

  test('kicks client due to invalid message when providing invalid game action parameters', async () => {
    const { opponentConnection } = await getServerManagerAndStuffAfterGameStarted();

    opponentConnection.sendMessage(messageDoGameAction(1, { playTile: { tile: 108 } }));

    expectClientKickedDueToInvalidMessage(opponentConnection);
  });

  test('does game action when providing valid game action parameters', async () => {
    const { hostConnection, opponentConnection, watcherConnection, anotherConnection } = await getServerManagerAndStuffAfterGameStarted();

    Date.now = () => 1234567890 + 1000;

    const gameAction = { playTile: { tile: 29 } };

    opponentConnection.sendMessage(messageDoGameAction(1, gameAction));

    expect(hostConnection.receivedMessages.length).toBe(1);
    expect(opponentConnection.receivedMessages.length).toBe(1);
    expect(watcherConnection.receivedMessages.length).toBe(1);
    expect(anotherConnection.receivedMessages.length).toBe(1);

    expect(hostConnection.receivedMessages[0]).toEqual([
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction,
          timestamp: 1000,
          revealedTileRackTiles: [{ tile: 29, playerIdBelongsTo: 0 }],
          revealedTileBagTiles: [TileEnum.Unknown],
          playerIdWithPlayableTilePlusOne: 2,
        },
      }),
    ]);
    expect(opponentConnection.receivedMessages[0]).toEqual([
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction,
          timestamp: 1000,
          revealedTileBagTiles: [15],
          playerIdWithPlayableTilePlusOne: 2,
        },
      }),
    ]);
    expect(watcherConnection.receivedMessages[0]).toEqual([
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction,
          timestamp: 1000,
          revealedTileRackTiles: [{ tile: 29, playerIdBelongsTo: 0 }],
          revealedTileBagTiles: [TileEnum.Unknown],
          playerIdWithPlayableTilePlusOne: 2,
        },
      }),
    ]);
    expect(anotherConnection.receivedMessages[0]).toEqual([
      PB_MessageToClient.create({
        gameBoardChanged: {
          gameDisplayNumber: 1,
          gameBoardType: PB_GameBoardType.NOTHING_YET,
          tiles: [29],
        },
      }),
    ]);
  });
});
