import type { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import {
  PB_MessageToClient,
  PB_MessageToClient_Game_UserIdAndUsername,
  PB_MessageToClient_Lobby_Event,
  PB_PlayerArrangementMode,
  type PB_GameMode,
  type PB_MessageToServer_Game_Connect,
  type PB_MessageToServer_Game_GameSetupAction,
} from '../common/pb';
import { type User } from '../common/user';
import type { Client } from './client';
import type { LobbyRoom } from './lobbyRoom';
import { Room } from './room';

export class GameRoom extends Room {
  gameSetup: GameSetup | undefined;
  game: Game | undefined;

  private numberOfGameSetupChanges = 0;

  private clientFromConnectMessage: Client | null = null;
  private userIdToUser = new Map<number, User>();
  private userIdsAndUsernames: PB_MessageToClient_Game_UserIdAndUsername[] = [];

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

    client.sendMessage(
      PB_MessageToClient.toBinary(
        PB_MessageToClient.create({
          game: {
            logTime: message.logTime,
            gameNumber: message.gameNumber,
            metadata: {
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
              userIdsInRoom: [...this.userToClients.keys()].map((user) => user.id),
            },
            userIdsAndUsernames:
              message.numberOfUserIdAndUsernameMessages === 0
                ? this.userIdsAndUsernames
                : this.userIdsAndUsernames.slice(message.numberOfUserIdAndUsernameMessages),
          },
        }),
      ),
    );
  }

  onMessage_GameSetupAction(client: Client, message: PB_MessageToServer_Game_GameSetupAction) {
    if (this.gameSetup && client.user !== null) {
      let queueLobbyEvent = false;

      if (message.sitDown) {
        this.gameSetup.addUser(client.user);
        queueLobbyEvent = true;
      } else if (message.standUp) {
        this.gameSetup.removeUser(client.user);
        queueLobbyEvent = true;
      } else if (message.approve) {
        this.gameSetup.approve(client.user);
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
    }
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
}

const dummyApprovals: boolean[] = [];
