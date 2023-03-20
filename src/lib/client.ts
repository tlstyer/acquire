import type { ClientCommunication } from './clientCommunication';

export class Client {
	constructor(private clientCommunication: ClientCommunication) {
		clientCommunication.setCallbacks(
			this.onConnect.bind(this),
			this.onDisconnect.bind(this),
			this.onMessage.bind(this),
		);
	}

	onConnect() {}

	onDisconnect() {}

	onMessage(message: Uint8Array) {}
}
