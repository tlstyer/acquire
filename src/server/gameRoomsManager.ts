import {
  PB_MessageToClient,
  type PB_GameMode,
  type PB_MessageToServer_Game,
  type PB_MessageToServer_Game_Connect,
} from '../common/pb';
import type { Client } from './client';
import { GameRoom } from './gameRoom';
import type { LobbyRoom } from './lobbyRoom';
import { ReuseIdManager } from './reuseIdManager';

export class GameRoomsManager {
  nextGameNumber = 1;
  nextGameDisplayNumber = new ReuseIdManager(60000);
  gameNumberToGameRoom = new Map<number, GameRoom>();

  private lobbyRoom!: LobbyRoom;
  setLobbyRoom(lobbyRoom: LobbyRoom) {
    this.lobbyRoom = lobbyRoom;
  }

  private logTime = 0;
  setLogTime(logTime: number) {
    this.logTime = logTime;
  }

  createGameRoom(host: Client, gameMode: PB_GameMode) {
    const gameNumber = this.nextGameNumber++;
    const gameDisplayNumber = this.nextGameDisplayNumber.getId();
    const gameRoom = new GameRoom(this.lobbyRoom, gameNumber, gameDisplayNumber, host, gameMode);

    this.gameNumberToGameRoom.set(gameNumber, gameRoom);

    return gameRoom;
  }

  onMessage(client: Client, message: PB_MessageToServer_Game) {
    if (message.connect) {
      this.onMessage_Connect(client, message.connect);
    }
  }

  onMessage_Connect(client: Client, message: PB_MessageToServer_Game_Connect) {
    if (message.logTime === this.logTime && this.gameNumberToGameRoom.has(message.gameNumber)) {
      const gameRoom = this.gameNumberToGameRoom.get(message.gameNumber)!;
      gameRoom.onMessage_Connect(client, message);
    } else {
      client.disconnectFromRoom();

      client.sendMessage(
        PB_MessageToClient.toBinary(
          PB_MessageToClient.create({
            game: {
              logTime: message.logTime,
              gameNumber: message.gameNumber,
              gameNotFound: true,
            },
          }),
        ),
      );
    }
  }
}
