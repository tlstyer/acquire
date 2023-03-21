import { PB_MessagesToClient, PB_MessageToClient_Initial } from '../common/pb';
import type { ClientCommunication } from './clientCommunication';
import { reloadWindow } from './helpers';

export class Client {
	logTime = 0;

	constructor(private clientCommunication: ClientCommunication, private version: number) {
		clientCommunication.setCallbacks(
			this.onConnect.bind(this),
			this.onDisconnect.bind(this),
			this.onMessage.bind(this),
		);
	}

	onConnect() {}

	onDisconnect() {}

	onMessage(message: Uint8Array) {
		const messages = PB_MessagesToClient.fromBinary(message).messagesToClient;

		for (const message of messages) {
			if (message.initial) {
				this.onMessage_Initial(message.initial);
			}
		}
	}

	onMessage_Initial(message: PB_MessageToClient_Initial) {
		if (message.version !== this.version) {
			reloadWindow();
		}

		this.logTime = message.logTime;
	}
}
