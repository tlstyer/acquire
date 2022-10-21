import { List } from 'immutable';
import WebSocket from 'ws';
import { GameActionEnum } from '../common/enums';
import { setupTextDecoderAndTextEncoder } from '../common/nodeSpecificStuff';
import {
  PB_ErrorCode,
  PB_Game,
  PB_GameBoardType,
  PB_GameMode,
  PB_GameStatus,
  PB_MessagesToClient,
  PB_MessageToClient,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { Client, ClientManager, ClientManagerPage, GameData, User } from './clientManager';

setupTextDecoderAndTextEncoder();

class TestWebSocket {
  static OPEN = WebSocket.OPEN;

  constructor() {
    testWebSocket = this;
  }

  onopen: ((e: any) => any) | null = null;
  onmessage: ((e: any) => any) | null = null;
  onclose: ((e: any) => any) | null = null;

  readyState: number = WebSocket.CLOSED;

  sentMessages: PB_MessageToServer[] = [];

  send(data: Uint8Array) {
    this.sentMessages.push(PB_MessageToServer.fromBinary(data));
  }

  triggerOpen() {
    if (this.onopen) {
      this.readyState = WebSocket.OPEN;
      this.onopen({});
    }
  }

  triggerMessages(messages: PB_MessageToClient[]) {
    if (this.onmessage) {
      this.onmessage({
        data: PB_MessagesToClient.toBinary({
          messagesToClient: messages,
        }),
      });
    }
  }

  triggerClose() {
    if (this.onclose) {
      this.readyState = WebSocket.CLOSED;
      this.onclose({});
    }
  }

  clearSentMessages() {
    this.sentMessages = [];
  }
}

let testWebSocket: TestWebSocket | undefined;

// @ts-expect-error
global.WebSocket = TestWebSocket;

function getClientManagerAndStuff() {
  testWebSocket = undefined;

  const clientManager = new ClientManager();

  const renderMock = jest.fn();
  clientManager.render = renderMock;

  clientManager.manage();

  return { clientManager, renderMock };
}

class ClientData {
  constructor(public clientID: number, public gameID?: number) {}
}

class UserData {
  constructor(public userID: number, public username: string, public clientDatas: ClientData[]) {}
}

class GameDataData {
  constructor(public gameID: number, public gameDisplayNumber: number, public userIDs: number[]) {}
}

// UCR = Un-Circular-Reference-ified

class UCRClient {
  constructor(public clientID: number, public gameID: number | null, public userID: number) {}
}

class UCRUser {
  constructor(public userID: number, public username: string, public clientIDs: Set<number>, public numGames: number) {}
}

class UCRGameData {
  clientIDs = new Set<number>();

  constructor(public gameID: number, public gameDisplayNumber: number, public userIDs: Set<number>) {}
}

type ClientIDToUCRClient = Map<number, UCRClient>;
type UserIDToUCRUser = Map<number, UCRUser>;
type GameIDTOUCRGameData = Map<number, UCRGameData>;

function expectClientAndUserAndGameData(clientManager: ClientManager, userDatas: UserData[], gameDataDatas: GameDataData[]) {
  const clientIDToUCRClient: ClientIDToUCRClient = new Map();
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
      const gameID = clientData.gameID !== undefined ? clientData.gameID : null;

      clientIDToUCRClient.set(clientData.clientID, new UCRClient(clientData.clientID, gameID, userData.userID));
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

  expect(uncircularreferenceifyClientIDToClient(clientManager.clientIDToClient)).toEqual(clientIDToUCRClient);
  expect(uncircularreferenceifyUserIDToUser(clientManager.userIDToUser)).toEqual(userIDToUCRUser);
  expect(uncircularreferenceifyGameIDToGameData(clientManager.gameIDToGameData)).toEqual(gameIDTOUCRGameData);
  expect(uncircularreferenceifyGameIDToGameData(clientManager.gameDisplayNumberToGameData)).toEqual(gameDisplayNumberTOUCRGameData);
}

function uncircularreferenceifyClientIDToClient(clientIDToClient: Map<number, Client>) {
  const clientIDToUCRClient: ClientIDToUCRClient = new Map();

  clientIDToClient.forEach((client, clientID) => {
    const gameID = client.gameData !== null ? client.gameData.id : null;

    clientIDToUCRClient.set(clientID, new UCRClient(client.id, gameID, client.user.id));
  });

  return clientIDToUCRClient;
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
    } else if (gameData.game !== null) {
      userIDs = new Set(gameData.game.userIDs);
    } else if (gameData.gameSummary !== null) {
      userIDs = new Set(gameData.gameSummary.userIDs);
    } else {
      throw new Error('no game data field set');
    }

    const ucrGameData = new UCRGameData(gameData.id, gameData.displayNumber, userIDs);

    gameData.clients.forEach((client) => {
      ucrGameData.clientIDs.add(client.id);
    });

    gameIDTOUCRGameData.set(gameID, ucrGameData);
  });

  return gameIDTOUCRGameData;
}

