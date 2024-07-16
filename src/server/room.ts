import type { Client } from './client';

export class Room {
  clients = new Set<Client>();
  userIDToClients = new Map<number, Set<Client>>();

  /**
   * These methods are called by Client.
   */

  clientConnected(client: Client) {
    this.clients.add(client);

    if (client.userID !== undefined) {
      this.clientLoggedIn(client);
    }
  }

  clientDisconnected(client: Client) {
    this.clients.delete(client);

    if (client.userID !== undefined) {
      this.clientLoggedOut(client);
    }
  }

  clientLoggedIn(client: Client) {
    const clients = this.userIDToClients.get(client.userID!);
    if (clients !== undefined) {
      clients.add(client);
    } else {
      this.userIDToClients.set(client.userID!, new Set([client]));
      this.userConnected(client.userID!, client.username!);
    }
  }

  clientLoggedOut(client: Client) {
    const clients = this.userIDToClients.get(client.userID!)!;
    clients.delete(client);
    if (clients.size === 0) {
      this.userIDToClients.delete(client.userID!);
      this.userDisconnected(client.userID!, client.username!);
    }
  }

  /**
   * These methods are called by other Room methods.
   * They can be overridden in order to listen to these events.
   */

  userConnected(userID: number, username: string) {
    // nothing here
  }

  userDisconnected(userID: number, username: string) {
    // nothing here
  }
}
