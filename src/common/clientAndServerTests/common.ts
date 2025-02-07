import { expect, test } from 'vitest';
import { type Client, createClient } from '../../client/client';
import { TestClientCommunication } from '../../client/clientCommunication';
import { Server } from '../../server/server';
import { TestServerCommunication } from '../../server/serverCommunication';
import { TestUserData, TestUserDataProvider, getPasswordHash } from '../../server/userDataProvider';
import { type PB_MessageToClient } from '../pb';
import { User } from '../user';

export const numTestUsers = 7;
export const userIdToTestUserData = [new TestUserData('', 0, '')];
for (let userId = 1; userId <= numTestUsers; userId++) {
  const username = `user ${userId}`;
  userIdToTestUserData.push(
    new TestUserData(username, userId, getPasswordHash(username, 'password')),
  );
}

export type ServerStuff = ReturnType<typeof createServerStuff>;

export function createServerStuff() {
  const userDataProvider = new TestUserDataProvider();

  for (let userId = 1; userId <= numTestUsers; userId++) {
    const userData = userIdToTestUserData[userId];
    userDataProvider.usernameToUserData.set(userData.username, userData);
  }
  userDataProvider.nextUserId = numTestUsers + 1;

  const serverCommunication = new TestServerCommunication();
  const server = new Server(serverCommunication, userDataProvider, 2, 123);

  return {
    server,
    serverCommunication,
    userDataProvider,
  };
}

export type ClientStuff = ReturnType<typeof createClientStuffAndConnectToTestServer>;

export function createClientStuffAndConnectToTestServer(serverStuff: ServerStuff) {
  const clientCommunication = new TestClientCommunication(serverStuff.serverCommunication);
  const client = createClient(clientCommunication, 2);

  clientCommunication.connect();

  return {
    client,
    clientCommunication,
  };
}

export async function waitForAsyncServerStuff() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

export function testLogin(
  name: string,
  login: (client: Client) => void,
  expectedMessageToClient: PB_MessageToClient,
  clientIdToUserIdSize: number,
) {
  test(name, async () => {
    const serverStuff = createServerStuff();
    const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

    clientStuff.clientCommunication.communicatedMessages.length = 0;

    login(clientStuff.client);
    await waitForAsyncServerStuff();

    expect(clientStuff.clientCommunication.communicatedMessages.length).toBe(2);
    expect(clientStuff.clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
      expectedMessageToClient,
    );

    const loginLogoutMessage = expectedMessageToClient.loginLogout!;
    expect(clientStuff.client.signals.user()).toEqual(
      loginLogoutMessage.username !== ''
        ? new User(loginLogoutMessage.userId, loginLogoutMessage.username)
        : null,
    );
    expect(clientStuff.client.myToken).toEqual(
      loginLogoutMessage.token !== '' ? loginLogoutMessage.token : undefined,
    );

    expect(
      [...serverStuff.server.clientIdToClient.values()].filter((c) => c.user !== null).length,
    ).toBe(clientIdToUserIdSize);
  });
}
