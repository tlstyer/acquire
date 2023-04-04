import { Client } from '$lib/client';
import { TestClientCommunication } from '$lib/clientCommunication';
import { describe, expect, test, vi } from 'vitest';
import { createLoginLogoutMessage } from '../common/helpers';
import {
	PB_MessageToClient,
	PB_MessageToClient_LoginLogout_ResponseCode,
	PB_MessageToServer,
} from '../common/pb';
import { Server } from './server';
import { TestServerCommunication } from './serverCommunication';
import { getPasswordHash, TestUserData, TestUserDataProvider } from './userDataProvider';

describe('Connect', () => {
	test('client should reload window when version is different', () => {
		const mock = vi.fn();
		// @ts-expect-error
		global.location = { reload: mock };

		const serverCommunication = new TestServerCommunication();
		const userDataProvider = new TestUserDataProvider();
		new Server(serverCommunication, userDataProvider, 2, 123);

		const clientCommunication = new TestClientCommunication(serverCommunication);
		new Client(clientCommunication, 1);

		clientCommunication.connect();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(mock).toHaveBeenCalledOnce();
	});

	test('client should not reload window when version is the same', () => {
		const mock = vi.fn();
		// @ts-expect-error
		global.location = { reload: mock };

		const { clientCommunication, serverCommunication } = createOneClientConnectedToOneServer();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(mock).not.toHaveBeenCalled();
	});

	test("client's logTime is set to server's logTime", () => {
		const { client, clientCommunication, serverCommunication } =
			createOneClientConnectedToOneServer();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(client.logTime).toBe(123);
	});

	function expectInitialMessageToBeCorrect(
		clientCommunication: TestClientCommunication,
		serverCommunication: TestServerCommunication,
	) {
		const message = PB_MessageToClient.create({
			initial: {
				version: 2,
				logTime: 123,
			},
		});

		expect(clientCommunication.communicatedMessages.length).toBe(1);
		expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual(message);

		expect(serverCommunication.communicatedMessages.length).toBe(1);
		expect(serverCommunication.communicatedMessages[0].clientID).toBe(0);
		expect(serverCommunication.communicatedMessages[0].sentMessage).toEqual(message);
	}
});

