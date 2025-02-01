import { createSignal } from 'solid-js';
import { GameSetup } from '../common/gameSetup';
import {
  PB_GameMode,
  PB_MessageToClient_Game,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { ClientCommunication } from './clientCommunication';

export type GamesManager = ReturnType<typeof createGamesManager>;

export function createGamesManager(clientCommunication: ClientCommunication) {
  const gameIdToGameManager = new Map<string, GameManager>();

  let lastRequestedGameId = '';
  let lastReceivedGameId = '';

  function connect(logTime: number, gameNumber: number) {
    lastRequestedGameId = `${logTime}-${gameNumber}`;

    let gameManager = gameIdToGameManager.get(lastRequestedGameId);
    if (gameManager === undefined) {
      gameManager = createGameManager(clientCommunication, logTime, gameNumber);
      gameIdToGameManager.set(lastRequestedGameId, gameManager);
    }

    gameManager.connect();

    return gameManager;
  }

  function getConnectMessage() {
    const gameManager = gameIdToGameManager.get(lastRequestedGameId);
    if (gameManager === undefined) {
      throw new Error('last requested game manager does not exist');
    }

    return gameManager.getConnectMessage();
  }

  function onMessage(message: PB_MessageToClient_Game) {
    if (message.gameNumber) {
      lastReceivedGameId = `${message.logTime}-${message.gameNumber}`;
    }

    const gameManager = gameIdToGameManager.get(lastReceivedGameId);
    if (gameManager === undefined) {
      throw new Error('last received game manager does not exist');
    }

    gameManager.onMessage(message);
  }

  return {
    connect,
    getConnectMessage,
    onMessage,
  };
}

export type GameManager = ReturnType<typeof createGameManager>;

export function createGameManager(
  clientCommunication: ClientCommunication,
  logTime: number,
  gameNumber: number,
) {
  let gameSetup: GameSetup | undefined;

  // let game: Game | undefined;

  const [connected, setConnected] = createSignal(false);

  const [gameMode, setGameMode] = createSignal(PB_GameMode.SINGLES_1);
  const [playerArrangementMode, setPlayerArrangementMode] = createSignal(
    PB_PlayerArrangementMode.VERSION_1,
  );
  const [usernames, setUsernames] = createSignal<(string | null)[]>([]);
  const [userIds, setUserIds] = createSignal<(number | null)[]>([]);
  const [approvals, setApprovals] = createSignal<boolean[]>([]);
  const [hostUserId, setHostUserId] = createSignal(0);

  function connect() {
    setConnected(false);

    clientCommunication.sendMessage(getConnectMessage());
  }

  function getConnectMessage() {
    return PB_MessageToServer.toBinary({
      game: {
        connect: {
          logTime,
          gameNumber,
        },
      },
    });
  }

  const userIdToUsername = new Map<number, string>();
  function getUsernameForUserId(userId: number) {
    return userIdToUsername.get(userId) ?? '?';
  }

  function onMessage(message: PB_MessageToClient_Game) {
    for (let i = 0; i < message.userIdsAndUsernames.length; i++) {
      const userIdAndUsername = message.userIdsAndUsernames[i];
      userIdToUsername.set(userIdAndUsername.userId, userIdAndUsername.username);
    }

    if (message.gameNumber !== 0) {
      const metadata = message.metadata;

      if (metadata) {
        gameSetup = new GameSetup(
          metadata.gameMode,
          metadata.playerArrangementMode,
          metadata.hostUserId,
          getUsernameForUserId,
          metadata.userIds.map((userId) => (userId === 0 ? null : userId)),
        );
        gameSetup.approvals = metadata.approvals;
      }
    }

    setConnected(true);

    if (gameSetup) {
      setGameMode(gameSetup.gameMode);
      setPlayerArrangementMode(gameSetup.playerArrangementMode);
      setUsernames(gameSetup.usernames);
      setUserIds(gameSetup.userIds);
      setApprovals(gameSetup.approvals);
      setHostUserId(gameSetup.hostUserId);
    }
  }

  return {
    connect,
    getConnectMessage,
    onMessage,
    signals: {
      connected,
      gameMode,
      playerArrangementMode,
      usernames,
      userIds,
      approvals,
      hostUserId,
    },
  };
}
