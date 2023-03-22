import { Client } from '$lib/client';
import { TestClientCommunication } from '$lib/clientCommunication';
import * as libHelpers from '$lib/helpers';
import { describe, expect, test, vi } from 'vitest';
import { PB_MessagesToClient } from '../common/pb';
import { Server } from './server';
import { TestServerCommunication } from './serverCommunication';

describe('Connect', () => {
	test('client should reload window when version is different', () => {
		const spy = vi.spyOn(libHelpers, 'reloadWindow').mockReturnValue();

		const serverCommunication = new TestServerCommunication();
		new Server(serverCommunication, 2, 123);

		const clientCommunication = new TestClientCommunication(serverCommunication);
		new Client(clientCommunication, 1);

		clientCommunication.connect();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(spy).toHaveBeenCalledOnce();
	});

	test('client should not reload window when version is the same', () => {
		const spy = vi.spyOn(libHelpers, 'reloadWindow').mockReturnValue();

		const { clientCommunication, serverCommunication } = createOneClientConnectedToOneServer();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(spy).not.toHaveBeenCalled();
	});

	test("client's logTime is set to server's logTime", () => {
		const { client, clientCommunication, serverCommunication } =
			createOneClientConnectedToOneServer();

		expectInitialMessageToBeCorrect(clientCommunication, serverCommunication);

		expect(client.logTime).toBe(123);
	});

	function expectInitialMessageToBeCorrect(
		clientCommunication: TestClientCommunication,
		serverCommunication: TestServerCommunication,
	) {
		const message = PB_MessagesToClient.create({
			messagesToClient: [
				{
					initial: {
						version: 2,
						logTime: 123,
					},
				},
			],
		});

		expect(clientCommunication.communicatedMessages.length).toBe(1);
		expect(clientCommunication.communicatedMessages[0].receivedMessage).toEqual(message);

		expect(serverCommunication.communicatedMessages.length).toBe(1);
		expect(serverCommunication.communicatedMessages[0].clientID).toBe(0);
		expect(serverCommunication.communicatedMessages[0].sentMessage).toEqual(message);
	}
});

function createOneClientConnectedToOneServer() {
	const serverCommunication = new TestServerCommunication();
	const server = new Server(serverCommunication, 2, 123);

	const clientCommunication = new TestClientCommunication(serverCommunication);
	const client = new Client(clientCommunication, 2);

	clientCommunication.connect();

	return { client, clientCommunication, server, serverCommunication };
}
