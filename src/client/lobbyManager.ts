import { createSignal } from 'solid-js';
import { GameSetup } from '../common/gameSetup';
import { gameModeToNumPlayers } from '../common/helpers';
import {
  PB_GameMode,
  PB_MessageToClient_Lobby,
  PB_MessageToClient_Lobby_CreateGameResponse,
  PB_MessageToClient_Lobby_Event,
  PB_MessageToClient_Lobby_Event_AddUserToLobby,
  PB_MessageToClient_Lobby_Event_GameCreated,
  PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
  PB_MessageToClient_Lobby_LastStateCheckpoint,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { ClientCommunication } from './clientCommunication';
import { GameStatus } from './helpers';

export type LobbyManager = ReturnType<typeof createLobbyManager>;

export function createLobbyManager(clientCommunication: ClientCommunication) {
  let lastEventIndex = 0;

  const userIDToUsername = new Map<number, string>();
  const getUsernameForUserID = (userID: number) => userIDToUsername.get(userID) ?? '?';
  const userIDs = new Set<number>();
  const gameDisplayNumberToLobbyGame = new Map<number, LobbyGame>();

  const [connected, setConnected] = createSignal(false);

  let shouldUpdateUsernamesSignal = false;
  const [usernames, setUsernames] = createSignal<string[]>([]);

  const [createdGameNumber, setCreatedGameNumber] = createSignal<number | undefined>();

  return {
    connect,
    getConnectMessage,
    createGame,
    onMessage,
    get lastEventIndex() {
      return lastEventIndex;
    },
    get userIDToUsername() {
      return userIDToUsername;
    },
    get userIDs() {
      return userIDs;
    },
    get gameDisplayNumberToLobbyGame() {
      return gameDisplayNumberToLobbyGame;
    },
    signals: {
      connected,
      usernames,
      createdGameNumber,
    },
  };

  function connect() {
    setConnected(false);
    setCreatedGameNumber(undefined);

    clientCommunication.sendMessage(getConnectMessage());
  }

  function getConnectMessage() {
    return PB_MessageToServer.toBinary({
      lobby: {
        connect: {
          lastEventIndex: lastEventIndex,
        },
      },
    });
  }

  function createGame(gameMode: PB_GameMode) {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        lobby: {
          createGame: {
            gameMode,
          },
        },
      }),
    );
  }

  function onMessage(message: PB_MessageToClient_Lobby) {
    if (message.lastStateCheckpoint) {
      onMessage_LastStateCheckpoint(message.lastStateCheckpoint);
    }
    if (message.events.length > 0) {
      onMessage_Events(message.events);
    }
    if (message.createGameResponse) {
      onMessage_CreateGameResponse(message.createGameResponse);
    }

    setConnected(true);

    if (shouldUpdateUsernamesSignal) {
      setUsernames([...userIDs].map((userID) => userIDToUsername.get(userID) ?? '?'));
      shouldUpdateUsernamesSignal = false;
    }
  }

  function onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
    userIDToUsername.clear();
    userIDs.clear();
    gameDisplayNumberToLobbyGame.clear();

    const users = message.users;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      userIDToUsername.set(user.userId, user.username);
      if (user.isInLobby) {
        userIDs.add(user.userId);
      }
    }

    const games = message.games;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      gameDisplayNumberToLobbyGame.set(
        game.gameDisplayNumber,
        new LobbyGame(
          game.gameNumber,
          game.gameDisplayNumber,
          game.gameMode,
          game.hostUserId,
          game.userIds,
          getUsernameForUserID,
        ),
      );
    }

    lastEventIndex = message.lastEventIndex;

    shouldUpdateUsernamesSignal = true;
  }

  function onMessage_Events(events: PB_MessageToClient_Lobby_Event[]) {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event.gameCreated) {
        onMessage_Event_GameCreated(event.gameCreated);
      } else if (event.addUserToLobby) {
        onMessage_Event_AddUserToLobby(event.addUserToLobby);
      } else if (event.removeUserFromLobby) {
        onMessage_Event_RemoveUserFromLobby(event.removeUserFromLobby);
      }
    }

    lastEventIndex += events.length;
  }

  function onMessage_Event_GameCreated(event: PB_MessageToClient_Lobby_Event_GameCreated) {
    const userIDs: number[] = new Array(gameModeToNumPlayers.get(event.gameMode));
    userIDs.fill(0);
    userIDs[0] = event.hostUserId;

    gameDisplayNumberToLobbyGame.set(
      event.gameDisplayNumber,
      new LobbyGame(
        event.gameNumber,
        event.gameDisplayNumber,
        event.gameMode,
        event.hostUserId,
        userIDs,
        getUsernameForUserID,
      ),
    );
  }

  function onMessage_Event_AddUserToLobby(event: PB_MessageToClient_Lobby_Event_AddUserToLobby) {
    if (event.username) {
      userIDToUsername.set(event.userId, event.username);
    }

    userIDs.add(event.userId);

    shouldUpdateUsernamesSignal = true;
  }

  function onMessage_Event_RemoveUserFromLobby(
    event: PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
  ) {
    userIDs.delete(event.userId);

    shouldUpdateUsernamesSignal = true;
  }

  function onMessage_CreateGameResponse(message: PB_MessageToClient_Lobby_CreateGameResponse) {
    setCreatedGameNumber(message.gameNumber);
  }
}

class LobbyGame {
  usernames: (string | null)[];
  gameStatus: GameStatus;

  gameSetup: GameSetup | undefined;

  constructor(
    public gameNumber: number,
    public gameDisplayNumber: number,
    public gameMode: PB_GameMode,
    hostUserID: number,
    userIDs: number[],
    getUsernameForUserID: (userID: number) => string,
  ) {
    this.gameStatus = GameStatus.SETTING_UP;

    this.gameSetup = new GameSetup(
      gameMode,
      PB_PlayerArrangementMode.EXACT_ORDER,
      hostUserID,
      getUsernameForUserID,
      userIDs?.map((userID) => (userID !== 0 ? userID : null)),
    );
    this.usernames = this.gameSetup.usernames;
  }
}
