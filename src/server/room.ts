import type { Client } from './client';

export class Room {
  clients = new Set<Client>();
  userIdToClients = new Map<number, Set<Client>>();

  /**
   * These methods are called by Client.
   */

  clientConnected(client: Client) {
    this.clients.add(client);

    if (client.userId !== undefined) {
      this.clientLoggedIn(client);
    }
  }

  clientDisconnected(client: Client) {
    this.clients.delete(client);

    if (client.userId !== undefined) {
      this.clientLoggedOut(client);
    }
  }

  clientLoggedIn(client: Client) {
    const clients = this.userIdToClients.get(client.userId!);
    if (clients !== undefined) {
      clients.add(client);
    } else {
      this.userIdToClients.set(client.userId!, new Set([client]));
      this.userConnected(client.userId!, client.username!);
    }
  }

  clientLoggedOut(client: Client) {
    const clients = this.userIdToClients.get(client.userId!)!;
    clients.delete(client);
    if (clients.size === 0) {
      this.userIdToClients.delete(client.userId!);
      this.userDisconnected(client.userId!, client.username!);
    }
  }

  /**
   * These methods are called by other Room methods.
   * They can be overridden in order to listen to these events.
   */

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userConnected(userId: number, username: string) {
    // nothing here
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userDisconnected(userId: number, username: string) {
    // nothing here
  }
}
