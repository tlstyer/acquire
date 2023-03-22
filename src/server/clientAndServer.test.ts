import { Client } from '$lib/client';
import { TestClientCommunication } from '$lib/clientCommunication';
import * as libHelpers from '$lib/helpers';
import { describe, expect, test, vi } from 'vitest';
import { createLoginLogoutMessage } from '../common/helpers';
import { PB_MessagesToClient, PB_MessageToClient_LoginLogout_ResponseCode } from '../common/pb';
import { Server } from './server';
import { TestServerCommunication } from './serverCommunication';
import { getPasswordHash, TestUserData, TestUserDataProvider } from './userDataProvider';

describe('Connect', () => {
	test('client should reload window when version is different', () => {
		const spy = vi.spyOn(libHelpers, 'reloadWindow').mockReturnValue();

		const serverCommunication = new TestServerCommunication();
		const userDataProvider = new TestUserDataProvider();
		new Server(serverCommunication, userDataProvider, 2, 123);

		const clientCommunication = new TestClientCommunication(serverCommunication);
		new Client(clientCommunication, 1);

		clientCommunication.connect();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(spy).toHaveBeenCalledOnce();
	});

	test('client should not reload window when version is the same', () => {
		const spy = vi.spyOn(libHelpers, 'reloadWindow').mockReturnValue();

		const { clientCommunication, serverCommunication } = createOneClientConnectedToOneServer();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(spy).not.toHaveBeenCalled();
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
		const message = PB_MessagesToClient.create({
			messagesToClient: [
				{
					initial: {
						version: 2,
						logTime: 123,
					},
				},
			],
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
				userIDToCorrectToken[1],
			),
			1,
		);

		test('no reply when trying to login with password while already logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithPassword('user 1', 'password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.loginWithPassword('user 1', 'password');
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(server.clientIDToUserID.size).toBe(1);
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
			(client) => client.loginWithToken('user 1', userIDToCorrectToken[1]),
			createLoginLogoutMessage(
				PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
				'user 1',
				1,
				userIDToCorrectToken[1],
			),
			1,
		);

		test('no reply when trying to login with token while already logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.loginWithToken('user 1', userIDToCorrectToken[1]);
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.loginWithToken('user 1', userIDToCorrectToken[1]);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(server.clientIDToUserID.size).toBe(1);
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

		test('no reply when trying to create user and login while already logged in', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			client.createUserAndLogin('username', 'super secret password');
			await waitForAsyncServerStuff();

			clientCommunication.communicatedMessages.length = 0;

			client.createUserAndLogin('username', 'super secret password');
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(server.clientIDToUserID.size).toBe(1);
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

			expect(server.clientIDToUserID.size).toBe(0);
		});

		test('no reply when trying to log out while already logged out', async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			clientCommunication.communicatedMessages.length = 0;

			client.logout();
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(1);

			expect(server.clientIDToUserID.size).toBe(0);
		});
	});

	function testLogin(
		name: string,
		login: (client: Client) => void,
		expectedMessagesToClient: PB_MessagesToClient,
		clientIDToUserIDSize: number,
	) {
		test(name, async () => {
			const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

			clientCommunication.communicatedMessages.length = 0;

			login(client);
			await waitForAsyncServerStuff();

			expect(clientCommunication.communicatedMessages.length).toBe(2);
			expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
				expectedMessagesToClient,
			);

			const loginLogoutMessage = expectedMessagesToClient.messagesToClient[0].loginLogout!;
			expect(client.myUsername).toEqual(
				loginLogoutMessage.username !== '' ? loginLogoutMessage.username : undefined,
			);
			expect(client.myUserID).toEqual(
				loginLogoutMessage.userId !== 0 ? loginLogoutMessage.userId : undefined,
			);
			expect(client.myToken).toEqual(
				loginLogoutMessage.token !== '' ? loginLogoutMessage.token : undefined,
			);

			expect(server.clientIDToUserID.size).toBe(clientIDToUserIDSize);
		});
	}
});

const userIDToCorrectToken = [''];

const numTestUsers = 7;
for (let userID = 1; userID <= numTestUsers; userID++) {
	userIDToCorrectToken.push(getPasswordHash(`user ${userID}`, 'password'));
}

function createOneClientConnectedToOneServer() {
	const userDataProvider = new TestUserDataProvider();

	for (let userID = 1; userID <= numTestUsers; userID++) {
		const username = `user ${userID}`;
		userDataProvider.usernameToUserData.set(
			username,
			new TestUserData(username, userID, userIDToCorrectToken[userID]),
		);
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