describe('Login / Create User / Logout', () => {
	describe('login with password', () => {
		testLogin(
			'error from user data provider is sent to client and user stays logged out',
			(client) => client.loginWithPassword('lookupUser error', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR),
			0,
		);

		testLogin(
			'user not found and user stays logged out',
			(client) => client.loginWithPassword('user that is not in database', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND),
			0,
		);

		testLogin(
			'incorrect password and user stays logged out',
			(client) => client.loginWithPassword('user 1', 'incorrect password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INCORRECT_PASSWORD),
			0,
		);

		testLogin(
			'correct password and is logged in',
			(client) => client.loginWithPassword('user 1', 'password'),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'user 1',
				1,
				userIDToTestUserData[1].passwordHash,
			),
			1,
		);

		testLogin(
			'correct password and is logged in after whitespace in username is cleaned up',
			(client) => client.loginWithPassword('\t user\n \t\v1\v ', 'password'),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'user 1',
				1,
				userIDToTestUserData[1].passwordHash,
			),
			1,
		);

		test('no message sent when trying to login with password while already logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithPassword('user 1', 'password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.loginWithPassword('user 1', 'password');
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(0);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(1);
		});

		test('no reply when trying to login with password while already logged in when sending message client would not send', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithPassword('user 1', 'password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			clientCommunication.sendMessage(
				PB_MessageToServer.toBinary({
					loginLogout: {
						loginWithPassword: {
							username: 'user 1',
							password: 'password',
						},
					},
				}),
			);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(1);
		});
	});

	describe('login with token', () => {
		testLogin(
			'error from user data provider is sent to client and user stays logged out',
			(client) => client.loginWithToken('lookupUser error', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR),
			0,
		);

		testLogin(
			'user not found and user stays logged out',
			(client) => client.loginWithToken('user that is not in database', 'token'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND),
			0,
		);

		testLogin(
			'incorrect password and user stays logged out',
			(client) => client.loginWithToken('user 1', 'incorrect token'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_TOKEN),
			0,
		);

		testLogin(
			'correct password and is logged in',
			(client) => client.loginWithToken('user 1', userIDToTestUserData[1].passwordHash),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'user 1',
				1,
				userIDToTestUserData[1].passwordHash,
			),
			1,
		);

		testLogin(
			'correct password and is logged in after whitespace in username is cleaned up',
			(client) => client.loginWithToken('\t user\n \t\v1\v ', userIDToTestUserData[1].passwordHash),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'user 1',
				1,
				userIDToTestUserData[1].passwordHash,
			),
			1,
		);

		test('no message sent when trying to login with token while already logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithToken('user 1', userIDToTestUserData[1].passwordHash);
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.loginWithToken('user 1', userIDToTestUserData[1].passwordHash);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(0);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(1);
		});

		test('no reply when trying to login with token while already logged in when sending message client would not send', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithToken('user 1', userIDToTestUserData[1].passwordHash);
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			clientCommunication.sendMessage(
				PB_MessageToServer.toBinary({
					loginLogout: {
						loginWithToken: {
							username: 'user 1',
							token: userIDToTestUserData[1].passwordHash,
						},
					},
				}),
			);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(1);
		});
	});

	describe('create user and login', () => {
		testLogin(
			'username of length 0 is an invalid username',
			(client) => client.createUserAndLogin('', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
			0,
		);

		testLogin(
			'username of length 33 is an invalid username',
			(client) => client.createUserAndLogin('123456789012345678901234567890123', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
			0,
		);

		testLogin(
			'username with a non-ASCII character is an invalid username',
			(client) => client.createUserAndLogin('123😀', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
			0,
		);

		testLogin(
			'username with just spaces is an invalid username',
			(client) => client.createUserAndLogin('    ', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
			0,
		);

		testLogin(
			'password of length 7 is an invalid password',
			(client) => client.createUserAndLogin('username', '1234567'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_PASSWORD),
			0,
		);

		testLogin(
			'error from user data provider is sent to client and user stays logged out',
			(client) => client.createUserAndLogin('createUser error', 'password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR),
			0,
		);

		testLogin(
			'cannot create a user if user already exists',
			(client) => client.createUserAndLogin('user 1', 'some other password'),
			createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.USER_EXISTS),
			0,
		);

		testLogin(
			'can create a new user and be logged in',
			(client) => client.createUserAndLogin('username', 'super secret password'),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'username',
				numTestUsers + 1,
				getPasswordHash('username', 'super secret password'),
			),
			1,
		);

		testLogin(
			'can create a new user and be logged in after whitespace in username is cleaned up',
			(client) => client.createUserAndLogin('\t user\n \t\vname\v ', 'super secret password'),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'user name',
				numTestUsers + 1,
				getPasswordHash('user name', 'super secret password'),
			),
			1,
		);

		test('no message sent when trying to create user and login while already logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.createUserAndLogin('username', 'super secret password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.createUserAndLogin('username', 'super secret password');
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(0);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(1);
		});

		test('no reply when trying to create user and login while already logged in when sending message client would not send', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.createUserAndLogin('username', 'super secret password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			clientCommunication.sendMessage(
				PB_MessageToServer.toBinary({
					loginLogout: {
						createUserAndLogin: {
							username: 'username',
							password: 'super secret password',
						},
					},
				}),
			);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(1);
		});
	});

	describe('logout', () => {
		test('can log out while logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.createUserAndLogin('username', 'super secret password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.logout();
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(2);
			expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
				createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS),
			);

			expect(client.myUsername).toEqual(undefined);
			expect(client.myUserID).toEqual(undefined);
			expect(client.myToken).toEqual(undefined);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(0);
		});

		test('logout data changes are made on the server when a client disconnects', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithToken('user 4', userIDToTestUserData[4].passwordHash);
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			clientCommunication.disconnect();
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(0);

			expect(client.myUsername).toEqual('user 4');
			expect(client.myUserID).toEqual(4);
			expect(client.myToken).toEqual(userIDToTestUserData[4].passwordHash);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(0);
		});

		test('no message sent when trying to log out while already logged out', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			clientCommunication.communicatedMessages.length = 0;

			client.logout();
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(0);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(0);
		});

		test('no reply when trying to log out while already logged out when sending message client would not send', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			clientCommunication.communicatedMessages.length = 0;

			clientCommunication.sendMessage(
				PB_MessageToServer.toBinary({
					loginLogout: {
						logout: {},
					},
				}),
			);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(0);
		});
	});

	function testLogin(
		name: string,
		login: (client: Client) => void,
		expectedMessageToClient: PB_MessageToClient,
		clientIDToUserIDSize: number,
	) {
		test(name, async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			clientCommunication.communicatedMessages.length = 0;

			login(client);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(2);
			expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
				expectedMessageToClient,
			);

			const loginLogoutMessage = expectedMessageToClient.loginLogout!;
			expect(client.myUsername).toEqual(
				loginLogoutMessage.username !== '' ? loginLogoutMessage.username : undefined,
			);
			expect(client.myUserID).toEqual(
				loginLogoutMessage.userId !== 0 ? loginLogoutMessage.userId : undefined,
			);
			expect(client.myToken).toEqual(
				loginLogoutMessage.token !== '' ? loginLogoutMessage.token : undefined,
			);

			expect(
				[...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length,
			).toBe(clientIDToUserIDSize);
		});
	}
});

