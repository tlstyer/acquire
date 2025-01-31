import 'dotenv/config';
import { parseDecimalInteger } from '../common/helpers';
import { Server } from './server';
import { WebSocketServerCommunication } from './serverCommunication';
import { TestUserDataProvider } from './userDataProvider';

function main() {
  const serverCommunication = new WebSocketServerCommunication();
  const userDataProvider = new TestUserDataProvider();

  userDataProvider.createUser('username', 'password');

  const server = new Server(
    serverCommunication,
    userDataProvider,
    parseDecimalInteger(process.env.VITE_VERSION) ?? 0,
    parseDecimalInteger(process.env.LOG_TIME) ?? 0,
  );
  serverCommunication.begin();

  setInterval(() => {
    server.lobbyRoom.sendQueuedEvents();
  }, 500);
}

main();
