import type { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import {
  PB_MessageToClient,
  PB_MessageToClient_Game_UserIdAndUsername,
  PB_MessageToClient_Lobby_Event,
  PB_MessageToServer_Game_Connect,
  PB_PlayerArrangementMode,
  type PB_GameMode,
} from '../common/pb';
import type { Client } from './client';
import type { LobbyRoom } from './lobbyRoom';
import { Room } from './room';

export class GameRoom extends Room {
  gameSetup: GameSetup | undefined;
  game: Game | undefined;

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

    this.addUserIdAndUsername(host.userId!, host.username!);

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

  addUserIdAndUsername(userId: number, username: string) {
    this.userIdToUsername.set(userId, username);
    this.userIdsAndUsernames.push(
      PB_MessageToClient_Game_UserIdAndUsername.create({
        userId: userId,
        username,
      }),
    );
  }

  getUsernameForUserId(userId: number) {
    return this.userIdToUsername.get(userId) ?? '?';
  }

  onMessage_Connect(client: Client, message: PB_MessageToServer_Game_Connect) {
    client.connectToRoom(this);

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
            },
            userIdsAndUsernames: this.userIdsAndUsernames,
          },
        }),
      ),
    );
  }
}

const dummyApprovals: boolean[] = [];
