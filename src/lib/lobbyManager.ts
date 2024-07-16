import { writable } from 'svelte/store';
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
import type { Client } from './client';
import { GameStatus } from './helpers';

export class LobbyManager {
  lastEventIndex = 0;

  userIDToUsername = new Map<number, string>();
  getUsernameForUserID = (userID: number) => this.userIDToUsername.get(userID) ?? '?';
  userIDs = new Set<number>();
  gameDisplayNumberToLobbyGame = new Map<number, LobbyGame>();

  private connectedWritableStore = writable(false);
  connectedStore = { subscribe: this.connectedWritableStore.subscribe };

  private shouldUpdateUsernamesStore = false;
  private usernamesWritableStore = writable<string[]>([]);
  usernamesStore = { subscribe: this.usernamesWritableStore.subscribe };

  private createdGameNumberWritableStore = writable<number | undefined>(undefined);
  createdGameNumberStore = { subscribe: this.createdGameNumberWritableStore.subscribe };

  constructor(public client: Client) {}

  connect() {
    this.connectedWritableStore.set(false);
    this.createdGameNumberWritableStore.set(undefined);

    this.client.clientCommunication.sendMessage(this.getConnectMessage());
  }

  getConnectMessage() {
    return PB_MessageToServer.toBinary({
      lobby: {
        connect: {
          lastEventIndex: this.lastEventIndex,
        },
      },
    });
  }

  createGame(gameMode: PB_GameMode) {
    this.client.clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        lobby: {
          createGame: {
            gameMode,
          },
        },
      }),
    );
  }

  onMessage(message: PB_MessageToClient_Lobby) {
    if (message.lastStateCheckpoint) {
      this.onMessage_LastStateCheckpoint(message.lastStateCheckpoint);
    }
    if (message.events.length > 0) {
      this.onMessage_Events(message.events);
    }
    if (message.createGameResponse) {
      this.onMessage_CreateGameResponse(message.createGameResponse);
    }

    this.connectedWritableStore.set(true);

    if (this.shouldUpdateUsernamesStore) {
      this.usernamesWritableStore.set(
        [...this.userIDs].map((userID) => this.userIDToUsername.get(userID) ?? '?'),
      );
      this.shouldUpdateUsernamesStore = false;
    }
  }

  onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
    this.userIDToUsername.clear();
    this.userIDs.clear();
    this.gameDisplayNumberToLobbyGame.clear();

    const users = message.users;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      this.userIDToUsername.set(user.userId, user.username);
      if (user.isInLobby) {
        this.userIDs.add(user.userId);
      }
    }

    const games = message.games;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      this.gameDisplayNumberToLobbyGame.set(
        game.gameDisplayNumber,
        new LobbyGame(
          game.gameNumber,
          game.gameDisplayNumber,
          game.gameMode,
          game.hostUserId,
          game.userIds,
          this.getUsernameForUserID,
        ),
      );
    }

    this.lastEventIndex = message.lastEventIndex;

    this.shouldUpdateUsernamesStore = true;
  }

  onMessage_Events(events: PB_MessageToClient_Lobby_Event[]) {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event.gameCreated) {
        this.onMessage_Event_GameCreated(event.gameCreated);
      } else if (event.addUserToLobby) {
        this.onMessage_Event_AddUserToLobby(event.addUserToLobby);
      } else if (event.removeUserFromLobby) {
        this.onMessage_Event_RemoveUserFromLobby(event.removeUserFromLobby);
      }
    }

    this.lastEventIndex += events.length;
  }

  onMessage_Event_GameCreated(event: PB_MessageToClient_Lobby_Event_GameCreated) {
    const userIDs: number[] = new Array(gameModeToNumPlayers.get(event.gameMode));
    userIDs.fill(0);
    userIDs[0] = event.hostUserId;

    this.gameDisplayNumberToLobbyGame.set(
      event.gameDisplayNumber,
      new LobbyGame(
        event.gameNumber,
        event.gameDisplayNumber,
        event.gameMode,
        event.hostUserId,
        userIDs,
        this.getUsernameForUserID,
      ),
    );
  }

  onMessage_Event_AddUserToLobby(event: PB_MessageToClient_Lobby_Event_AddUserToLobby) {
    if (event.username) {
      this.userIDToUsername.set(event.userId, event.username);
    }

    this.userIDs.add(event.userId);

    this.shouldUpdateUsernamesStore = true;
  }

  onMessage_Event_RemoveUserFromLobby(event: PB_MessageToClient_Lobby_Event_RemoveUserFromLobby) {
    this.userIDs.delete(event.userId);

    this.shouldUpdateUsernamesStore = true;
  }

  onMessage_CreateGameResponse(message: PB_MessageToClient_Lobby_CreateGameResponse) {
    this.createdGameNumberWritableStore.set(message.gameNumber);
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
