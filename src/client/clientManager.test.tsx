import { List } from 'immutable';
import { GameActionEnum, MessageToClientEnum, TileEnum } from '../common/enums';
import { ErrorCode, GameMode, PB, PlayerArrangementMode } from '../common/pb';
import { Client, ClientManager, ClientManagerPage, GameData, User } from './clientManager';

class TestWebSocket {
  static OPEN = WebSocket.OPEN;

  constructor() {
    testWebSocket = this;
  }

  onopen: ((e: any) => any) | null = null;
  onmessage: ((e: any) => any) | null = null;
  onclose: ((e: any) => any) | null = null;

  readyState = WebSocket.CLOSED;

  sentMessages: Uint8Array[] = [];

  send(data: Uint8Array) {
    this.sentMessages.push(data);
  }

  triggerOpen() {
    if (this.onopen) {
      this.readyState = WebSocket.OPEN;
      this.onopen({});
    }
  }

  triggerMessage(message: any) {
    if (this.onmessage) {
      if (typeof message !== 'string') {
        message = JSON.stringify(message);
      }
      this.onmessage({ data: message });
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

// @ts-ignore
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

function sendsMessageWhenConnected(handlerCallback: (clientManager: ClientManager) => void, expectedObject: any) {
  const { clientManager } = getClientManagerAndStuff();

  clientManager.onSubmitLoginForm('me', '');
  testWebSocket!.triggerOpen();
  testWebSocket!.clearSentMessages();

  handlerCallback(clientManager);

  expectMessageToServerDatasToEqual([expectedObject]);
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

function expectMessageToServerDatasToEqual(expectedObjects: any[]) {
  expect(testWebSocket!.sentMessages.length).toBe(expectedObjects.length);

  for (let i = 0; i < expectedObjects.length; i++) {
    expect(PB.MessageToServer.toObject(PB.MessageToServer.decode(testWebSocket!.sentMessages[i]))).toEqual(expectedObjects[i]);
  }
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
    expectMessageToServerDatasToEqual([{ login: { version: 0, username: 'username', password: 'password' } }]);
  });

  test('goes back to login page upon fatal error followed by a closed connection', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('username', 'password');

    testWebSocket!.triggerOpen();

    testWebSocket!.triggerMessage([[MessageToClientEnum.FatalError, ErrorCode.INCORRECT_PASSWORD]]);

    expect(clientManager.errorCode).toBe(ErrorCode.INCORRECT_PASSWORD);
    expect(clientManager.page).toBe(ClientManagerPage.Connecting);
    expect(renderMock.mock.calls.length).toBe(3);

    testWebSocket!.triggerClose();

    expect(clientManager.errorCode).toBe(ErrorCode.INCORRECT_PASSWORD);
    expect(clientManager.page).toBe(ClientManagerPage.Login);
    expect(renderMock.mock.calls.length).toBe(4);
  });

  test('goes back to login page upon closed connection before receiving a message', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('username', 'password');

    testWebSocket!.triggerClose();

    expect(clientManager.errorCode).toBe(ErrorCode.COULD_NOT_CONNECT);
    expect(clientManager.page).toBe(ClientManagerPage.Login);
    expect(renderMock.mock.calls.length).toBe(3);
  });

  test('goes to the lobby page upon receiving the Greeting message', () => {
    const { clientManager, renderMock } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('user', '');

    testWebSocket!.triggerOpen();

    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 1, [[1, 'user', [[1]]]], []]]);

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
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.clearSentMessages();

    clientManager.onSubmitCreateGame(GameMode.TEAMS_2_VS_2);

    expectMessageToServerDatasToEqual([{ createGame: { gameMode: GameMode.TEAMS_2_VS_2 } }]);
  });

  test('does not send CreateGame message when not connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerClose();
    testWebSocket!.clearSentMessages();

    clientManager.onSubmitCreateGame(GameMode.TEAMS_2_VS_2);

    expect(testWebSocket!.sentMessages.length).toBe(0);
  });
});