function sendsMessageWhenConnected(handlerCallback: (clientManager: ClientManager) => void, expectedObject: any) {
  const { clientManager } = getClientManagerAndStuff();

  clientManager.onSubmitLoginForm('me', '');
  testWebSocket!.triggerOpen();
  testWebSocket!.clearSentMessages();

  handlerCallback(clientManager);

  expect(testWebSocket!.sentMessages).toEqual([expectedObject]);
}

function doesNotSendMessageWhenNotConnected(handlerCallback: (clientManager: ClientManager) => void) {
  const { clientManager } = getClientManagerAndStuff();

  clientManager.onSubmitLoginForm('me', '');
  testWebSocket!.triggerOpen();
  testWebSocket!.triggerClose();
  testWebSocket!.clearSentMessages();

  handlerCallback(clientManager);

  expect(testWebSocket!.sentMessages.length).toBe(0);
}

describe('onSubmitLoginForm', () => {
  test('connection is instantiated and first message is sent', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    expect(clientManager.page).toBe(ClientManagerPage.Login);
    expect(renderMock.mock.calls.length).toBe(1);

    clientManager.onSubmitLoginForm('username', 'password');

    expect(clientManager.page).toBe(ClientManagerPage.Connecting);
    expect(clientManager.socket).toBe(testWebSocket);
    if (clientManager.socket !== null) {
      expect(testWebSocket!.onopen).toBe(clientManager.onSocketOpen);
      expect(testWebSocket!.onmessage).toBe(clientManager.onSocketMessage);
      expect(testWebSocket!.onclose).toBe(clientManager.onSocketClose);
    }
    expect(renderMock.mock.calls.length).toBe(2);
    expect(testWebSocket!.sentMessages).toEqual([]);

    testWebSocket!.triggerOpen();

    expect(renderMock.mock.calls.length).toBe(2);
    expect(testWebSocket!.sentMessages).toEqual([{ login: { version: 0, username: 'username', password: 'password' } }]);
  });

  test('goes back to login page upon fatal error followed by a closed connection', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('username', 'password');

    testWebSocket!.triggerOpen();

    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        fatalError: {
          errorCode: PB_ErrorCode.INCORRECT_PASSWORD,
        },
      }),
    ]);

    expect(clientManager.errorCode).toBe(PB_ErrorCode.INCORRECT_PASSWORD);
    expect(clientManager.page).toBe(ClientManagerPage.Connecting);
    expect(renderMock.mock.calls.length).toBe(3);

    testWebSocket!.triggerClose();

    expect(clientManager.errorCode).toBe(PB_ErrorCode.INCORRECT_PASSWORD);
    expect(clientManager.page).toBe(ClientManagerPage.Login);
    expect(renderMock.mock.calls.length).toBe(4);
  });

  test('goes back to login page upon closed connection before receiving a message', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('username', 'password');

    testWebSocket!.triggerClose();

    expect(clientManager.errorCode).toBe(PB_ErrorCode.COULD_NOT_CONNECT);
    expect(clientManager.page).toBe(ClientManagerPage.Login);
    expect(renderMock.mock.calls.length).toBe(3);
  });

  test('goes to the lobby page upon receiving the Greeting message', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('user', '');

    testWebSocket!.triggerOpen();

    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 1,
          users: [{ userId: 1, username: 'user', clients: [{ clientId: 1 }] }],
        },
      }),
    ]);

    expect(clientManager.errorCode).toBe(null);
    expect(clientManager.page).toBe(ClientManagerPage.Lobby);
    expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(1));
    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'user', [new ClientData(1)])], []);
    expect(renderMock.mock.calls.length).toBe(3);
  });
});

