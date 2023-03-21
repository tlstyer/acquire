import { PB_MessagesToClient } from '../common/pb';
import type { ServerCommunication } from './serverCommunication';

export class Server {
	private initialMessage: Uint8Array;

	constructor(private serverCommunication: ServerCommunication, version: number, logTime: number) {
		serverCommunication.setCallbacks(
			this.onConnect.bind(this),
			this.onDisconnect.bind(this),
			this.onMessage.bind(this),
		);

		this.initialMessage = PB_MessagesToClient.toBinary({
			messagesToClient: [
				{
					initial: {
						version,
						logTime,
					},
				},
			],
		});
	}

	private onConnect(clientID: number) {
		this.serverCommunication.sendMessage(clientID, this.initialMessage);
	}

	private onDisconnect(clientID: number) {}

	private onMessage(clientID: number, message: Uint8Array) {}
}