describe('onEnterClicked', () => {
  test('sends EnterGame message when connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
        ],
      ],
    ]);
    testWebSocket!.clearSentMessages();

    clientManager.gameDisplayNumberToGameData.get(1)!.onEnterClicked();

    expectMessageToServerDatasToEqual([{ enterGame: { gameDisplayNumber: 1 } }]);
  });

  test('does not send EnterGame message when not connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
        ],
      ],
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
    sendsMessageWhenConnected((clientManager) => clientManager.onChangeGameMode(GameMode.TEAMS_2_VS_2), {
      doGameSetupAction: { changeGameMode: { gameMode: GameMode.TEAMS_2_VS_2 } },
    });
  });

  test('does not send ChangeGameMode message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onChangeGameMode(GameMode.TEAMS_2_VS_2));
  });
});

describe('onChangePlayerArrangementMode', () => {
  test('sends ChangePlayerArrangementMode message when connected', () => {
    sendsMessageWhenConnected((clientManager) => clientManager.onChangePlayerArrangementMode(PlayerArrangementMode.EXACT_ORDER), {
      doGameSetupAction: { changePlayerArrangementMode: { playerArrangementMode: PlayerArrangementMode.EXACT_ORDER } },
    });
  });

  test('does not send ChangePlayerArrangementMode message when not connected', () => {
    doesNotSendMessageWhenNotConnected((clientManager) => clientManager.onChangePlayerArrangementMode(PlayerArrangementMode.EXACT_ORDER));
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
    const gameSetupData1 = {
      gameMode: GameMode.TEAMS_3_VS_3,
      playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
      positions: [{ userId: 4, isHost: true }, {}, {}, {}, {}, {}],
    };
    const gameSetupData2 = {
      gameMode: GameMode.SINGLES_2,
      playerArrangementMode: PlayerArrangementMode.EXACT_ORDER,
      positions: [{ userId: 9 }, { userId: 5, isHost: true, approvesOfGameSetup: true }],
    };
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        7,
        [
          [1, 'user 1', [[1], [6]]],
          [2, 'user 2', [[2], [3]]],
          [3, 'user 3', [[4]]],
          [4, 'user 4', [[5, 1]]],
          [5, 'me', [[7]]],
          [9, 'user 9'],
        ],
        [
          [0, 1, 1, gameSetupData1],
          [0, 2, 3, gameSetupData2],
        ],
      ],
    ]);

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(0);
    expect(clientManager.userIDToUser.get(2)!.numGames).toBe(0);
    expect(clientManager.userIDToUser.get(3)!.numGames).toBe(0);
    expect(clientManager.userIDToUser.get(4)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(5)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(9)!.numGames).toBe(1);
    expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(7));
    expect(PB.GameSetupData.toObject(clientManager.gameIDToGameData.get(1)!.gameSetup!.toGameSetupData())).toEqual(gameSetupData1);
    expect(PB.GameSetupData.toObject(clientManager.gameIDToGameData.get(2)!.gameSetup!.toGameSetupData())).toEqual(gameSetupData2);
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

    clientManager.onSubmitLoginForm('2', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        4,
        [
          [1, '1', [[1, 1]]],
          [2, '2', [[2, 2], [4]]],
          [3, '3', [[3]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.SINGLES_4,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
          [
            1,
            11,
            2,
            {
              gameMode: GameMode.SINGLES_1,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 2, isHost: true }],
              gameStateDatas: [
                {
                  gameAction: { startGame: {} },
                  timestamp: 1234567894,
                  revealedTileBagTiles: [89, 19, 29, 39, 49, 59, 69],
                  playerIdWithPlayableTilePlusOne: 1,
                },
                { gameAction: { playTile: { tile: 19 } }, timestamp: 1, revealedTileBagTiles: [79], playerIdWithPlayableTilePlusOne: 1 },
                { gameAction: { playTile: { tile: 29 } }, timestamp: 1, revealedTileBagTiles: [0], playerIdWithPlayableTilePlusOne: 1 },
                { gameAction: { playTile: { tile: 39 } }, timestamp: 1, revealedTileBagTiles: [99], playerIdWithPlayableTilePlusOne: 1 },
              ],
            },
          ],
        ],
      ],
    ]);

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(2)!.numGames).toBe(1);
    expect(clientManager.userIDToUser.get(3)!.numGames).toBe(0);
    expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(4));
    const game = clientManager.gameIDToGameData.get(11)!.game!;
    expect(game).toBeDefined();
    expect(game.gameMode).toBe(GameMode.SINGLES_1);
    expect(game.hostUserID).toBe(2);
    expect(game.gameStateHistory.size).toBe(4);
    expect(game.myUserID).toBe(2);
    expect(game.playerArrangementMode).toBe(PlayerArrangementMode.RANDOM_ORDER);
    expect(game.userIDs).toEqual(List([2]));
    expect(game.usernames).toEqual(List(['2']));
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
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])], []);
  });

  test('client added for existing user', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 5, 3]]);

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
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientDisconnected, 4]]);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)])], []);
  });

  test('a client of a user disconnects, leaving another client still connected', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 5, 3]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientDisconnected, 4]]);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(5)])], []);
  });

  test('user is not deleted if they are in a game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.GameCreated, 10, 1, GameMode.TEAMS_2_VS_2, 4]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientDisconnected, 4]]);

    expect(clientManager.userIDToUser.get(3)!.numGames).toBe(1);
    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [])], [new GameDataData(10, 1, [3])]);
  });
});