describe('onSubmitCreateGame', () => {
  test('sends CreateGame message when connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.clearSentMessages();

    clientManager.onSubmitCreateGame(PB_GameMode.TEAMS_2_VS_2);

    expect(testWebSocket!.sentMessages).toEqual([{ createGame: { gameMode: PB_GameMode.TEAMS_2_VS_2 } }]);
  });

  test('does not send CreateGame message when not connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerClose();
    testWebSocket!.clearSentMessages();

    clientManager.onSubmitCreateGame(PB_GameMode.TEAMS_2_VS_2);

    expect(testWebSocket!.sentMessages.length).toBe(0);
  });
});

describe('onEnterClicked', () => {
  test('sends EnterGame message when connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
        },
      }),
    ]);
    testWebSocket!.clearSentMessages();

    clientManager.gameDisplayNumberToGameData.get(1)!.onEnterClicked();

    expect(testWebSocket!.sentMessages).toEqual([{ enterGame: { gameDisplayNumber: 1, gameStateHistorySize: 0 } }]);
  });

  test('does not send EnterGame message when not connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
        },
      }),
    ]);
    testWebSocket!.triggerClose();
    testWebSocket!.clearSentMessages();

    clientManager.gameDisplayNumberToGameData.get(1)!.onEnterClicked();

    expect(testWebSocket!.sentMessages.length).toBe(0);
  });
});

describe('onExitGameClicked', () => {
  test('sends ExitGame message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onExitGameClicked(), { exitGame: {} });
  });

  test('does not send ExitGame message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onExitGameClicked());
  });
});

describe('onJoinGame', () => {
  test('sends JoinGame message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onJoinGame(), { doGameSetupAction: { joinGame: {} } });
  });

  test('does not send JoinGame message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onJoinGame());
  });
});

describe('onUnjoinGame', () => {
  test('sends UnjoinGame message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onUnjoinGame(), { doGameSetupAction: { unjoinGame: {} } });
  });

  test('does not send UnjoinGame message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onUnjoinGame());
  });
});

describe('onApproveOfGameSetup', () => {
  test('sends ApproveOfGameSetup message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onApproveOfGameSetup(), { doGameSetupAction: { approveOfGameSetup: {} } });
  });

  test('does not send ApproveOfGameSetup message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onApproveOfGameSetup());
  });
});

describe('onChangeGameMode', () => {
  test('sends ChangeGameMode message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onChangeGameMode(PB_GameMode.TEAMS_2_VS_2), {
      doGameSetupAction: { changeGameMode: { gameMode: PB_GameMode.TEAMS_2_VS_2 } },
    });
  });

  test('does not send ChangeGameMode message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onChangeGameMode(PB_GameMode.TEAMS_2_VS_2));
  });
});

describe('onChangePlayerArrangementMode', () => {
  test('sends ChangePlayerArrangementMode message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onChangePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER), {
      doGameSetupAction: { changePlayerArrangementMode: { playerArrangementMode: PB_PlayerArrangementMode.EXACT_ORDER } },
    });
  });

  test('does not send ChangePlayerArrangementMode message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onChangePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER));
  });
});

describe('onSwapPositions', () => {
  test('sends SwapPositions message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onSwapPositions(0, 1), { doGameSetupAction: { swapPositions: { position1: 0, position2: 1 } } });
  });

  test('does not send SwapPositions message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onSwapPositions(0, 1));
  });
});

describe('onKickUser', () => {
  test('sends KickUser message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onKickUser(5), { doGameSetupAction: { kickUser: { userId: 5 } } });
  });

  test('does not send KickUser message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onKickUser(5));
  });
});

