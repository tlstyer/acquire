import type { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import {
  PB_MessageToClient,
  PB_MessageToClient_Game_UserIDAndUsername,
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

  private userIDToUsername = new Map<number, string>();
  private userIDsAndUsernames: PB_MessageToClient_Game_UserIDAndUsername[] = [];

  constructor(
    public lobbyRoom: LobbyRoom,
    public gameNumber: number,
    public gameDisplayNumber: number,
    host: Client,
    gameMode: PB_GameMode,
  ) {
    super();

    this.addUserIDAndUsername(host.userID!, host.username!);

    this.gameSetup = new GameSetup(
      gameMode,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      host.userID!,
      this.getUsernameForUserID.bind(this),
    );

    lobbyRoom.queueEvent(
      PB_MessageToClient_Lobby_Event.create({
        gameCreated: {
          gameNumber,
          gameDisplayNumber,
          gameMode,
          hostUserId: host.userID,
        },
      }),
    );
  }

  addUserIDAndUsername(userID: number, username: string) {
    this.userIDToUsername.set(userID, username);
    this.userIDsAndUsernames.push(
      PB_MessageToClient_Game_UserIDAndUsername.create({
        userId: userID,
        username,
      }),
    );
  }

  getUsernameForUserID(userID: number) {
    return this.userIDToUsername.get(userID) ?? '?';
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
              hostUserId: this.gameSetup ? this.gameSetup.hostUserID : this.game!.hostUserID,
              userIds: this.gameSetup
                ? this.gameSetup.userIDs.map((userID) => userID ?? 0)
                : this.game!.userIDs,
              approvals: this.gameSetup ? this.gameSetup.approvals : dummyApprovals,
            },
            userIdsAndUsernames: this.userIDsAndUsernames,
          },
        }),
      ),
    );
  }
}

const dummyApprovals: boolean[] = [];
