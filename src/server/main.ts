import 'dotenv/config';
import { parseDecimalInteger } from '../common/helpers.js';
import { Server } from './server.js';
import { WebSocketServerCommunication } from './serverCommunication.js';
import { TestUserDataProvider } from './userDataProvider.js';

function main() {
  const serverCommunication = new WebSocketServerCommunication();
  const userDataProvider = new TestUserDataProvider();

  const logTime = Math.floor(Date.now() / 1000);

  const server = new Server(
    serverCommunication,
    userDataProvider,
    parseDecimalInteger(process.env.VITE_VERSION) ?? 0,
    logTime,
  );
  serverCommunication.begin();

  setInterval(() => {
    server.lobbyRoom.sendQueuedEvents();
  }, 500);
}

main();
