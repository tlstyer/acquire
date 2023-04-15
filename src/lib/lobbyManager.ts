import { writable } from 'svelte/store';
import {
	PB_MessageToClient_Lobby,
	PB_MessageToClient_Lobby_Event,
	PB_MessageToClient_Lobby_Event_AddUserToLobby,
	PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
	PB_MessageToClient_Lobby_LastStateCheckpoint,
	PB_MessageToServer,
} from '../common/pb';
import type { Client } from './client';

export class LobbyManager {
	lastEventIndex = 0;

	userIDToUsername = new Map<number, string>();
	userIDs = new Set<number>();

	private connectedWritableStore = writable(false);
	connectedStore = { subscribe: this.connectedWritableStore.subscribe };

	constructor(public client: Client) {}

	connect() {
		this.connectedWritableStore.set(false);

		this.client.clientCommunication.sendMessage(this.getConnectMessage());
	}

	getConnectMessage() {
		return PB_MessageToServer.toBinary({
			lobby: {
				connect: {
					lastEventIndex: this.lastEventIndex,
				},
			},
		});
	}

	onMessage(message: PB_MessageToClient_Lobby) {
		if (message.lastStateCheckpoint) {
			this.onMessage_LastStateCheckpoint(message.lastStateCheckpoint);
		}
		if (message.events.length > 0) {
			this.onMessage_Events(message.events);
		}

		this.connectedWritableStore.set(true);
	}

	onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
		this.userIDToUsername.clear();
		this.userIDs.clear();

		const users = message.users;
		for (let i = 0; i < users.length; i++) {
			const user = users[i];

			this.userIDToUsername.set(user.userId, user.username);
			if (user.isInLobby) {
				this.userIDs.add(user.userId);
			}
		}

		this.lastEventIndex = message.lastEventIndex;
	}

	onMessage_Events(events: PB_MessageToClient_Lobby_Event[]) {
		for (let i = 0; i < events.length; i++) {
			const event = events[i];

			if (event.addUserToLobby) {
				this.onMessage_Event_AddUserToLobby(event.addUserToLobby);
			} else if (event.removeUserFromLobby) {
				this.onMessage_Event_RemoveUserFromLobby(event.removeUserFromLobby);
			}
		}

		this.lastEventIndex += events.length;
	}

	onMessage_Event_AddUserToLobby(event: PB_MessageToClient_Lobby_Event_AddUserToLobby) {
		if (event.username) {
			this.userIDToUsername.set(event.userId, event.username);
		}

		this.userIDs.add(event.userId);
	}

	onMessage_Event_RemoveUserFromLobby(event: PB_MessageToClient_Lobby_Event_RemoveUserFromLobby) {
		this.userIDs.delete(event.userId);
	}
}
