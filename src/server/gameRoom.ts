import { Game } from '../common/game.js';
import { ActionGameOver } from '../common/gameActions/gameOver.js';
import { GameSetup } from '../common/gameSetup.js';
import { getNewTileBag } from '../common/helpers.js';
import {
  PB_GameAction,
  PB_MessageToClient,
  PB_MessageToClient_Game_UserIdAndUsername,
  PB_MessageToClient_Lobby_Event,
  PB_PlayerArrangementMode,
  type PB_GameMode,
  type PB_GameState,
  type PB_MessageToServer_Game_Connect,
  type PB_MessageToServer_Game_GameAction,
  type PB_MessageToServer_Game_GameSetupAction,
} from '../common/pb.js';
import { type User } from '../common/user.js';
import { type Client } from './client.js';
import { type LobbyRoom } from './lobbyRoom.js';
import { Room } from './room.js';

export class GameRoom extends Room {
  gameSetup: GameSetup | null = null;
  game: Game | null = null;

  private numberOfGameSetupChanges = 0;

  private clientFromConnectMessage: Client | null = null;
  private userIdToUser = new Map<number, User>();
  private userIdsAndUsernames: PB_MessageToClient_Game_UserIdAndUsername[] = [];
  private clientToNumberOfGameStatesPerPlayerAndWatcher = new WeakMap<Client, number[]>();

  getNewTileBag = getNewTileBag;
  dateNow: () => number | null = Date.now;

