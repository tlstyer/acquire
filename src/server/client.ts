import type { Room } from './room';

export class Client {
  room: Room | undefined;

  userId: number | undefined;
  username: string | undefined;

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

  loggedIn(userId: number, username: string) {
    this.userId = userId;
    this.username = username;

    this.room?.clientLoggedIn(this);
  }

  loggedOut() {
    this.room?.clientLoggedOut(this);

    this.userId = undefined;
    this.username = undefined;
  }
}
