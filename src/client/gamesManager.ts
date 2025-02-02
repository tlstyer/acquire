import { batch, createSignal } from 'solid-js';
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
    if (message.metadata || message.gameReview || message.gameNotFound) {
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
  let gameSetup: GameSetup | null;

  // let game: Game | null;

  const [status, setStatus] = createSignal(GameManagerStatus.Connecting);

  const [gameMode, setGameMode] = createSignal(PB_GameMode.SINGLES_1);
  const [playerArrangementMode, setPlayerArrangementMode] = createSignal(
    PB_PlayerArrangementMode.VERSION_1,
  );
  const [usernames, setUsernames] = createSignal<(string | null)[]>([]);
  const [usernamesWithoutNulls, setUsernamesWithoutNulls] = createSignal<string[]>([]); // TODO: come up with a better way
  const [userIds, setUserIds] = createSignal<(number | null)[]>([]);
  const [approvals, setApprovals] = createSignal<boolean[]>([]);
  const [hostUserId, setHostUserId] = createSignal(0);

  function connect() {
    setStatus(GameManagerStatus.Connecting);

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

    if (message.metadata || message.gameReview || message.gameNotFound) {
      if (message.metadata) {
        const metadata = message.metadata;
        gameSetup = new GameSetup(
          metadata.gameMode,
          metadata.playerArrangementMode,
          metadata.hostUserId,
          getUsernameForUserId,
          metadata.userIds.map((userId) => (userId === 0 ? null : userId)),
        );
        gameSetup.approvals = metadata.approvals;
      } else if (message.gameNotFound) {
        gameSetup = null;
      }
    }

    batch(() => {
      if (gameSetup) {
        setStatus(GameManagerStatus.SettingUp);
        setGameMode(gameSetup.gameMode);
        setPlayerArrangementMode(gameSetup.playerArrangementMode);
        if (gameSetup.usernames !== usernames()) {
          if (gameSetup.usernames.includes(null)) {
            setUsernamesWithoutNulls(
              gameSetup.usernames.map((username) => (username !== null ? username : '')),
            );
          } else {
            // @ts-expect-error just asserted that gameSetup.usernames does not include null
            setUsernamesWithoutNulls(gameSetup.usernames);
          }
        }
        setUsernames(gameSetup.usernames);
        setUserIds(gameSetup.userIds);
        setApprovals(gameSetup.approvals);
        setHostUserId(gameSetup.hostUserId);
      } else {
        setStatus(GameManagerStatus.NotFound);
      }
    });
  }

  return {
    connect,
    getConnectMessage,
    onMessage,
    signals: {
      status,
      gameMode,
      playerArrangementMode,
      usernames,
      usernamesWithoutNulls,
      userIds,
      approvals,
      hostUserId,
    },
  };
}

export const enum GameManagerStatus {
  Connecting,
  NotFound,
  SettingUp,
  // Game,
  Review,
}
