import type { ServerCommunication } from './serverCommunication';

export class Server {
	constructor(private serverCommunication: ServerCommunication) {
		serverCommunication.setCallbacks(
			this.onConnect.bind(this),
			this.onDisconnect.bind(this),
			this.onMessage.bind(this),
		);
	}

	onConnect(clientID: number) {}

	onDisconnect(clientID: number) {}

	onMessage(clientID: number, message: Uint8Array) {}
}