  constructor(
    public lobbyRoom: LobbyRoom,
    public gameNumber: number,
    public gameDisplayNumber: number,
    host: Client,
    gameMode: PB_GameMode,
  ) {
    super();

    this.userIdToUser.set(host.user!.id, host.user!);
    this.userIdsAndUsernames.push(
      PB_MessageToClient_Game_UserIdAndUsername.create({
        userId: host.user!.id,
        username: host.user!.name,
      }),
    );

    this.gameSetup = new GameSetup(
      gameMode,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      host.user!,
      this.userIdToUser,
    );

    lobbyRoom.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        gameCreated: {
          gameNumber,
          gameDisplayNumber,
          gameMode,
          hostUserId: host.user!.id,
        },
      }),
    );
  }

  getUsernameForUserId(userId: number) {
    return this.userIdToUser.get(userId) ?? '?';
  }

  onMessage_Connect(client: Client, message: PB_MessageToServer_Game_Connect) {
    this.clientFromConnectMessage = client;
    client.connectToRoom(this);
    this.clientFromConnectMessage = null;

    const numEntriesRequired = this.game ? this.game.users.length + 1 : 0;
    const numberOfGameStatesPerPlayerAndWatcher =
      message.numberOfGameStatesPerPlayerAndWatcher.slice(0, numEntriesRequired);
    for (let i = numberOfGameStatesPerPlayerAndWatcher.length; i < numEntriesRequired; i++) {
      numberOfGameStatesPerPlayerAndWatcher.push(0);
    }

    this.clientToNumberOfGameStatesPerPlayerAndWatcher.set(
      client,
      numberOfGameStatesPerPlayerAndWatcher,
    );

    const messageToClient = PB_MessageToClient.create({
      game: {
        connectResponse: {
          logTime: message.logTime,
          gameNumber: message.gameNumber,
          metadata: numberOfGameStatesPerPlayerAndWatcher.every((entry) => entry === 0)
            ? {
                gameMode: this.gameSetup ? this.gameSetup.gameMode : this.game!.gameMode,
                playerArrangementMode: this.gameSetup
                  ? this.gameSetup.playerArrangementMode
                  : this.game!.playerArrangementMode,
                hostUserId: this.gameSetup ? this.gameSetup.hostUser.id : this.game!.hostUser.id,
                userIds: (this.gameSetup ? this.gameSetup : this.game!).users.map(
                  (user) => user?.id ?? 0,
                ),
                approvals: this.gameSetup ? this.gameSetup.approvals : dummyApprovals,
                numberOfGameSetupChanges: this.gameSetup ? this.numberOfGameSetupChanges : 0,
              }
            : undefined,
          userIdsInRoom: [...this.userToClients.keys()].map((user) => user.id),
        },
        userIdsAndUsernames:
          message.numberOfUserIdAndUsernameMessages === 0
            ? this.userIdsAndUsernames
            : this.userIdsAndUsernames.slice(message.numberOfUserIdAndUsernameMessages),
      },
    });

    const gameStateMessages = this.gameStateMessagesClientDoesNotHave(client);
    if (gameStateMessages) {
      messageToClient.game!.gameStates = gameStateMessages;
    }

    client.sendMessage(PB_MessageToClient.toBinary(messageToClient));
  }

  onMessage_GameSetupAction(client: Client, message: PB_MessageToServer_Game_GameSetupAction) {
    if (!this.gameSetup || !client.user) {
      return;
    }

    let queueLobbyEvent = false;

    if (message.sitDown) {
      this.gameSetup.addUser(client.user);
      queueLobbyEvent = true;
    } else if (message.standUp) {
      this.gameSetup.removeUser(client.user);
      queueLobbyEvent = true;
    } else if (message.approve) {
      this.gameSetup.approve(client.user);

      if (this.gameSetup.history[0]?.userApprovedOfGameSetup?.approvedByEverybody) {
        queueLobbyEvent = true;
      }
    } else if (message.changeGameMode) {
      if (client.user === this.gameSetup.hostUser) {
        this.gameSetup.changeGameMode(message.changeGameMode.gameMode);
        queueLobbyEvent = true;
      }
    } else if (message.changePlayerArrangementMode) {
      if (client.user === this.gameSetup.hostUser) {
        this.gameSetup.changePlayerArrangementMode(
          message.changePlayerArrangementMode.playerArrangementMode,
        );
      }
    } else if (message.swapPositions) {
      if (client.user === this.gameSetup.hostUser) {
        this.gameSetup.swapPositions(
          message.swapPositions.position1,
          message.swapPositions.position2,
        );
        queueLobbyEvent = true;
      }
    } else if (message.kickUser) {
      if (client.user === this.gameSetup.hostUser) {
        const user = this.userIdToUser.get(message.kickUser.userId);
        if (user) {
          this.gameSetup.kickUser(user);
          queueLobbyEvent = true;
        }
      }
    }

    if (this.gameSetup.history.length > 0) {
      const gameSetupChange = this.gameSetup.history[0];

      const messageToGameClients = PB_MessageToClient.toBinary(
        PB_MessageToClient.create({
          game: {
            gameSetupChange,
          },
        }),
      );

      for (const client of this.clients) {
        client.sendMessage(messageToGameClients);
      }

      if (queueLobbyEvent) {
        this.lobbyRoom.queueEvent(
          PB_MessageToClient_Lobby_Event.create({
            gameSetupChange: {
              gameDisplayNumber: this.gameDisplayNumber,
              gameSetupChange,
            },
          }),
        );
      }

      this.gameSetup.clearHistory();
      this.numberOfGameSetupChanges++;
    }

    if (this.gameSetup.finalUsers) {
      this.game = new Game(
        this.gameSetup.gameMode,
        this.gameSetup.playerArrangementMode,
        this.getNewTileBag(),
        this.gameSetup.finalUsers,
        this.gameSetup.hostUser,
        null,
      );
      this.gameSetup = null;

      this.game.doGameAction(PB_GameAction.create({ startGame: {} }), this.dateNow());

      for (const client of this.clients) {
        const initialNumberOfGameStatesPerPlayerAndWatcher = new Array(this.game.users.length + 1);
        initialNumberOfGameStatesPerPlayerAndWatcher.fill(0);

        this.clientToNumberOfGameStatesPerPlayerAndWatcher.set(
          client,
          initialNumberOfGameStatesPerPlayerAndWatcher,
        );
      }

      this.sendLastGameStateToClients();
    }
  }

  onMessage_GameAction(client: Client, message: PB_MessageToServer_Game_GameAction) {
    if (
      !this.game ||
      !client.user ||
      !message.gameAction ||
      message.numberOfGameStates !== this.game.gameStateHistory.length
    ) {
      return;
    }

    const playerId = this.game.users.indexOf(client.user);
    const currentAction = this.game.gameActionStack[this.game.gameActionStack.length - 1];
    if (playerId !== currentAction.playerId) {
      return;
    }

    try {
      this.game.doGameAction(message.gameAction, this.dateNow());
    } catch {
      return;
    }

    this.sendLastGameStateToClients();
  }

  clientLoggedIn(client: Client) {
    super.clientLoggedIn(client);

    this.sendClientGameStateMessagesTheyDoNotHave(client);
  }

  clientLoggedOut(client: Client, previousUser: User) {
    super.clientLoggedOut(client, previousUser);

    this.sendClientGameStateMessagesTheyDoNotHave(client);
  }

  sendClientGameStateMessagesTheyDoNotHave(client: Client) {
    if (client === this.clientFromConnectMessage) {
      return;
    }

    const gameStateMessages = this.gameStateMessagesClientDoesNotHave(client);

    if (gameStateMessages) {
      client.sendMessage(
        PB_MessageToClient.toBinary(
          PB_MessageToClient.create({
            game: {
              gameStates: gameStateMessages,
            },
          }),
        ),
      );
    }
  }

  gameStateMessagesClientDoesNotHave(client: Client) {
    if (!this.game) {
      return;
    }

    const numberOfGameStatesPerPlayerAndWatcher =
      this.clientToNumberOfGameStatesPerPlayerAndWatcher.get(client)!;

    const playerId = client.user ? this.game.users.indexOf(client.user) : -1;
    const numberOfGameStates =
      numberOfGameStatesPerPlayerAndWatcher[playerId === -1 ? this.game.users.length : playerId];

    if (numberOfGameStates === this.game.gameStateHistory.length) {
      return;
    }

    const gameStateMessages: PB_GameState[] = [];

    for (let i = numberOfGameStates; i < this.game.gameStateHistory.length; i++) {
      const gameState = this.game.gameStateHistory[i];
      gameStateMessages.push(
        playerId >= 0 ? gameState.playerGameStates[playerId] : gameState.watcherGameState,
      );
    }

    numberOfGameStatesPerPlayerAndWatcher[playerId === -1 ? this.game.users.length : playerId] =
      this.game.gameStateHistory.length;

    return gameStateMessages;
  }

  userConnected(user: User) {
    const messageToClient = PB_MessageToClient.create({
      game: {
        userIdWhoEnteredRoom: user.id,
      },
    });

    if (!this.userIdToUser.has(user.id)) {
      this.userIdToUser.set(user.id, user);

      const userIdAndUsername = PB_MessageToClient_Game_UserIdAndUsername.create({
        userId: user.id,
        username: user.name,
      });
      this.userIdsAndUsernames.push(userIdAndUsername);
      messageToClient.game!.userIdsAndUsernames.push(userIdAndUsername);
    }

    const messageToClientBinary = PB_MessageToClient.toBinary(messageToClient);

    for (const client of this.clients) {
      if (client !== this.clientFromConnectMessage) {
        client.sendMessage(messageToClientBinary);
      }
    }

    const isKnownUser = this.lobbyRoom.lscKnownUsers.has(user);

    this.lobbyRoom.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        addUserToGameRoom: {
          userId: user.id,
          gameDisplayNumber: this.gameDisplayNumber,
          username: isKnownUser ? undefined : user.name,
        },
      }),
    );

    if (!isKnownUser) {
      this.lobbyRoom.lscKnownUsers.add(user);
    }
  }

  userDisconnected(user: User) {
    const messageToClientBinary = PB_MessageToClient.toBinary(
      PB_MessageToClient.create({
        game: {
          userIdWhoExitedRoom: user.id,
        },
      }),
    );

    for (const client of this.clients) {
      client.sendMessage(messageToClientBinary);
    }

    this.lobbyRoom.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        removeUserFromGameRoom: {
          userId: user.id,
          gameDisplayNumber: this.gameDisplayNumber,
        },
      }),
    );
  }

  private sendLastGameStateToClients() {
    const game = this.game!;
    const gameState = game.gameStateHistory[game.gameStateHistory.length - 1];

    gameState.createPlayerAndWatcherGameStates();

    const clientsInGame = new Set<Client>();

    for (let playerId = 0; playerId < gameState.playerGameStates.length; playerId++) {
      const clients = this.userToClients.get(game.users[playerId]);

      if (clients) {
        const message = PB_MessageToClient.toBinary(
          PB_MessageToClient.create({
            game: {
              gameStates: [gameState.playerGameStates[playerId]],
            },
          }),
        );

        for (const client of clients) {
          client.sendMessage(message);
          clientsInGame.add(client);

          this.clientToNumberOfGameStatesPerPlayerAndWatcher.get(client)![playerId]++;
        }
      }
    }

    if (this.clients.size !== clientsInGame.size) {
      const message = PB_MessageToClient.toBinary(
        PB_MessageToClient.create({
          game: {
            gameStates: [gameState.watcherGameState],
          },
        }),
      );

      for (const client of this.clients) {
        if (!clientsInGame.has(client)) {
          client.sendMessage(message);

          this.clientToNumberOfGameStatesPerPlayerAndWatcher.get(client)![game.users.length]++;
        }
      }
    }

    if (gameState.gameBoardChanges) {
      this.lobbyRoom.queueEvent(
        PB_MessageToClient_Lobby_Event.create({
          gameBoardChanges: {
            gameDisplayNumber: this.gameDisplayNumber,
            gameBoardChanges: gameState.gameBoardChanges,
          },
        }),
      );
    }

    if (gameState.nextGameAction instanceof ActionGameOver) {
      this.lobbyRoom.queueEvent(
        PB_MessageToClient_Lobby_Event.create({
          gameCompleted: {
            gameDisplayNumber: this.gameDisplayNumber,
          },
        }),
      );
    }
  }
}

const dummyApprovals: boolean[] = [];
