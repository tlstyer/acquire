import { type User } from '../common/user.js';
import type { Room } from './room.js';

export class Client {
  room: Room | undefined;

  user: User | null = null;

  isLoggingInOrOut = false;

  constructor(
    public clientId: number,
    public sendMessage: (message: Uint8Array) => void,
  ) {}

  connectToRoom(room: Room) {
    this.disconnectFromRoom();

    this.room = room;
    room.clientConnected(this);
  }

  disconnectFromRoom() {
    if (this.room) {
      this.room.clientDisconnected(this);
      this.room = undefined;
    }
  }

  loggedIn(user: User) {
    this.user = user;

    this.room?.clientLoggedIn(this);
  }

  loggedOut() {
    this.room?.clientLoggedOut(this);

    this.user = null;
  }
}
