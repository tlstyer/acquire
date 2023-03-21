import { Server } from './server';
import { WebSocketServerCommunication } from './serverCommunication';

const serverCommunication = new WebSocketServerCommunication();
const server = new Server(
	serverCommunication,
	parseInt(process.env.PUBLIC_VERSION ?? '0', 10),
	parseInt(process.env.LOG_TIME ?? '0', 10),
);
serverCommunication.begin();
