import { describe, expect, test } from 'vitest';
import { Client } from './client';
import { Room } from './room';

describe('no other clients in room', () => {
  const clientID = 1;
  const userID = 2;
  const username = 'username';

  function expectStuff(client: Client, room: TestRoom, loggedIn: boolean, inRoom: boolean) {
    expect(client.clientID).toBe(clientID);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.userID).toBe(loggedIn ? userID : undefined);
    expect(client.username).toBe(loggedIn ? username : undefined);

    const clients = new Set<Client>();
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userIDToClients = new Map<number, Set<Client>>();
    if (loggedIn && inRoom) {
      userIDToClients.set(userID, new Set([client]));
    }
    expect(room.userIDToClients).toEqual(userIDToClients);
  }

  test('never logs in', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});

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
    const client = new Client(clientID, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in after connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in before connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in after connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

describe('same user already in room', () => {
  const clientID = 1;
  const userID = 2;
  const username = 'username';

  const otherClientID = 3;

  function initialStuffForOtherClient(otherClient: Client, room: TestRoom) {
    otherClient.loggedIn(userID, username);
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
    expect(client.clientID).toBe(clientID);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.userID).toBe(loggedIn ? userID : undefined);
    expect(client.username).toBe(loggedIn ? username : undefined);

    const clients = new Set([otherClient]);
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userIDToClients = new Map([[userID, new Set([otherClient])]]);
    if (loggedIn && inRoom) {
      userIDToClients.get(userID)!.add(client);
    }
    expect(room.userIDToClients).toEqual(userIDToClients);
  }

  test('never logs in', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
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
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

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
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

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
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

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
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

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
  const clientID = 1;
  const userID = 2;
  const username = 'username';

  const otherClientID = 3;
  const otherUserID = 4;
  const otherUsername = 'other username';

  function initialStuffForOtherClient(otherClient: Client, room: TestRoom) {
    otherClient.loggedIn(otherUserID, otherUsername);
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
    expect(client.clientID).toBe(clientID);
    expect(client.room).toBe(inRoom ? room : undefined);
    expect(client.userID).toBe(loggedIn ? userID : undefined);
    expect(client.username).toBe(loggedIn ? username : undefined);

    const clients = new Set([otherClient]);
    if (inRoom) {
      clients.add(client);
    }
    expect(room.clients).toEqual(clients);

    const userIDToClients = new Map([[otherUserID, new Set([otherClient])]]);
    if (loggedIn && inRoom) {
      userIDToClients.set(userID, new Set([client]));
    }
    expect(room.userIDToClients).toEqual(userIDToClients);
  }

  test('never logs in', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
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
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in after connecting, does not log out', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;
  });

  test('logs in before connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, otherClient, room, true, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });

  test('logs in after connecting, logs out after connecting', () => {
    const room = new TestRoom();
    const client = new Client(clientID, () => {});
    const otherClient = new Client(otherClientID, () => {});
    initialStuffForOtherClient(otherClient, room);

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.connectToRoom(room);

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);

    client.loggedIn(userID, username);

    expectStuff(client, otherClient, room, true, true);
    expect(room.usersConnected).toEqual([{ userID, username }]);
    expect(room.usersDisconnected.length).toBe(0);
    room.usersConnected.length = 0;

    client.loggedOut();

    expectStuff(client, otherClient, room, false, true);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected).toEqual([{ userID, username }]);
    room.usersDisconnected.length = 0;

    client.disconnectFromRoom();

    expectStuff(client, otherClient, room, false, false);
    expect(room.usersConnected.length).toBe(0);
    expect(room.usersDisconnected.length).toBe(0);
  });
});

class TestRoom extends Room {
  usersConnected: { userID: number; username: string }[] = [];
  userConnected(userID: number, username: string) {
    this.usersConnected.push({ userID, username });
  }

  usersDisconnected: { userID: number; username: string }[] = [];
  userDisconnected(userID: number, username: string) {
    this.usersDisconnected.push({ userID, username });
  }
}
