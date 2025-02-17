import { type PB_MessageToClient, PB_MessageToServer } from '../common/pb.js';
import {
  TestServerCommunicatedMessage,
  type TestServerCommunication,
} from '../server/testServerCommunication.js';
import { ClientCommunication } from './clientCommunication.js';

export class TestClientCommunication extends ClientCommunication {
  private connected = false;
  communicatedMessages: TestClientCommunicatedMessage[] = [];

  constructor(private serverCommunication: TestServerCommunication) {
    super();
  }

  connect() {
    if (this.serverCommunication.connect(this)) {
      this.connected = true;
      this.onConnect();
    }
  }

  disconnect() {
    if (this.serverCommunication.disconnect(this)) {
      this.connected = false;
      this.onDisconnect();
    }
  }

  sendMessage(message: Uint8Array) {
    if (this.connected) {
      const clientId = this.serverCommunication.clientCommunicationToClientId.get(this);

      if (clientId !== undefined) {
        const messageToServer = PB_MessageToServer.fromBinary(message);

        this.communicatedMessages.push(
          new TestClientCommunicatedMessage(true, message, messageToServer, undefined),
        );
        this.serverCommunication.communicatedMessages.push(
          new TestServerCommunicatedMessage(false, clientId, message, undefined, messageToServer),
        );

        this.serverCommunication.receiveMessage(clientId, message);
      }
    }
  }

  receiveMessage(message: Uint8Array) {
    this.onMessage(message);
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

export class TestClientCommunicatedMessage {
  constructor(
    public sent: boolean,
    public message: Uint8Array,
    public sentMessage: PB_MessageToServer | undefined,
    public receivedMessage: PB_MessageToClient | undefined,
  ) {}

  log() {
    if (this.sent) {
      console.log(
        'Sent:',
        Buffer.from(this.message).toString('hex'),
        `(${this.message.length} bytes)`,
      );
      console.log(JSON.stringify(this.sentMessage, null, 2));
    } else {
      console.log(
        'Received:',
        Buffer.from(this.message).toString('hex'),
        `(${this.message.length} bytes)`,
      );
      console.log(JSON.stringify(this.receivedMessage, null, 2));
    }
  }
}
