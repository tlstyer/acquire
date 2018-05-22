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
