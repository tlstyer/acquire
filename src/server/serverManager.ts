import WebSocket from 'ws';
import { Game } from '../common/game';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { GameSetup } from '../common/gameSetup';
import { gameModeToNumPlayers, getNewTileBag, isASCII } from '../common/helpers';
import {
  PB_ErrorCode,
  PB_Game,
  PB_GameAction,
  PB_GameSetupAction_ChangeGameMode,
  PB_GameSetupAction_ChangePlayerArrangementMode,
  PB_GameSetupAction_KickUser,
  PB_GameSetupAction_SwapPositions,
  PB_GameStatus,
  PB_Game_Position,
  PB_MessagesToClient,
  PB_MessageToClient,
  PB_MessageToClient_Greetings_User,
  PB_MessageToClient_Greetings_User_Client,
  PB_MessageToServer,
  PB_MessageToServer_CreateGame,
  PB_MessageToServer_DoGameAction,
  PB_MessageToServer_EnterGame,
  PB_MessageToServer_Login,
  PB_PlayerArrangementMode,
} from '../common/pb';
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
        let message: PB_MessageToServer;
        try {
          // @ts-expect-error
          message = PB_MessageToServer.fromBinary(rawMessage);
        } catch (error) {
          this.logMessage(LogMessage.InvalidMessage, webSocketID, rawMessage);

          this.kickWithError(webSocket, PB_ErrorCode.INVALID_MESSAGE_FORMAT);
          return;
        }

        const client = this.webSocketToClient.get(webSocket);
        if (client !== undefined) {
          this.logMessage(LogMessage.MessageWhileLoggedIn, client.id, message);
        } else {
          let sanitizedMessage = message;
          if (message.login && message.login.password !== '') {
            sanitizedMessage = PB_MessageToServer.clone(message);
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
            const gameSetupAction = message.doGameSetupAction;

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
              this.kickWithError(webSocket, PB_ErrorCode.INVALID_MESSAGE);
            }
          } else if (message.doGameAction) {
            this.onMessageDoGameAction(client, message.doGameAction);
          } else {
            this.kickWithError(webSocket, PB_ErrorCode.INVALID_MESSAGE);
          }

          this.sendAllQueuedMessages();
        } else if (connectionState === ConnectionState.WaitingForFirstMessage) {
          this.webSocketToConnectionState.set(webSocket, ConnectionState.ProcessingFirstMessage);

          if (message.login) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.processFirstMessage(webSocket, message.login);
          } else {
            this.kickWithError(webSocket, PB_ErrorCode.INVALID_MESSAGE_FORMAT);
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

      const clientDisconnectedMessage = PB_MessageToClient.create({
        clientDisconnected: {
          clientId: client.id,
        },
      });
      this.webSocketToClient.forEach((otherClient) => {
        otherClient.queueMessage(clientDisconnectedMessage);
      });
    } else {
      this.preLoggedInWebSockets.delete(webSocket);
    }
  }

  kickWithError(webSocket: WebSocket, errorCode: PB_ErrorCode) {
    this.logMessage(LogMessage.KickedWithError, this.webSocketToID.get(webSocket), errorCode);

    webSocket.send(
      PB_MessagesToClient.toBinary({
        messagesToClient: [
          {
            fatalError: {
              errorCode,
            },
          },
        ],
      }),
    );
    webSocket.close();
  }

  async processFirstMessage(webSocket: WebSocket, message: PB_MessageToServer_Login) {
    const version = message.version;
    if (version !== 0) {
      this.kickWithError(webSocket, PB_ErrorCode.NOT_USING_LATEST_VERSION);
      return;
    }

    const username = message.username;
    if (username.length === 0 || username.length > 32 || !isASCII(username)) {
      this.kickWithError(webSocket, PB_ErrorCode.INVALID_USERNAME);
      return;
    }

    const password = message.password;

    let userData;
    try {
      userData = await this.userDataProvider.lookupUser(username);
    } catch (error) {
      this.kickWithError(webSocket, PB_ErrorCode.INTERNAL_SERVER_ERROR);
      return;
    }

    let userID = 0;

    if (userData !== null) {
      if (userData.hasPassword) {
        if (password.length === 0) {
          this.kickWithError(webSocket, PB_ErrorCode.MISSING_PASSWORD);
          return;
        } else if (!userData.verifyPassword(password)) {
          this.kickWithError(webSocket, PB_ErrorCode.INCORRECT_PASSWORD);
          return;
        } else {
          userID = userData.userID;
        }
      } else {
        if (password.length > 0) {
          this.kickWithError(webSocket, PB_ErrorCode.PROVIDED_PASSWORD);
          return;
        } else {
          userID = userData.userID;
        }
      }
    } else {
      if (password.length > 0) {
        this.kickWithError(webSocket, PB_ErrorCode.PROVIDED_PASSWORD);
        return;
      } else {
        try {
          userID = await this.userDataProvider.createUser(username, null);
        } catch (error) {
          this.kickWithError(webSocket, PB_ErrorCode.INTERNAL_SERVER_ERROR);
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

    client.queueMessage(this.getGreetingsMessage(client));

    const clientConnectedMessage = PB_MessageToClient.create({
      clientConnected: {
        clientId: client.id,
        userId: client.user.id,
        username: isNewUser ? client.user.name : undefined,
      },
    });

    this.webSocketToClient.forEach((otherClient) => {
      if (otherClient !== client) {
        otherClient.queueMessage(clientConnectedMessage);
      }
    });

    this.sendAllQueuedMessages();

    this.logMessage(LogMessage.LoggedIn, this.webSocketToID.get(webSocket), client.id, userID, username);
  }

  onMessageCreateGame(client: Client, message: PB_MessageToServer_CreateGame) {
    const gameMode = message.gameMode;
    if (!gameModeToNumPlayers.has(gameMode)) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (client.gameData !== null) {
      return;
    }

    const gameData = new GameData(this.nextGameID++, this.gameDisplayNumberManager.getID());
    gameData.gameSetup = new GameSetup(gameMode, PB_PlayerArrangementMode.RANDOM_ORDER, client.user.id, this.getUsernameForUserID);
    gameData.clients.add(client);

    client.gameData = gameData;
    client.user.numGames++;

    this.gameIDToGameData.set(gameData.id, gameData);
    this.gameDisplayNumberToGameData.set(gameData.displayNumber, gameData);

    const gameCreatedMessage = PB_MessageToClient.create({
      gameCreated: {
        gameId: gameData.id,
        gameDisplayNumber: gameData.displayNumber,
        gameMode: gameData.gameSetup.gameMode,
        hostClientId: client.id,
      },
    });
    const clientEnteredGameMessage = PB_MessageToClient.create({
      clientEnteredGame: {
        clientId: client.id,
        gameDisplayNumber: gameData.displayNumber,
      },
    });
    this.webSocketToClient.forEach((aClient) => {
      aClient.queueMessage(gameCreatedMessage);
      aClient.queueMessage(clientEnteredGameMessage);
    });
  }

  onMessageEnterGame(client: Client, message: PB_MessageToServer_EnterGame) {
    const gameData = this.gameDisplayNumberToGameData.get(message.gameDisplayNumber);
    if (gameData === undefined || message.gameStateHistorySize < 0 || (gameData.game && message.gameStateHistorySize > gameData.game.gameStateHistory.size)) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (client.gameData !== null) {
      return;
    }

    gameData.clients.add(client);

    client.gameData = gameData;

    const clientEnteredGameMessage = PB_MessageToClient.create({
      clientEnteredGame: {
        clientId: client.id,
        gameDisplayNumber: gameData.displayNumber,
      },
    });
    this.webSocketToClient.forEach((aClient) => {
      aClient.queueMessage(clientEnteredGameMessage);
    });

    const game = gameData.game;
    if (game) {
      const gameStateHistory = game.gameStateHistory;
      const playerID = game.userIDs.indexOf(client.user.id);

      for (let gameStateHistoryIndex = message.gameStateHistorySize; gameStateHistoryIndex < gameStateHistory.size; gameStateHistoryIndex++) {
        const gameState = gameStateHistory.get(gameStateHistoryIndex)!;

        client.queueMessage(
          PB_MessageToClient.create({
            gameActionDone: playerID >= 0 ? gameState.playerGameStates[playerID] : gameState.watcherGameState,
          }),
        );
      }
    }
  }

  onMessageExitGame(client: Client) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    gameData.clients.delete(client);

    client.gameData = null;

    const clientExitedGameMessage = PB_MessageToClient.create({
      clientExitedGame: {
        clientId: client.id,
      },
    });
    this.webSocketToClient.forEach((aClient) => {
      aClient.queueMessage(clientExitedGameMessage);
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

      const gameStartedMessage = PB_MessageToClient.create({
        gameStarted: {
          gameDisplayNumber: gameData.displayNumber,
          // @ts-expect-error
          userIds: userIDs.toJS(),
        },
      });
      this.webSocketToClient.forEach((aClient) => {
        aClient.queueMessage(gameStartedMessage);
      });

      game.doGameAction(
        PB_GameAction.create({
          startGame: {},
        }),
        Date.now(),
      );
      this.sendLastGameGameStateMessage(gameData);
    } else if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageChangeGameMode(client: Client, message: PB_GameSetupAction_ChangeGameMode) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.changeGameMode(message.gameMode);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageChangePlayerArrangementMode(client: Client, message: PB_GameSetupAction_ChangePlayerArrangementMode) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.changePlayerArrangementMode(message.playerArrangementMode);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageSwapPositions(client: Client, message: PB_GameSetupAction_SwapPositions) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.swapPositions(message.position1, message.position2);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageKickUser(client: Client, message: PB_GameSetupAction_KickUser) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    const userID = message.userId;

    gameSetup.kickUser(userID);

    if (gameSetup.history.length > 0) {
      const user = this.userIDToUser.get(userID)!;
      user.numGames--;
      this.deleteUserIfItDoesNotHaveReferences(user);

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageDoGameAction(client: Client, message: PB_MessageToServer_DoGameAction) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const game = gameData.game;
    if (game === null) {
      return;
    }

    const gameStateHistorySize = message.gameStateHistorySize;
    const gameAction = message.gameAction;
    if (gameStateHistorySize < 0 || gameAction === undefined) {
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (gameStateHistorySize !== game.gameStateHistory.size) {
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
      this.kickWithError(client.webSocket, PB_ErrorCode.INVALID_MESSAGE);
      return;
    }

    this.sendLastGameGameStateMessage(gameData);
  }

  sendGameSetupChanges(gameData: GameData) {
    const gameSetup = gameData.gameSetup!;

    gameSetup.history.forEach((gameSetupChange) => {
      const gameSetupChangedMessage = PB_MessageToClient.create({
        gameSetupChanged: {
          gameDisplayNumber: gameData.displayNumber,
          gameSetupChange,
        },
      });
      this.webSocketToClient.forEach((aClient) => {
        aClient.queueMessage(gameSetupChangedMessage);
      });
    });

    gameSetup.clearHistory();
  }

  sendLastGameGameStateMessage(gameData: GameData) {
    const game = gameData.game!;
    const gameState = game.gameStateHistory.get(game.gameStateHistory.size - 1)!;

    // queue GameBoardChanged messages to clients not in the game room
    if (gameState.gameBoardChangeGameBoardType !== undefined || gameState.gameBoardCantPlayEverTiles.length > 0) {
      const gameBoardChanged = PB_MessageToClient.create({
        gameBoardChanged: {
          gameDisplayNumber: gameData.displayNumber,
          gameBoardType: gameState.gameBoardChangeGameBoardType,
          tiles: gameState.gameBoardChangeTiles,
          cantPlayEverTiles: gameState.gameBoardCantPlayEverTiles,
        },
      });

      this.webSocketToClient.forEach((aClient) => {
        if (!gameData.clients.has(aClient)) {
          aClient.queueMessage(gameBoardChanged);
        }
      });
    }

    // queue GameActionDone player and watcher messages to clients in the game room
    gameState.createPlayerAndWatcherGameStates();

    gameData.clients.forEach((aClient) => {
      const playerID = game.userIDs.indexOf(aClient.user.id);

      aClient.queueMessage(
        PB_MessageToClient.create({
          gameActionDone: playerID >= 0 ? gameState.playerGameStates[playerID] : gameState.watcherGameState,
        }),
      );
    });
  }

  getGreetingsMessage(client: Client) {
    const users: PB_MessageToClient_Greetings_User[] = [];
    this.userIDToUser.forEach((user) => {
      const clients: PB_MessageToClient_Greetings_User_Client[] = [];
      user.clients.forEach((aClient) => {
        clients.push(
          PB_MessageToClient_Greetings_User_Client.create({
            clientId: aClient.id,
            gameDisplayNumber: aClient.gameData !== null ? aClient.gameData.displayNumber : undefined,
          }),
        );
      });

      users.push(
        PB_MessageToClient_Greetings_User.create({
          userId: user.id,
          username: user.name,
          clients,
        }),
      );
    });

    const games: PB_Game[] = [];
    this.gameIDToGameData.forEach((gameData) => {
      let gamePB: PB_Game;

      if (gameData.gameSetup !== null) {
        gamePB = gameData.gameSetup.toGameData();
      } else {
        const game = gameData.game!;

        const positions: PB_Game_Position[] = new Array(game.userIDs.size);
        game.userIDs.forEach((userID, i) => {
          positions[i] = PB_Game_Position.create({
            userId: userID,
            isHost: userID === game.hostUserID,
          });
        });

        gamePB = PB_Game.create({
          gameStatus: game.gameActionStack[0] instanceof ActionGameOver ? PB_GameStatus.COMPLETED : PB_GameStatus.IN_PROGRESS,
          gameMode: game.gameMode,
          playerArrangementMode: game.playerArrangementMode,
          positions,
          // @ts-expect-error
          gameBoard: game.gameBoard.toJS().flat(),
        });
      }

      gamePB.gameId = gameData.id;
      gamePB.gameDisplayNumber = gameData.displayNumber;

      games.push(gamePB);
    });

    return PB_MessageToClient.create({
      greetings: {
        clientId: client.id,
        users,
        games,
      },
    });
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
  queuedMessages: PB_MessageToClient[] = [];

  constructor(public id: number, public webSocket: WebSocket, public user: User) {}

  queueMessage(message: PB_MessageToClient) {
    this.queuedMessages.push(message);
  }

  sendQueuedMessages() {
    if (this.queuedMessages.length > 0) {
      this.webSocket.send(
        PB_MessagesToClient.toBinary({
          messagesToClient: this.queuedMessages,
        }),
      );
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
