import { Accessor, createSignal, Setter } from 'solid-js';
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
  isConnectedSignal: Accessor<boolean>;
  private setIsConnectedSignal: Setter<boolean>;

  loginMessage: Uint8Array | undefined;

  usernameSignal: Accessor<string>;
  private setUsernameSignal: Setter<string>;
  loginStateSignal: Accessor<LoginState>;
  private setLoginStateSignal: Setter<LoginState>;
  loginLogoutResponseCodeSignal: Accessor<PB_MessageToClient_LoginLogout_ResponseCode | undefined>;
  private setLoginLogoutResponseCodeSignal: Setter<
    PB_MessageToClient_LoginLogout_ResponseCode | undefined
  >;

  usernameAndTokenSignal: Accessor<UsernameAndToken | undefined>;
  private setUsernameAndTokenSignal: Setter<UsernameAndToken | undefined>;

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

    const [isConnectedSignal, setIsConnectedSignal] = createSignal(false);
    this.isConnectedSignal = isConnectedSignal;
    this.setIsConnectedSignal = setIsConnectedSignal;

    const [usernameSignal, setUsernameSignal] = createSignal('');
    this.usernameSignal = usernameSignal;
    this.setUsernameSignal = setUsernameSignal;

    const [loginStateSignal, setLoginStateSignal] = createSignal(LoginState.LoggedOut);
    this.loginStateSignal = loginStateSignal;
    this.setLoginStateSignal = setLoginStateSignal;

    const [loginLogoutResponseCodeSignal, setLoginLogoutResponseCodeSignal] = createSignal<
      PB_MessageToClient_LoginLogout_ResponseCode | undefined
    >(undefined);
    this.loginLogoutResponseCodeSignal = loginLogoutResponseCodeSignal;
    this.setLoginLogoutResponseCodeSignal = setLoginLogoutResponseCodeSignal;

    const [usernameAndTokenSignal, setUsernameAndTokenSignal] = createSignal<
      UsernameAndToken | undefined
    >(undefined);
    this.usernameAndTokenSignal = usernameAndTokenSignal;
    this.setUsernameAndTokenSignal = setUsernameAndTokenSignal;
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

    this.setLoginStateSignal(LoginState.TryingToLogIn);
    this.setLoginLogoutResponseCodeSignal(undefined);

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

    this.setLoginStateSignal(LoginState.TryingToLogIn);
    this.setLoginLogoutResponseCodeSignal(undefined);

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

    this.setLoginStateSignal(LoginState.TryingToCreateUser);
    this.setLoginLogoutResponseCodeSignal(undefined);

    this.clientCommunication.sendMessage(this.loginMessage);
  }

  logout() {
    if (this.loginMessage === undefined) {
      return;
    }

    if (this.isConnected) {
      this.loginMessage = undefined;

      this.setLoginStateSignal(LoginState.TryingToLogOut);
      this.setLoginLogoutResponseCodeSignal(undefined);

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
    this.setIsConnectedSignal(true);

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
    this.setIsConnectedSignal(false);

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

      this.setUsernameSignal(message.username);
      this.setLoginStateSignal(LoginState.LoggedIn);

      this.setUsernameAndTokenSignal(new UsernameAndToken(message.username, message.token));
    } else {
      this.makeLoggedOutDataChanges();
    }

    this.setLoginLogoutResponseCodeSignal(message.responseCode);
  }

  private logoutWhenNotConnected() {
    this.makeLoggedOutDataChanges();

    this.setLoginLogoutResponseCodeSignal(PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS);
  }

  private makeLoggedOutDataChanges() {
    this.myUsername = undefined;
    this.myUserID = undefined;
    this.myToken = undefined;

    this.loginMessage = undefined;

    this.setUsernameSignal('');
    this.setLoginStateSignal(LoginState.LoggedOut);

    this.setUsernameAndTokenSignal(undefined);
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
