import { Connection, Server } from 'sockjs';

export class Manager {
    nextClientID: number = 1;
    clientIDToConnection: Map<number, Connection> = new Map();
    connectionIDToClientID: Map<string, number> = new Map();

    constructor(public server: Server) {}

    manage() {
        this.server.on('connection', connection => {
            this.addConnection(connection);

            connection.on('data', message => {
                connection.write(message);
            });

            connection.on('close', () => {
                this.removeConnection(connection);
            });
        });
    }

    private addConnection(connection: Connection) {
        const clientID = this.nextClientID++;

        this.clientIDToConnection.set(clientID, connection);
        this.connectionIDToClientID.set(connection.id, clientID);
    }

    private removeConnection(connection: Connection) {
        const clientID = this.connectionIDToClientID.get(connection.id);
        if (clientID === undefined) {
            return;
        }

        this.clientIDToConnection.delete(clientID);
        this.connectionIDToClientID.delete(connection.id);
    }
}
