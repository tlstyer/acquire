import * as SockJS from 'sockjs-client';
import { ErrorCode, GameMode, MessageToClient, MessageToServer, PlayerArrangementMode } from '../common/enums';
import { Client, ClientManager, ClientManagerPage, GameData, User } from './clientManager';

jest.mock('sockjs-client');

// @ts-ignore
const mockSockJS: jest.Mock = SockJS;

describe('ClientManager', () => {
    describe('onSubmitLoginForm', () => {
        it('connection is instantiated and first message is sent', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            expect(clientManager.page).toBe(ClientManagerPage.Login);
            expect(renderMock.mock.calls.length).toBe(1);

            clientManager.onSubmitLoginForm('username', 'password');

            expect(clientManager.page).toBe(ClientManagerPage.Connecting);
            expect(clientManager.socket).toBe(testConnection);
            if (clientManager.socket !== null) {
                expect(testConnection.onopen).toBe(clientManager.onSocketOpen);
                expect(testConnection.onmessage).toBe(clientManager.onSocketMessage);
                expect(testConnection.onclose).toBe(clientManager.onSocketClose);
            }
            expect(renderMock.mock.calls.length).toBe(2);
            expect(testConnection.sentMessages).toEqual([]);

            testConnection.triggerOpen();

            expect(renderMock.mock.calls.length).toBe(2);
            expect(testConnection.sentMessages).toEqual([[0, 'username', 'password', []]]);
        });

        it('goes back to login page upon fatal error followed by a closed connection', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('username', 'password');

            testConnection.triggerOpen();

            testConnection.triggerMessage([[MessageToClient.FatalError, ErrorCode.IncorrectPassword]]);

            expect(clientManager.errorCode).toBe(ErrorCode.IncorrectPassword);
            expect(clientManager.page).toBe(ClientManagerPage.Connecting);
            expect(renderMock.mock.calls.length).toBe(3);

            testConnection.triggerClose();

            expect(clientManager.errorCode).toBe(ErrorCode.IncorrectPassword);
            expect(clientManager.page).toBe(ClientManagerPage.Login);
            expect(renderMock.mock.calls.length).toBe(4);
        });

        it('goes back to login page upon closed connection before receiving a message', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('username', 'password');

            testConnection.triggerClose();

            expect(clientManager.errorCode).toBe(ErrorCode.CouldNotConnect);
            expect(clientManager.page).toBe(ClientManagerPage.Login);
            expect(renderMock.mock.calls.length).toBe(3);
        });

        it('goes to the lobby page upon receiving the Greeting message', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('user', '');

            testConnection.triggerOpen();

            testConnection.triggerMessage([[MessageToClient.Greetings, 1, [[1, 'user', [[1]]]], []]]);

            expect(clientManager.errorCode).toBe(null);
            expect(clientManager.page).toBe(ClientManagerPage.Lobby);
            expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(1));
            expectClientAndUserAndGameData(clientManager, [new UserData(1, 'user', [new ClientData(1)])], []);
            expect(renderMock.mock.calls.length).toBe(3);
        });
    });

    describe('MessageToClient.Greetings', () => {
        it('message is processed correctly', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            const gameSetupJSON1 = [GameMode.Teams3vs3, PlayerArrangementMode.RandomOrder, 4, [4, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
            const gameSetupJSON2 = [GameMode.Singles2, PlayerArrangementMode.ExactOrder, 5, [9, 5], [0, 1]];
            testConnection.triggerMessage([
                [
                    MessageToClient.Greetings,
                    7,
                    [[1, 'user 1', [[1], [6]]], [2, 'user 2', [[2], [3]]], [3, 'user 3', [[4]]], [4, 'user 4', [[5, 1]]], [5, 'me', [[7]]], [9, 'user 9']],
                    [[0, 1, 1, ...gameSetupJSON1], [0, 2, 3, ...gameSetupJSON2]],
                ],
            ]);

            expect(clientManager.userIDToUser.get(1)!.numGames).toBe(0);
            expect(clientManager.userIDToUser.get(2)!.numGames).toBe(0);
            expect(clientManager.userIDToUser.get(3)!.numGames).toBe(0);
            expect(clientManager.userIDToUser.get(4)!.numGames).toBe(1);
            expect(clientManager.userIDToUser.get(5)!.numGames).toBe(1);
            expect(clientManager.userIDToUser.get(9)!.numGames).toBe(1);
            expect(clientManager.myClient).toBe(clientManager.clientIDToClient.get(7));
            expect(clientManager.gameIDToGameData.get(1)!.gameSetup!.toJSON()).toEqual(gameSetupJSON1);
            expect(clientManager.gameIDToGameData.get(2)!.gameSetup!.toJSON()).toEqual(gameSetupJSON2);
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
                [new GameDataData(1, 1), new GameDataData(2, 3)],
            );
        });
    });

    describe('MessageToClient.ClientConnected', () => {
        it('new user and client added', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);

            expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])], []);
        });

        it('client added for existing user', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 5, 3]]);

            expectClientAndUserAndGameData(
                clientManager,
                [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4), new ClientData(5)])],
                [],
            );
        });
    });

    describe('MessageToClient.ClientDisconnected', () => {
        it('sole client of a user disconnects', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.ClientDisconnected, 4]]);

            expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)])], []);
        });

        it('a client of a user disconnects, leaving another client still connected', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 5, 3]]);
            testConnection.triggerMessage([[MessageToClient.ClientDisconnected, 4]]);

            expectClientAndUserAndGameData(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(5)])], []);
        });

        it('user is not deleted if they are in a game', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.GameCreated, 10, 1, GameMode.Teams2vs2, 4]]);
            testConnection.triggerMessage([[MessageToClient.ClientDisconnected, 4]]);

            expect(clientManager.userIDToUser.get(3)!.numGames).toBe(1);
            expectClientAndUserAndGameData(
                clientManager,
                [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [])],
                [new GameDataData(10, 1)],
            );
        });
    });

    describe('onSubmitCreateGame', () => {
        it('sends CreateGame message when connected', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.clearSentMessages();

            clientManager.onSubmitCreateGame(GameMode.Teams2vs2);

            expect(testConnection.sentMessages.length).toBe(1);
            expect(testConnection.sentMessages[0]).toEqual([MessageToServer.CreateGame, GameMode.Teams2vs2]);
        });

        it('does not send CreateGame message when not connected', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerClose();
            testConnection.clearSentMessages();

            clientManager.onSubmitCreateGame(GameMode.Teams2vs2);

            expect(testConnection.sentMessages.length).toBe(0);
        });
    });

    describe('MessageToClient.GameCreated', () => {
        it('game is added', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.GameCreated, 10, 1, GameMode.Teams2vs2, 2]]);

            expectClientAndUserAndGameData(
                clientManager,
                [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])],
                [new GameDataData(10, 1)],
            );

            expect(clientManager.userIDToUser.get(1)!.numGames).toBe(1);
            const gameSetup = clientManager.gameIDToGameData.get(10)!.gameSetup!;
            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
            expect(gameSetup.hostUserID).toBe(1);
            expect(gameSetup.hostUsername).toBe('me');
        });
    });

    describe('MessageToClient.ClientEnteredGame', () => {
        it('own client enters game', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.GameCreated, 10, 1, GameMode.Teams2vs2, 2], [MessageToClient.ClientEnteredGame, 2, 1]]);

            expect(clientManager.page).toBe(ClientManagerPage.Game);
            expectClientAndUserAndGameData(
                clientManager,
                [new UserData(1, 'me', [new ClientData(2, 10)]), new UserData(3, 'user 3', [new ClientData(4)])],
                [new GameDataData(10, 1)],
            );
        });

        it('other client enters game', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, 2, [[1, 'me', [[2]]]], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.GameCreated, 10, 1, GameMode.Teams2vs2, 4], [MessageToClient.ClientEnteredGame, 4, 1]]);

            expect(clientManager.page).toBe(ClientManagerPage.Lobby);
            expectClientAndUserAndGameData(
                clientManager,
                [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4, 10)])],
                [new GameDataData(10, 1)],
            );
        });
    });

    describe('onEnterClicked', () => {
        it('sends EnterGame message when connected', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([
                [
                    MessageToClient.Greetings,
                    2,
                    [[1, 'user 1', [[1, 1]]], [2, 'me', [[2]]]],
                    [[0, 10, 1, GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, [1, 0, 0, 0], [0, 0, 0, 0]]],
                ],
            ]);
            testConnection.clearSentMessages();

            clientManager.gameDisplayNumberToGameData.get(1)!.onEnterClicked();

            expect(testConnection.sentMessages.length).toBe(1);
            expect(testConnection.sentMessages[0]).toEqual([MessageToServer.EnterGame, 1]);
        });

        it('does not send EnterGame message when not connected', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([
                [
                    MessageToClient.Greetings,
                    2,
                    [[1, 'user 1', [[1, 1]]], [2, 'me', [[2]]]],
                    [[0, 10, 1, GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, [1, 0, 0, 0], [0, 0, 0, 0]]],
                ],
            ]);
            testConnection.triggerClose();
            testConnection.clearSentMessages();

            clientManager.gameDisplayNumberToGameData.get(1)!.onEnterClicked();

            expect(testConnection.sentMessages.length).toBe(0);
        });
    });
});

