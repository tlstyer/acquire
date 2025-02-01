import { describe, expect, test } from 'vitest';
import { Client } from './client';
import { Room } from './room';

describe('no other clients in room', () => {
  const clientId = 1;
  const userId = 2;
  const username = 'username';

  function expectStuff(client: Client, room: TestRoom, loggedIn: boolean, inRoom: boolean) {
    expect(client.clientId).toBe(clientId);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.userId).toBe(loggedIn ? userId : undefined);
    expect(client.username).toBe(loggedIn ? username : undefined);

    const clients = new Set<Client>();
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userIdToClients = new Map<number, Set<Client>>();
    if (loggedIn && inRoom) {
      userIdToClients.set(userId, new Set([client]));
    }
    expect(room.userIdToClients).toEqual(userIdToClients);
  }

  test('never logs in', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in before connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in after connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in before connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in after connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

describe('same user already in room', () => {
  const clientId = 1;
  const userId = 2;
  const username = 'username';

  const otherClientId = 3;

  function initialStuffForOtherClient(otherClient: Client, room: TestRoom) {
    otherClient.loggedIn(userId, username);
    otherClient.connectToRoom(room);
    room.usersConnected.length = 0;
  }

  function expectStuff(
    client: Client,
    otherClient: Client,
    room: TestRoom,
    loggedIn: boolean,
    inRoom: boolean,
  ) {
    expect(client.clientId).toBe(clientId);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.userId).toBe(loggedIn ? userId : undefined);
    expect(client.username).toBe(loggedIn ? username : undefined);

    const clients = new Set([otherClient]);
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userIdToClients = new Map([[userId, new Set([otherClient])]]);
    if (loggedIn && inRoom) {
      userIdToClients.get(userId)!.add(client);
    }
    expect(room.userIdToClients).toEqual(userIdToClients);
  }

  test('never logs in', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in before connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in after connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in before connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in after connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

describe('different user already in room', () => {
  const clientId = 1;
  const userId = 2;
  const username = 'username';

  const otherClientId = 3;
  const otherUserId = 4;
  const otherUsername = 'other username';

  function initialStuffForOtherClient(otherClient: Client, room: TestRoom) {
    otherClient.loggedIn(otherUserId, otherUsername);
    otherClient.connectToRoom(room);
    room.usersConnected.length = 0;
  }

  function expectStuff(
    client: Client,
    otherClient: Client,
    room: TestRoom,
    loggedIn: boolean,
    inRoom: boolean,
  ) {
    expect(client.clientId).toBe(clientId);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.userId).toBe(loggedIn ? userId : undefined);
    expect(client.username).toBe(loggedIn ? username : undefined);

    const clients = new Set([otherClient]);
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userIdToClients = new Map([[otherUserId, new Set([otherClient])]]);
    if (loggedIn && inRoom) {
      userIdToClients.set(userId, new Set([client]));
    }
    expect(room.userIdToClients).toEqual(userIdToClients);
  }

  test('never logs in', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in before connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in after connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in before connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in after connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});
    const otherClient = new Client(otherClientId, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userId, username);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userId, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userId, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

class TestRoom extends Room {
  usersConnected: { userId: number; username: string }[] = [];
  userConnected(userId: number, username: string) {
    this.usersConnected.push({ userId, username });
  }

  usersDisconnected: { userId: number; username: string }[] = [];
  userDisconnected(userId: number, username: string) {
    this.usersDisconnected.push({ userId, username });
  }
}
