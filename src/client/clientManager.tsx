import './global.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SockJS from 'sockjs-client';
import { LoginForm } from './components/LoginForm';

export enum ClientManagerPage {
    Login,
    Connecting,
    Lobby,
    Game,
}

export class ClientManager {
    page = ClientManagerPage.Login;
    socket: WebSocket | null = null;

    username = '';
    password = '';

    renderPageFunctions: { [key: number]: () => JSX.Element };

    constructor() {
        this.renderPageFunctions = {
            [ClientManagerPage.Login]: this.renderLoginPage,
            [ClientManagerPage.Connecting]: this.renderConnectingPage,
            [ClientManagerPage.Lobby]: this.renderLobbyPage,
            [ClientManagerPage.Game]: this.renderGamePage,
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
                <LoginForm onSubmit={this.onSubmitLoginForm} />
            </>
        );
    };

    onSubmitLoginForm = (username: string, password: string) => {
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
    };

    onSocketClose = (e: CloseEvent) => {
        if (this.socket === null) {
            throw new Error('why is this.socket null?');
        }

        this.socket = null;
    };
}
