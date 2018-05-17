import { ErrorCode, MessageToClient } from '../common/enums';
import { ConnectionState, Manager } from './manager';
import { TestUserDataProvider } from './userDataProvider';

describe('Manager', () => {
    describe('when not sending first message', () => {
        it('can open connections and then close them', () => {
            const [manager, server, userDataProvider] = getManagerAndStuff();

            const connection1 = new DummyConnection('connection ID 1');
            server.openConnection(connection1);

            expect(manager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.WaitingForFirstMessage]]));
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1]]));

            const connection2 = new DummyConnection('connection ID 2');
            server.openConnection(connection2);

            expect(manager.connectionIDToConnectionState).toEqual(
                new Map([[connection1.id, ConnectionState.WaitingForFirstMessage], [connection2.id, ConnectionState.WaitingForFirstMessage]]),
            );
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1], [connection2.id, connection2]]));

            connection1.close();

            expect(manager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));

            connection2.close();

            expect(manager.connectionIDToConnectionState).toEqual(new Map());
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map());
        });

        it('closing already closed connection does nothing', () => {
            const [manager, server, userDataProvider] = getManagerAndStuff();

            const connection1 = new DummyConnection('connection ID 1');
            server.openConnection(connection1);

            expect(manager.connectionIDToConnectionState).toEqual(new Map([[connection1.id, ConnectionState.WaitingForFirstMessage]]));
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1]]));

            const connection2 = new DummyConnection('connection ID 2');
            server.openConnection(connection2);

            expect(manager.connectionIDToConnectionState).toEqual(
                new Map([[connection1.id, ConnectionState.WaitingForFirstMessage], [connection2.id, ConnectionState.WaitingForFirstMessage]]),
            );
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection1.id, connection1], [connection2.id, connection2]]));

            connection1.close();

            expect(manager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));

            connection1.close();

            expect(manager.connectionIDToConnectionState).toEqual(new Map([[connection2.id, ConnectionState.WaitingForFirstMessage]]));
            expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map([[connection2.id, connection2]]));
        });
    });

    describe('when sending first message', () => {
        describe('gets kicked', () => {
            async function getsKickedWithMessage(inputMessage: any, outputErrorCode: ErrorCode) {
                const [manager, server, userDataProvider] = getManagerAndStuff();

                userDataProvider.createUser('has password', 'password');
                userDataProvider.createUser('does not have password', null);

                const connection = new DummyConnection('connection');
                server.openConnection(connection);
                connection.sendMessage(inputMessage);

                await new Promise(resolve => setTimeout(resolve, 0));

                expect(connection.receivedMessages).toEqual([JSON.stringify([MessageToClient.FatalError, outputErrorCode])]);
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
            async function getsLoggedInWithMessage(inputMessage: any, expectedUserID: number) {
                const [manager, server, userDataProvider] = getManagerAndStuff();

                userDataProvider.createUser('has password', 'password');
                userDataProvider.createUser('does not have password', null);

                const connection = new DummyConnection('connection');
                server.openConnection(connection);
                connection.sendMessage(inputMessage);

                await new Promise(resolve => setTimeout(resolve, 0));

                expect(connection.closed).toBe(false);

                expect(manager.connectionIDToConnectionState).toEqual(new Map([[connection.id, ConnectionState.LoggedIn]]));
                expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map());
                expect(manager.clientIDManager.used).toEqual(new Set([1]));
                expect(manager.connectionIDToClientID).toEqual(new Map([[connection.id, 1]]));
                expect(manager.clientIDToConnection).toEqual(new Map([[1, connection]]));
                expect(manager.clientIDToUserID).toEqual(new Map([[1, expectedUserID]]));

                connection.close();

                expect(manager.connectionIDToConnectionState).toEqual(new Map([]));
                expect(manager.connectionIDToPreLoggedInConnection).toEqual(new Map());
                expect(manager.clientIDManager.used).toEqual(new Set());
                expect(manager.connectionIDToClientID).toEqual(new Map());
                expect(manager.clientIDToConnection).toEqual(new Map());
                expect(manager.clientIDToUserID).toEqual(new Map());
            }

            it('after providing correct password', async () => {
                await getsLoggedInWithMessage([0, 'has password', 'password', []], 1);
            });

            it('after not providing a password when it is not set', async () => {
                await getsLoggedInWithMessage([0, 'does not have password', '', []], 2);
            });

            it('after not providing a password when user data does not exist', async () => {
                await getsLoggedInWithMessage([0, 'no user data', '', []], 3);
            });
        });
    });
});

class DummyServer {
    connectionListener: ((conn: DummyConnection) => any) | null = null;

    on(event: string, listener: (conn: DummyConnection) => any) {
        if (event === 'connection') {
            this.connectionListener = listener;
        }
    }

    openConnection(conn: DummyConnection) {
        if (this.connectionListener) {
            this.connectionListener(conn);
        }
    }
}

class DummyConnection {
    dataListener: ((message: string) => any) | null = null;
    closeListener: (() => void) | null = null;

    receivedMessages: string[] = [];
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
        this.receivedMessages.push(message);
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
}

function getManagerAndStuff(): [Manager, DummyServer, TestUserDataProvider] {
    const server = new DummyServer();
    const userDataProvider = new TestUserDataProvider();
    // @ts-ignore
    const manager = new Manager(server, userDataProvider);
    manager.manage();

    return [manager, server, userDataProvider];
}
