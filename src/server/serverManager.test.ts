import { Connection } from 'sockjs';
import { ErrorCode, GameMode, MessageToClient, MessageToServer, PlayerArrangementMode } from '../common/enums';
import { Client, ConnectionState, GameData, ServerManager, User } from './serverManager';
import { TestUserDataProvider } from './userDataProvider';

describe('ServerManager', () => {
    describe('when not sending first message', () => {
        it('can open connections and then close them', () => {
            const { serverManager, server } = getServerManagerAndStuff();

            const connection1 = new TestConnection('connection ID 1');
            server.openConnection(connection1);

            expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.WaitingForFirstMessage]]));
            expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1]]));

            const connection2 = new TestConnection('connection ID 2');
            server.openConnection(connection2);

            expect(serverManager.connectionIDToConnectionState).toEqual(
                new Map([[connection1.id, ConnectionState.WaitingForFirstMessage], [connection2.id, ConnectionState.WaitingForFirstMessage]]),
            );
            expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1], [connection2.id, connection2]]));

            connection1.close();

            expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
            expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));

            connection2.close();

            expect(serverManager.connectionIDToConnectionState).toEqual(new Map());
            expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
        });

        it('closing already closed connection does nothing', () => {
            const { serverManager, server } = getServerManagerAndStuff();

            const connection1 = new TestConnection('connection ID 1');
            server.openConnection(connection1);

            expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.WaitingForFirstMessage]]));
            expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1]]));

            const connection2 = new TestConnection('connection ID 2');
            server.openConnection(connection2);

            expect(serverManager.connectionIDToConnectionState).toEqual(
                new Map([[connection1.id, ConnectionState.WaitingForFirstMessage], [connection2.id, ConnectionState.WaitingForFirstMessage]]),
            );
            expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1], [connection2.id, connection2]]));

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

                await new Promise(resolve => setTimeout(resolve, 0));

                expect(connection.receivedMessages).toEqual([[[MessageToClient.FatalError, outputErrorCode]]]);
                expect(connection.closed).toBe(true);
            }

            it('after sending invalid JSON', async () => {
                await getsKickedWithMessage('', ErrorCode.InvalidMessageFormat);
                await getsKickedWithMessage('not json', ErrorCode.InvalidMessageFormat);
            });

            it('after sending a non-array', async () => {
                await getsKickedWithMessage({}, ErrorCode.InvalidMessageFormat);
                await getsKickedWithMessage(null, ErrorCode.InvalidMessageFormat);
            });

            it('after sending an array with the wrong length', async () => {
                await getsKickedWithMessage([1, 2, 3], ErrorCode.InvalidMessageFormat);
                await getsKickedWithMessage([1, 2, 3, 4, 5], ErrorCode.InvalidMessageFormat);
            });

            it('after sending wrong version', async () => {
                await getsKickedWithMessage([-1, 'username', 'password', []], ErrorCode.NotUsingLatestVersion);
                await getsKickedWithMessage([{}, 'username', 'password', []], ErrorCode.NotUsingLatestVersion);
            });

            it('after sending invalid username', async () => {
                await getsKickedWithMessage([0, '', 'password', []], ErrorCode.InvalidUsername);
                await getsKickedWithMessage([0, '123456789012345678901234567890123', 'password', []], ErrorCode.InvalidUsername);
                await getsKickedWithMessage([0, '▲', 'password', []], ErrorCode.InvalidUsername);
            });

            it('after sending invalid password', async () => {
                await getsKickedWithMessage([0, 'username', 0, []], ErrorCode.InvalidMessageFormat);
                await getsKickedWithMessage([0, 'username', {}, []], ErrorCode.InvalidMessageFormat);
            });

            it('after sending invalid game data array', async () => {
                await getsKickedWithMessage([0, 'username', '', 0], ErrorCode.InvalidMessageFormat);
                await getsKickedWithMessage([0, 'username', '', {}], ErrorCode.InvalidMessageFormat);
            });

            it('after not providing password', async () => {
                await getsKickedWithMessage([0, 'has password', '', []], ErrorCode.MissingPassword);
            });

            it('after providing incorrect password', async () => {
                await getsKickedWithMessage([0, 'has password', 'not my password', []], ErrorCode.IncorrectPassword);
            });

            it('after providing a password when it is not set', async () => {
                await getsKickedWithMessage([0, 'does not have password', 'password', []], ErrorCode.ProvidedPassword);
            });

            it('after providing a password when user data does not exist', async () => {
                await getsKickedWithMessage([0, 'no user data', 'password', []], ErrorCode.ProvidedPassword);
            });

            it("after an error from user data provider's lookupUser()", async () => {
                await getsKickedWithMessage([0, 'lookupUser error', 'password', []], ErrorCode.InternalServerError);
            });

            it("after an error from user data provider's createUser()", async () => {
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
                await new Promise(resolve => setTimeout(resolve, 0));

                function expectJustConnection1Data() {
                    expect(serverManager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.LoggedIn]]));
                    expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
                    expect(serverManager.clientIDManager.used).toEqual(new Set([1]));
                    expectClientAndUserAndGameData(serverManager, [new UserData(expectedUserID, username, [new ClientData(1, connection1)])], []);
                    expect(connection1.closed).toBe(false);
                }
                expectJustConnection1Data();
                expect(connection1.receivedMessages.length).toBe(1);
                expect(connection1.receivedMessages[0]).toEqual([[MessageToClient.Greetings, 1, [[expectedUserID, username, [[1]]]], []]]);

                const connection2 = new TestConnection('connection 2');
                server.openConnection(connection2);
                connection2.sendMessage([0, username, password, []]);
                await new Promise(resolve => setTimeout(resolve, 0));

                expect(serverManager.connectionIDToConnectionState).toEqual(
                    new Map([[connection1.id, ConnectionState.LoggedIn], [connection2.id, ConnectionState.LoggedIn]]),
                );
                expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
                expect(serverManager.clientIDManager.used).toEqual(new Set([1, 2]));
                expectClientAndUserAndGameData(
                    serverManager,
                    [new UserData(expectedUserID, username, [new ClientData(1, connection1), new ClientData(2, connection2)])],
                    [],
                );
                expect(connection1.closed).toBe(false);
                expect(connection2.closed).toBe(false);
                expect(connection1.receivedMessages.length).toBe(2);
                expect(connection1.receivedMessages[1]).toEqual([[MessageToClient.ClientConnected, 2, expectedUserID]]);
                expect(connection2.receivedMessages.length).toBe(1);
                expect(connection2.receivedMessages[0]).toEqual([[MessageToClient.Greetings, 2, [[expectedUserID, username, [[1], [2]]]], []]]);

                connection2.close();

                expectJustConnection1Data();
                expect(connection2.closed).toBe(true);
                expect(connection1.receivedMessages.length).toBe(3);
                expect(connection1.receivedMessages[2]).toEqual([[MessageToClient.ClientDisconnected, 2]]);
                expect(connection2.receivedMessages.length).toBe(1);

                connection1.close();

                expect(serverManager.connectionIDToConnectionState).toEqual(new Map([]));
                expect(serverManager.connectionIDToPreLoggedInConnection).toEqual(new Map());
                expect(serverManager.clientIDManager.used).toEqual(new Set());
                expectClientAndUserAndGameData(serverManager, [], []);
                expect(connection1.closed).toBe(true);
                expect(connection1.receivedMessages.length).toBe(3);
                expect(connection2.receivedMessages.length).toBe(1);
            }

            it('after providing correct password', async () => {
                await getsLoggedIn('has password', 'password', 1);
            });

            it('after not providing a password when it is not set', async () => {
                await getsLoggedIn('does not have password', '', 2);
            });

            it('after not providing a password when user data does not exist', async () => {
                await getsLoggedIn('no user data', '', 3);
            });

            it('user and client info is included in MessageToClient.Greetings message', async () => {
                const { server } = getServerManagerAndStuff();

                await connectToServer(server, 'user 1');
                await connectToServer(server, 'user 2');
                await connectToServer(server, 'user 2');
                await connectToServer(server, 'user 3');
                await connectToServer(server, 'user 4');
                await connectToServer(server, 'user 1');
                const connection = await connectToServer(server, 'me');

                expect(connection.receivedMessages.length).toBe(1);
                expect(connection.receivedMessages[0]).toEqual([
                    [
                        MessageToClient.Greetings,
                        7,
                        [[1, 'user 1', [[1], [6]]], [2, 'user 2', [[2], [3]]], [3, 'user 3', [[4]]], [4, 'user 4', [[5]]], [5, 'me', [[7]]]],
                        [],
                    ],
                ]);
            });

            it('username parameter is excluded if already known in MessageToClient.ClientConnected message', async () => {
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
        it('kicks client due to invalid message', async () => {
            await expectKicksClientDueToInvalidMessage([]);
            await expectKicksClientDueToInvalidMessage([{}]);
            await expectKicksClientDueToInvalidMessage([-1, 1, 2, 3]);
        });
    });

    describe('create game', () => {
        it('kicks client due to invalid message', async () => {
            await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame]);
            await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame, 1, 2]);
            await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame, -1]);
            await expectKicksClientDueToInvalidMessage([MessageToServer.CreateGame, {}]);
        });

        it('sends MessageToClient.GameCreated and MessageToClient.ClientEnteredGame when successful', async () => {
            const { serverManager, server } = getServerManagerAndStuff();
            serverManager.nextGameID = 10;

            const connection1 = await connectToServer(server, 'user 1');
            const connection2 = await connectToServer(server, 'user 2');
            connection1.clearReceivedMessages();
            connection2.clearReceivedMessages();

            expectClientAndUserAndGameData(
                serverManager,
                [new UserData(1, 'user 1', [new ClientData(1, connection1)]), new UserData(2, 'user 2', [new ClientData(2, connection2)])],
                [],
            );

            connection2.sendMessage([MessageToServer.CreateGame, GameMode.Teams2vs2]);

            expectClientAndUserAndGameData(
                serverManager,
                [new UserData(1, 'user 1', [new ClientData(1, connection1)]), new UserData(2, 'user 2', [new ClientData(2, connection2, 10)])],
                [new GameDataData(10, 1)],
            );

            const gameSetup = serverManager.gameIDToGameData.get(10)!.gameSetup!;
            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
            expect(gameSetup.hostUserID).toBe(2);
            expect(gameSetup.hostUsername).toBe('user 2');

            expect(connection1.receivedMessages.length).toBe(1);
            expect(connection2.receivedMessages.length).toBe(1);

            const expectedMessage: any[] = [[MessageToClient.GameCreated, 10, 1, GameMode.Teams2vs2, 2], [MessageToClient.ClientEnteredGame, 2, 1]];
            expect(connection1.receivedMessages[0]).toEqual(expectedMessage);
            expect(connection2.receivedMessages[0]).toEqual(expectedMessage);
        });

        it('disallows creating a game when currently in a game', async () => {
            const { serverManager, server } = getServerManagerAndStuff();
            serverManager.nextGameID = 10;

            const connection1 = await connectToServer(server, 'user 1');
            const connection2 = await connectToServer(server, 'user 2');
            connection2.sendMessage([MessageToServer.CreateGame, GameMode.Teams2vs2]);
            connection1.clearReceivedMessages();
            connection2.clearReceivedMessages();

            connection2.sendMessage([MessageToServer.CreateGame, GameMode.Teams2vs2]);

            expect(serverManager.gameIDToGameData.size).toBe(1);
            expect(connection1.receivedMessages.length).toBe(0);
            expect(connection2.receivedMessages.length).toBe(0);
        });
    });
});

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

    receivedMessages: any[] = [];
    closed = false;

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
        this.closed = true;
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
    const serverManager = new ServerManager(server, userDataProvider, 1);
    serverManager.manage();

    return { serverManager, server, userDataProvider };
}

