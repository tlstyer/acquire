import type { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import {
  PB_MessageToClient,
  PB_MessageToClient_Game_UserIdAndUsername,
  PB_MessageToClient_Lobby_Event,
  PB_PlayerArrangementMode,
  type PB_GameMode,
  type PB_MessageToServer_Game_Connect,
} from '../common/pb';
import type { Client } from './client';
import type { LobbyRoom } from './lobbyRoom';
import { Room } from './room';

export class GameRoom extends Room {
  gameSetup: GameSetup | undefined;
  game: Game | undefined;

  private clientFromConnectMessage: Client | null = null;
  private userIdToUsername = new Map<number, string>();
  private userIdsAndUsernames: PB_MessageToClient_Game_UserIdAndUsername[] = [];

  constructor(
    public lobbyRoom: LobbyRoom,
    public gameNumber: number,
    public gameDisplayNumber: number,
    host: Client,
    gameMode: PB_GameMode,
  ) {
    super();

    this.userIdToUsername.set(host.userId!, host.username!);
    this.userIdsAndUsernames.push(
      PB_MessageToClient_Game_UserIdAndUsername.create({
        userId: host.userId!,
        username: host.username!,
      }),
    );

    this.gameSetup = new GameSetup(
      gameMode,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      host.userId!,
      this.getUsernameForUserId.bind(this),
    );

    lobbyRoom.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        gameCreated: {
          gameNumber,
          gameDisplayNumber,
          gameMode,
          hostUserId: host.userId,
        },
      }),
    );
  }

  getUsernameForUserId(userId: number) {
    return this.userIdToUsername.get(userId) ?? '?';
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
              hostUserId: this.gameSetup ? this.gameSetup.hostUserId : this.game!.hostUserId,
              userIds: this.gameSetup
                ? this.gameSetup.userIds.map((userId) => userId ?? 0)
                : this.game!.userIds,
              approvals: this.gameSetup ? this.gameSetup.approvals : dummyApprovals,
              userIdsInRoom: [...this.userIdToClients.keys()],
            },
            userIdsAndUsernames: this.userIdsAndUsernames,
          },
        }),
      ),
    );
  }

  userConnected(userId: number, username: string) {
    const messageToClient = PB_MessageToClient.create({
      game: {
        userIdWhoEnteredRoom: userId,
      },
    });

    if (!this.userIdToUsername.has(userId)) {
      this.userIdToUsername.set(userId, username);

      const userIdAndUsername = PB_MessageToClient_Game_UserIdAndUsername.create({
        userId,
        username,
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
  }

  userDisconnected(userId: number) {
    const messageToClientBinary = PB_MessageToClient.toBinary(
      PB_MessageToClient.create({
        game: {
          userIdWhoExitedRoom: userId,
        },
      }),
    );

    for (const client of this.clients) {
      client.sendMessage(messageToClientBinary);
    }
  }
}

const dummyApprovals: boolean[] = [];
