import {
	PB_MessageToClient,
	PB_MessageToServer_Lobby,
	PB_MessageToServer_Lobby_Connect,
} from '../common/pb';
import type { Client } from './client';
import { Room } from './room';
import type { Server } from './server';

export class LobbyManager extends Room {
	lastEventIndex = 2; // need a gap between first event index and what clients initially say they have

	lastStateCheckpointMessage: Uint8Array;

	noUpdatesMessage: Uint8Array;

	constructor(private server: Server) {
		super();

		this.lastStateCheckpointMessage = PB_MessageToClient.toBinary(
			PB_MessageToClient.create({
				lobby: {
					lastStateCheckpoint: {
						lastEventIndex: this.lastEventIndex,
					},
				},
			}),
		);

		this.noUpdatesMessage = PB_MessageToClient.toBinary(
			PB_MessageToClient.create({
				lobby: {},
			}),
		);
	}

	onMessage(client: Client, message: PB_MessageToServer_Lobby) {
		if (message.connect) {
			this.onMessage_Connect(client, message.connect);
		}
	}

	onMessage_Connect(client: Client, message: PB_MessageToServer_Lobby_Connect) {
		client.connectToRoom(this);

		if (message.lastEventIndex + 1 < this.lastEventIndex) {
			this.server.serverCommunication.sendMessage(client.clientID, this.lastStateCheckpointMessage);
		} else {
			this.server.serverCommunication.sendMessage(client.clientID, this.noUpdatesMessage);
		}
	}
}
