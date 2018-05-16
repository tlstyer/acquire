import * as http from 'http';
import * as sockjs from 'sockjs';

import { Manager } from './manager';

const sockjsServer = sockjs.createServer({
    sockjs_url: 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.4/sockjs.min.js',
});
const httpServer = http.createServer();
sockjsServer.installHandlers(httpServer, { prefix: '/sockjs' });
httpServer.listen(9999, '0.0.0.0');

const manager = new Manager(sockjsServer);
manager.manage();
