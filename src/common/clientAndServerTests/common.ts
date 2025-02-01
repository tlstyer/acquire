import { expect, test } from 'vitest';
import { Client, createClient } from '../../client/client';
import { TestClientCommunication } from '../../client/clientCommunication';
import { Server } from '../../server/server';
import { TestServerCommunication } from '../../server/serverCommunication';
import { TestUserData, TestUserDataProvider, getPasswordHash } from '../../server/userDataProvider';
import { PB_MessageToClient } from '../pb';

export const numTestUsers = 7;
export const userIDToTestUserData = [new TestUserData('', 0, '')];
for (let userID = 1; userID <= numTestUsers; userID++) {
  const username = `user ${userID}`;
  userIDToTestUserData.push(
    new TestUserData(username, userID, getPasswordHash(username, 'password')),
  );
}

export function createOneClientConnectedToOneServer() {
  const userDataProvider = new TestUserDataProvider();

  for (let userID = 1; userID <= numTestUsers; userID++) {
    const userData = userIDToTestUserData[userID];
    userDataProvider.usernameToUserData.set(userData.username, userData);
  }
  userDataProvider.nextUserID = numTestUsers + 1;

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
  clientIDToUserIDSize: number,
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
    expect(client.myUsername).toEqual(
      loginLogoutMessage.username !== '' ? loginLogoutMessage.username : undefined,
    );
    expect(client.myUserID).toEqual(
      loginLogoutMessage.userId !== 0 ? loginLogoutMessage.userId : undefined,
    );
    expect(client.myToken).toEqual(
      loginLogoutMessage.token !== '' ? loginLogoutMessage.token : undefined,
    );

    expect([...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length).toBe(
      clientIDToUserIDSize,
    );
  });
}