class TestConnection {
    onopen: ((e: any) => any) | null = null;
    onmessage: ((e: any) => any) | null = null;
    onclose: ((e: any) => any) | null = null;

    sentMessages: any[] = [];

    send(data: string) {
        this.sentMessages.push(JSON.parse(data));
    }

    triggerOpen() {
        if (this.onopen) {
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
            this.onclose({});
        }
    }

    clearSentMessages() {
        this.sentMessages = [];
    }
}

function getClientManagerAndStuff() {
    const clientManager = new ClientManager();
    const testConnection = new TestConnection();

    const renderMock = jest.fn();
    clientManager.render = renderMock;

    mockSockJS.mockReset();
    mockSockJS.mockImplementation(() => testConnection);

    clientManager.manage();

    return { clientManager, testConnection, renderMock };
}

class ClientData {
    constructor(public clientID: number, public gameID?: number) {}
}

class UserData {
    constructor(public userID: number, public username: string, public clientDatas: ClientData[]) {}
}

class GameDataData {
    constructor(public gameID: number, public gameDisplayNumber: number) {}
}

// UCR = Un-Circular-Reference-ified

class UCRClient {
    constructor(public clientID: number, public gameID: number | null, public userID: number) {}
}

class UCRUser {
    constructor(public userID: number, public username: string, public clientIDs: Set<number>) {}
}

