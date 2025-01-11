import { writable } from 'svelte/store';
import { concatenateUint8Arrays } from '../common/helpers';
import {
  PB_MessageToClient,
  PB_MessageToClient_Initial,
  PB_MessageToClient_LoginLogout,
  PB_MessageToClient_LoginLogout_ResponseCode,
  PB_MessageToServer,
} from '../common/pb';
import type { ClientCommunication } from './clientCommunication';
import { LobbyManager } from './lobbyManager';

export class Client {
  logTime = 0;

  myUsername: string | undefined;
  myUserID: number | undefined;
  myToken: string | undefined;

  isConnected = false;
  private isConnectedWritableStore = writable(false);
  isConnectedStore = { subscribe: this.isConnectedWritableStore.subscribe };

  loginMessage: Uint8Array | undefined;

  private usernameWritableStore = writable<string>('');
  usernameStore = { subscribe: this.usernameWritableStore.subscribe };
  private loginStateWritableStore = writable(LoginState.LoggedOut);
  loginStateStore = { subscribe: this.loginStateWritableStore.subscribe };
  private loginLogoutResponseCodeWritableStore = writable<
    PB_MessageToClient_LoginLogout_ResponseCode | undefined
  >(undefined);
  loginLogoutResponseCodeStore = { subscribe: this.loginLogoutResponseCodeWritableStore.subscribe };

  private usernameAndTokenWritableStore = writable<UsernameAndToken | undefined>(undefined);
  usernameAndTokenStore = { subscribe: this.usernameAndTokenWritableStore.subscribe };

  currentPage = CurrentPage.None;
  lobbyManager = new LobbyManager(this);

  constructor(
    public clientCommunication: ClientCommunication,
    private version: number,
  ) {
    clientCommunication.setCallbacks(
      this.onConnect.bind(this),
      this.onDisconnect.bind(this),
      this.onMessage.bind(this),
    );
  }

  loginWithPassword(username: string, password: string) {
    if (this.loginMessage !== undefined) {
      return;
    }

    this.loginMessage = PB_MessageToServer.toBinary({
      loginLogout: {
        loginWithPassword: {
          username,
          password,
        },
      },
    });

    this.loginStateWritableStore.set(LoginState.TryingToLogIn);
    this.loginLogoutResponseCodeWritableStore.set(undefined);

    this.clientCommunication.sendMessage(this.loginMessage);
  }

  loginWithToken(username: string, token: string) {
    if (this.loginMessage !== undefined) {
      return;
    }

    this.loginMessage = PB_MessageToServer.toBinary({
      loginLogout: {
        loginWithToken: {
          username,
          token,
        },
      },
    });

    this.loginStateWritableStore.set(LoginState.TryingToLogIn);
    this.loginLogoutResponseCodeWritableStore.set(undefined);

    this.clientCommunication.sendMessage(this.loginMessage);
  }

  createUserAndLogin(username: string, password: string) {
    if (this.loginMessage !== undefined) {
      return;
    }

    this.loginMessage = PB_MessageToServer.toBinary({
      loginLogout: {
        createUserAndLogin: {
          username,
          password,
        },
      },
    });

    this.loginStateWritableStore.set(LoginState.TryingToCreateUser);
    this.loginLogoutResponseCodeWritableStore.set(undefined);

    this.clientCommunication.sendMessage(this.loginMessage);
  }

  logout() {
    if (this.loginMessage === undefined) {
      return;
    }

    if (this.isConnected) {
      this.loginMessage = undefined;

      this.loginStateWritableStore.set(LoginState.TryingToLogOut);
      this.loginLogoutResponseCodeWritableStore.set(undefined);

      this.clientCommunication.sendMessage(
        PB_MessageToServer.toBinary({
          loginLogout: {
            logout: {},
          },
        }),
      );
    } else {
      this.logoutWhenNotConnected();
    }
  }

  connectToLobby() {
    this.currentPage = CurrentPage.Lobby;
    this.lobbyManager.connect();
  }

  private onConnect() {
    this.isConnected = true;
    this.isConnectedWritableStore.set(true);

    const dataToSend: Uint8Array[] = [];

    if (this.loginMessage !== undefined) {
      dataToSend.push(this.loginMessage);
    }

    switch (this.currentPage) {
      case CurrentPage.Lobby: {
        dataToSend.push(this.lobbyManager.getConnectMessage());
        break;
      }
    }

    if (dataToSend.length > 0) {
      this.clientCommunication.sendMessage(concatenateUint8Arrays(dataToSend));
    }
  }

  private onDisconnect() {
    this.isConnected = false;
    this.isConnectedWritableStore.set(false);

    if (this.loginMessage === undefined) {
      this.logoutWhenNotConnected();
    }
  }

  private onMessage(message: Uint8Array) {
    const messageToClient = PB_MessageToClient.fromBinary(message);

    if (messageToClient.initial) {
      this.onMessage_Initial(messageToClient.initial);
    }
    if (messageToClient.loginLogout) {
      this.onMessage_LoginLogout(messageToClient.loginLogout);
    }
    if (messageToClient.lobby) {
      this.lobbyManager.onMessage(messageToClient.lobby);
    }
  }

  private onMessage_Initial(message: PB_MessageToClient_Initial) {
    if (message.version !== this.version) {
      location.reload();
    }

    this.logTime = message.logTime;
  }

  private onMessage_LoginLogout(message: PB_MessageToClient_LoginLogout) {
    if (message.username && message.userId && message.token) {
      this.myUsername = message.username;
      this.myUserID = message.userId;
      this.myToken = message.token;

      this.loginMessage = PB_MessageToServer.toBinary({
        loginLogout: {
          loginWithToken: {
            username: message.username,
            token: message.token,
          },
        },
      });

      this.usernameWritableStore.set(message.username);
      this.loginStateWritableStore.set(LoginState.LoggedIn);

      this.usernameAndTokenWritableStore.set(new UsernameAndToken(message.username, message.token));
    } else {
      this.makeLoggedOutDataChanges();
    }

    this.loginLogoutResponseCodeWritableStore.set(message.responseCode);
  }

  private logoutWhenNotConnected() {
    this.makeLoggedOutDataChanges();

    this.loginLogoutResponseCodeWritableStore.set(
      PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
    );
  }

  private makeLoggedOutDataChanges() {
    this.myUsername = undefined;
    this.myUserID = undefined;
    this.myToken = undefined;

    this.loginMessage = undefined;

    this.usernameWritableStore.set('');
    this.loginStateWritableStore.set(LoginState.LoggedOut);

    this.usernameAndTokenWritableStore.set(undefined);
  }
}

export const enum LoginState {
  LoggedOut,
  TryingToLogIn,
  TryingToCreateUser,
  LoggedIn,
  TryingToLogOut,
}

class UsernameAndToken {
  constructor(
    public username: string,
    public token: string,
  ) {}
}

const enum CurrentPage {
  None,
  Lobby,
}
