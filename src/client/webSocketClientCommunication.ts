import chalk from 'chalk';
import { isServer } from 'solid-js/web';
import { PB_MessageToClient, PB_MessageToServer } from '../common/pb.js';
import { ClientCommunication } from './clientCommunication.js';

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
      if (
        (isServer
          ? process.env.VITE_LOG_MESSAGES_TO_BROWSER_CONSOLE
          : import.meta.env.VITE_LOG_MESSAGES_TO_BROWSER_CONSOLE) === 'yes'
      ) {
        const string = `${uint8ArrayToHexString(message)}\n${JSON.stringify(PB_MessageToServer.fromBinary(message), null, 2)}`;
        const hexColor = '#008000';

        if (isServer) {
          console.log(chalk.hex(hexColor)(string));
        } else {
          console.log(`%c${string}`, `color: ${hexColor}`);
        }
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

    if (
      (isServer
        ? process.env.VITE_LOG_MESSAGES_TO_BROWSER_CONSOLE
        : import.meta.env.VITE_LOG_MESSAGES_TO_BROWSER_CONSOLE) === 'yes'
    ) {
      const string = `${uint8ArrayToHexString(message)}\n${JSON.stringify(PB_MessageToClient.fromBinary(message), null, 2)}`;
      const hexColor = '#ff0000';

      if (isServer) {
        console.log(chalk.hex(hexColor)(string));
      } else {
        console.log(`%c${string}`, `color: ${hexColor}`);
      }
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

function uint8ArrayToHexString(uint8Array: Uint8Array) {
  return Array.prototype.map.call(uint8Array, (x) => ('0' + x.toString(16)).slice(-2)).join('');
}
