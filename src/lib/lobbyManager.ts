import {
	PB_MessageToClient_Lobby,
	PB_MessageToClient_Lobby_LastStateCheckpoint,
	PB_MessageToServer,
} from '../common/pb';

export class LobbyManager {
	lastEventIndex = 0;

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
	}

	onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
		this.lastEventIndex = message.lastEventIndex;
	}
}
