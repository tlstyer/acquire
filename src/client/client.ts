import { type Accessor, createSignal } from 'solid-js';
import { isServer } from 'solid-js/web';
import { concatenateUint8Arrays, parseDecimalInteger } from '../common/helpers';
import {
  PB_MessageToClient,
  type PB_MessageToClient_Initial,
  type PB_MessageToClient_LoginLogout,
  PB_MessageToClient_LoginLogout_ResponseCode,
  PB_MessageToServer,
} from '../common/pb';
import type { ClientCommunication } from './clientCommunication';
import { type DialogType } from './components/Dialog';
import { createGamesManager } from './gamesManager';
import { GameBoardLabelMode } from './helpers';
import { createLobbyManager } from './lobbyManager';

export type Client = ReturnType<typeof createClient>;

export function createClient(clientCommunication: ClientCommunication, version: number) {
  clientCommunication.setCallbacks(onConnect, onDisconnect, onMessage);

  let logTime = 0;

  let myUsername: string | undefined;
  let myUserId: number | undefined;
  let myToken: string | undefined;

  const [connected, setConnected] = createSignal(false);

  let loginMessage: Uint8Array | undefined;

  const [username, setUsername] = createSignal('');
  const [loginState, setLoginState] = createSignal(LoginState.LoggedOut);
  const [loginLogoutResponseCode, setLoginLogoutResponseCode] = createSignal<
    PB_MessageToClient_LoginLogout_ResponseCode | undefined
  >();

  const [usernameAndToken, setUsernameAndToken] = createSignal<UsernameAndToken | undefined>();

  const [dialogType, setDialogType] = createSignal<DialogType | undefined>();

  const [colorScheme, setColorScheme] = createSetting('ColorScheme', (localStorageValue): string =>
    localStorageValue === 'white' ? localStorageValue : 'netacquire',
  );

  const [gameBoardLabelMode, setGameBoardLabelMode] = createSetting(
    'GameBoardLabelMode',
    (localStorageValue) => {
      const gblm: GameBoardLabelMode = parseDecimalInteger(localStorageValue) ?? Number.NaN;
      return GameBoardLabelMode[gblm] !== undefined ? gblm : GameBoardLabelMode.Nothing;
    },
  );

  let currentPage = CurrentPage.None;
  const lobbyManager = createLobbyManager(clientCommunication);
  const gamesManager = createGamesManager(clientCommunication);

  function loginWithPassword(username: string, password: string) {
    if (loginMessage !== undefined) {
      return;
    }

    loginMessage = PB_MessageToServer.toBinary({
      loginLogout: {
        loginWithPassword: {
          username,
          password,
        },
      },
    });

    setLoginState(LoginState.TryingToLogIn);
    setLoginLogoutResponseCode(undefined);

    clientCommunication.sendMessage(loginMessage);
  }

  function loginWithToken(username: string, token: string) {
    if (loginMessage !== undefined) {
      return;
    }

    loginMessage = PB_MessageToServer.toBinary({
      loginLogout: {
        loginWithToken: {
          username,
          token,
        },
      },
    });

    setLoginState(LoginState.TryingToLogIn);
    setLoginLogoutResponseCode(undefined);

    clientCommunication.sendMessage(loginMessage);
  }

  function createUserAndLogin(username: string, password: string) {
    if (loginMessage !== undefined) {
      return;
    }

    loginMessage = PB_MessageToServer.toBinary({
      loginLogout: {
        createUserAndLogin: {
          username,
          password,
        },
      },
    });

    setLoginState(LoginState.TryingToCreateUser);
    setLoginLogoutResponseCode(undefined);

    clientCommunication.sendMessage(loginMessage);
  }

  function logout() {
    if (loginMessage === undefined) {
      return;
    }

    if (connected()) {
      loginMessage = undefined;

      setLoginState(LoginState.TryingToLogOut);
      setLoginLogoutResponseCode(undefined);

      clientCommunication.sendMessage(
        PB_MessageToServer.toBinary({
          loginLogout: {
            logout: {},
          },
        }),
      );
    } else {
      logoutWhenNotConnected();
    }
  }

  function connectToLobby() {
    currentPage = CurrentPage.Lobby;
    lobbyManager.connect();
  }

  function connectToGame(logTime: number, gameNumber: number) {
    currentPage = CurrentPage.Game;
    return gamesManager.connect(logTime, gameNumber);
  }

  function onConnect() {
    setConnected(true);

    const dataToSend: Uint8Array[] = [];

    if (loginMessage !== undefined) {
      dataToSend.push(loginMessage);
    }

    switch (currentPage) {
      case CurrentPage.Lobby: {
        dataToSend.push(lobbyManager.getConnectMessage());
        break;
      }
      case CurrentPage.Game: {
        dataToSend.push(gamesManager.getConnectMessage());
        break;
      }
    }

    if (dataToSend.length > 0) {
      clientCommunication.sendMessage(concatenateUint8Arrays(dataToSend));
    }
  }

  function onDisconnect() {
    setConnected(false);

    if (loginMessage === undefined) {
      logoutWhenNotConnected();
    }
  }

  function onMessage(message: Uint8Array) {
    const messageToClient = PB_MessageToClient.fromBinary(message);

    if (messageToClient.initial) {
      onMessage_Initial(messageToClient.initial);
    }
    if (messageToClient.loginLogout) {
      onMessage_LoginLogout(messageToClient.loginLogout);
    }
    if (messageToClient.lobby) {
      lobbyManager.onMessage(messageToClient.lobby);
    }
    if (messageToClient.game) {
      gamesManager.onMessage(messageToClient.game);
    }
  }

  function onMessage_Initial(message: PB_MessageToClient_Initial) {
    if (message.version !== version) {
      location.reload();
    }

    logTime = message.logTime;
  }

  function onMessage_LoginLogout(message: PB_MessageToClient_LoginLogout) {
    if (message.username && message.userId && message.token) {
      myUsername = message.username;
      myUserId = message.userId;
      myToken = message.token;

      loginMessage = PB_MessageToServer.toBinary({
        loginLogout: {
          loginWithToken: {
            username: message.username,
            token: message.token,
          },
        },
      });

      setUsername(message.username);
      setLoginState(LoginState.LoggedIn);

      setUsernameAndToken(new UsernameAndToken(message.username, message.token));
    } else {
      makeLoggedOutDataChanges();
    }

    setLoginLogoutResponseCode(message.responseCode);
  }

  function logoutWhenNotConnected() {
    makeLoggedOutDataChanges();

    setLoginLogoutResponseCode(PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS);
  }

  function makeLoggedOutDataChanges() {
    myUsername = undefined;
    myUserId = undefined;
    myToken = undefined;

    loginMessage = undefined;

    setUsername('');
    setLoginState(LoginState.LoggedOut);

    setUsernameAndToken(undefined);
  }

  return {
    loginWithPassword,
    loginWithToken,
    createUserAndLogin,
    logout,
    connectToLobby,
    connectToGame,
    lobbyManager,
    get logTime() {
      return logTime;
    },
    get myUsername() {
      return myUsername;
    },
    get myUserId() {
      return myUserId;
    },
    get myToken() {
      return myToken;
    },
    signals: {
      connected,
      username,
      loginState,
      loginLogoutResponseCode,
      usernameAndToken,
      dialogType,
      colorScheme,
      gameBoardLabelMode,
    },
    setDialogType,
    setColorScheme,
    setGameBoardLabelMode,
  };
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
  Game,
}

function createSetting<T extends { toString(): string }>(
  localStorageKey: string,
  localStorageValueToValidValue: (localStorageValue: string | null) => T,
): [get: Accessor<T>, set: (newValue: T) => void] {
  const [setting, setSetting] = createSignal(
    localStorageValueToValidValue(isServer ? null : localStorage.getItem(localStorageKey)),
  );

  if (!isServer) {
    addEventListener('storage', (event) => {
      if (event.key === localStorageKey || event.key === null) {
        // @ts-expect-error I have no idea why there's a TS error here
        setSetting(localStorageValueToValidValue(event.newValue));
      }
    });
  }

  return [
    setting,
    function set(newValue: T) {
      if (!isServer) {
        localStorage.setItem(localStorageKey, newValue.toString());
      }
      // @ts-expect-error I have no idea why there's a TS error here
      setSetting(newValue);
    },
  ];
}