describe('MessageToClient.Greetings', () => {
  test('message is processed correctly (1)', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    const gamePB1 = PB_Game.create({
      gameMode: PB_GameMode.TEAMS_3_VS_3,
      playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
      positions: [
        { userId: 4, isHost: true, approvesOfGameSetup: false },
        { userId: 0, isHost: false, approvesOfGameSetup: false },
        { userId: 0, isHost: false, approvesOfGameSetup: false },
        { userId: 0, isHost: false, approvesOfGameSetup: false },
        { userId: 0, isHost: false, approvesOfGameSetup: false },
        { userId: 0, isHost: false, approvesOfGameSetup: false },
      ],
    });
    const gamePB2 = PB_Game.create({
      gameMode: PB_GameMode.SINGLES_2,
      playerArrangementMode: PB_PlayerArrangementMode.EXACT_ORDER,
      positions: [
        { userId: 9, isHost: false, approvesOfGameSetup: false },
        { userId: 5, isHost: true, approvesOfGameSetup: true },
      ],
    });
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 7,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1 }, { clientId: 6 }] },
            { userId: 2, username: 'user 2', clients: [{ clientId: 2 }, { clientId: 3 }] },
            { userId: 3, username: 'user 3', clients: [{ clientId: 4 }] },
            { userId: 4, username: 'user 4', clients: [{ clientId: 5, gameDisplayNumber: 1 }] },
            { userId: 5, username: 'me', clients: [{ clientId: 7 }] },
            { userId: 9, username: 'user 9' },
          ],
          games: [
            { ...gamePB1, gameId: 1, gameDisplayNumber: 1 },
            { ...gamePB2, gameId: 2, gameDisplayNumber: 3 },
          ],
        },
      }),
    ]);

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(0);
    expect(clientManager.userIDToUser.get(2)!.numGames).toBe(0);
    expect(clientManager.userIDToUser.get(3)!.numGames).toBe(0);
    expect(clientManager.userIDToUser.get(4)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(5)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(9)!.numGames).toBe(1);
    expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(7));
    expect(clientManager.gameIDToGameData.get(1)!.gameSetup!.toGameData()).toEqual(gamePB1);
    expect(clientManager.gameIDToGameData.get(2)!.gameSetup!.toGameData()).toEqual(gamePB2);
    expectClientAndUserAndGameData(
      clientManager,
      [
        new UserData(1, 'user 1', [new ClientData(1), new ClientData(6)]),
        new UserData(2, 'user 2', [new ClientData(2), new ClientData(3)]),
        new UserData(3, 'user 3', [new ClientData(4)]),
        new UserData(4, 'user 4', [new ClientData(5, 1)]),
        new UserData(5, 'me', [new ClientData(7)]),
        new UserData(9, 'user 9', []),
      ],
      [new GameDataData(1, 1, [4]), new GameDataData(2, 3, [5, 9])],
    );
  });

  test('message is processed correctly (2)', () => {
    const { clientManager } = getClientManagerAndStuff();

    const gameBoard: PB_GameBoardType[] = new Array(108);
    for (let i = 0; i < gameBoard.length; i++) {
      gameBoard[i] = Math.floor(Math.random() * PB_GameBoardType.MAX);
    }

    clientManager.onSubmitLoginForm('2', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
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
              gameBoard,
            },
          ],
        },
      }),
    ]);

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(2)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(3)!.numGames).toBe(0);
    expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(4));

    const gameSummary = clientManager.gameIDToGameData.get(11)!.gameSummary!;
    expect(gameSummary).toBeDefined();
    expect(gameSummary.gameMode).toBe(PB_GameMode.SINGLES_1);
    expect(gameSummary.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSummary.gameStatus).toBe(PB_GameStatus.IN_PROGRESS);
    expect(gameSummary.userIDs).toEqual(List([2]));
    expect(gameSummary.usernames).toEqual(List(['2']));
    expect(gameSummary.hostUserID).toBe(2);
    expect(gameSummary.gameBoard.toJS().flat()).toEqual(gameBoard);

    const game = clientManager.gameIDToGameData.get(11)!.game!;
    expect(game).toBeDefined();
    expect(game.gameMode).toBe(PB_GameMode.SINGLES_1);
    expect(game.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(game.tileBag).toEqual([]);
    expect(game.userIDs).toEqual(List([2]));
    expect(game.usernames).toEqual(List(['2']));
    expect(game.hostUserID).toBe(2);
    expect(game.myUserID).toBe(2);

    expectClientAndUserAndGameData(
      clientManager,
      [
        new UserData(1, '1', [new ClientData(1, 10)]),
        new UserData(2, '2', [new ClientData(2, 11), new ClientData(4)]),
        new UserData(3, '3', [new ClientData(3)]),
      ],
      [new GameDataData(10, 1, [1]), new GameDataData(11, 2, [2])],
    );
  });
});

