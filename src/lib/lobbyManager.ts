import { writable } from 'svelte/store';
import {
	PB_MessageToClient_Lobby,
	PB_MessageToClient_Lobby_LastStateCheckpoint,
	PB_MessageToServer,
} from '../common/pb';
import type { Client } from './client';

export class LobbyManager {
	lastEventIndex = 0;

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

		this.connectedWritableStore.set(true);
	}

	onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
		this.lastEventIndex = message.lastEventIndex;
	}
}
