import * as SockJS from 'sockjs-client';
import { ErrorCode, MessageToClient } from '../common/enums';
import { ClientManager, ClientManagerPage } from './clientManager';

jest.mock('sockjs-client');

// @ts-ignore
const mockSockJS: jest.Mock = SockJS;

describe('ClientManager', () => {
    describe('onSubmitLoginForm', () => {
        it('connection is instantiated and first message is sent', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            clientManager.manage();

            expect(clientManager.page).toBe(ClientManagerPage.Login);
            expect(renderMock.mock.calls.length).toBe(1);

            clientManager.onSubmitLoginForm('username', 'password');

            expect(clientManager.page).toBe(ClientManagerPage.Connecting);
            expect(clientManager.socket).toBe(testConnection);
            if (clientManager.socket !== null) {
                expect(testConnection.onopen).toBe(clientManager.onSocketOpen);
                expect(testConnection.onmessage).toBe(clientManager.onSocketMessage);
                expect(testConnection.onclose).toBe(clientManager.onSocketClose);
            }
            expect(renderMock.mock.calls.length).toBe(2);
            expect(testConnection.sentMessages).toEqual([]);

            testConnection.triggerOpen();

            expect(renderMock.mock.calls.length).toBe(2);
            expect(testConnection.sentMessages).toEqual([[0, 'username', 'password', []]]);
        });

        it('goes back to login page upon fatal error followed by a closed connection', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            clientManager.manage();

            clientManager.onSubmitLoginForm('username', 'password');

            testConnection.triggerOpen();

            testConnection.triggerMessage([[MessageToClient.FatalError, ErrorCode.IncorrectPassword]]);

            expect(clientManager.errorCode).toBe(ErrorCode.IncorrectPassword);
            expect(clientManager.page).toBe(ClientManagerPage.Connecting);
            expect(renderMock.mock.calls.length).toBe(3);

            testConnection.triggerClose();

            expect(clientManager.errorCode).toBe(ErrorCode.IncorrectPassword);
            expect(clientManager.page).toBe(ClientManagerPage.Login);
            expect(renderMock.mock.calls.length).toBe(4);
        });

        it('goes back to login page upon closed connection before receiving a message', () => {
            const { clientManager, testConnection, renderMock } = getClientManagerAndStuff();

            clientManager.manage();

            clientManager.onSubmitLoginForm('username', 'password');

            testConnection.triggerClose();

            expect(clientManager.errorCode).toBe(ErrorCode.CouldNotConnect);
            expect(clientManager.page).toBe(ClientManagerPage.Login);
            expect(renderMock.mock.calls.length).toBe(3);
        });
    });
});

class TestConnection {
    onopen: ((e: any) => any) | null = null;
    onmessage: ((e: any) => any) | null = null;
    onclose: ((e: any) => any) | null = null;

    sentMessages: any[] = [];

    send(data: string) {
        this.sentMessages.push(JSON.parse(data));
    }

    triggerOpen() {
        if (this.onopen) {
            this.onopen({});
        }
    }

    triggerMessage(message: any) {
        if (this.onmessage) {
            if (typeof message !== 'string') {
                message = JSON.stringify(message);
            }
            this.onmessage({ data: message });
        }
    }

    triggerClose() {
        if (this.onclose) {
            this.onclose({});
        }
    }
}

function getClientManagerAndStuff() {
    const clientManager = new ClientManager();
    const testConnection = new TestConnection();

    const renderMock = jest.fn();
    clientManager.render = renderMock;

    mockSockJS.mockReset();
    mockSockJS.mockImplementation(() => testConnection);

    return { clientManager, testConnection, renderMock };
}
