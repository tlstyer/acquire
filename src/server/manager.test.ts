import { Manager } from './manager';

describe('Manager', () => {
    it('can construct', () => {
        const manager = new Manager();

        expect(manager.nextClientID).toBe(1);
        expect(manager.clientIDToConnection).toEqual(new Map());
        expect(manager.connectionIDToClientID).toEqual(new Map());
    });

    it('can add connections and then remove them', () => {
        const manager = new Manager();

        const connection1 = { id: 'connection ID 1' };
        // @ts-ignore
        manager.addConnection(connection1);

        expect(manager.nextClientID).toBe(2);
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection1]]));
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection1.id, 1]]));

        const connection2 = { id: 'connection ID 2' };
        // @ts-ignore
        manager.addConnection(connection2);

        expect(manager.nextClientID).toBe(3);
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection1], [2, connection2]]));
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection1.id, 1], [connection2.id, 2]]));

        // @ts-ignore
        manager.removeConnection(connection1);

        expect(manager.nextClientID).toBe(3);
        expect(manager.clientIDToConnection).toEqual(new Map([[2, connection2]]));
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection2.id, 2]]));

        // @ts-ignore
        manager.removeConnection(connection2);

        expect(manager.nextClientID).toBe(3);
        expect(manager.clientIDToConnection).toEqual(new Map());
        expect(manager.connectionIDToClientID).toEqual(new Map());
    });

    it('removing non-managed connection does nothing', () => {
        const manager = new Manager();

        const connection = { id: 'connection ID' };
        // @ts-ignore
        manager.addConnection(connection);

        expect(manager.nextClientID).toBe(2);
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection]]));
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection.id, 1]]));

        const connection2 = { id: 'connection ID 2' };
        // @ts-ignore
        manager.removeConnection(connection2);

        expect(manager.nextClientID).toBe(2);
        expect(manager.clientIDToConnection).toEqual(new Map([[1, connection]]));
        expect(manager.connectionIDToClientID).toEqual(new Map([[connection.id, 1]]));
    });
});
