import { PB_MessageToClient, PB_MessageToServer } from '../common/pb';
import {
  TestServerCommunicatedMessage,
  type TestServerCommunication,
} from '../server/serverCommunication';

export abstract class ClientCommunication {
  protected onConnect = () => {};
  protected onDisconnect = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMessage = (message: Uint8Array) => {};

  setCallbacks(
    onConnect: () => void,
    onDisconnect: () => void,
    onMessage: (message: Uint8Array) => void,
  ) {
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onMessage = onMessage;
  }

  abstract sendMessage(message: Uint8Array): void;
}

export class WebSocketClientCommunication extends ClientCommunication {
  private running = false;
  private socket: WebSocket | undefined;
  private connected = false;
  private reconnectTimeout: ReturnType<typeof setTimeout> | undefined;

  begin() {
    if (!this.running) {
      this.running = true;

      this.connect();
    }
  }

  end() {
    if (this.running) {
      this.running = false;
      this.socket?.close();
      if (this.reconnectTimeout !== undefined) {
        clearTimeout(this.reconnectTimeout);
      }
    }
  }

  sendMessage(message: Uint8Array) {
    if (this.connected) {
      if (import.meta.env.VITE_LOG_MESSAGES_TO_BROWSER_CONSOLE === 'yes') {
        console.log(
          `%c${uint8ArrayToHexString(message)}\n${JSON.stringify(PB_MessageToServer.fromBinary(message), null, 2)}`,
          'color: green',
        );
      }

      this.socket?.send(message);
    }
  }

  private connect() {
    if (this.running) {
      this.socket = new WebSocket('ws://localhost:9999');

      this.socket.binaryType = 'arraybuffer';

      this.socket.onopen = this.onSocketOpen.bind(this);
      this.socket.onmessage = this.onSocketMessage.bind(this);
      this.socket.onerror = this.onSocketError.bind(this);
      this.socket.onclose = this.onSocketClose.bind(this);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onSocketOpen(ev: Event) {
    this.connected = true;
    this.onConnect();
  }

  private onSocketMessage(ev: MessageEvent) {
    const message = new Uint8Array(ev.data);

    if (import.meta.env.VITE_LOG_MESSAGES_TO_BROWSER_CONSOLE === 'yes') {
      console.log(
        `%c${uint8ArrayToHexString(message)}\n${JSON.stringify(PB_MessageToClient.fromBinary(message), null, 2)}`,
        'color: blue',
      );
    }

    this.onMessage(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onSocketError(ev: Event) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onSocketClose(ev: CloseEvent) {
    if (this.connected) {
      this.connected = false;
      this.onDisconnect();
    }

    this.socket = undefined;

    if (this.running) {
      this.reconnectTimeout = setTimeout(
        () => {
          this.reconnectTimeout = undefined;
          this.connect();
        },
        1000 + 500 * Math.random(),
      );
    }
  }
}

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
      const clientID = this.serverCommunication.clientCommunicationToClientID.get(this);

      if (clientID !== undefined) {
        const messageToServer = PB_MessageToServer.fromBinary(message);

        this.communicatedMessages.push(
          new TestClientCommunicatedMessage(true, message, messageToServer, undefined),
        );
        this.serverCommunication.communicatedMessages.push(
          new TestServerCommunicatedMessage(false, clientID, message, undefined, messageToServer),
        );

        this.serverCommunication.receiveMessage(clientID, message);
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

function uint8ArrayToHexString(uint8Array: Uint8Array) {
  return Array.prototype.map.call(uint8Array, (x) => ('0' + x.toString(16)).slice(-2)).join('');
}
