import { expect, test } from 'vitest';
import { createLoginLogoutMessage } from '../helpers.js';
import { PB_MessageToClient_LoginLogout_ResponseCode, PB_MessageToServer } from '../pb.js';
import { User } from '../user.js';
import {
  createClientStuffAndConnectToTestServer,
  createServerStuff,
  userIdToTestUserData,
  waitForAsyncServerStuff,
} from './common.js';

test('can log out while logged in', async () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  clientStuff.client.createUserAndLogin('username', 'super secret password');
  await waitForAsyncServerStuff();

  clientStuff.clientCommunication.communicatedMessages.length = 0;

  clientStuff.client.logout();
  await waitForAsyncServerStuff();

  expect(clientStuff.clientCommunication.communicatedMessages.length).toBe(2);
  expect(clientStuff.clientCommunication.communicatedMessages[1].receivedMessage).toEqual(
    createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS),
  );

  expect(clientStuff.client.signals.user()).toEqual(null);
  expect(clientStuff.client.myToken).toEqual(undefined);

  expect(
    [...serverStuff.server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined)
      .length,
  ).toBe(0);
});

test('logout data changes are made on the server when a client disconnects', async () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  clientStuff.client.loginWithToken('user 4', userIdToTestUserData[4].passwordHash);
  await waitForAsyncServerStuff();

  clientStuff.clientCommunication.communicatedMessages.length = 0;

  clientStuff.clientCommunication.disconnect();
  await waitForAsyncServerStuff();

  expect(clientStuff.clientCommunication.communicatedMessages.length).toBe(0);

  expect(clientStuff.client.signals.user()).toEqual(new User(4, 'user 4'));
  expect(clientStuff.client.myToken).toEqual(userIdToTestUserData[4].passwordHash);

  expect(
    [...serverStuff.server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined)
      .length,
  ).toBe(0);
});

test('no message sent when trying to log out while already logged out', async () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  clientStuff.clientCommunication.communicatedMessages.length = 0;

  clientStuff.client.logout();
  await waitForAsyncServerStuff();

  expect(clientStuff.clientCommunication.communicatedMessages.length).toBe(0);

  expect(
    [...serverStuff.server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined)
      .length,
  ).toBe(0);
});

test('no reply when trying to log out while already logged out when sending message client would not send', async () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  clientStuff.clientCommunication.communicatedMessages.length = 0;

  clientStuff.clientCommunication.sendMessage(
    PB_MessageToServer.toBinary({
      loginLogout: {
        logout: {},
      },
    }),
  );
  await waitForAsyncServerStuff();

  expect(clientStuff.clientCommunication.communicatedMessages.length).toBe(1);

  expect(
    [...serverStuff.server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined)
      .length,
  ).toBe(0);
});
