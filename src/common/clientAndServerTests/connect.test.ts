import { expect, test, vi } from 'vitest';
import { createClient } from '../../client/client.js';
import { TestClientCommunication } from '../../client/clientCommunication.js';
import { Server } from '../../server/server.js';
import { TestServerCommunication } from '../../server/serverCommunication.js';
import { TestUserDataProvider } from '../../server/userDataProvider.js';
import { PB_MessageToClient } from '../pb.js';
import { createClientStuffAndConnectToTestServer, createServerStuff } from './common.js';

test('client should reload window when version is different', () => {
  const mock = vi.fn();
  // @ts-expect-error the other required properties of global.location aren't used in this test
  global.location = { reload: mock };

  const serverCommunication = new TestServerCommunication();
  const userDataProvider = new TestUserDataProvider();
  new Server(serverCommunication, userDataProvider, 2, 123);

  const clientCommunication = new TestClientCommunication(serverCommunication);
  createClient(clientCommunication, 1);

  clientCommunication.connect();

  expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

  expect(mock).toHaveBeenCalledOnce();
});

test('client should not reload window when version is the same', () => {
  const mock = vi.fn();
  // @ts-expect-error the other required properties of global.location aren't used in this test
  global.location = { reload: mock };

  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  expectInitialMessageToBeCorrect(clientStuff.clientCommunication, serverStuff.serverCommunication);

  expect(mock).not.toHaveBeenCalled();
});

test("client's logTime is set to server's logTime", () => {
  const serverStuff = createServerStuff();
  const clientStuff = createClientStuffAndConnectToTestServer(serverStuff);

  expectInitialMessageToBeCorrect(clientStuff.clientCommunication, serverStuff.serverCommunication);

  expect(clientStuff.client.logTime).toBe(123);
});

function expectInitialMessageToBeCorrect(
  clientCommunication: TestClientCommunication,
  serverCommunication: TestServerCommunication,
) {
  const message = PB_MessageToClient.create({
    initial: {
      version: 2,
      logTime: 123,
    },
  });

  expect(clientCommunication.communicatedMessages.length).toBe(1);
  expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual(message);

  expect(serverCommunication.communicatedMessages.length).toBe(1);
  expect(serverCommunication.communicatedMessages[0].clientId).toBe(1);
  expect(serverCommunication.communicatedMessages[0].sentMessage).toEqual(message);
}
