import http from 'http';
import { type WebSocket, WebSocketServer } from 'ws';
import { ReuseIdManager } from './reuseIdManager.js';
import { ServerCommunication } from './serverCommunication.js';

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
