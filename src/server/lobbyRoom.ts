import {
  PB_GameMode,
  PB_MessageToClient,
  PB_MessageToClient_Lobby_Event,
  PB_MessageToClient_Lobby_LastStateCheckpoint_Game,
  PB_MessageToClient_Lobby_LastStateCheckpoint_User,
  type PB_MessageToServer_Lobby,
  type PB_MessageToServer_Lobby_Connect,
  type PB_MessageToServer_Lobby_CreateGame,
} from '../common/pb.js';
import { type User } from '../common/user.js';
import type { Client } from './client.js';
import type { GameRoomsManager } from './gameRoomsManager.js';
import { Room } from './room.js';

export class LobbyRoom extends Room {
  private gameRoomsManager!: GameRoomsManager;
  setGameRoomsManager(gameRoomsManager: GameRoomsManager) {
    this.gameRoomsManager = gameRoomsManager;
  }

  onMessage(client: Client, message: PB_MessageToServer_Lobby) {
    if (message.connect) {
      this.onMessage_Connect(client, message.connect);
    }
    if (message.createGame) {
      this.onMessage_CreateGame(client, message.createGame);
    }
  }

  onMessage_Connect(client: Client, message: PB_MessageToServer_Lobby_Connect) {
    client.connectToRoom(this);

    client.sendMessage(this.getConnectionResponse(message));
  }

  onMessage_CreateGame(client: Client, message: PB_MessageToServer_Lobby_CreateGame) {
    if (client.user === null) {
      return;
    }
    if (client.room !== this) {
      return;
    }
    if (message.gameMode < PB_GameMode.SINGLES_1 || message.gameMode > PB_GameMode.TEAMS_3_VS_3) {
      return;
    }

    const gameRoom = this.gameRoomsManager.createGameRoom(client, message.gameMode);

    client.sendMessage(
      PB_MessageToClient.toBinary(
        PB_MessageToClient.create({
          lobby: {
            createGameResponse: {
              gameNumber: gameRoom.gameNumber,
            },
          },
        }),
      ),
    );
  }

