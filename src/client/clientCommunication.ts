export abstract class ClientCommunication {
  protected onConnect = () => {};
  protected onDisconnect = () => {};
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onMessage = (message: Uint8Array) => {};

  setCallbacks(
    onConnect: () => void,
    onDisconnect: () => void,
    onMessage: (message: Uint8Array) => void,
  ) {
    this.onConnect = onConnect;
    this.onDisconnect = onDisconnect;
    this.onMessage = onMessage;
  }

  abstract sendMessage(message: Uint8Array): void;
}
