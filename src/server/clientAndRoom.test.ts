import { describe, expect, test } from 'vitest';
import { User } from '../common/user';
import { Client } from './client';
import { Room } from './room';

const clientId = 1;
const user = new User(2, 'username');

const otherClientId = 3;
const otherUser = new User(4, 'other username');

describe('no other clients in room', () => {
  function expectStuff(client: Client, room: TestRoom, loggedIn: boolean, inRoom: boolean) {
    expect(client.clientId).toBe(clientId);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.user).toBe(loggedIn ? user : null);

    const clients = new Set<Client>();
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userToClients = new Map<User, Set<Client>>();
    if (loggedIn && inRoom) {
      userToClients.set(user, new Set([client]));
    }
    expect(room.userToClients).toEqual(userToClients);
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

    client.loggedIn(user);

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
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

    client.loggedIn(user);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
    room.usersDisconnected.length = 0;
  });

  test('logs in before connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientId, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(user);

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
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

    client.loggedIn(user);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

describe('same user already in room', () => {
  function initialStuffForOtherClient(otherClient: Client, room: TestRoom) {
    otherClient.loggedIn(user);
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
    expect(client.user).toBe(loggedIn ? user : null);

    const clients = new Set([otherClient]);
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userToClients = new Map([[user, new Set([otherClient])]]);
    if (loggedIn && inRoom) {
      userToClients.get(user)!.add(client);
    }
    expect(room.userToClients).toEqual(userToClients);
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

    client.loggedIn(user);

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

    client.loggedIn(user);

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

    client.loggedIn(user);

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

    client.loggedIn(user);

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
  function initialStuffForOtherClient(otherClient: Client, room: TestRoom) {
    otherClient.loggedIn(otherUser);
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
    expect(client.user).toBe(loggedIn ? user : null);

    const clients = new Set([otherClient]);
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userToClients = new Map([[otherUser, new Set([otherClient])]]);
    if (loggedIn && inRoom) {
      userToClients.set(user, new Set([client]));
    }
    expect(room.userToClients).toEqual(userToClients);
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

    client.loggedIn(user);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
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

    client.loggedIn(user);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
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

    client.loggedIn(user);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
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

    client.loggedIn(user);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([user]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([user]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

class TestRoom extends Room {
  usersConnected: User[] = [];
  userConnected(user: User) {
    this.usersConnected.push(user);
  }

  usersDisconnected: User[] = [];
  userDisconnected(user: User) {
    this.usersDisconnected.push(user);
  }
}
