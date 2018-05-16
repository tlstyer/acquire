import { Manager } from './manager';

describe('Manager', () => {
    it('can construct', () => {
        const [server, manager] = getServerAndManager();

        expect(manager.nextClientID).toBe(1);
        expect(manager.connectionIDToClientID).toEqual(new Map());
        expect(manager.clientIDToConnection).toEqual(new Map());
    });

    it('can open connections and then close them', () => {
        const [server, manager] = getServerAndManager();

        const connection1 = new DummyConnection('connection ID 1');
        server.openConnection(connection1);

        expect(manager.nextClientID).toBe(2);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection1.id, 1]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection1]]));

        const connection2 = new DummyConnection('connection ID 2');
        server.openConnection(connection2);

        expect(manager.nextClientID).toBe(3);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection1.id, 1], [connection2.id, 2]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection1], [2, connection2]]));

        connection1.close();

        expect(manager.nextClientID).toBe(3);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection2.id, 2]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[2, connection2]]));

        connection2.close();

        expect(manager.nextClientID).toBe(3);
        expect(manager.connectionIDToClientID).toEqual(new Map());
        expect(manager.clientIDToConnection).toEqual(new Map());
    });

    it('closing already closed connection does nothing', () => {
        const [server, manager] = getServerAndManager();

        const connection1 = new DummyConnection('connection ID 1');
        server.openConnection(connection1);

        expect(manager.nextClientID).toBe(2);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection1.id, 1]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection1]]));

        const connection2 = new DummyConnection('connection ID 2');
        server.openConnection(connection2);

        expect(manager.nextClientID).toBe(3);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection1.id, 1], [connection2.id, 2]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection1], [2, connection2]]));

        connection1.close();

        expect(manager.nextClientID).toBe(3);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection2.id, 2]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[2, connection2]]));

        connection1.close();

        expect(manager.nextClientID).toBe(3);
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection2.id, 2]]));
        expect(manager.clientIDToConnection).toEqual(new Map([[2, connection2]]));
    });
});

class DummyServer {
    connectionListener: ((conn: DummyConnection) => any) | null = null;

    on(event: string, listener: (conn: DummyConnection) => any) {
        if (event === 'connection') {
            this.connectionListener = listener;
        }
    }

    openConnection(conn: DummyConnection) {
        if (this.connectionListener) {
            this.connectionListener(conn);
        }
    }
}

class DummyConnection {
    dataListener: ((message: string) => any) | null = null;
    closeListener: (() => void) | null = null;

    constructor(public id: string) {}

    on(event: string, listener: any) {
        if (event === 'data') {
            this.dataListener = listener;
        } else if (event === 'close') {
            this.closeListener = listener;
        }
    }

    sendMessage(message: string) {
        if (this.dataListener) {
            this.dataListener(message);
        }
    }

    close() {
        if (this.closeListener) {
            this.closeListener();
        }
    }
}

function getServerAndManager(): [DummyServer, Manager] {
    const server = new DummyServer();
    // @ts-ignore
    const manager = new Manager(server);
    manager.manage();

    return [server, manager];
}
