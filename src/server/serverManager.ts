import * as WebSocket from 'ws';
import { MessageToClientEnum } from '../common/enums';
import { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import { gameModeToNumPlayers, getNewTileBag, isASCII } from '../common/helpers';
import { ErrorCode, GameAction, GameSetupAction, MessageToServer, PlayerArrangementMode } from '../common/pb';
import { LogMessage } from './enums';
import { ReuseIDManager } from './reuseIDManager';
import { UserDataProvider } from './userDataProvider';

export enum ConnectionState {
  WaitingForFirstMessage,
  ProcessingFirstMessage,
  LoggedIn,
}

export class ServerManager {
  nextWebSocketID = 1;
  webSocketToID = new WeakMap<WebSocket, number>();

  webSocketToConnectionState = new Map<WebSocket, ConnectionState>();
  preLoggedInWebSockets = new Set<WebSocket>();

  clientIDManager = new ReuseIDManager(60000);
  webSocketToClient = new Map<WebSocket, Client>();
  userIDToUser = new Map<number, User>();

  gameDisplayNumberManager = new ReuseIDManager(60000);
  gameIDToGameData = new Map<number, GameData>();
  gameDisplayNumberToGameData = new Map<number, GameData>();

  lastLogMessageTime = 0;

  constructor(
    public webSocketServer: WebSocket.Server,
    public userDataProvider: UserDataProvider,
    public nextGameID: number,
    public logger: (message: string) => void,
  ) {}

  manage() {
    this.webSocketServer.on('connection', (webSocket, incomingMessage) => {
      const webSocketID = this.nextWebSocketID++;
      this.webSocketToID.set(webSocket, webSocketID);

      this.logMessage(LogMessage.Connected, webSocketID, incomingMessage?.headers, incomingMessage?.socket?.remoteAddress, incomingMessage?.socket?.remotePort);

      this.addConnection(webSocket);

      webSocket.on('message', (rawMessage) => {
        let message: MessageToServer;
        try {
          // @ts-ignore
          message = MessageToServer.decode(rawMessage);
        } catch (error) {
          this.logMessage(LogMessage.InvalidMessage, webSocketID, rawMessage);

          this.kickWithError(webSocket, ErrorCode.INVALID_MESSAGE_FORMAT);
          return;
        }

        const client = this.webSocketToClient.get(webSocket);
        if (client !== undefined) {
          this.logMessage(LogMessage.MessageWhileLoggedIn, client.id, message);
        } else {
          let sanitizedMessage = message;
          if (message.login && message.login.password !== '') {
            sanitizedMessage = MessageToServer.create(MessageToServer.toObject(message));
            sanitizedMessage.login!.password = '***';
          }

          this.logMessage(LogMessage.MessageWhileNotLoggedIn, webSocketID, sanitizedMessage);
        }

        const connectionState = this.webSocketToConnectionState.get(webSocket);

        if (connectionState === ConnectionState.LoggedIn && client !== undefined) {
          if (message.createGame) {
            this.onMessageCreateGame(client, message.createGame);
          } else if (message.enterGame) {
            this.onMessageEnterGame(client, message.enterGame);
          } else if (message.exitGame) {
            this.onMessageExitGame(client);
          } else if (message.doGameSetupAction) {
            const gameSetupAction: GameSetupAction = message.doGameSetupAction;

            if (gameSetupAction.joinGame) {
              this.onMessageJoinGame(client);
            } else if (gameSetupAction.unjoinGame) {
              this.onMessageUnjoinGame(client);
            } else if (gameSetupAction.approveOfGameSetup) {
              this.onMessageApproveOfGameSetup(client);
            } else if (gameSetupAction.changeGameMode) {
              this.onMessageChangeGameMode(client, gameSetupAction.changeGameMode);
            } else if (gameSetupAction.changePlayerArrangementMode) {
              this.onMessageChangePlayerArrangementMode(client, gameSetupAction.changePlayerArrangementMode);
            } else if (gameSetupAction.swapPositions) {
              this.onMessageSwapPositions(client, gameSetupAction.swapPositions);
            } else if (gameSetupAction.kickUser) {
              this.onMessageKickUser(client, gameSetupAction.kickUser);
            } else {
              this.kickWithError(webSocket, ErrorCode.INVALID_MESSAGE);
            }
          } else if (message.doGameAction) {
            this.onMessageDoGameAction(client, message.doGameAction);
          } else {
            this.kickWithError(webSocket, ErrorCode.INVALID_MESSAGE);
          }

          this.sendAllQueuedMessages();
        } else if (connectionState === ConnectionState.WaitingForFirstMessage) {
          this.webSocketToConnectionState.set(webSocket, ConnectionState.ProcessingFirstMessage);

          if (message.login) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.processFirstMessage(webSocket, message.login);
          } else {
            this.kickWithError(webSocket, ErrorCode.INVALID_MESSAGE_FORMAT);
          }
        }
      });

      webSocket.on('close', () => {
        const client = this.webSocketToClient.get(webSocket);
        if (client !== undefined) {
          this.logMessage(LogMessage.Disconnected, webSocketID, client.id, client.user.id, client.user.name);
        } else {
          this.logMessage(LogMessage.Disconnected, webSocketID);
        }

        this.removeConnection(webSocket);

        this.sendAllQueuedMessages();
      });
    });
  }

  sendAllQueuedMessages() {
    this.webSocketToClient.forEach((aClient) => {
      aClient.sendQueuedMessages();
    });
  }

  addConnection(webSocket: WebSocket) {
    this.webSocketToConnectionState.set(webSocket, ConnectionState.WaitingForFirstMessage);
    this.preLoggedInWebSockets.add(webSocket);
  }

  removeConnection(webSocket: WebSocket) {
    const connectionState = this.webSocketToConnectionState.get(webSocket);
    if (connectionState === undefined) {
      return;
    }

    this.webSocketToConnectionState.delete(webSocket);

    if (connectionState === ConnectionState.LoggedIn) {
      const client = this.webSocketToClient.get(webSocket);
      if (client === undefined) {
        return;
      }

      this.clientIDManager.returnID(client.id);

      this.webSocketToClient.delete(webSocket);

      const user = client.user;
      user.clients.delete(client);
      this.deleteUserIfItDoesNotHaveReferences(user);

      const messageToOtherClients = JSON.stringify([MessageToClientEnum.ClientDisconnected, client.id]);
      this.webSocketToClient.forEach((otherClient) => {
        otherClient.queueMessage(messageToOtherClients);
      });
    } else {
      this.preLoggedInWebSockets.delete(webSocket);
    }
  }

  kickWithError(webSocket: WebSocket, errorCode: ErrorCode) {
    this.logMessage(LogMessage.KickedWithError, this.webSocketToID.get(webSocket), errorCode);

    webSocket.send(JSON.stringify([[MessageToClientEnum.FatalError, errorCode]]));
    webSocket.close();
  }

  async processFirstMessage(webSocket: WebSocket, message: MessageToServer.ILogin) {
    const version = message.version;
    if (version !== 0) {
      this.kickWithError(webSocket, ErrorCode.NOT_USING_LATEST_VERSION);
      return;
    }

    const username = message.username;
    if (username === null || username === undefined || username.length === 0 || username.length > 32 || !isASCII(username)) {
      this.kickWithError(webSocket, ErrorCode.INVALID_USERNAME);
      return;
    }

    const password = message.password;
    if (password === null || password === undefined) {
      this.kickWithError(webSocket, ErrorCode.INVALID_MESSAGE_FORMAT);
      return;
    }

    const gameDatas = message.gameDatas;
    if (gameDatas === null || gameDatas === undefined) {
      this.kickWithError(webSocket, ErrorCode.INVALID_MESSAGE_FORMAT);
      return;
    }

    let userData;
    try {
      userData = await this.userDataProvider.lookupUser(username);
    } catch (error) {
      this.kickWithError(webSocket, ErrorCode.INTERNAL_SERVER_ERROR);
      return;
    }

    let userID = 0;

    if (userData !== null) {
      if (userData.hasPassword) {
        if (password.length === 0) {
          this.kickWithError(webSocket, ErrorCode.MISSING_PASSWORD);
          return;
        } else if (!userData.verifyPassword(password)) {
          this.kickWithError(webSocket, ErrorCode.INCORRECT_PASSWORD);
          return;
        } else {
          userID = userData.userID;
        }
      } else {
        if (password.length > 0) {
          this.kickWithError(webSocket, ErrorCode.PROVIDED_PASSWORD);
          return;
        } else {
          userID = userData.userID;
        }
      }
    } else {
      if (password.length > 0) {
        this.kickWithError(webSocket, ErrorCode.PROVIDED_PASSWORD);
        return;
      } else {
        try {
          userID = await this.userDataProvider.createUser(username, null);
        } catch (error) {
          this.kickWithError(webSocket, ErrorCode.INTERNAL_SERVER_ERROR);
          return;
        }
      }
    }

    this.webSocketToConnectionState.set(webSocket, ConnectionState.LoggedIn);

    this.preLoggedInWebSockets.delete(webSocket);

    let user = this.userIDToUser.get(userID);
    let isNewUser = false;
    if (user === undefined) {
      user = new User(userID, username);
      this.userIDToUser.set(userID, user);
      isNewUser = true;
    }

    const client = new Client(this.clientIDManager.getID(), webSocket, user);
    this.webSocketToClient.set(webSocket, client);
    user.clients.add(client);

    client.queueMessage(this.getGreetingsMessage(gameDatas, client));

    const outgoingMessageParts: any[] = [MessageToClientEnum.ClientConnected, client.id, client.user.id];
    if (isNewUser) {
      outgoingMessageParts.push(client.user.name);
    }
    const messageToOtherClients = JSON.stringify(outgoingMessageParts);

    this.webSocketToClient.forEach((otherClient) => {
      if (otherClient !== client) {
        otherClient.queueMessage(messageToOtherClients);
      }
    });

    this.sendAllQueuedMessages();

    this.logMessage(LogMessage.LoggedIn, this.webSocketToID.get(webSocket), client.id, userID, username);
  }

  onMessageCreateGame(client: Client, message: MessageToServer.ICreateGame) {
    const gameMode = message.gameMode;
    if (gameMode === null || gameMode === undefined || !gameModeToNumPlayers.has(gameMode)) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (client.gameData !== null) {
      return;
    }

    const gameData = new GameData(this.nextGameID++, this.gameDisplayNumberManager.getID());
    gameData.gameSetup = new GameSetup(gameMode, PlayerArrangementMode.RANDOM_ORDER, client.user.id, this.getUsernameForUserID);
    gameData.clients.add(client);

    client.gameData = gameData;
    client.user.numGames++;

    this.gameIDToGameData.set(gameData.id, gameData);
    this.gameDisplayNumberToGameData.set(gameData.displayNumber, gameData);

    const gameCreatedMessage = JSON.stringify([MessageToClientEnum.GameCreated, gameData.id, gameData.displayNumber, gameData.gameSetup!.gameMode, client.id]);
    const clientEnteredGameMessage = JSON.stringify([MessageToClientEnum.ClientEnteredGame, client.id, gameData.displayNumber]);
    this.webSocketToClient.forEach((aClient) => {
      aClient.queueMessage(gameCreatedMessage);
      aClient.queueMessage(clientEnteredGameMessage);
    });
  }

  onMessageEnterGame(client: Client, message: MessageToServer.IEnterGame) {
    const gameDisplayNumber = message.gameDisplayNumber;
    if (gameDisplayNumber === null || gameDisplayNumber === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }
    const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber);
    if (gameData === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (client.gameData !== null) {
      return;
    }

    gameData.clients.add(client);

    client.gameData = gameData;

    const message2 = JSON.stringify([MessageToClientEnum.ClientEnteredGame, client.id, gameData.displayNumber]);
    this.webSocketToClient.forEach((aClient) => {
      aClient.queueMessage(message2);
    });
  }

  onMessageExitGame(client: Client) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    gameData.clients.delete(client);

    client.gameData = null;

    const message2 = JSON.stringify([MessageToClientEnum.ClientExitedGame, client.id]);
    this.webSocketToClient.forEach((aClient) => {
      aClient.queueMessage(message2);
    });
  }

  onMessageJoinGame(client: Client) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    gameSetup.addUser(client.user.id);

    if (gameSetup.history.length > 0) {
      client.user.numGames++;

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageUnjoinGame(client: Client) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    gameSetup.removeUser(client.user.id);

    if (gameSetup.history.length > 0) {
      client.user.numGames--;
      this.deleteUserIfItDoesNotHaveReferences(client.user);

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageApproveOfGameSetup(client: Client) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    gameSetup.approve(client.user.id);

    if (gameSetup.approvedByEverybody) {
      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      const game = new Game(gameSetup.gameMode, gameSetup.playerArrangementMode, getNewTileBag(), userIDs, usernames, gameSetup.hostUserID, null);
      gameData.gameSetup = null;
      gameData.game = game;

      const message2 = JSON.stringify([MessageToClientEnum.GameStarted, gameData.displayNumber, userIDs.toJS()]);
      this.webSocketToClient.forEach((aClient) => {
        aClient.queueMessage(message2);
      });

      game.doGameAction(GameAction.fromObject({ startGame: {} }), Date.now());
      this.sendLastGameMoveDataMessage(gameData);
    } else if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageChangeGameMode(client: Client, message: GameSetupAction.IChangeGameMode) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const gameMode = message.gameMode;
    if (gameMode === null || gameMode === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.changeGameMode(gameMode);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageChangePlayerArrangementMode(client: Client, message: GameSetupAction.IChangePlayerArrangementMode) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const playerArrangementMode = message.playerArrangementMode;
    if (playerArrangementMode === null || playerArrangementMode === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.changePlayerArrangementMode(playerArrangementMode);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageSwapPositions(client: Client, message: GameSetupAction.ISwapPositions) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const position1 = message.position1;
    const position2 = message.position2;
    if (position1 === null || position1 === undefined || position2 === null || position2 === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.swapPositions(position1, position2);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageKickUser(client: Client, message: GameSetupAction.IKickUser) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const userID = message.userId;
    if (userID === null || userID === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.kickUser(userID);

    if (gameSetup.history.length > 0) {
      const user = this.userIDToUser.get(userID)!;
      user.numGames--;
      this.deleteUserIfItDoesNotHaveReferences(user);

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageDoGameAction(client: Client, message: MessageToServer.IDoGameAction) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const game = gameData.game;
    if (game === null) {
      return;
    }

    const moveHistorySize = message.moveDataHistorySize;
    const gameAction = message.gameAction;
    if (moveHistorySize === null || moveHistorySize === undefined || moveHistorySize < 0 || gameAction === null || gameAction === undefined) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (moveHistorySize !== game.moveDataHistory.size) {
      return;
    }

    const playerID = game.userIDs.indexOf(client.user.id);
    const currentAction = game.gameActionStack[game.gameActionStack.length - 1];
    if (playerID !== currentAction.playerID) {
      return;
    }

    try {
      game.doGameAction(gameAction, Date.now());
    } catch (e) {
      this.kickWithError(client.webSocket, ErrorCode.INVALID_MESSAGE);
      return;
    }

    this.sendLastGameMoveDataMessage(gameData);
  }

  sendGameSetupChanges(gameData: GameData) {
    const gameSetup = gameData.gameSetup!;

    gameSetup.history.forEach((change) => {
      const message = JSON.stringify([MessageToClientEnum.GameSetupChanged, gameData.displayNumber, ...change]);
      this.webSocketToClient.forEach((aClient) => {
        aClient.queueMessage(message);
      });
    });

    gameSetup.clearHistory();
  }

  sendLastGameMoveDataMessage(gameData: GameData) {
    const game = gameData.game!;
    const moveData = game.moveDataHistory.get(game.moveDataHistory.size - 1)!;

    moveData.createPlayerAndWatcherMessages();

    const playerUserIDs = new Set<number>();

    // send player messages
    game.userIDs.forEach((userID, playerID) => {
      const user = this.userIDToUser.get(userID)!;
      if (user.clients.size > 0) {
        const message = JSON.stringify([MessageToClientEnum.GameActionDone, gameData.displayNumber, ...moveData.playerMessages[playerID]]);
        user.clients.forEach((aClient) => {
          aClient.queueMessage(message);
        });
      }

      playerUserIDs.add(userID);
    });

    // send watcher messages to everybody else
    const watcherMessage = JSON.stringify([MessageToClientEnum.GameActionDone, gameData.displayNumber, ...moveData.watcherMessage]);
    this.webSocketToClient.forEach((aClient) => {
      if (!playerUserIDs.has(aClient.user.id)) {
        aClient.queueMessage(watcherMessage);
      }
    });
  }

  getGreetingsMessage(gameDatas: MessageToServer.Login.IGameData[], client: Client) {
    const users: any[] = [];
    this.userIDToUser.forEach((user) => {
      const clients: any[] = [];
      user.clients.forEach((aClient) => {
        const clientData = [aClient.id];
        if (aClient.gameData !== null) {
          clientData.push(aClient.gameData.displayNumber);
        }
        clients.push(clientData);
      });

      const userMessage: any[] = [user.id, user.name];
      if (clients.length > 0) {
        userMessage.push(clients);
      }

      users.push(userMessage);
    });

    const games: any[] = [];
    this.gameIDToGameData.forEach((gameData) => {
      const message: any[] = [gameData.gameSetup !== null ? 0 : 1, gameData.id, gameData.displayNumber];

      if (gameData.gameSetup !== null) {
        message.push(gameData.gameSetup.toGameSetupData());
      } else {
        const game = gameData.game!;
        const playerID = game.userIDs.indexOf(client.user.id);

        const moveHistoryMessages: any[][] = [];
        game.moveDataHistory.forEach((moveData) => {
          if (playerID >= 0) {
            moveHistoryMessages.push(moveData.playerMessages[playerID]);
          } else {
            moveHistoryMessages.push(moveData.watcherMessage);
          }
        });
        message.push(moveHistoryMessages);

        message.push(game.gameMode, game.playerArrangementMode, game.hostUserID, game.userIDs);
      }

      games.push(message);
    });

    return JSON.stringify([MessageToClientEnum.Greetings, client.id, users, games]);
  }

  getClientConnectedMessage(client: Client, isNewUser: boolean) {
    const message: any[] = [MessageToClientEnum.ClientConnected, client.id, client.user.id];
    if (isNewUser) {
      message.push(client.user.name);
    }

    return JSON.stringify(message);
  }

  getUsernameForUserID = (userID: number) => {
    return this.userIDToUser.get(userID)!.name;
  };

  deleteUserIfItDoesNotHaveReferences(user: User) {
    if (user.clients.size === 0 && user.numGames === 0) {
      this.userIDToUser.delete(user.id);
    }
  }

  logMessage(logMessage: LogMessage, ...parameters: any[]) {
    const time = Date.now();
    const offset = time - this.lastLogMessageTime;

    this.logger(JSON.stringify([offset, logMessage, ...parameters]));

    this.lastLogMessageTime = time;
  }
}

export class Client {
  gameData: GameData | null = null;
  queuedMessages: string[] = [];

  constructor(public id: number, public webSocket: WebSocket, public user: User) {}

  queueMessage(message: string) {
    this.queuedMessages.push(message);
  }

  sendQueuedMessages() {
    if (this.queuedMessages.length > 0) {
      this.webSocket.send(['[', this.queuedMessages.join(','), ']'].join(''));
      this.queuedMessages.length = 0;
    }
  }
}

export class User {
  clients = new Set<Client>();

  numGames = 0;

  constructor(public id: number, public name: string) {}
}

export class GameData {
  gameSetup: GameSetup | null = null;
  game: Game | null = null;

  clients = new Set<Client>();

  constructor(public id: number, public displayNumber: number) {}
}
