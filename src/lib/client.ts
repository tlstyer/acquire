import { writable } from 'svelte/store';
import {
	PB_MessageToClient,
	PB_MessageToClient_Initial,
	PB_MessageToClient_LoginLogout,
	PB_MessageToClient_LoginLogout_ResponseCode,
	PB_MessageToServer,
} from '../common/pb';
import type { ClientCommunication } from './clientCommunication';

export class Client {
	logTime = 0;

	myUsername: string | undefined;
	myUserID: number | undefined;
	myToken: string | undefined;

	private isConnectedWritableStore = writable(false);
	isConnectedStore = { subscribe: this.isConnectedWritableStore.subscribe };

	loginMessage: Uint8Array | undefined;

	private usernameWritableStore = writable<string>('');
	usernameStore = { subscribe: this.usernameWritableStore.subscribe };
	private loginStateWritableStore = writable(LoginState.LoggedOut);
	loginStateStore = { subscribe: this.loginStateWritableStore.subscribe };
	private loginLogoutResponseCodeWritableStore = writable<
		PB_MessageToClient_LoginLogout_ResponseCode | undefined
	>(undefined);
	loginLogoutResponseCodeStore = { subscribe: this.loginLogoutResponseCodeWritableStore.subscribe };

	constructor(private clientCommunication: ClientCommunication, private version: number) {
		clientCommunication.setCallbacks(
			this.onConnect.bind(this),
			this.onDisconnect.bind(this),
			this.onMessage.bind(this),
		);
	}

	loginWithPassword(username: string, password: string) {
		if (this.loginMessage !== undefined) {
			return;
		}

		this.loginMessage = PB_MessageToServer.toBinary({
			loginLogout: {
				loginWithPassword: {
					username,
					password,
				},
			},
		});

		this.loginStateWritableStore.set(LoginState.TryingToLogIn);
		this.loginLogoutResponseCodeWritableStore.set(undefined);

		this.clientCommunication.sendMessage(this.loginMessage);
	}

	loginWithToken(username: string, token: string) {
		if (this.loginMessage !== undefined) {
			return;
		}

		this.loginMessage = PB_MessageToServer.toBinary({
			loginLogout: {
				loginWithToken: {
					username,
					token,
				},
			},
		});

		this.loginStateWritableStore.set(LoginState.TryingToLogIn);
		this.loginLogoutResponseCodeWritableStore.set(undefined);

		this.clientCommunication.sendMessage(this.loginMessage);
	}

	createUserAndLogin(username: string, password: string) {
		if (this.loginMessage !== undefined) {
			return;
		}

		this.loginMessage = PB_MessageToServer.toBinary({
			loginLogout: {
				createUserAndLogin: {
					username,
					password,
				},
			},
		});

		this.loginStateWritableStore.set(LoginState.TryingToLogIn);
		this.loginLogoutResponseCodeWritableStore.set(undefined);

		this.clientCommunication.sendMessage(this.loginMessage);
	}

	logout() {
		if (this.loginMessage === undefined) {
			return;
		}

		this.loginMessage = undefined;

		this.loginStateWritableStore.set(LoginState.TryingToLogOut);
		this.loginLogoutResponseCodeWritableStore.set(undefined);

		this.clientCommunication.sendMessage(
			PB_MessageToServer.toBinary({
				loginLogout: {
					logout: {},
				},
			}),
		);
	}

	private onConnect() {
		this.isConnectedWritableStore.set(true);

		if (this.loginMessage !== undefined) {
			this.clientCommunication.sendMessage(this.loginMessage);
		}
	}

	private onDisconnect() {
		this.isConnectedWritableStore.set(false);
	}

	private onMessage(message: Uint8Array) {
		const messageToClient = PB_MessageToClient.fromBinary(message);

		if (messageToClient.initial) {
			this.onMessage_Initial(messageToClient.initial);
		} else if (messageToClient.loginLogout) {
			this.onMessage_LoginLogout(messageToClient.loginLogout);
		}
	}

	private onMessage_Initial(message: PB_MessageToClient_Initial) {
		if (message.version !== this.version) {
			window.location.reload();
		}

		this.logTime = message.logTime;
	}

	private onMessage_LoginLogout(message: PB_MessageToClient_LoginLogout) {
		if (message.username && message.userId && message.token) {
			this.myUsername = message.username;
			this.myUserID = message.userId;
			this.myToken = message.token;

			this.loginMessage = PB_MessageToServer.toBinary({
				loginLogout: {
					loginWithToken: {
						username: message.username,
						token: message.token,
					},
				},
			});

			this.usernameWritableStore.set(message.username);
			this.loginStateWritableStore.set(LoginState.LoggedIn);
		} else {
			this.myUsername = undefined;
			this.myUserID = undefined;
			this.myToken = undefined;

			this.loginMessage = undefined;

			this.usernameWritableStore.set('');
			this.loginStateWritableStore.set(LoginState.LoggedOut);
		}

		this.loginLogoutResponseCodeWritableStore.set(message.responseCode);
	}
}

export const enum LoginState {
	LoggedOut,
	TryingToLogIn,
	LoggedIn,
	TryingToLogOut,
}