describe('MessageToClient.GameCreated', () => {
  test('game is added', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.GameCreated, 10, 1, GameMode.TEAMS_2_VS_2, 2]]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])],
      [new GameDataData(10, 1, [1])],
    );

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
    const gameSetup = clientManager.gameIDToGameData.get(10)!.gameSetup!;
    expect(gameSetup.gameMode).toBe(GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.hostUserID).toBe(1);
    expect(gameSetup.hostUsername).toBe('me');
  });
});

describe('MessageToClient.ClientEnteredGame', () => {
  test('own client enters game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([
      [MessageToClientEnum.GameCreated, 10, 1, GameMode.TEAMS_2_VS_2, 2],
      [MessageToClientEnum.ClientEnteredGame, 2, 1],
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
    testWebSocket!.triggerMessage([[MessageToClientEnum.Greetings, 2, [[1, 'me', [[2]]]], []]]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientConnected, 4, 3, 'user 3']]);
    testWebSocket!.triggerMessage([
      [MessageToClientEnum.GameCreated, 10, 1, GameMode.TEAMS_2_VS_2, 4],
      [MessageToClientEnum.ClientEnteredGame, 4, 1],
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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        ],
      ],
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.GameSetup);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientExitedGame, 2]]);

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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        ],
      ],
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.GameSetup);
    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientExitedGame, 1]]);

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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, {}, {}, {}],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.GameSetupChanged, 1, PB.GameSetupChange.create({ userAdded: { userId: 2 } })]]);

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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.GameSetupChanged, 1, PB.GameSetupChange.create({ userRemoved: { userId: 2 } })]]);

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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.SINGLES_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.GameSetupChanged, 1, PB.GameSetupChange.create({ userApprovedOfGameSetup: { userId: 2 } })]]);

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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.SINGLES_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([
      [MessageToClientEnum.GameSetupChanged, 1, PB.GameSetupChange.toObject(PB.GameSetupChange.create({ gameModeChanged: { gameMode: GameMode.SINGLES_3 } }))],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.gameMode).toEqual(GameMode.SINGLES_3);
  });

  test('PlayerArrangementModeChanged message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.SINGLES_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.GameSetupChanged,
        1,
        PB.GameSetupChange.toObject(PB.GameSetupChange.create({ playerArrangementModeChanged: { playerArrangementMode: PlayerArrangementMode.EXACT_ORDER } })),
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.playerArrangementMode).toEqual(PlayerArrangementMode.EXACT_ORDER);
  });

  test('PositionsSwapped message is processed correctly', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.GameSetupChanged, 1, PB.GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 1 } })]]);

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
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [
          [1, 'user 1', [[1, 1]]],
          [2, 'me', [[2, 1]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.TEAMS_2_VS_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }, {}, {}],
            },
          ],
        ],
      ],
    ]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    testWebSocket!.triggerMessage([[MessageToClientEnum.GameSetupChanged, 1, PB.GameSetupChange.create({ userKicked: { userId: 2 } })]]);

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'user 1', [new ClientData(1, 10)]), new UserData(2, 'me', [new ClientData(2, 10)])],
      [new GameDataData(10, 1, [1])],
    );
    expect(clientManager.gameIDToGameData.get(10)!.gameSetup!.userIDs.toJS()).toEqual([1, null, null, null]);
  });
});

