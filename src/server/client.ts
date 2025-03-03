import { concatenateUint8Arrays } from '../common/helpers.js';
import { type User } from '../common/user.js';
import { type Room } from './room.js';

export class Client {
  room: Room | undefined;

  user: User | null = null;

  isLoggingInOrOut = false;

  constructor(
    public clientId: number,
    private actuallySendMessage: (message: Uint8Array) => void,
  ) {}

  private responseMessages: Uint8Array[] | null = null;

  beginResponse() {
    if (!this.responseMessages) {
      this.responseMessages = [];
    }
  }

  endResponse() {
    if (this.responseMessages) {
      if (this.responseMessages.length > 0) {
        this.actuallySendMessage(concatenateUint8Arrays(this.responseMessages));
      }

      this.responseMessages = null;
    }
  }

  sendMessage(message: Uint8Array) {
    if (this.responseMessages) {
      this.responseMessages.push(message);
    } else {
      this.actuallySendMessage(message);
    }
  }

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
    const previousUser = this.user!;
    this.user = null;
    this.room?.clientLoggedOut(this, previousUser);
  }
}
