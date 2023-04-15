import { writable } from 'svelte/store';
import {
	PB_MessageToClient_Lobby,
	PB_MessageToClient_Lobby_Event,
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
		if (message.events.length > 0) {
			this.onMessage_Events(message.events);
		}

		this.connectedWritableStore.set(true);
	}

	onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
		this.lastEventIndex = message.lastEventIndex;
	}

	onMessage_Events(events: PB_MessageToClient_Lobby_Event[]) {
		for (let i = 0; i < events.length; i++) {
			const event = events[i];
		}

		this.lastEventIndex += events.length;
	}
}
