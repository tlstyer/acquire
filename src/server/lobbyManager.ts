import {
	PB_MessageToClient,
	PB_MessageToServer_Lobby,
	PB_MessageToServer_Lobby_Connect,
} from '../common/pb';
import type { Server } from './server';

export class LobbyManager {
	clientIDs = new Set<number>();

	lastEventIndex = 2; // need a gap between first event index and what clients initially say they have

	lastStateCheckpointMessage: Uint8Array;

	noUpdatesMessage: Uint8Array;

	constructor(private server: Server) {
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

	onDisconnect(clientID: number) {
		this.clientIDs.delete(clientID);
	}

	onMessage(clientID: number, message: PB_MessageToServer_Lobby) {
		if (message.connect) {
			this.onMessage_Connect(clientID, message.connect);
		}
	}

	onMessage_Connect(clientID: number, message: PB_MessageToServer_Lobby_Connect) {
		this.clientIDs.add(clientID);

		if (message.lastEventIndex + 1 < this.lastEventIndex) {
			this.server.serverCommunication.sendMessage(clientID, this.lastStateCheckpointMessage);
		} else {
			this.server.serverCommunication.sendMessage(clientID, this.noUpdatesMessage);
		}
	}
}
