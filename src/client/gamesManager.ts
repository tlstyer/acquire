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
  const gameIDToGameManager = new Map<string, GameManager>();

  let lastRequestedGameID = '';
  let lastReceivedGameID = '';

  function connect(logTime: number, gameNumber: number) {
    lastRequestedGameID = `${logTime}-${gameNumber}`;

    let gameManager = gameIDToGameManager.get(lastRequestedGameID);
    if (gameManager === undefined) {
      gameManager = createGameManager(clientCommunication, logTime, gameNumber);
      gameIDToGameManager.set(lastRequestedGameID, gameManager);
    }

    gameManager.connect();

    return gameManager;
  }

  function getConnectMessage() {
    const gameManager = gameIDToGameManager.get(lastRequestedGameID);
    if (gameManager === undefined) {
      throw new Error('last requested game manager does not exist');
    }

    return gameManager.getConnectMessage();
  }

  function onMessage(message: PB_MessageToClient_Game) {
    if (message.gameNumber) {
      lastReceivedGameID = `${message.logTime}-${message.gameNumber}`;
    }

    const gameManager = gameIDToGameManager.get(lastReceivedGameID);
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
  const [userIDs, setUserIDs] = createSignal<(number | null)[]>([]);
  const [approvals, setApprovals] = createSignal<boolean[]>([]);
  const [hostUserID, setHostUserID] = createSignal(0);

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

  const userIDToUsername = new Map<number, string>();
  function getUsernameForUserID(userID: number) {
    return userIDToUsername.get(userID) ?? '?';
  }

  function onMessage(message: PB_MessageToClient_Game) {
    for (let i = 0; i < message.userIdsAndUsernames.length; i++) {
      const userIDAndUsername = message.userIdsAndUsernames[i];
      userIDToUsername.set(userIDAndUsername.userId, userIDAndUsername.username);
    }

    if (message.gameNumber !== 0) {
      const metadata = message.metadata;

      if (metadata) {
        gameSetup = new GameSetup(
          metadata.gameMode,
          metadata.playerArrangementMode,
          metadata.hostUserId,
          getUsernameForUserID,
          metadata.userIds.map((userID) => (userID === 0 ? null : userID)),
        );
        gameSetup.approvals = metadata.approvals;
      }
    }

    setConnected(true);

    if (gameSetup) {
      setGameMode(gameSetup.gameMode);
      setPlayerArrangementMode(gameSetup.playerArrangementMode);
      setUsernames(gameSetup.usernames);
      setUserIDs(gameSetup.userIDs);
      setApprovals(gameSetup.approvals);
      setHostUserID(gameSetup.hostUserID);
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
      userIDs,
      approvals,
      hostUserID,
    },
  };
}
