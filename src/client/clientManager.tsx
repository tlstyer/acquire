import './global.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SockJS from 'sockjs-client';
import { ErrorCode, MessageToClient } from '../common/enums';
import { LoginForm } from './components/LoginForm';

export enum ClientManagerPage {
    Login,
    Connecting,
    Lobby,
    Game,
}

const errorCodeToMessage: { [key: number]: string } = {
    [ErrorCode.NotUsingLatestVersion]: 'You are not using the latest version.',
    [ErrorCode.InternalServerError]: 'An error occurred during the processing of your request.',
    [ErrorCode.InvalidMessageFormat]: 'An error occurred during the processing of your request.',
    [ErrorCode.InvalidUsername]: 'Invalid username. Username must have between 1 and 32 ASCII characters.',
    [ErrorCode.MissingPassword]: 'Password is required.',
    [ErrorCode.ProvidedPassword]: 'Password is not set for this user.',
    [ErrorCode.IncorrectPassword]: 'Password is incorrect.',
    [ErrorCode.CouldNotConnect]: 'Could not connect to the server.',
};

export class ClientManager {
    errorCode: ErrorCode | null = null;
    page = ClientManagerPage.Login;
    socket: WebSocket | null = null;
    clientIDToClient: Map<number, Client> = new Map();
    userIDToUser: Map<number, User> = new Map();

    username = '';
    password = '';

    renderPageFunctions: { [key: number]: () => JSX.Element };
    onMessageFunctions: { [key: number]: (...params: any[]) => void };

    constructor() {
        this.renderPageFunctions = {
            [ClientManagerPage.Login]: this.renderLoginPage,
            [ClientManagerPage.Connecting]: this.renderConnectingPage,
            [ClientManagerPage.Lobby]: this.renderLobbyPage,
            [ClientManagerPage.Game]: this.renderGamePage,
        };

        this.onMessageFunctions = {
            [MessageToClient.FatalError]: this.onMessageFatalError,
            [MessageToClient.Greetings]: this.onMessageGreetings,
            [MessageToClient.ClientConnected]: this.onMessageClientConnected,
            [MessageToClient.ClientDisconnected]: this.onMessageClientDisconnected,
        };
    }

    manage() {
        this.render();
    }

    render() {
        ReactDOM.render(this.renderPageFunctions[this.page](), document.getElementById('root'));
    }

    renderLoginPage = () => {
        return (
            <>
                <h1>Acquire</h1>
                <h2>Login</h2>
                <LoginForm
                    error={this.errorCode !== null ? errorCodeToMessage[this.errorCode] : undefined}
                    username={this.username}
                    onSubmit={this.onSubmitLoginForm}
                />
            </>
        );
    };

    onSubmitLoginForm = (username: string, password: string) => {
        this.errorCode = null;
        this.page = ClientManagerPage.Connecting;

        this.username = username;
        this.password = password;

        this.connect();

        this.render();
    };

    renderConnectingPage = () => {
        return (
            <>
                <h1>Acquire</h1>
                <p>Connecting...</p>
            </>
        );
    };

    renderLobbyPage = () => {
        return (
            <>
                <h1>Acquire</h1>
                <p>Lobby</p>
            </>
        );
    };

    renderGamePage = () => {
        return (
            <>
                <h1>Acquire</h1>
                <p>Game</p>
            </>
        );
    };

    connect = () => {
        this.socket = new SockJS('http://localhost:9999/sockjs');

        this.socket.onopen = this.onSocketOpen;
        this.socket.onmessage = this.onSocketMessage;
        this.socket.onclose = this.onSocketClose;
    };

    onSocketOpen = (e: Event) => {
        if (this.socket === null) {
            throw new Error('why is this.socket null?');
        }

        this.socket.send(JSON.stringify([0, this.username, this.password, []]));
    };

    onSocketMessage = (e: MessageEvent) => {
        if (this.socket === null) {
            throw new Error('why is this.socket null?');
        }

        const messages = JSON.parse(e.data);

        for (let i = 0; i < messages.length; i++) {
            const message = messages[i];
            const handler = this.onMessageFunctions[message[0]];
            handler.apply(this, message.slice(1));
        }

        if (this.page === ClientManagerPage.Connecting && this.errorCode === null) {
            this.page = ClientManagerPage.Lobby;
        }

        this.render();
    };

    onMessageFatalError(errorCode: ErrorCode) {
        this.errorCode = errorCode;
    }

    onMessageGreetings(users: any[], gamesBeingSetUp: any[], games: any[], nonexistentGames: number[]) {
        this.clientIDToClient.clear();
        this.userIDToUser.clear();

        for (let i = 0; i < users.length; i++) {
            const [userID, username, clientDatas] = users[i];

            const user = new User(userID, username);
            this.userIDToUser.set(userID, user);

            for (let j = 0; j < clientDatas.length; j++) {
                const clientData = clientDatas[j];
                const clientID = clientData[0];

                const client = new Client(clientID, user);
                user.clients.add(client);
                this.clientIDToClient.set(clientID, client);
            }
        }
    }

    onMessageClientConnected(clientID: number, userID: number, username?: string) {
        let user: User;
        if (username !== undefined) {
            user = new User(userID, username);
            this.userIDToUser.set(userID, user);
        } else {
            user = this.userIDToUser.get(userID)!;
        }

        const client = new Client(clientID, user);
        user.clients.add(client);
        this.clientIDToClient.set(clientID, client);
    }

    onMessageClientDisconnected(clientID: number) {
        const client = this.clientIDToClient.get(clientID)!;
        const user = client.user;

        this.clientIDToClient.delete(clientID);
        user.clients.delete(client);
        if (user.clients.size === 0) {
            this.userIDToUser.delete(user.id);
        }
    }

    onSocketClose = (e: CloseEvent) => {
        if (this.socket === null) {
            throw new Error('why is this.socket null?');
        }

        this.socket = null;

        if (this.errorCode !== null) {
            this.page = ClientManagerPage.Login;
        } else if (this.page === ClientManagerPage.Connecting) {
            this.errorCode = ErrorCode.CouldNotConnect;
            this.page = ClientManagerPage.Login;
        }

        this.render();
    };
}

export class Client {
    constructor(public id: number, public user: User) {}
}

export class User {
    clients: Set<Client> = new Set();

    constructor(public id: number, public name: string) {}
}
