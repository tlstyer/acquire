import { Client } from '$lib/client';
import { TestClientCommunication } from '$lib/clientCommunication';
import * as libHelpers from '$lib/helpers';
import { describe, expect, test, vi } from 'vitest';
import { Server } from './server';
import { TestServerCommunication } from './serverCommunication';

describe('initial message', () => {
	test('client should reload window when version is different', () => {
		const spy = vi.spyOn(libHelpers, 'reloadWindow').mockReturnValue();

		const serverCommunication = new TestServerCommunication();
		new Server(serverCommunication, 2, 123);

		const clientConnection = new TestClientCommunication(serverCommunication);
		new Client(clientConnection, 1);

		clientConnection.connect();

		expect(spy).toHaveBeenCalledOnce();
	});

	test('client should not reload window when version is the same', () => {
		const spy = vi.spyOn(libHelpers, 'reloadWindow').mockReturnValue();

		const serverCommunication = new TestServerCommunication();
		new Server(serverCommunication, 2, 123);

		const clientConnection = new TestClientCommunication(serverCommunication);
		new Client(clientConnection, 2);

		clientConnection.connect();

		expect(spy).not.toHaveBeenCalled();
	});

	test("client's logTime is set to server's logTime", () => {
		const serverCommunication = new TestServerCommunication();
		new Server(serverCommunication, 2, 123);

		const clientConnection = new TestClientCommunication(serverCommunication);
		const client = new Client(clientConnection, 2);

		clientConnection.connect();

		expect(client.logTime).toEqual(123);
	});
});
