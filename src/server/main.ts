import { setupTextDecoderAndTextEncoder } from '$common/nodeSpecificStuff';
import http from 'http';
import { WebSocketServer } from 'ws';
import { TestUserDataProvider } from './userDataProvider';

setupTextDecoderAndTextEncoder();

const server = http.createServer();
const webSocketServer = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
	webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
		webSocketServer.emit('connection', webSocket, request);
	});
});

const userDataProvider = new TestUserDataProvider();
const nextGameID = 1;

server.listen(9999, '0.0.0.0');