  userConnected(user: User) {
    const isKnownUser = this.lscKnownUsers.has(user);

    this.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        addUserToLobby: {
          userId: user.id,
          username: isKnownUser ? undefined : user.name,
        },
      }),
    );

    if (!isKnownUser) {
      this.lscKnownUsers.add(user);
    }
  }

  userDisconnected(user: User) {
    this.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        removeUserFromLobby: {
          userId: user.id,
        },
      }),
    );
  }

  /**
   * event management stuff
   *
   * The first event index is 2 because we need a gap between the first event index
   * and what clients initially say they have.
   */

  private lscLastEventIndex = 2;
  private lscMessage = PB_MessageToClient.toBinary(
    PB_MessageToClient.create({
      lobby: {
        lastStateCheckpoint: {
          lastEventIndex: this.lscLastEventIndex,
        },
      },
    }),
  );
  lscKnownUsers = new Set<User>();

  private noUpdatesMessage = PB_MessageToClient.toBinary(
    PB_MessageToClient.create({
      lobby: {},
    }),
  );

  private eventIndexOfFirstQueuedEvent = this.lscLastEventIndex + 1;
  private queuedEvents: PB_MessageToClient_Lobby_Event[] = [];

  private batchesOfEvents = [
    new BatchOfEvents(this.lscLastEventIndex, [PB_MessageToClient_Lobby_Event.create()]),
  ];

  queueEvent(event: PB_MessageToClient_Lobby_Event) {
    this.queuedEvents.push(event);
  }

  sendQueuedEvents() {
    if (this.queuedEvents.length === 0) {
      return;
    }

    const batchOfEvents = new BatchOfEvents(this.eventIndexOfFirstQueuedEvent, this.queuedEvents);
    this.batchesOfEvents.push(batchOfEvents);

    this.eventIndexOfFirstQueuedEvent += this.queuedEvents.length;
    this.queuedEvents.length = 0;

    for (const client of this.clients) {
      client.sendMessage(batchOfEvents.message);
    }
  }

  createLastStateCheckpoint() {
    this.sendQueuedEvents();

    const userToUserMessage = new Map<User, PB_MessageToClient_Lobby_LastStateCheckpoint_User>();

    function addUserToUserToUserMessageIfNotThere(user: User) {
      let userMessage = userToUserMessage.get(user);
      if (userMessage === undefined) {
        userMessage = PB_MessageToClient_Lobby_LastStateCheckpoint_User.create({
          userId: user.id,
          username: user.name,
        });
        userToUserMessage.set(user, userMessage);
      }

      return userMessage;
    }

    for (const client of this.clients) {
      if (client.user !== null) {
        const userMessage = addUserToUserToUserMessageIfNotThere(client.user);
        userMessage.isInLobby = true;
      }
    }

    const gameCheckpoints: PB_MessageToClient_Lobby_LastStateCheckpoint_Game[] = [];
    for (const gameRoom of this.gameRoomsManager.gameNumberToGameRoom.values()) {
      const gameCheckpoint = PB_MessageToClient_Lobby_LastStateCheckpoint_Game.create();
      gameCheckpoint.gameNumber = gameRoom.gameNumber;
      gameCheckpoint.gameDisplayNumber = gameRoom.gameDisplayNumber;

      for (const client of gameRoom.clients) {
        if (client.user !== null) {
          const user = addUserToUserToUserMessageIfNotThere(client.user);
          user.gameDisplayNumbersWherePresent.push(gameRoom.gameDisplayNumber);
        }
      }

      if (gameRoom.gameSetup) {
        const gameSetup = gameRoom.gameSetup;

        gameCheckpoint.gameMode = gameSetup.gameMode;
        gameCheckpoint.hostUserId = gameSetup.hostUser.id;
        gameCheckpoint.userIds = gameSetup.users.map((user) => (user !== null ? user.id : 0));

        for (let playerId = 0; playerId < gameSetup.users.length; playerId++) {
          const user = gameSetup.users[playerId];

          if (user !== null) {
            addUserToUserToUserMessageIfNotThere(user);
          }
        }
      } else if (gameRoom.game) {
        console.log('TODO');
        continue;
      } else {
        console.log('huh?');
        continue;
      }

      gameCheckpoints.push(gameCheckpoint);
    }

    this.lscLastEventIndex = this.batchesOfEvents[this.batchesOfEvents.length - 1].lastEventIndex;
    this.lscMessage = PB_MessageToClient.toBinary(
      PB_MessageToClient.create({
        lobby: {
          lastStateCheckpoint: {
            games: gameCheckpoints,
            users: [...userToUserMessage.values()],
            lastEventIndex: this.lscLastEventIndex,
          },
        },
      }),
    );
    this.lscKnownUsers = new Set(userToUserMessage.keys());
  }

  private getConnectionResponse(message: PB_MessageToServer_Lobby_Connect) {
    const clientLastEventIndex = message.lastEventIndex;
    const serverLastEventIndex =
      this.batchesOfEvents[this.batchesOfEvents.length - 1].lastEventIndex;

    // is client is up-to-date?
    if (clientLastEventIndex === serverLastEventIndex) {
      return this.noUpdatesMessage;
    }

    // is client a ways behind and we have events to catch them up?
    const indexOfBatchAfterClientsLastEvent = this.findInBatchesOfEvents(clientLastEventIndex + 1);
    if (indexOfBatchAfterClientsLastEvent !== undefined) {
      return this.concatenateMessages(false, indexOfBatchAfterClientsLastEvent);
    }

    // refresh client with last state checkpoint and following batches of events
    const indexOfBatchAfterLSC = this.findInBatchesOfEvents(this.lscLastEventIndex + 1);
    return this.concatenateMessages(
      true,
      indexOfBatchAfterLSC !== undefined ? indexOfBatchAfterLSC : this.batchesOfEvents.length,
    );
  }

  private findInBatchesOfEvents(firstEventIndex: number) {
    let begin = 0;
    let end = this.batchesOfEvents.length - 1;

    while (begin <= end) {
      const middle = (begin + end) >> 1;

      const firstEventIndexAtMiddle = this.batchesOfEvents[middle].firstEventIndex;

      if (firstEventIndex < firstEventIndexAtMiddle) {
        end = middle - 1;
      } else if (firstEventIndex > firstEventIndexAtMiddle) {
        begin = middle + 1;
      } else {
        return middle;
      }
    }
  }

  private concatenateMessages(
    includeLastStateCheckpoint: boolean,
    beginningBatchesOfEventsIndex: number,
  ) {
    let numberOfMessages = 0;
    let lengthOfConcatenatedMessages = 0;
    if (includeLastStateCheckpoint) {
      numberOfMessages++;
      lengthOfConcatenatedMessages += this.lscMessage.length;
    }
    for (let i = beginningBatchesOfEventsIndex; i < this.batchesOfEvents.length; i++) {
      numberOfMessages++;
      lengthOfConcatenatedMessages += this.batchesOfEvents[i].message.length;
    }

    if (numberOfMessages === 0) {
      throw new Error('no messages to concatenate');
    } else if (numberOfMessages === 1) {
      if (includeLastStateCheckpoint) {
        return this.lscMessage;
      } else {
        return this.batchesOfEvents[beginningBatchesOfEventsIndex].message;
      }
    } else {
      const concatenatedMessages = new Uint8Array(lengthOfConcatenatedMessages);
      let offset = 0;
      if (includeLastStateCheckpoint) {
        const message = this.lscMessage;
        concatenatedMessages.set(message, offset);
        offset += message.length;
      }
      for (let i = beginningBatchesOfEventsIndex; i < this.batchesOfEvents.length; i++) {
        const message = this.batchesOfEvents[i].message;
        concatenatedMessages.set(message, offset);
        offset += message.length;
      }

      return concatenatedMessages;
    }
  }
}

class BatchOfEvents {
  lastEventIndex: number;
  message: Uint8Array;

  constructor(
    public firstEventIndex: number,
    events: PB_MessageToClient_Lobby_Event[],
  ) {
    this.lastEventIndex = firstEventIndex + events.length - 1;
    this.message = PB_MessageToClient.toBinary({
      lobby: {
        events,
      },
    });
  }
}
