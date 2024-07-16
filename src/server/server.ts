import {
  cleanUpWhitespaceInUsername,
  createLoginLogoutMessage,
  isValidPassword,
  isValidUsername,
} from '../common/helpers';
import {
  PB_MessageToClient,
  PB_MessageToClient_LoginLogout_ResponseCode,
  PB_MessageToServer,
  PB_MessageToServer_LoginLogout,
  PB_MessageToServer_LoginLogout_CreateUserAndLogin,
  PB_MessageToServer_LoginLogout_LoginWithPassword,
  PB_MessageToServer_LoginLogout_LoginWithToken,
} from '../common/pb';
import { Client } from './client';
import { GameRoomsManager } from './gameRoomsManager';
import { LobbyRoom } from './lobbyRoom';
import type { ServerCommunication } from './serverCommunication';
import type { UserData, UserDataProvider } from './userDataProvider';

export class Server {
  private initialMessage: Uint8Array;

  clientIDToClient = new Map<number, Client>();

  lobbyRoom = new LobbyRoom();
  gameRoomsManager = new GameRoomsManager();

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
  }

  private onConnect(clientID: number) {
    const client = new Client(clientID, (message) =>
      this.serverCommunication.sendMessage(clientID, message),
    );
    this.clientIDToClient.set(clientID, client);

    client.sendMessage(this.initialMessage);
  }

  private onDisconnect(clientID: number) {
    const client = this.clientIDToClient.get(clientID)!;

    client.disconnectFromRoom();
    client.loggedOut();

    this.clientIDToClient.delete(clientID);
  }

  private async onMessage(clientID: number, message: Uint8Array) {
    const client = this.clientIDToClient.get(clientID)!;
    const messageToServer = PB_MessageToServer.fromBinary(message);

    if (messageToServer.loginLogout) {
      await this.onMessage_LoginLogout(client, messageToServer.loginLogout);
    }
    if (messageToServer.lobby) {
      this.lobbyRoom.onMessage(client, messageToServer.lobby);
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
    if (client.userID !== undefined) {
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
    if (client.userID !== undefined) {
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
    if (client.userID !== undefined) {
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
    client.loggedIn(userData.userID, userData.username);

    this.sendLoginLogoutMessage(
      client,
      PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
      userData.username,
      userData.userID,
      userData.passwordHash,
    );
  }

  private onMessage_LoginLogout_Logout(client: Client) {
    if (client.userID === undefined) {
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
    userID?: number,
    token?: string,
  ) {
    client.sendMessage(
      PB_MessageToClient.toBinary(createLoginLogoutMessage(responseCode, username, userID, token)),
    );
  }
}