class ClientData {
    constructor(public clientID: number, public connection: TestConnection, public gameID?: number) {}
}

class UserData {
    constructor(public userID: number, public username: string, public clientDatas: ClientData[]) {}
}

class GameDataData {
    constructor(public gameID: number, public gameDisplayNumber: number) {}
}

// UCR = Un-Circular-Reference-ified

class UCRClient {
    constructor(public clientID: number, public connection: Connection, public gameID: number | null, public userID: number) {}
}

class UCRUser {
    constructor(public userID: number, public username: string, public clientIDs: Set<number>) {}
}

class UCRGameData {
    clientIDs = new Set<number>();

    constructor(public gameID: number, public gameDisplayNumber: number) {}
}

type ConnectionIDToUCRClient = Map<string, UCRClient>;
type UserIDToUCRUser = Map<number, UCRUser>;
type GameIDTOUCRGameData = Map<number, UCRGameData>;

function expectClientAndUserAndGameData(serverManager: ServerManager, userDatas: UserData[], gameDataDatas: GameDataData[]) {
    const connectionIDToUCRClient: ConnectionIDToUCRClient = new Map();
    const userIDToUCRUser: UserIDToUCRUser = new Map();
    const gameIDTOUCRGameData: GameIDTOUCRGameData = new Map();

    gameDataDatas.forEach(gameDataData => {
        gameIDTOUCRGameData.set(gameDataData.gameID, new UCRGameData(gameDataData.gameID, gameDataData.gameDisplayNumber));
    });

    userDatas.forEach(userData => {
        const clientIDs = new Set<number>();

        userData.clientDatas.forEach(clientData => {
            // @ts-ignore
            const connection: Connection = clientData.connection;
            const gameID = clientData.gameID !== undefined ? clientData.gameID : null;

            connectionIDToUCRClient.set(clientData.connection.id, new UCRClient(clientData.clientID, connection, gameID, userData.userID));
            if (clientData.gameID !== undefined) {
                gameIDTOUCRGameData.get(clientData.gameID)!.clientIDs.add(clientData.clientID);
            }

            clientIDs.add(clientData.clientID);
        });

        userIDToUCRUser.set(userData.userID, new UCRUser(userData.userID, userData.username, clientIDs));
    });

    expect(uncircularreferenceifyConnectionIDToClient(serverManager.connectionIDToClient)).toEqual(connectionIDToUCRClient);
    expect(uncircularreferenceifyUserIDToUser(serverManager.userIDToUser)).toEqual(userIDToUCRUser);
    expect(uncircularreferenceifyGameIDToGameData(serverManager.gameIDToGameData)).toEqual(gameIDTOUCRGameData);
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

async function connectToServer(server: TestServer, username: string) {
    const connection = new TestConnection(username);
    server.openConnection(connection);
    connection.sendMessage([0, username, '', []]);
    await new Promise(resolve => setTimeout(resolve, 0));

    return connection;
}

async function expectKicksClientDueToInvalidMessage(message: any[]) {
    const { server } = getServerManagerAndStuff();

    const connection = await connectToServer(server, 'user 1');
    connection.clearReceivedMessages();

    connection.sendMessage(message);

    expect(connection.receivedMessages.length).toBe(1);
    expect(connection.receivedMessages[0]).toEqual([[MessageToClient.FatalError, ErrorCode.InvalidMessage]]);
    expect(connection.closed).toBe(true);
}