class UCRGameData {
    clientIDs = new Set<number>();

    constructor(public gameID: number, public gameDisplayNumber: number) {}
}

type ClientIDToUCRClient = Map<number, UCRClient>;
type UserIDToUCRUser = Map<number, UCRUser>;
type GameIDTOUCRGameData = Map<number, UCRGameData>;

function expectClientAndUserAndGameData(clientManager: ClientManager, userDatas: UserData[], gameDataDatas: GameDataData[]) {
    const clientIDToUCRClient: ClientIDToUCRClient = new Map();
    const userIDToUCRUser: UserIDToUCRUser = new Map();
    const gameIDTOUCRGameData: GameIDTOUCRGameData = new Map();
    const gameDisplayNumberTOUCRGameData: GameIDTOUCRGameData = new Map();

    gameDataDatas.forEach(gameDataData => {
        const ucrGameData = new UCRGameData(gameDataData.gameID, gameDataData.gameDisplayNumber);

        gameIDTOUCRGameData.set(gameDataData.gameID, ucrGameData);
        gameDisplayNumberTOUCRGameData.set(gameDataData.gameDisplayNumber, ucrGameData);
    });

    userDatas.forEach(userData => {
        const clientIDs = new Set<number>();

        userData.clientDatas.forEach(clientData => {
            const gameID = clientData.gameID !== undefined ? clientData.gameID : null;

            clientIDToUCRClient.set(clientData.clientID, new UCRClient(clientData.clientID, gameID, userData.userID));
            if (clientData.gameID !== undefined) {
                gameIDTOUCRGameData.get(clientData.gameID)!.clientIDs.add(clientData.clientID);
            }

            clientIDs.add(clientData.clientID);
        });

        userIDToUCRUser.set(userData.userID, new UCRUser(userData.userID, userData.username, clientIDs));
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

        user.clients.forEach(client => {
            clientIDs.add(client.id);
        });

        userIDToUCRUser.set(userID, new UCRUser(user.id, user.name, clientIDs));
    });

    return userIDToUCRUser;
}

function uncircularreferenceifyGameIDToGameData(gameIDToGameData: Map<number, GameData>) {
    const gameIDTOUCRGameData: GameIDTOUCRGameData = new Map();

    gameIDToGameData.forEach((gameData, gameID) => {
        const ucrGameData = new UCRGameData(gameData.id, gameData.displayNumber);

        gameData.clients.forEach(client => {
            ucrGameData.clientIDs.add(client.id);
        });

        gameIDTOUCRGameData.set(gameID, ucrGameData);
    });

    return gameIDTOUCRGameData;
}
