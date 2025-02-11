import { type User } from '../common/user.js';
import type { Client } from './client.js';

export class Room {
  clients = new Set<Client>();
  userToClients = new Map<User, Set<Client>>();

  /**
   * These methods are called by Client.
   */

  clientConnected(client: Client) {
    this.clients.add(client);

    if (client.user !== null) {
      this.clientLoggedIn(client);
    }
  }

  clientDisconnected(client: Client) {
    this.clients.delete(client);

    if (client.user !== null) {
      this.clientLoggedOut(client);
    }
  }

  clientLoggedIn(client: Client) {
    const clients = this.userToClients.get(client.user!);
    if (clients !== undefined) {
      clients.add(client);
    } else {
      this.userToClients.set(client.user!, new Set([client]));
      this.userConnected(client.user!);
    }
  }

  clientLoggedOut(client: Client) {
    const clients = this.userToClients.get(client.user!)!;
    clients.delete(client);
    if (clients.size === 0) {
      this.userToClients.delete(client.user!);
      this.userDisconnected(client.user!);
    }
  }

  /**
   * These methods are called by other Room methods.
   * They can be overridden in order to listen to these events.
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userConnected(user: User) {
    // nothing here
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userDisconnected(user: User) {
    // nothing here
  }
}
