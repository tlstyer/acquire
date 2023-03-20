import { Server } from './server';
import { WebSocketServerCommunication } from './serverCommunication';

const serverCommunication = new WebSocketServerCommunication();
const server = new Server(serverCommunication);
serverCommunication.begin();
