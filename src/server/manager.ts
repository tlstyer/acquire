import { Connection, Server } from 'sockjs';

export enum ConnectionState {
    WaitingForFirstMessage,
    LookingUpUserData,
    LoggedIn,
}

export class Manager {
    nextClientID: number = 1;

    connectionIDToConnectionState: Map<string, ConnectionState> = new Map();

    connectionIDToPreLoggedInConnection: Map<string, Connection> = new Map();

    connectionIDToClientID: Map<string, number> = new Map();
    clientIDToConnection: Map<number, Connection> = new Map();

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

    addConnection(connection: Connection) {
        this.connectionIDToConnectionState.set(connection.id, ConnectionState.WaitingForFirstMessage);
        this.connectionIDToPreLoggedInConnection.set(connection.id, connection);
    }

    removeConnection(connection: Connection) {
        const connectionState = this.connectionIDToConnectionState.get(connection.id);
        if (connectionState === undefined) {
            return;
        }

        this.connectionIDToConnectionState.delete(connection.id);

        if (connectionState === ConnectionState.LoggedIn) {
            const clientID = this.connectionIDToClientID.get(connection.id);
            if (clientID === undefined) {
                throw new Error('connection not in connectionIDToClientID');
            }

            this.connectionIDToClientID.delete(connection.id);
            this.clientIDToConnection.delete(clientID);
        } else {
            this.connectionIDToPreLoggedInConnection.delete(connection.id);
        }
    }
}
