import 'dotenv/config';
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
    parseInt(process.env.VITE_VERSION ?? '0', 10),
    parseInt(process.env.LOG_TIME ?? '0', 10),
  );
  serverCommunication.begin();

  setInterval(() => {
    server.lobbyRoom.sendQueuedEvents();
  }, 500);
}

main();
