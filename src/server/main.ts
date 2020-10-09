import * as http from 'http';
import * as WebSocket from 'ws';
import { setupTextDecoderAndTextEncoder } from '../common/nodeSpecificStuff';
import { ServerManager } from './serverManager';
import { TestUserDataProvider } from './userDataProvider';

setupTextDecoderAndTextEncoder();

const server = http.createServer();
const webSocketServer = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
    webSocketServer.emit('connection', webSocket, request);
  });
});

const userDataProvider = new TestUserDataProvider();
const nextGameID = 1;

const serverManager = new ServerManager(webSocketServer, userDataProvider, nextGameID, console.log);

serverManager.manage();

server.listen(9999, '0.0.0.0');
