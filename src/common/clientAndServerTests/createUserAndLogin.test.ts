import { expect, test } from 'vitest';
import { getPasswordHash } from '../../server/userDataProvider';
import { createLoginLogoutMessage } from '../helpers';
import { PB_MessageToClient_LoginLogout_ResponseCode, PB_MessageToServer } from '../pb';
import {
  createOneClientConnectedToOneServer,
  numTestUsers,
  testLogin,
  waitForAsyncServerStuff,
} from './common';

testLogin(
  'username of length 0 is an invalid username',
  (client) => client.createUserAndLogin('', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
  0,
);

testLogin(
  'username of length 33 is an invalid username',
  (client) => client.createUserAndLogin('123456789012345678901234567890123', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
  0,
);

testLogin(
  'username with a non-ASCII character is an invalid username',
  (client) => client.createUserAndLogin('123😀', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
  0,
);

testLogin(
  'username with just spaces is an invalid username',
  (client) => client.createUserAndLogin('    ', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME),
  0,
);

testLogin(
  'password of length 7 is an invalid password',
  (client) => client.createUserAndLogin('username', '1234567'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.INVALID_PASSWORD),
  0,
);

testLogin(
  'error from user data provider is sent to client and user stays logged out',
  (client) => client.createUserAndLogin('createUser error', 'password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR),
  0,
);

testLogin(
  'cannot create a user if user already exists',
  (client) => client.createUserAndLogin('user 1', 'some other password'),
  createLoginLogoutMessage(PB_MessageToClient_LoginLogout_ResponseCode.USER_EXISTS),
  0,
);

testLogin(
  'can create a new user and be logged in',
  (client) => client.createUserAndLogin('username', 'super secret password'),
  createLoginLogoutMessage(
    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
    'username',
    numTestUsers + 1,
    getPasswordHash('username', 'super secret password'),
  ),
  1,
);

testLogin(
  'can create a new user and be logged in after whitespace in username is cleaned up',
  (client) => client.createUserAndLogin('\t user\n \t\vname\v ', 'super secret password'),
  createLoginLogoutMessage(
    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
    'user name',
    numTestUsers + 1,
    getPasswordHash('user name', 'super secret password'),
  ),
  1,
);

test('no message sent when trying to create user and login while already logged in', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  client.createUserAndLogin('username', 'super secret password');
  await waitForAsyncServerStuff();

  clientCommunication.communicatedMessages.length = 0;

  client.createUserAndLogin('username', 'super secret password');
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(0);

  expect([...server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined).length).toBe(
    1,
  );
});

test('no reply when trying to create user and login while already logged in when sending message client would not send', async () => {
  const { client, clientCommunication, server } = createOneClientConnectedToOneServer();

  client.createUserAndLogin('username', 'super secret password');
  await waitForAsyncServerStuff();

  clientCommunication.communicatedMessages.length = 0;

  clientCommunication.sendMessage(
    PB_MessageToServer.toBinary({
      loginLogout: {
        createUserAndLogin: {
          username: 'username',
          password: 'super secret password',
        },
      },
    }),
  );
  await waitForAsyncServerStuff();

  expect(clientCommunication.communicatedMessages.length).toBe(1);

  expect([...server.clientIdToClient.values()].filter((c) => c.user?.id !== undefined).length).toBe(
    1,
  );
});
