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

export function createOneClientConnectedToOneServer() {
  const userDataProvider = new TestUserDataProvider();

  for (let userId = 1; userId <= numTestUsers; userId++) {
    const userData = userIdToTestUserData[userId];
    userDataProvider.usernameToUserData.set(userData.username, userData);
  }
  userDataProvider.nextUserId = numTestUsers + 1;

  const serverCommunication = new TestServerCommunication();
  const server = new Server(serverCommunication, userDataProvider, 2, 123);

  const clientCommunication = new TestClientCommunication(serverCommunication);
  const client = createClient(clientCommunication, 2);

  clientCommunication.connect();

  return { client, clientCommunication, server, serverCommunication, userDataProvider };
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
    const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

    clientCommunication.communicatedMessages.length = 0;

    login(client);
    await waitForAsyncServerStuff();

    expect(clientCommunication.communicatedMessages.length).toBe(2);
    expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
      expectedMessageToClient,
    );

    const loginLogoutMessage = expectedMessageToClient.loginLogout!;
    expect(client.signals.user()).toEqual(
      loginLogoutMessage.username !== ''
        ? new User(loginLogoutMessage.userId, loginLogoutMessage.username)
        : null,
    );
    expect(client.myToken).toEqual(
      loginLogoutMessage.token !== '' ? loginLogoutMessage.token : undefined,
    );

    expect([...server.clientIdToClient.values()].filter((c) => c.user !== null).length).toBe(
      clientIdToUserIdSize,
    );
  });
}
