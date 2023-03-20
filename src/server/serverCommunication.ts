import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import type { TestClientCommunication } from '../lib/clientCommunication';
import { ReuseIDManager } from './reuseIDManager';

export abstract class ServerCommunication {
	protected onConnect = (clientID: number) => {};
	protected onDisconnect = (clientID: number) => {};
	protected onMessage = (clientID: number, message: Uint8Array) => {};

	setCallbacks(
		onConnect: (clientID: number) => void,
		onDisconnect: (clientID: number) => void,
		onMessage: (clientID: number, message: Uint8Array) => void,
	) {
		this.onConnect = onConnect;
		this.onDisconnect = onDisconnect;
		this.onMessage = onMessage;
	}

	abstract sendMessage(clientID: number, message: Uint8Array): void;
}

export class WebSocketServerCommunication extends ServerCommunication {
	nextClientID = new ReuseIDManager(60000);
	clientIDToWebSocket = new Map<number, WebSocket>();

	begin() {
		const server = http.createServer();
		const webSocketServer = new WebSocketServer({ noServer: true });

		server.on('upgrade', (request, socket, head) => {
			webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
				webSocketServer.emit('connection', webSocket, request);
			});
		});

		webSocketServer.on('connection', (webSocket, connectionMessage) => {
			const clientID = this.nextClientID.getID();
			this.clientIDToWebSocket.set(clientID, webSocket);

			// console.log(
			// 	clientID,
			// 	connectionMessage?.headers,
			// 	connectionMessage?.socket?.remoteAddress,
			// 	connectionMessage?.socket?.remotePort,
			// );

			this.onConnect(clientID);

			webSocket.on('message', (message) => {
				// @ts-expect-error
				const uint8Array = new Uint8Array(message);

				this.onMessage(clientID, uint8Array);
			});

			webSocket.on('close', () => {
				this.nextClientID.returnID(clientID);
				this.clientIDToWebSocket.delete(clientID);

				this.onDisconnect(clientID);
			});
		});

		server.listen(9999, '0.0.0.0');
	}

	sendMessage(clientID: number, message: Uint8Array) {
		this.clientIDToWebSocket.get(clientID)?.send(message);
	}
}

export class TestServerCommunication extends ServerCommunication {
	nextClientID = 0;
	clientIDToClientCommunication = new Map<number, TestClientCommunication>();
	clientCommunicationToClientID = new Map<TestClientCommunication, number>();

	connect(clientCommunication: TestClientCommunication) {
		if (!this.clientCommunicationToClientID.has(clientCommunication)) {
			const clientID = this.nextClientID++;
			this.clientIDToClientCommunication.set(clientID, clientCommunication);
			this.clientCommunicationToClientID.set(clientCommunication, clientID);

			this.onConnect(clientID);
		}
	}

	disconnect(clientCommunication: TestClientCommunication) {
		const clientID = this.clientCommunicationToClientID.get(clientCommunication);
		if (clientID !== undefined) {
			this.clientIDToClientCommunication.delete(clientID);
			this.clientCommunicationToClientID.delete(clientCommunication);

			this.onDisconnect(clientID);
		}
	}

	receiveMessage(clientCommunication: TestClientCommunication, message: Uint8Array) {
		const clientID = this.clientCommunicationToClientID.get(clientCommunication);
		if (clientID !== undefined) {
			this.onMessage(clientID, message);
		}
	}

	sendMessage(clientID: number, message: Uint8Array) {
		this.clientIDToClientCommunication.get(clientID)?.receiveMessage(message);
	}
}
