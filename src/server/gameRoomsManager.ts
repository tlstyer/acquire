import type { PB_GameMode } from '../common/pb';
import type { Client } from './client';
import { GameRoom } from './gameRoom';
import type { LobbyRoom } from './lobbyRoom';
import { ReuseIDManager } from './reuseIDManager';

export class GameRoomsManager {
  nextGameNumber = 1;
  nextGameDisplayNumber = new ReuseIDManager(60000);
  gameNumberToGameRoom = new Map<number, GameRoom>();

  private lobbyRoom!: LobbyRoom;
  setLobbyRoom(lobbyRoom: LobbyRoom) {
    this.lobbyRoom = lobbyRoom;
  }

  createGameRoom(host: Client, gameMode: PB_GameMode) {
    const gameNumber = this.nextGameNumber++;
    const gameDisplayNumber = this.nextGameDisplayNumber.getID();
    const gameRoom = new GameRoom(this.lobbyRoom, gameNumber, gameDisplayNumber, host, gameMode);

    this.gameNumberToGameRoom.set(gameNumber, gameRoom);

    return gameRoom;
  }
}
