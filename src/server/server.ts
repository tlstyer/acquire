import {
	cleanUpWhitespaceInUsername,
	createLoginLogoutMessage,
	isValidPassword,
	isValidUsername,
} from '../common/helpers';
import {
	PB_MessageToClient,
	PB_MessageToClient_LoginLogout_ResponseCode,
	PB_MessageToServer,
	PB_MessageToServer_LoginLogout,
	PB_MessageToServer_LoginLogout_CreateUserAndLogin,
	PB_MessageToServer_LoginLogout_LoginWithPassword,
	PB_MessageToServer_LoginLogout_LoginWithToken,
} from '../common/pb';
import type { ServerCommunication } from './serverCommunication';
import type { UserData, UserDataProvider } from './userDataProvider';

export class Server {
	private initialMessage: Uint8Array;

	clientIDs = new Set<number>();
	clientIDsThatAreLoggingInOrOut = new Set<number>();
	clientIDToUserID = new Map<number, number>();
	userIDToUsername = new Map<number, string>();

	constructor(
		private serverCommunication: ServerCommunication,
		private userDataProvider: UserDataProvider,
		version: number,
		logTime: number,
	) {
		serverCommunication.setCallbacks(
			this.onConnect.bind(this),
			this.onDisconnect.bind(this),
			this.onMessage.bind(this),
		);

		this.initialMessage = PB_MessageToClient.toBinary({
			initial: {
				version,
				logTime,
			},
		});
	}

	private onConnect(clientID: number) {
		this.clientIDs.add(clientID);

		this.serverCommunication.sendMessage(clientID, this.initialMessage);
	}

	private onDisconnect(clientID: number) {
		this.makeLogoutDataChanges(clientID);

		this.clientIDs.delete(clientID);
	}

	private onMessage(clientID: number, message: Uint8Array) {
		const messageToServer = PB_MessageToServer.fromBinary(message);

		if (messageToServer.loginLogout) {
			this.onMessage_LoginLogout(clientID, messageToServer.loginLogout);
		}
	}

	private async onMessage_LoginLogout(clientID: number, message: PB_MessageToServer_LoginLogout) {
		if (this.clientIDsThatAreLoggingInOrOut.has(clientID)) {
			// ignore attempt to login or logout while already attempting to do so
			return;
		}

		this.clientIDsThatAreLoggingInOrOut.add(clientID);

		if (message.loginWithPassword) {
			await this.onMessage_LoginLogout_LoginWithPassword(clientID, message.loginWithPassword);
		} else if (message.loginWithToken) {
			await this.onMessage_LoginLogout_LoginWithToken(clientID, message.loginWithToken);
		} else if (message.createUserAndLogin) {
			await this.onMessage_LoginLogout_CreateUserAndLogin(clientID, message.createUserAndLogin);
		} else if (message.logout) {
			this.onMessage_LoginLogout_Logout(clientID);
		}

		this.clientIDsThatAreLoggingInOrOut.delete(clientID);
	}

	private async onMessage_LoginLogout_LoginWithPassword(
		clientID: number,
		message: PB_MessageToServer_LoginLogout_LoginWithPassword,
	) {
		if (this.clientIDToUserID.has(clientID)) {
			// ignore attempt to login while already logged in
			return;
		}

		const username = cleanUpWhitespaceInUsername(message.username);

		const userDataProviderResponse = await this.userDataProvider.lookupUser(username);

		if (userDataProviderResponse.errorCode !== undefined) {
			this.sendLoginLogoutMessage(clientID, userDataProviderResponse.errorCode);
			return;
		}

		if (!userDataProviderResponse.userData) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND,
			);
			return;
		}

		if (!userDataProviderResponse.userData.verifyPassword(message.password)) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.INCORRECT_PASSWORD,
			);
			return;
		}

		this.loginUser(clientID, userDataProviderResponse.userData);
	}

	private async onMessage_LoginLogout_LoginWithToken(
		clientID: number,
		message: PB_MessageToServer_LoginLogout_LoginWithToken,
	) {
		if (this.clientIDToUserID.has(clientID)) {
			// ignore attempt to login while already logged in
			return;
		}

		const username = cleanUpWhitespaceInUsername(message.username);

		const userDataProviderResponse = await this.userDataProvider.lookupUser(username);

		if (userDataProviderResponse.errorCode !== undefined) {
			this.sendLoginLogoutMessage(clientID, userDataProviderResponse.errorCode);
			return;
		}

		if (!userDataProviderResponse.userData) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND,
			);
			return;
		}

		if (!userDataProviderResponse.userData.verifyToken(message.token)) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.INVALID_TOKEN,
			);
			return;
		}

		this.loginUser(clientID, userDataProviderResponse.userData);
	}

	private async onMessage_LoginLogout_CreateUserAndLogin(
		clientID: number,
		message: PB_MessageToServer_LoginLogout_CreateUserAndLogin,
	) {
		if (this.clientIDToUserID.has(clientID)) {
			// ignore attempt to login while already logged in
			return;
		}

		const username = cleanUpWhitespaceInUsername(message.username);

		if (!isValidUsername(username)) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME,
			);
			return;
		}

		if (!isValidPassword(message.password)) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.INVALID_PASSWORD,
			);
			return;
		}

		const userDataProviderResponse = await this.userDataProvider.createUser(
			username,
			message.password,
		);

		if (userDataProviderResponse.errorCode !== undefined) {
			this.sendLoginLogoutMessage(clientID, userDataProviderResponse.errorCode);
			return;
		}

		if (!userDataProviderResponse.userData) {
			this.sendLoginLogoutMessage(
				clientID,
				PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR,
			);
			return;
		}

		this.loginUser(clientID, userDataProviderResponse.userData);
	}

	private loginUser(clientID: number, userData: UserData) {
		this.clientIDToUserID.set(clientID, userData.userID);
		this.userIDToUsername.set(userData.userID, userData.username);

		this.sendLoginLogoutMessage(
			clientID,
			PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
			userData.username,
			userData.userID,
			userData.passwordHash,
		);
	}

	private onMessage_LoginLogout_Logout(clientID: number) {
		if (!this.clientIDToUserID.has(clientID)) {
			// ignore attempt to log out while already logged out
			return;
		}

		this.makeLogoutDataChanges(clientID);

		this.sendLoginLogoutMessage(clientID, PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS);
	}

	private makeLogoutDataChanges(clientID: number) {
		this.clientIDToUserID.delete(clientID);
	}

	private sendLoginLogoutMessage(
		clientID: number,
		responseCode: PB_MessageToClient_LoginLogout_ResponseCode,
		username?: string,
		userID?: number,
		token?: string,
	) {
		this.serverCommunication.sendMessage(
			clientID,
			PB_MessageToClient.toBinary(createLoginLogoutMessage(responseCode, username, userID, token)),
		);
	}
}
