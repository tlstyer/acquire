import * as http from 'http';
import * as sockjs from 'sockjs';

import { Manager } from './manager';
import { TestUserDataProvider } from './userDataProvider';

const sockjsServer = sockjs.createServer({
    sockjs_url: 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.4/sockjs.min.js',
});
const httpServer = http.createServer();
sockjsServer.installHandlers(httpServer, { prefix: '/sockjs' });
httpServer.listen(9999, '0.0.0.0');

const userDataProvider = new TestUserDataProvider();

const manager = new Manager(sockjsServer, userDataProvider);
manager.manage();
