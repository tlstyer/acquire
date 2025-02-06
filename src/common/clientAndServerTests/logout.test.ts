import { expect, test } from 'vitest';
import { createLoginLogoutMessage } from '../helpers';
import { PB_MessageToClient_LoginLogout_ResponseCode, PB_MessageToServer } from '../pb';
import { User } from '../user';
import {
  createOneClientConnectedToOneServer,
  userIdToTestUserData,
  waitForAsyncServerStuff,
} from './common';

test('can log out while logged in', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  client.createUserAndLogin('username', 'super secret password');
  await waitForAsyncServerStuff();

  clientCommunication.communicatedMessages.length = 0;

  client.logout();
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(2);
  expect(clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
    createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS),
  );

  expect(client.signals.user()).toEqual(null);
  expect(client.myToken).toEqual(undefined);

  expect([...server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined).length).toBe(
    0,
  );
});

test('logout data changes are made on the server when a client disconnects', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  client.loginWithToken('user 4', userIdToTestUserData[4].passwordHash);
  await waitForAsyncServerStuff();

  clientCommunication.communicatedMessages.length = 0;

  clientCommunication.disconnect();
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(0);

  expect(client.signals.user()).toEqual(new User(4, 'user 4'));
  expect(client.myToken).toEqual(userIdToTestUserData[4].passwordHash);

  expect([...server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined).length).toBe(
    0,
  );
});

test('no message sent when trying to log out while already logged out', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  clientCommunication.communicatedMessages.length = 0;

  client.logout();
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(0);

  expect([...server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined).length).toBe(
    0,
  );
});

test('no reply when trying to log out while already logged out when sending message client would not send', async () => {
  const { clientCommunication, server } = createOneClientConnectedToOneServer();

  clientCommunication.communicatedMessages.length = 0;

  clientCommunication.sendMessage(
    PB_MessageToServer.toBinary({
      loginLogout: {
        logout: {},
      },
    }),
  );
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(1);

  expect([...server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined).length).toBe(
    0,
  );
});
