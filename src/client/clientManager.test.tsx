import * as SockJS from 'sockjs-client';
import { ErrorCode, MessageToClient } from '../common/enums';
import { Client, ClientManager, ClientManagerPage, User } from './clientManager';

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

            clientManager.onSubmitLoginForm('username', '');

            testConnection.triggerOpen();

            testConnection.triggerMessage([[MessageToClient.Greetings, [[1, 'user', [[1]]]], [], []]]);

            expect(clientManager.errorCode).toBe(null);
            expect(clientManager.page).toBe(ClientManagerPage.Lobby);
            expectClientAndUser(clientManager, [new UserData(1, 'user', [new ClientData(1)])]);
            expect(renderMock.mock.calls.length).toBe(3);
        });
    });

    describe('MessageToClient.Greetings', () => {
        it('user and client info is included', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([
                [
                    MessageToClient.Greetings,
                    [[1, 'user 1', [[1], [6]]], [2, 'user 2', [[2], [3]]], [3, 'user 3', [[4]]], [4, 'user 4', [[5]]], [5, 'me', [[7]]]],
                    [],
                    [],
                ],
            ]);

            expectClientAndUser(clientManager, [
                new UserData(1, 'user 1', [new ClientData(1), new ClientData(6)]),
                new UserData(2, 'user 2', [new ClientData(2), new ClientData(3)]),
                new UserData(3, 'user 3', [new ClientData(4)]),
                new UserData(4, 'user 4', [new ClientData(5)]),
                new UserData(5, 'me', [new ClientData(7)]),
            ]);
        });
    });

    describe('MessageToClient.ClientConnected', () => {
        it('new user and client added', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, [[1, 'me', [[2]]]], [], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);

            expectClientAndUser(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4)])]);
        });

        it('client added for existing user', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, [[1, 'me', [[2]]]], [], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 5, 3]]);

            expectClientAndUser(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(4), new ClientData(5)])]);
        });
    });

    describe('MessageToClient.ClientDisconnected', () => {
        it('sole client of a user disconnects', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, [[1, 'me', [[2]]]], [], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.ClientDisconnected, 4]]);

            expectClientAndUser(clientManager, [new UserData(1, 'me', [new ClientData(2)])]);
        });

        it('a client of a user disconnects, leaving another client still connected', async () => {
            const { clientManager, testConnection } = getClientManagerAndStuff();

            clientManager.onSubmitLoginForm('me', '');
            testConnection.triggerOpen();
            testConnection.triggerMessage([[MessageToClient.Greetings, [[1, 'me', [[2]]]], [], []]]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 4, 3, 'user 3']]);
            testConnection.triggerMessage([[MessageToClient.ClientConnected, 5, 3]]);
            testConnection.triggerMessage([[MessageToClient.ClientDisconnected, 4]]);

            expectClientAndUser(clientManager, [new UserData(1, 'me', [new ClientData(2)]), new UserData(3, 'user 3', [new ClientData(5)])]);
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
    constructor(public clientID: number) {}
}

class UserData {
    constructor(public userID: number, public username: string, public clientDatas: ClientData[]) {}
}

// UCR = Un-Circular-Reference-ified

class UCRClient {
    constructor(public clientID: number, public userID: number) {}
}

class UCRUser {
    constructor(public userID: number, public username: string, public clientIDs: Set<number>) {}
}

type ClientIDToUCRClient = Map<number, UCRClient>;
type UserIDToUCRUser = Map<number, UCRUser>;

function expectClientAndUser(clientManager: ClientManager, userDatas: UserData[]) {
    const clientIDToUCRClient: ClientIDToUCRClient = new Map();
    const userIDToUCRUser: UserIDToUCRUser = new Map();

    userDatas.forEach(userData => {
        const clientIDs = new Set<number>();

        userData.clientDatas.forEach(clientData => {
            clientIDToUCRClient.set(clientData.clientID, new UCRClient(clientData.clientID, userData.userID));

            clientIDs.add(clientData.clientID);
        });

        userIDToUCRUser.set(userData.userID, new UCRUser(userData.userID, userData.username, clientIDs));
    });

    expect(uncircularreferenceifyClientIDToClient(clientManager.clientIDToClient)).toEqual(clientIDToUCRClient);
    expect(uncircularreferenceifyUserIDToUser(clientManager.userIDToUser)).toEqual(userIDToUCRUser);
}

function uncircularreferenceifyClientIDToClient(clientIDToClient: Map<number, Client>) {
    const clientIDToUCRClient: ClientIDToUCRClient = new Map();

    clientIDToClient.forEach((client, clientID) => {
        clientIDToUCRClient.set(clientID, new UCRClient(client.id, client.user.id));
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
