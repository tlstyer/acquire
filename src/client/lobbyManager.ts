import { batch, createSignal } from 'solid-js';
import { defaultGameBoard } from '../common/defaults';
import { GameSetup } from '../common/gameSetup';
import { gameModeToNumPlayers } from '../common/helpers';
import {
  type PB_GameMode,
  type PB_MessageToClient_Lobby,
  type PB_MessageToClient_Lobby_CreateGameResponse,
  type PB_MessageToClient_Lobby_Event,
  type PB_MessageToClient_Lobby_Event_AddUserToLobby,
  type PB_MessageToClient_Lobby_Event_GameCreated,
  type PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
  type PB_MessageToClient_Lobby_LastStateCheckpoint,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { type ClientCommunication } from './clientCommunication';
import { GameStatus } from './helpers';

export type LobbyManager = ReturnType<typeof createLobbyManager>;

export function createLobbyManager(clientCommunication: ClientCommunication) {
  let lastEventIndex = 0;

  const userIdToUsername = new Map<number, string>();
  const getUsernameForUserId = (userId: number) => userIdToUsername.get(userId) ?? '?';
  const userIds = new Set<number>();
  const gameDisplayNumberToLobbyGame = new Map<number, LobbyGame>();

  const [connected, setConnected] = createSignal(false);

  let shouldUpdateUsernamesSignal = false;
  const [usernames, setUsernames] = createSignal<string[]>([]);

  let shouldUpdateLobbyGamesSignal = false;
  const [lobbyGames, setLobbyGames] = createSignal<LobbyGame[]>([]);

  const [createdGameNumber, setCreatedGameNumber] = createSignal<number | undefined>();

  function connect() {
    setConnected(false);
    setCreatedGameNumber(undefined);

    clientCommunication.sendMessage(getConnectMessage());
  }

  function getConnectMessage() {
    return PB_MessageToServer.toBinary({
      lobby: {
        connect: {
          lastEventIndex,
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
    batch(() => {
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
        setUsernames([...userIds].map((userId) => userIdToUsername.get(userId) ?? '?'));
        shouldUpdateUsernamesSignal = false;
      }
      if (shouldUpdateLobbyGamesSignal) {
        const newLobbyGames = [...gameDisplayNumberToLobbyGame.values()];
        newLobbyGames.reverse();
        setLobbyGames(newLobbyGames);
        shouldUpdateLobbyGamesSignal = false;
      }
    });
  }

  function onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
    userIdToUsername.clear();
    userIds.clear();
    gameDisplayNumberToLobbyGame.clear();

    const users = message.users;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      userIdToUsername.set(user.userId, user.username);
      if (user.isInLobby) {
        userIds.add(user.userId);
      }
    }

    const games = message.games;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      gameDisplayNumberToLobbyGame.set(
        game.gameDisplayNumber,
        createLobbyGame(
          game.gameNumber,
          game.gameDisplayNumber,
          game.gameMode,
          game.hostUserId,
          game.userIds,
          getUsernameForUserId,
        ),
      );
    }

    lastEventIndex = message.lastEventIndex;

    shouldUpdateUsernamesSignal = true;
    shouldUpdateLobbyGamesSignal = true;
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
    const userIds: number[] = new Array(gameModeToNumPlayers.get(event.gameMode));
    userIds.fill(0);
    userIds[0] = event.hostUserId;

    gameDisplayNumberToLobbyGame.set(
      event.gameDisplayNumber,
      createLobbyGame(
        event.gameNumber,
        event.gameDisplayNumber,
        event.gameMode,
        event.hostUserId,
        userIds,
        getUsernameForUserId,
      ),
    );

    shouldUpdateLobbyGamesSignal = true;
  }

  function onMessage_Event_AddUserToLobby(event: PB_MessageToClient_Lobby_Event_AddUserToLobby) {
    if (event.username) {
      userIdToUsername.set(event.userId, event.username);
    }

    userIds.add(event.userId);

    shouldUpdateUsernamesSignal = true;
  }

  function onMessage_Event_RemoveUserFromLobby(
    event: PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
  ) {
    userIds.delete(event.userId);

    shouldUpdateUsernamesSignal = true;
  }

  function onMessage_CreateGameResponse(message: PB_MessageToClient_Lobby_CreateGameResponse) {
    setCreatedGameNumber(message.gameNumber);
  }

  return {
    connect,
    getConnectMessage,
    createGame,
    onMessage,
    get lastEventIndex() {
      return lastEventIndex;
    },
    get userIdToUsername() {
      return userIdToUsername;
    },
    get userIds() {
      return userIds;
    },
    get gameDisplayNumberToLobbyGame() {
      return gameDisplayNumberToLobbyGame;
    },
    signals: {
      connected,
      usernames,
      lobbyGames,
      createdGameNumber,
    },
  };
}

export type LobbyGame = ReturnType<typeof createLobbyGame>;

function createLobbyGame(
  gameNumber: number,
  gameDisplayNumber: number,
  initialGameMode: PB_GameMode,
  hostUserId: number,
  initialUserIds: number[],
  getUsernameForUserId: (userId: number) => string,
) {
  const gameSetup = new GameSetup(
    initialGameMode,
    PB_PlayerArrangementMode.EXACT_ORDER,
    hostUserId,
    getUsernameForUserId,
    initialUserIds?.map((userId) => (userId !== 0 ? userId : null)),
  );

  const [gameBoard, setGameBoard] = createSignal(defaultGameBoard);
  const [usernames, setUsernames] = createSignal(gameSetup.usernames);
  const [gameMode, setGameMode] = createSignal(gameSetup.gameMode);
  const [gameStatus, setGameStatus] = createSignal(GameStatus.SETTING_UP);

  return {
    gameNumber,
    gameDisplayNumber,
    signals: {
      gameBoard,
      usernames,
      gameMode,
      gameStatus,
    },
  };
}
