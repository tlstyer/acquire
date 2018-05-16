import * as http from 'http';
import * as sockjs from 'sockjs';

const echo = sockjs.createServer({
    sockjs_url: 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.4/sockjs.min.js',
});

echo.on('connection', function(conn) {
    conn.on('data', function(message) {
        conn.write(message);
    });

    conn.on('close', function() {});
});

const server = http.createServer();
echo.installHandlers(server, { prefix: '/sockjs' });
server.listen(9999, '0.0.0.0');
