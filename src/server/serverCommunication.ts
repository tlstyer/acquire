import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';
import { PB_MessageToClient, PB_MessageToServer } from '../common/pb';
import {
  TestClientCommunicatedMessage,
  type TestClientCommunication,
} from '../lib/clientCommunication';
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
      //   clientID,
      //   connectionMessage?.headers,
      //   connectionMessage?.socket?.remoteAddress,
      //   connectionMessage?.socket?.remotePort,
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

  communicatedMessages: TestServerCommunicatedMessage[] = [];

  connect(clientCommunication: TestClientCommunication) {
    if (!this.clientCommunicationToClientID.has(clientCommunication)) {
      const clientID = this.nextClientID++;
      this.clientIDToClientCommunication.set(clientID, clientCommunication);
      this.clientCommunicationToClientID.set(clientCommunication, clientID);

      this.onConnect(clientID);

      return true;
    } else {
      return false;
    }
  }

  disconnect(clientCommunication: TestClientCommunication) {
    const clientID = this.clientCommunicationToClientID.get(clientCommunication);
    if (clientID !== undefined) {
      this.clientIDToClientCommunication.delete(clientID);
      this.clientCommunicationToClientID.delete(clientCommunication);

      this.onDisconnect(clientID);

      return true;
    } else {
      return false;
    }
  }

  sendMessage(clientID: number, message: Uint8Array) {
    const clientCommunication = this.clientIDToClientCommunication.get(clientID);

    if (clientCommunication) {
      const messageToClient = PB_MessageToClient.fromBinary(message);

      this.communicatedMessages.push(
        new TestServerCommunicatedMessage(true, clientID, message, messageToClient, undefined),
      );
      clientCommunication.communicatedMessages.push(
        new TestClientCommunicatedMessage(false, message, undefined, messageToClient),
      );

      clientCommunication.receiveMessage(message);
    }
  }

  receiveMessage(clientID: number, message: Uint8Array) {
    this.onMessage(clientID, message);
  }

  logAndEmptyCommunicatedMessages() {
    if (this.communicatedMessages.length > 0) {
      for (const communicatedMessage of this.communicatedMessages) {
        communicatedMessage.log();
      }
      this.communicatedMessages.length = 0;
    }
  }
}

export class TestServerCommunicatedMessage {
  constructor(
    public sent: boolean,
    public clientID: number,
    public message: Uint8Array,
    public sentMessage: PB_MessageToClient | undefined,
    public receivedMessage: PB_MessageToServer | undefined,
  ) {}

  log() {
    if (this.sent) {
      console.log(
        'Sent:',
        this.clientID,
        Buffer.from(this.message).toString('hex'),
        `(${this.message.length} bytes)`,
      );
      console.log(JSON.stringify(this.sentMessage, null, 2));
    } else {
      console.log(
        'Received:',
        this.clientID,
        Buffer.from(this.message).toString('hex'),
        `(${this.message.length} bytes)`,
      );
      console.log(JSON.stringify(this.receivedMessage, null, 2));
    }
  }
}
