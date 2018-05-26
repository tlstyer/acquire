import './global.css';

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as SockJS from 'sockjs-client';
import { defaultGameBoard } from '../common/defaults';
import { ErrorCode, GameMode, MessageToClient, MessageToServer, PlayerArrangementMode } from '../common/enums';
import { GameSetup } from '../common/gameSetup';
import { CreateGame } from './components/CreateGame';
import { GameListing } from './components/GameListing';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { GameStatus } from './enums';

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
    [ErrorCode.InvalidMessage]: 'An error occurred.',
    [ErrorCode.CouldNotConnect]: 'Could not connect to the server.',
};

export class ClientManager {
    errorCode: ErrorCode | null = null;
    page = ClientManagerPage.Login;

    socket: WebSocket | null = null;

    myClient: Client | null = null;
    clientIDToClient: Map<number, Client> = new Map();
    userIDToUser: Map<number, User> = new Map();
    gameIDToGameData: Map<number, GameData> = new Map();
    gameDisplayNumberToGameData: Map<number, GameData> = new Map();

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
            [MessageToClient.GameCreated]: this.onMessageGameCreated,
            [MessageToClient.ClientEnteredGame]: this.onMessageClientEnteredGame,
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
                <Header username={this.username} isConnected={this.socket !== null} />
                <CreateGame onSubmit={this.onSubmitCreateGame} />
                {[...this.gameIDToGameData].reverse().map(([gameID, gameData]) => {
                    if (gameData.gameSetup !== null) {
                        return (
                            <GameListing
                                key={gameID}
                                gameBoard={defaultGameBoard}
                                usernames={gameData.gameSetup.usernames}
                                gameDisplayNumber={gameData.displayNumber}
                                gameMode={gameData.gameSetup.gameMode}
                                gameStatus={GameStatus.SettingUp}
                                onJoinClicked={undefined}
                                onRejoinClicked={undefined}
                                onWatchClicked={undefined}
                            />
                        );
                    }
                })}
            </>
        );
    };

    onSubmitCreateGame = (gameMode: GameMode) => {
        if (this.socket !== null) {
            this.socket.send(JSON.stringify([MessageToServer.CreateGame, gameMode]));
        }
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

    onMessageGreetings(myClientID: number, users: any[], games: any[]) {
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

        this.myClient = this.clientIDToClient.get(myClientID)!;
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

    onMessageGameCreated(gameID: number, gameDisplayNumber: number, gameMode: GameMode, hostClientID: number) {
        const hostClient = this.clientIDToClient.get(hostClientID)!;

        const gameData = new GameData(gameID, gameDisplayNumber);
        gameData.gameSetup = new GameSetup(gameMode, PlayerArrangementMode.RandomOrder, hostClient.user.id, hostClient.user.name);

        this.gameIDToGameData.set(gameID, gameData);
        this.gameDisplayNumberToGameData.set(gameDisplayNumber, gameData);
    }

    onMessageClientEnteredGame(clientID: number, gameDisplayNumber: number) {
        const client = this.clientIDToClient.get(clientID)!;
        const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber)!;

        client.gameData = gameData;
        gameData.clients.add(client);
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
    gameData: GameData | null = null;

    constructor(public id: number, public user: User) {}
}

export class User {
    clients: Set<Client> = new Set();

    constructor(public id: number, public name: string) {}
}

export class GameData {
    gameSetup: GameSetup | null = null;

    clients: Set<Client> = new Set();

    constructor(public id: number, public displayNumber: number) {}
}
