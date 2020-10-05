import { Connection, Server } from 'sockjs';
import { MessageToClientEnum, MessageToServerEnum } from '../common/enums';
import { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import { gameModeToNumPlayers, getNewTileBag, isASCII } from '../common/helpers';
import { ErrorCode, GameAction, GameMode, PlayerArrangementMode } from '../common/pb';
import { LogMessage } from './enums';
import { ReuseIDManager } from './reuseIDManager';
import { UserDataProvider } from './userDataProvider';

export enum ConnectionState {
  WaitingForFirstMessage,
  ProcessingFirstMessage,
  LoggedIn,
}

export class ServerManager {
  connectionIDToConnectionState = new Map<string, ConnectionState>();

  connectionIDToPreLoggedInConnection = new Map<string, Connection>();

  clientIDManager = new ReuseIDManager(60000);
  connectionIDToClient = new Map<string, Client>();
  userIDToUser = new Map<number, User>();

  gameDisplayNumberManager = new ReuseIDManager(60000);
  gameIDToGameData = new Map<number, GameData>();
  gameDisplayNumberToGameData = new Map<number, GameData>();

  onMessageFunctions: Map<MessageToServerEnum, (client: Client, params: any[]) => void>;

  lastLogMessageTime = 0;

  constructor(public server: Server, public userDataProvider: UserDataProvider, public nextGameID: number, public logger: (message: string) => void) {
    this.onMessageFunctions = new Map([
      [MessageToServerEnum.CreateGame, this.onMessageCreateGame],
      [MessageToServerEnum.EnterGame, this.onMessageEnterGame],
      [MessageToServerEnum.ExitGame, this.onMessageExitGame],
      [MessageToServerEnum.JoinGame, this.onMessageJoinGame],
      [MessageToServerEnum.UnjoinGame, this.onMessageUnjoinGame],
      [MessageToServerEnum.ApproveOfGameSetup, this.onMessageApproveOfGameSetup],
      [MessageToServerEnum.ChangeGameMode, this.onMessageChangeGameMode],
      [MessageToServerEnum.ChangePlayerArrangementMode, this.onMessageChangePlayerArrangementMode],
      [MessageToServerEnum.SwapPositions, this.onMessageSwapPositions],
      [MessageToServerEnum.KickUser, this.onMessageKickUser],
      [MessageToServerEnum.DoGameAction, this.onMessageDoGameAction],
    ]);
  }

  manage() {
    this.server.on('connection', (connection) => {
      this.logMessage(
        LogMessage.Connected,
        connection.id,
        connection.headers,
        connection.pathname,
        connection.protocol,
        connection.remoteAddress,
        connection.remotePort,
      );

      this.addConnection(connection);

      connection.on('data', (messageString) => {
        let message: any[];
        try {
          message = JSON.parse(messageString);
        } catch (error) {
          this.logMessage(LogMessage.MessageThatIsNotJSON, connection.id, messageString);

          this.kickWithError(connection, ErrorCode.INVALID_MESSAGE_FORMAT);
          return;
        }

        if (!Array.isArray(message)) {
          this.logMessage(LogMessage.MessageThatIsNotAnArray, connection.id, message);

          this.kickWithError(connection, ErrorCode.INVALID_MESSAGE_FORMAT);
          return;
        }

        const client = this.connectionIDToClient.get(connection.id);
        if (client !== undefined) {
          this.logMessage(LogMessage.MessageWhileLoggedIn, client.id, message);
        } else {
          let sanitizedMessage = message;
          if (message[2] !== '') {
            sanitizedMessage = [...message];
            sanitizedMessage[2] = '***';
          }

          this.logMessage(LogMessage.MessageWhileNotLoggedIn, connection.id, sanitizedMessage);
        }

        const connectionState = this.connectionIDToConnectionState.get(connection.id);

        if (connectionState === ConnectionState.LoggedIn && client !== undefined) {
          const handler = this.onMessageFunctions.get(message[0]);

          if (handler) {
            handler.call(this, client, message.slice(1));

            this.sendAllQueuedMessages();
          } else {
            this.kickWithError(connection, ErrorCode.INVALID_MESSAGE);
          }
        } else if (connectionState === ConnectionState.WaitingForFirstMessage) {
          this.connectionIDToConnectionState.set(connection.id, ConnectionState.ProcessingFirstMessage);

          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          this.processFirstMessage(connection, message);
        }
      });

      connection.on('close', () => {
        const client = this.connectionIDToClient.get(connection.id);
        if (client !== undefined) {
          this.logMessage(LogMessage.Disconnected, connection.id, client.id, client.user.id, client.user.name);
        } else {
          this.logMessage(LogMessage.Disconnected, connection.id);
        }

        this.removeConnection(connection);

        this.sendAllQueuedMessages();
      });
    });
  }

  sendAllQueuedMessages() {
    this.connectionIDToClient.forEach((aClient) => {
      aClient.sendQueuedMessages();
    });
  }

  addConnection(connection: Connection) {
    this.connectionIDToConnectionState.set(connection.id, ConnectionState.WaitingForFirstMessage);
    this.connectionIDToPreLoggedInConnection.set(connection.id, connection);
  }

  removeConnection(connection: Connection) {
    const connectionState = this.connectionIDToConnectionState.get(connection.id);
    if (connectionState === undefined) {
      return;
    }

    this.connectionIDToConnectionState.delete(connection.id);

    if (connectionState === ConnectionState.LoggedIn) {
      const client = this.connectionIDToClient.get(connection.id);
      if (client === undefined) {
        return;
      }

      this.clientIDManager.returnID(client.id);

      this.connectionIDToClient.delete(connection.id);

      const user = client.user;
      user.clients.delete(client);
      this.deleteUserIfItDoesNotHaveReferences(user);

      const messageToOtherClients = JSON.stringify([MessageToClientEnum.ClientDisconnected, client.id]);
      this.connectionIDToClient.forEach((otherClient) => {
        otherClient.queueMessage(messageToOtherClients);
      });
    } else {
      this.connectionIDToPreLoggedInConnection.delete(connection.id);
    }
  }

  kickWithError(connection: Connection, errorCode: ErrorCode) {
    this.logMessage(LogMessage.KickedWithError, connection.id, errorCode);

    connection.write(JSON.stringify([[MessageToClientEnum.FatalError, errorCode]]));
    connection.close();
  }

  async processFirstMessage(connection: Connection, message: any[]) {
    if (message.length !== 4) {
      this.kickWithError(connection, ErrorCode.INVALID_MESSAGE_FORMAT);
      return;
    }

    const version: number = message[0];
    if (version !== 0) {
      this.kickWithError(connection, ErrorCode.NOT_USING_LATEST_VERSION);
      return;
    }

    const username: string = message[1];
    if (username.length === 0 || username.length > 32 || !isASCII(username)) {
      this.kickWithError(connection, ErrorCode.INVALID_USERNAME);
      return;
    }

    const password: string = message[2];
    if (typeof password !== 'string') {
      this.kickWithError(connection, ErrorCode.INVALID_MESSAGE_FORMAT);
      return;
    }

    const gameDataArray: any[] = message[3];
    if (!Array.isArray(gameDataArray)) {
      this.kickWithError(connection, ErrorCode.INVALID_MESSAGE_FORMAT);
      return;
    }

    let userData;
    try {
      userData = await this.userDataProvider.lookupUser(username);
    } catch (error) {
      this.kickWithError(connection, ErrorCode.INTERNAL_SERVER_ERROR);
      return;
    }

    let userID = 0;

    if (userData !== null) {
      if (userData.hasPassword) {
        if (password.length === 0) {
          this.kickWithError(connection, ErrorCode.MISSING_PASSWORD);
          return;
        } else if (!userData.verifyPassword(password)) {
          this.kickWithError(connection, ErrorCode.INCORRECT_PASSWORD);
          return;
        } else {
          userID = userData.userID;
        }
      } else {
        if (password.length > 0) {
          this.kickWithError(connection, ErrorCode.PROVIDED_PASSWORD);
          return;
        } else {
          userID = userData.userID;
        }
      }
    } else {
      if (password.length > 0) {
        this.kickWithError(connection, ErrorCode.PROVIDED_PASSWORD);
        return;
      } else {
        try {
          userID = await this.userDataProvider.createUser(username, null);
        } catch (error) {
          this.kickWithError(connection, ErrorCode.INTERNAL_SERVER_ERROR);
          return;
        }
      }
    }

    this.connectionIDToConnectionState.set(connection.id, ConnectionState.LoggedIn);

    this.connectionIDToPreLoggedInConnection.delete(connection.id);

    let user = this.userIDToUser.get(userID);
    let isNewUser = false;
    if (user === undefined) {
      user = new User(userID, username);
      this.userIDToUser.set(userID, user);
      isNewUser = true;
    }

    const client = new Client(this.clientIDManager.getID(), connection, user);
    this.connectionIDToClient.set(connection.id, client);
    user.clients.add(client);

    client.queueMessage(this.getGreetingsMessage(gameDataArray, client));

    const outgoingMessageParts: any[] = [MessageToClientEnum.ClientConnected, client.id, client.user.id];
    if (isNewUser) {
      outgoingMessageParts.push(client.user.name);
    }
    const messageToOtherClients = JSON.stringify(outgoingMessageParts);

    this.connectionIDToClient.forEach((otherClient) => {
      if (otherClient !== client) {
        otherClient.queueMessage(messageToOtherClients);
      }
    });

    this.sendAllQueuedMessages();

    this.logMessage(LogMessage.LoggedIn, connection.id, client.id, userID, username);
  }

  onMessageCreateGame(client: Client, params: any[]) {
    if (params.length !== 1) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const gameMode: GameMode = params[0];
    if (!gameModeToNumPlayers.has(gameMode)) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
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
    this.connectionIDToClient.forEach((aClient) => {
      aClient.queueMessage(gameCreatedMessage);
      aClient.queueMessage(clientEnteredGameMessage);
    });
  }

  onMessageEnterGame(client: Client, params: any[]) {
    if (params.length !== 1) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const gameDisplayNumber: number = params[0];
    const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber);
    if (gameData === undefined) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (client.gameData !== null) {
      return;
    }

    gameData.clients.add(client);

    client.gameData = gameData;

    const message = JSON.stringify([MessageToClientEnum.ClientEnteredGame, client.id, gameData.displayNumber]);
    this.connectionIDToClient.forEach((aClient) => {
      aClient.queueMessage(message);
    });
  }

  onMessageExitGame(client: Client, params: any[]) {
    if (params.length !== 0) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    gameData.clients.delete(client);

    client.gameData = null;

    const message = JSON.stringify([MessageToClientEnum.ClientExitedGame, client.id]);
    this.connectionIDToClient.forEach((aClient) => {
      aClient.queueMessage(message);
    });
  }

  onMessageJoinGame(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (params.length !== 0) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.addUser(client.user.id);

    if (gameSetup.history.length > 0) {
      client.user.numGames++;

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageUnjoinGame(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (params.length !== 0) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.removeUser(client.user.id);

    if (gameSetup.history.length > 0) {
      client.user.numGames--;
      this.deleteUserIfItDoesNotHaveReferences(client.user);

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageApproveOfGameSetup(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (params.length !== 0) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.approve(client.user.id);

    if (gameSetup.approvedByEverybody) {
      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      const game = new Game(gameSetup.gameMode, gameSetup.playerArrangementMode, getNewTileBag(), userIDs, usernames, gameSetup.hostUserID, null);
      gameData.gameSetup = null;
      gameData.game = game;

      const message = JSON.stringify([MessageToClientEnum.GameStarted, gameData.displayNumber, userIDs.toJS()]);
      this.connectionIDToClient.forEach((aClient) => {
        aClient.queueMessage(message);
      });

      game.doGameAction(GameAction.fromObject({ startGame: {} }), Date.now());
      this.sendLastGameMoveDataMessage(gameData);
    } else if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageChangeGameMode(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (params.length !== gameSetup.changeGameMode.length) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.changeGameMode(params[0]);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageChangePlayerArrangementMode(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (params.length !== gameSetup.changePlayerArrangementMode.length) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.changePlayerArrangementMode(params[0]);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageSwapPositions(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (params.length !== gameSetup.swapPositions.length) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.swapPositions(params[0], params[1]);

    if (gameSetup.history.length > 0) {
      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageKickUser(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const gameSetup = gameData.gameSetup;
    if (gameSetup === null) {
      return;
    }

    if (client.user.id !== gameSetup.hostUserID) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    if (params.length !== gameSetup.kickUser.length) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    gameSetup.kickUser(params[0]);

    if (gameSetup.history.length > 0) {
      const user = this.userIDToUser.get(params[0])!;
      user.numGames--;
      this.deleteUserIfItDoesNotHaveReferences(user);

      this.sendGameSetupChanges(gameData);
    }
  }

  onMessageDoGameAction(client: Client, params: any[]) {
    const gameData = client.gameData;
    if (gameData === null) {
      return;
    }

    const game = gameData.game;
    if (game === null) {
      return;
    }

    if (params.length === 0) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    const moveHistorySize: number = params[0];
    if (!Number.isInteger(moveHistorySize) || moveHistorySize < 0) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
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
      game.doGameAction(params[1], Date.now());
    } catch (e) {
      this.kickWithError(client.connection, ErrorCode.INVALID_MESSAGE);
      return;
    }

    this.sendLastGameMoveDataMessage(gameData);
  }

  sendGameSetupChanges(gameData: GameData) {
    const gameSetup = gameData.gameSetup!;

    gameSetup.history.forEach((change) => {
      const message = JSON.stringify([MessageToClientEnum.GameSetupChanged, gameData.displayNumber, ...change]);
      this.connectionIDToClient.forEach((aClient) => {
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
    this.connectionIDToClient.forEach((aClient) => {
      if (!playerUserIDs.has(aClient.user.id)) {
        aClient.queueMessage(watcherMessage);
      }
    });
  }

  getGreetingsMessage(_gameDataArray: any[], client: Client) {
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
        message.push(...gameData.gameSetup.toJSON());
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

  constructor(public id: number, public connection: Connection, public user: User) {}

  queueMessage(message: string) {
    this.queuedMessages.push(message);
  }

  sendQueuedMessages() {
    if (this.queuedMessages.length > 0) {
      this.connection.write(['[', this.queuedMessages.join(','), ']'].join(''));
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
