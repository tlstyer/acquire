import fsPromises from 'fs/promises';
import path from 'path';
import {
  PB_MessageToClient,
  type PB_GameMode,
  type PB_MessageToServer_Game,
  type PB_MessageToServer_Game_Connect,
} from '../common/pb';
import { PBWithBinaryAlready_MessageToClient } from '../common/pbWithBinaryAlready';
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
    if (message.gameSetupAction && client.room instanceof GameRoom) {
      client.room.onMessage_GameSetupAction(client, message.gameSetupAction);
    }
  }

  async onMessage_Connect(client: Client, message: PB_MessageToServer_Game_Connect) {
    if (message.logTime === this.logTime && this.gameNumberToGameRoom.has(message.gameNumber)) {
      const gameRoom = this.gameNumberToGameRoom.get(message.gameNumber)!;
      gameRoom.onMessage_Connect(client, message);
      return;
    }

    client.disconnectFromRoom();

    if (process.env.GAME_PROTOCOL_BUFFER_BINARIES_DIR) {
      try {
        const fileContents = await fsPromises.readFile(
          path.join(
            process.env.GAME_PROTOCOL_BUFFER_BINARIES_DIR,
            message.logTime.toString(),
            message.gameNumber.toString(),
          ),
        );

        client.sendMessage(
          PBWithBinaryAlready_MessageToClient.toBinary(
            PBWithBinaryAlready_MessageToClient.create({
              game: {
                logTime: message.logTime,
                gameNumber: message.gameNumber,
                gameReview: fileContents,
              },
            }),
          ),
        );

        return;
      } catch {
        // ignore file not found
      }
    }

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
