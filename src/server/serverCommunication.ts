export abstract class ServerCommunication {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onConnect = (clientId: number) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onDisconnect = (clientId: number) => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMessage = (clientId: number, message: Uint8Array) => {};

  setCallbacks(
    onConnect: (clientId: number) => void,
    onDisconnect: (clientId: number) => void,
    onMessage: (clientId: number, message: Uint8Array) => void,
  ) {
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onMessage = onMessage;
  }

  abstract sendMessage(clientId: number, message: Uint8Array): void;
}