describe('MessageToClient.ClientConnected', () => {
  test('new user and client added', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])], []);
  });

  test('client added for existing user', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 5,
          userId: 3,
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4), new ClientData(5)])],
      [],
    );
  });
});

describe('MessageToClient.ClientDisconnected', () => {
  test('sole client of a user disconnects', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientDisconnected: {
          clientId: 4,
        },
      }),
    ]);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)])], []);
  });

  test('a client of a user disconnects, leaving another client still connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 5,
          userId: 3,
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientDisconnected: {
          clientId: 4,
        },
      }),
    ]);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(5)])], []);
  });

  test('user is not deleted if they are in a game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        gameCreated: {
          gameId: 10,
          gameDisplayNumber: 1,
          gameMode: PB_GameMode.TEAMS_2_VS_2,
          hostClientId: 4,
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientDisconnected: {
          clientId: 4,
        },
      }),
    ]);

    expect(clientManager.userIDToUser.get(3)!.numGames).toBe(1);
    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [])], [new GameDataData(10, 1, [3])]);
  });
});

describe('MessageToClient.GameCreated', () => {
  test('game is added', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        gameCreated: {
          gameId: 10,
          gameDisplayNumber: 1,
          gameMode: PB_GameMode.TEAMS_2_VS_2,
          hostClientId: 2,
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
    const gameSetup = clientManager.gameIDToGameData.get(10)!.gameSetup!;
    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.hostUserID).toBe(1);
    expect(gameSetup.hostUsername).toBe('me');
  });
});

describe('MessageToClient.ClientEnteredGame', () => {
  test('own client enters game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
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
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.GameSetup);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'me', [new ClientData(2, 10)]), new UserData(3, 'user 3', [new ClientData(4)])],
      [new GameDataData(10, 1, [1])],
    );
  });

  test('other client enters game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'me', clients: [{ clientId: 2 }] }],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientConnected: {
          clientId: 4,
          userId: 3,
          username: 'user 3',
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        gameCreated: {
          gameId: 10,
          gameDisplayNumber: 1,
          gameMode: PB_GameMode.TEAMS_2_VS_2,
          hostClientId: 4,
        },
      }),
      PB_MessageToClient.create({
        clientEnteredGame: {
          clientId: 4,
          gameDisplayNumber: 1,
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.Lobby);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4, 10)])],
      [new GameDataData(10, 1, [3])],
    );
  });
});

describe('MessageToClient.ClientExitedGame', () => {
  test('own client exits game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.GameSetup);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientExitedGame: {
          clientId: 2,
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.Lobby);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2)])],
      [new GameDataData(10, 1, [1, 2])],
    );
  });

  test('other client exits game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.GameSetup);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientExitedGame: {
          clientId: 1,
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.GameSetup);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
  });
});

describe('MessageToClient.GameSetupChanged', () => {
  test('UserAdded message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.userIDs.toJS()).toEqual([1, 2, null, null]);
  });

  test('UserRemoved message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.userIDs.toJS()).toEqual([1, null, null, null]);
  });

  test('UserApprovedOfGameSetup message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.SINGLES_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.approvals.toJS()).toEqual([false, true]);
  });

  test('GameModeChanged message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.SINGLES_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.gameMode).toEqual(PB_GameMode.SINGLES_3);
  });

  test('PlayerArrangementModeChanged message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.SINGLES_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.playerArrangementMode).toEqual(PB_PlayerArrangementMode.EXACT_ORDER);
  });

  test('PositionsSwapped message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.userIDs.toJS()).toEqual([2, 1, null, null]);
  });

  test('UserKicked message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [
            { userId: 1, username: 'user 1', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'me', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        },
      }),
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessages([
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
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.userIDs.toJS()).toEqual([1, null, null, null]);
  });
});

