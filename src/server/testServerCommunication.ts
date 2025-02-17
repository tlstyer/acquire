import {
  TestClientCommunicatedMessage,
  type TestClientCommunication,
} from '../client/testClientCommunication.js';
import { PB_MessageToClient, type PB_MessageToServer } from '../common/pb.js';
import { ServerCommunication } from './serverCommunication.js';

export class TestServerCommunication extends ServerCommunication {
  nextClientId = 1;
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
