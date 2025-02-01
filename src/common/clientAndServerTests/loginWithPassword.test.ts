import { expect, test } from 'vitest';
import { createLoginLogoutMessage } from '../helpers';
import { PB_MessageToClient_LoginLogout_ResponseCode, PB_MessageToServer } from '../pb';
import {
  createOneClientConnectedToOneServer,
  testLogin,
  userIDToTestUserData,
  waitForAsyncServerStuff,
} from './common';

testLogin(
  'error from user data provider is sent to client and user stays logged out',
  (client) => client.loginWithPassword('lookupUser error', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR),
  0,
);

testLogin(
  'user not found and user stays logged out',
  (client) => client.loginWithPassword('user that is not in database', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND),
  0,
);

testLogin(
  'incorrect password and user stays logged out',
  (client) => client.loginWithPassword('user 1', 'incorrect password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INCORRECT_PASSWORD),
  0,
);

testLogin(
  'correct password and is logged in',
  (client) => client.loginWithPassword('user 1', 'password'),
  createLoginLogoutMessage(
    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
    'user 1',
    1,
    userIDToTestUserData[1].passwordHash,
  ),
  1,
);

testLogin(
  'correct password and is logged in after whitespace in username is cleaned up',
  (client) => client.loginWithPassword('\t user\n \t\v1\v ', 'password'),
  createLoginLogoutMessage(
    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
    'user 1',
    1,
    userIDToTestUserData[1].passwordHash,
  ),
  1,
);

test('no message sent when trying to login with password while already logged in', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();

  clientCommunication.communicatedMessages.length = 0;

  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(0);

  expect([...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length).toBe(
    1,
  );
});

test('no reply when trying to login with password while already logged in when sending message client would not send', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  client.loginWithPassword('user 1', 'password');
  await waitForAsyncServerStuff();

  clientCommunication.communicatedMessages.length = 0;

  clientCommunication.sendMessage(
    PB_MessageToServer.toBinary({
      loginLogout: {
        loginWithPassword: {
          username: 'user 1',
          password: 'password',
        },
      },
    }),
  );
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(1);

  expect([...server.clientIDToClient.values()].filter((c) => c.userID !== undefined).length).toBe(
    1,
  );
});