describe('lobby', () => {
	test('connect to lobby in its initial state', () => {
		const { client, clientCommunication, server, serverCommunication, userDataProvider } =
			createOneClientConnectedToOneServer();
		clientCommunication.communicatedMessages.length = 0;

		expect(client.lobbyManager.lastEventIndex).toBe(0);

		client.connectToLobby();

		expect(client.lobbyManager.lastEventIndex).toBe(2);
		expect(clientCommunication.communicatedMessages.length).toBe(2);
		expect(clientCommunication.communicatedMessages[0].sentMessage).toEqual(
			PB_MessageToServer.create({
				lobby: {
					connect: {
						lastEventIndex: 0,
					},
				},
			}),
		);
		expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
			PB_MessageToClient.create({
				lobby: {
					lastStateCheckpoint: {
						lastEventIndex: 2,
					},
				},
			}),
		);
		clientCommunication.communicatedMessages.length = 0;

		expect([...server.lobbyManager.clients].map((c) => c.clientID)).toEqual([0]);

		clientCommunication.disconnect();

		expect(server.lobbyManager.clients.size).toBe(0);

		clientCommunication.connect();

		expect(client.lobbyManager.lastEventIndex).toBe(2);
		expect(clientCommunication.communicatedMessages.length).toBe(3);
		expect(clientCommunication.communicatedMessages[1].sentMessage).toEqual(
			PB_MessageToServer.create({
				lobby: {
					connect: {
						lastEventIndex: 2,
					},
				},
			}),
		);
		expect(clientCommunication.communicatedMessages[2].receivedMessage).toEqual(
			PB_MessageToClient.create({
				lobby: {},
			}),
		);
		clientCommunication.communicatedMessages.length = 0;

		expect([...server.lobbyManager.clients].map((c) => c.clientID)).toEqual([1]);
	});
});

const numTestUsers = 7;
const userIDToTestUserData = [new TestUserData('', 0, '')];
for (let userID = 1; userID <= numTestUsers; userID++) {
	const username = `user ${userID}`;
	userIDToTestUserData.push(
		new TestUserData(username, userID, getPasswordHash(username, 'password')),
	);
}

function createOneClientConnectedToOneServer() {
	const userDataProvider = new TestUserDataProvider();

	for (let userID = 1; userID <= numTestUsers; userID++) {
		const userData = userIDToTestUserData[userID];
		userDataProvider.usernameToUserData.set(userData.username, userData);
	}
	userDataProvider.nextUserID = numTestUsers + 1;

	const serverCommunication = new TestServerCommunication();
	const server = new Server(serverCommunication, userDataProvider, 2, 123);

	const clientCommunication = new TestClientCommunication(serverCommunication);
	const client = new Client(clientCommunication, 2);

	clientCommunication.connect();

	return { client, clientCommunication, server, serverCommunication, userDataProvider };
}

async function waitForAsyncServerStuff() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}