describe('MessageToClient.GameStarted and MessageToClient.GameActionDone', () => {
  test('messages are processed correctly when not in the game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('me', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        3,
        [
          [1, 'host', [[1, 1]]],
          [2, 'opponent', [[2, 1]]],
          [3, 'me', [[3]]],
        ],
        [
          [
            0,
            10,
            1,
            {
              gameMode: GameMode.SINGLES_2,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }, { userId: 2 }],
            },
          ],
        ],
      ],
    ]);
    testWebSocket!.triggerMessage([
      [MessageToClientEnum.GameStarted, 1, [2, 1]],
      [
        MessageToClientEnum.GameActionDone,
        1,
        {
          gameAction: { startGame: {} },
          timestamp: 123456789,
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
      ],
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.Lobby);
    expect(clientManager.myRequiredGameAction).toBeNull();

    expectClientAndUserAndGameData(
      clientManager,
      [new UserData(1, 'host', [new ClientData(1, 10)]), new UserData(2, 'opponent', [new ClientData(2, 10)]), new UserData(3, 'me', [new ClientData(3)])],
      [new GameDataData(10, 1, [1, 2])],
    );

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
    const game = clientManager.gameIDToGameData.get(10)!.game!;
    expect(game.gameMode).toBe(GameMode.SINGLES_2);
    expect(game.playerArrangementMode).toBe(PlayerArrangementMode.RANDOM_ORDER);
    expect(game.hostUserID).toBe(1);
  });

  test('messages are processed correctly when in the game', () => {
    const { clientManager } = getClientManagerAndStuff();

    clientManager.onSubmitLoginForm('user', '');
    testWebSocket!.triggerOpen();
    testWebSocket!.triggerMessage([
      [
        MessageToClientEnum.Greetings,
        2,
        [[1, 'user', [[2]]]],
        [
          [
            0,
            1,
            1,
            {
              gameMode: GameMode.SINGLES_1,
              playerArrangementMode: PlayerArrangementMode.RANDOM_ORDER,
              positions: [{ userId: 1, isHost: true }],
            },
          ],
        ],
      ],
    ]);
    testWebSocket!.triggerMessage([[MessageToClientEnum.ClientEnteredGame, 2, 1]]);
    testWebSocket!.triggerMessage([
      [MessageToClientEnum.GameStarted, 1, [1]],
      [
        MessageToClientEnum.GameActionDone,
        1,
        {
          gameAction: { startGame: {} },
          timestamp: 1550799393696,
          revealedTileBagTiles: [65, 3, 34, 6, 46, 10, 78],
          playerIdWithPlayableTilePlusOne: 1,
        },
      ],
    ]);

    expect(clientManager.page).toBe(ClientManagerPage.Game);
    expect(clientManager.myRequiredGameAction).toBe(GameActionEnum.PlayTile);

    expectClientAndUserAndGameData(clientManager, [new UserData(1, 'user', [new ClientData(2, 1)])], [new GameDataData(1, 1, [1])]);

    expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
    const game = clientManager.gameIDToGameData.get(1)!.game!;
    expect(game.gameMode).toBe(GameMode.SINGLES_1);
    expect(game.playerArrangementMode).toBe(PlayerArrangementMode.RANDOM_ORDER);
    expect(game.hostUserID).toBe(1);
  });
});
