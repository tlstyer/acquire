import {
  cleanUpWhitespaceInUsername,
  createLoginLogoutMessage,
  isValidPassword,
  isValidUsername,
} from '../common/helpers.js';
import {
  PB_MessageToClient,
  PB_MessageToClient_LoginLogout_ResponseCode,
  PB_MessageToServer,
  type PB_MessageToServer_LoginLogout,
  type PB_MessageToServer_LoginLogout_CreateUserAndLogin,
  type PB_MessageToServer_LoginLogout_LoginWithPassword,
  type PB_MessageToServer_LoginLogout_LoginWithToken,
} from '../common/pb.js';
import { User } from '../common/user.js';
import { Client } from './client.js';
import { GameRoomsManager } from './gameRoomsManager.js';
import { LobbyRoom } from './lobbyRoom.js';
import { type ServerCommunication } from './serverCommunication.js';
import { type UserData, type UserDataProvider } from './userDataProvider.js';

export class Server {
  private initialMessage: Uint8Array;

  clientIdToClient = new Map<number, Client>();

  lobbyRoom = new LobbyRoom();
  gameRoomsManager = new GameRoomsManager();

  userIdToUser = new Map<number, User>(); // unique User objects for everybody who ever logged in. TODO: purge unused users sometimes.

  constructor(
    public serverCommunication: ServerCommunication,
    private userDataProvider: UserDataProvider,
    version: number,
    logTime: number,
  ) {
    serverCommunication.setCallbacks(
      this.onConnect.bind(this),
      this.onDisconnect.bind(this),
      this.onMessage.bind(this),
    );

    this.initialMessage = PB_MessageToClient.toBinary({
      initial: {
        version,
        logTime,
      },
    });

    this.lobbyRoom.setGameRoomsManager(this.gameRoomsManager);

    this.gameRoomsManager.setLobbyRoom(this.lobbyRoom);
    this.gameRoomsManager.setLogTime(logTime);
  }

  private onConnect(clientId: number) {
    const client = new Client(clientId, (message) =>
      this.serverCommunication.sendMessage(clientId, message),
    );
    this.clientIdToClient.set(clientId, client);

    client.sendMessage(this.initialMessage);
  }

  private onDisconnect(clientId: number) {
    const client = this.clientIdToClient.get(clientId)!;

    client.disconnectFromRoom();
    client.loggedOut();

    this.clientIdToClient.delete(clientId);
  }

  private async onMessage(clientId: number, message: Uint8Array) {
    const client = this.clientIdToClient.get(clientId)!;
    const messageToServer = PB_MessageToServer.fromBinary(message);

    if (messageToServer.loginLogout) {
      await this.onMessage_LoginLogout(client, messageToServer.loginLogout);
    }
    if (messageToServer.lobby) {
      this.lobbyRoom.onMessage(client, messageToServer.lobby);
    }
    if (messageToServer.game) {
      this.gameRoomsManager.onMessage(client, messageToServer.game);
    }
  }

  private async onMessage_LoginLogout(client: Client, message: PB_MessageToServer_LoginLogout) {
    if (client.isLoggingInOrOut) {
      // ignore attempt to login or logout while already attempting to do so
      return;
    }

    client.isLoggingInOrOut = true;

    if (message.loginWithPassword) {
      await this.onMessage_LoginLogout_LoginWithPassword(client, message.loginWithPassword);
    } else if (message.loginWithToken) {
      await this.onMessage_LoginLogout_LoginWithToken(client, message.loginWithToken);
    } else if (message.createUserAndLogin) {
      await this.onMessage_LoginLogout_CreateUserAndLogin(client, message.createUserAndLogin);
    } else if (message.logout) {
      this.onMessage_LoginLogout_Logout(client);
    }

    client.isLoggingInOrOut = false;
  }

  private async onMessage_LoginLogout_LoginWithPassword(
    client: Client,
    message: PB_MessageToServer_LoginLogout_LoginWithPassword,
  ) {
    if (client.user !== null) {
      // ignore attempt to login while already logged in
      return;
    }

    const username = cleanUpWhitespaceInUsername(message.username);

    const userDataProviderResponse = await this.userDataProvider.lookupUser(username);

    if (userDataProviderResponse.errorCode !== undefined) {
      this.sendLoginLogoutMessage(client, userDataProviderResponse.errorCode);
      return;
    }

    if (!userDataProviderResponse.userData) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND,
      );
      return;
    }

    if (!userDataProviderResponse.userData.verifyPassword(message.password)) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.INCORRECT_PASSWORD,
      );
      return;
    }

    this.loginUser(client, userDataProviderResponse.userData);
  }

  private async onMessage_LoginLogout_LoginWithToken(
    client: Client,
    message: PB_MessageToServer_LoginLogout_LoginWithToken,
  ) {
    if (client.user !== null) {
      // ignore attempt to login while already logged in
      return;
    }

    const username = cleanUpWhitespaceInUsername(message.username);

    const userDataProviderResponse = await this.userDataProvider.lookupUser(username);

    if (userDataProviderResponse.errorCode !== undefined) {
      this.sendLoginLogoutMessage(client, userDataProviderResponse.errorCode);
      return;
    }

    if (!userDataProviderResponse.userData) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND,
      );
      return;
    }

    if (!userDataProviderResponse.userData.verifyToken(message.token)) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.INVALID_TOKEN,
      );
      return;
    }

    this.loginUser(client, userDataProviderResponse.userData);
  }

  private async onMessage_LoginLogout_CreateUserAndLogin(
    client: Client,
    message: PB_MessageToServer_LoginLogout_CreateUserAndLogin,
  ) {
    if (client.user !== null) {
      // ignore attempt to login while already logged in
      return;
    }

    const username = cleanUpWhitespaceInUsername(message.username);

    if (!isValidUsername(username)) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME,
      );
      return;
    }

    if (!isValidPassword(message.password)) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.INVALID_PASSWORD,
      );
      return;
    }

    const userDataProviderResponse = await this.userDataProvider.createUser(
      username,
      message.password,
    );

    if (userDataProviderResponse.errorCode !== undefined) {
      this.sendLoginLogoutMessage(client, userDataProviderResponse.errorCode);
      return;
    }

    if (!userDataProviderResponse.userData) {
      this.sendLoginLogoutMessage(
        client,
        PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR,
      );
      return;
    }

    this.loginUser(client, userDataProviderResponse.userData);
  }

  private loginUser(client: Client, userData: UserData) {
    let user = this.userIdToUser.get(userData.userId);
    if (user === undefined) {
      user = new User(userData.userId, userData.username);
      this.userIdToUser.set(userData.userId, user);
    }

    client.loggedIn(user);

    this.sendLoginLogoutMessage(
      client,
      PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
      userData.username,
      userData.userId,
      userData.passwordHash,
    );
  }

  private onMessage_LoginLogout_Logout(client: Client) {
    if (client.user === null) {
      // ignore attempt to log out while already logged out
      return;
    }

    client.loggedOut();

    this.sendLoginLogoutMessage(client, PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS);
  }

  private sendLoginLogoutMessage(
    client: Client,
    responseCode: PB_MessageToClient_LoginLogout_ResponseCode,
    username?: string,
    userId?: number,
    token?: string,
  ) {
    client.sendMessage(
      PB_MessageToClient.toBinary(createLoginLogoutMessage(responseCode, username, userId, token)),
    );
  }
}