describe('MessageToClient.GameStarted, MessageToClient.GameBoardChanged, and MessageToClient.GameActionDone', () => {
  test('messages are processed correctly when not in the game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 3,
          users: [
            { userId: 1, username: 'host', clients: [{ clientId: 1, gameDisplayNumber: 1 }] },
            { userId: 2, username: 'opponent', clients: [{ clientId: 2, gameDisplayNumber: 1 }] },
            { userId: 3, username: 'me', clients: [{ clientId: 3 }] },
          ],
          games: [
            {
              gameId: 10,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.SINGLES_2,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        gameStarted: {
          gameDisplayNumber: 1,
          userIds: [2, 1],
        },
      }),
      PB_MessageToClient.create({
        gameBoardChanged: {
          gameDisplayNumber: 1,
          gameBoardType: PB_GameBoardType.NOTHING_YET,
          tiles: [89, 19],
          cantPlayEverTiles: [45],
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.Lobby);
    expect(clientManager.myRequiredGameAction).toBeNull();

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'host', [new ClientData(1, 10)]), new UserData(2, 'opponent', [new ClientData(2, 10)]), new UserData(3, 'me', [new ClientData(3)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);

    const gameSummary = clientManager.gameIDToGameData.get(10)!.gameSummary!;
    expect(gameSummary.gameMode).toBe(PB_GameMode.SINGLES_2);
    expect(gameSummary.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSummary.hostUserID).toBe(1);
    const expectedGameBoard: PB_GameBoardType[] = new Array(108);
    expectedGameBoard.fill(PB_GameBoardType.NOTHING);
    expectedGameBoard[5] = PB_GameBoardType.CANT_PLAY_EVER;
    expectedGameBoard[14] = PB_GameBoardType.NOTHING_YET;
    expectedGameBoard[105] = PB_GameBoardType.NOTHING_YET;
    expect(gameSummary.gameBoard.toJS().flat()).toEqual(expectedGameBoard);

    const game = clientManager.gameIDToGameData.get(10)!.game!;
    expect(game.gameMode).toBe(PB_GameMode.SINGLES_2);
    expect(game.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(game.hostUserID).toBe(1);
  });

  test('messages are processed correctly when in the game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('user', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        greetings: {
          clientId: 2,
          users: [{ userId: 1, username: 'user', clients: [{ clientId: 2 }] }],
          games: [
            {
              gameId: 1,
              gameDisplayNumber: 1,
              gameMode: PB_GameMode.SINGLES_1,
              playerArrangementMode: PB_PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }],
            },
          ],
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        clientEnteredGame: {
          clientId: 2,
          gameDisplayNumber: 1,
        },
      }),
    ]);
    testWebSocket!.triggerMessages([
      PB_MessageToClient.create({
        gameStarted: {
          gameDisplayNumber: 1,
          userIds: [1],
        },
      }),
      PB_MessageToClient.create({
        gameActionDone: {
          gameAction: { startGame: {} },
          timestamp: 1550799393696,
          revealedTileBagTiles: [65, 3, 34, 6, 46, 10, 78],
          playerIdWithPlayableTilePlusOne: 1,
        },
      }),
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.Game);
    expect(clientManager.myRequiredGameAction).toBe(GameActionEnum.PlayTile);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'user', [new ClientData(2, 1)])], [new GameDataData(1, 1, [1])]);

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);

    const gameSummary = clientManager.gameIDToGameData.get(1)!.gameSummary!;
    expect(gameSummary.gameMode).toBe(PB_GameMode.SINGLES_1);
    expect(gameSummary.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSummary.hostUserID).toBe(1);
    const expectedGameBoard: PB_GameBoardType[] = new Array(108);
    expectedGameBoard.fill(PB_GameBoardType.NOTHING);
    expectedGameBoard[31] = PB_GameBoardType.NOTHING_YET;
    expect(gameSummary.gameBoard.toJS().flat()).toEqual(expectedGameBoard);

    const game = clientManager.gameIDToGameData.get(1)!.game!;
    expect(game.gameMode).toBe(PB_GameMode.SINGLES_1);
    expect(game.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(game.hostUserID).toBe(1);
  });
});
