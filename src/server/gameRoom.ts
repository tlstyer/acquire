import type { Game } from '../common/game';
import { GameSetup } from '../common/gameSetup';
import {
  PB_MessageToClient_Lobby_Event,
  PB_PlayerArrangementMode,
  type PB_GameMode,
} from '../common/pb';
import type { Client } from './client';
import type { LobbyRoom } from './lobbyRoom';
import { Room } from './room';

export class GameRoom extends Room {
  gameSetup: GameSetup | undefined;
  private userIDToUsername = new Map<number, string>();

  game: Game | undefined;

  constructor(
    public lobbyRoom: LobbyRoom,
    public gameNumber: number,
    public gameDisplayNumber: number,
    host: Client,
    gameMode: PB_GameMode,
  ) {
    super();

    this.userIDToUsername.set(host.userID!, host.username!);

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

  getUsernameForUserID(userID: number) {
    return this.userIDToUsername.get(userID) ?? '?';
  }
}
