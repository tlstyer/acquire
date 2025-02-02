import http from 'http';
import { type WebSocket, WebSocketServer } from 'ws';
import {
  TestClientCommunicatedMessage,
  type TestClientCommunication,
} from '../client/clientCommunication';
import { PB_MessageToClient, type PB_MessageToServer } from '../common/pb';
import { ReuseIdManager } from './reuseIdManager';

export abstract class ServerCommunication {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onConnect = (clientId: number) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDisconnect = (clientId: number) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMessage = (clientId: number, message: Uint8Array) => {};

  setCallbacks(
    onConnect: (clientId: number) => void,
    onDisconnect: (clientId: number) => void,
    onMessage: (clientId: number, message: Uint8Array) => void,
  ) {
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onMessage = onMessage;
  }

  abstract sendMessage(clientId: number, message: Uint8Array): void;
}

export class WebSocketServerCommunication extends ServerCommunication {
  nextClientId = new ReuseIdManager(60000);
  clientIdToWebSocket = new Map<number, WebSocket>();

  begin() {
    const server = http.createServer();
    const webSocketServer = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
        webSocketServer.emit('connection', webSocket, request);
      });
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webSocketServer.on('connection', (webSocket, connectionMessage) => {
      const clientId = this.nextClientId.getId();
      this.clientIdToWebSocket.set(clientId, webSocket);

      // console.log(
      //   clientId,
      //   connectionMessage?.headers,
      //   connectionMessage?.socket?.remoteAddress,
      //   connectionMessage?.socket?.remotePort,
      // );

      this.onConnect(clientId);

      webSocket.on('message', (message, isBinary) => {
        if (isBinary) {
          // @ts-expect-error message is binary
          const uint8Array = new Uint8Array(message);

          this.onMessage(clientId, uint8Array);
        } else {
          // messages that are not binary are not allowed
          webSocket.close();
        }
      });

      webSocket.on('close', () => {
        this.nextClientId.returnId(clientId);
        this.clientIdToWebSocket.delete(clientId);

        this.onDisconnect(clientId);
      });
    });

    server.listen(9999, '0.0.0.0');
  }

  sendMessage(clientId: number, message: Uint8Array) {
    this.clientIdToWebSocket.get(clientId)?.send(message);
  }
}

export class TestServerCommunication extends ServerCommunication {
  nextClientId = 0;
  clientIdToClientCommunication = new Map<number, TestClientCommunication>();
  clientCommunicationToClientId = new Map<TestClientCommunication, number>();

  communicatedMessages: TestServerCommunicatedMessage[] = [];

  connect(clientCommunication: TestClientCommunication) {
    if (!this.clientCommunicationToClientId.has(clientCommunication)) {
      const clientId = this.nextClientId++;
      this.clientIdToClientCommunication.set(clientId, clientCommunication);
      this.clientCommunicationToClientId.set(clientCommunication, clientId);

      this.onConnect(clientId);

      return true;
    } else {
      return false;
    }
  }

  disconnect(clientCommunication: TestClientCommunication) {
    const clientId = this.clientCommunicationToClientId.get(clientCommunication);
    if (clientId !== undefined) {
      this.clientIdToClientCommunication.delete(clientId);
      this.clientCommunicationToClientId.delete(clientCommunication);

      this.onDisconnect(clientId);

      return true;
    } else {
      return false;
    }
  }

  sendMessage(clientId: number, message: Uint8Array) {
    const clientCommunication = this.clientIdToClientCommunication.get(clientId);

    if (clientCommunication) {
      const messageToClient = PB_MessageToClient.fromBinary(message);

      this.communicatedMessages.push(
        new TestServerCommunicatedMessage(true, clientId, message, messageToClient, undefined),
      );
      clientCommunication.communicatedMessages.push(
        new TestClientCommunicatedMessage(false, message, undefined, messageToClient),
      );

      clientCommunication.receiveMessage(message);
    }
  }

  receiveMessage(clientId: number, message: Uint8Array) {
    this.onMessage(clientId, message);
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
    public clientId: number,
    public message: Uint8Array,
    public sentMessage: PB_MessageToClient | undefined,
    public receivedMessage: PB_MessageToServer | undefined,
  ) {}

  log() {
    if (this.sent) {
      console.log(
        'Sent:',
        this.clientId,
        Buffer.from(this.message).toString('hex'),
        `(${this.message.length} bytes)`,
      );
      console.log(JSON.stringify(this.sentMessage, null, 2));
    } else {
      console.log(
        'Received:',
        this.clientId,
        Buffer.from(this.message).toString('hex'),
        `(${this.message.length} bytes)`,
      );
      console.log(JSON.stringify(this.receivedMessage, null, 2));
    }
  }
}
