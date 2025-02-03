import { batch, createSignal } from 'solid-js';
import { Game } from '../common/game';
import { gameFromProtocolBuffer } from '../common/gameSerialization';
import { createGameSetupLite, type GameSetupLite } from '../common/gameSetupLite';
import { GameState } from '../common/gameState';
import {
  PB_GameMode,
  type PB_MessageToClient_Game,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { type ClientCommunication } from './clientCommunication';

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
  let gameSetup: GameSetupLite | null;
  let game: Game | null;

  const [status, setStatus] = createSignal(GameManagerStatus.Connecting);

  const [gameMode, setGameMode] = createSignal(PB_GameMode.SINGLES_1);
  const [playerArrangementMode, setPlayerArrangementMode] = createSignal(
    PB_PlayerArrangementMode.VERSION_1,
  );
  const [usernames, setUsernames] = createSignal(dummyUsernames);
  const [usernamesWithoutNulls, setUsernamesWithoutNulls] = createSignal(
    dummyUsernamesWithoutNulls,
  ); // TODO: come up with a better way
  const [userIds, setUserIds] = createSignal(dummyUserIds);
  const [approvals, setApprovals] = createSignal(dummyApprovals);
  const [hostUserId, setHostUserId] = createSignal(0);
  let numberOfGameSetupChanges = 0;
  const internalUserIdToUsername = new Map<number, string>();
  const [userIdToUsername, setUserIdToUsername] = createSignal(internalUserIdToUsername, {
    equals: false,
  });
  const internalUserIdsInRoom = new Set<number>();
  const [userIdsInRoom, setUserIdsInRoom] = createSignal(internalUserIdsInRoom, { equals: false });

  const [gameStateHistory, setGameStateHistory] = createSignal(dummyGameStateHistory);

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

  function onMessage(message: PB_MessageToClient_Game) {
    let updatedUserIdToUsername = false;
    let updatedUserIdsInRoom = false;

    for (let i = 0; i < message.userIdsAndUsernames.length; i++) {
      const userIdAndUsername = message.userIdsAndUsernames[i];
      internalUserIdToUsername.set(userIdAndUsername.userId, userIdAndUsername.username);
      updatedUserIdToUsername = true;
    }

    if (message.metadata || message.gameReview || message.gameNotFound) {
      if (message.metadata) {
        const metadata = message.metadata;

        gameSetup = createGameSetupLite(
          metadata.gameMode,
          metadata.playerArrangementMode,
          metadata.hostUserId,
          metadata.userIds.map((userId) => (userId === 0 ? null : userId)),
          metadata.approvals,
        );

        numberOfGameSetupChanges = metadata.numberOfGameSetupChanges;

        for (let i = 0; i < metadata.userIdsInRoom.length; i++) {
          internalUserIdsInRoom.add(metadata.userIdsInRoom[i]);
          updatedUserIdsInRoom = true;
        }

        game = null;
      } else if (message.gameReview) {
        gameSetup = null;
        game = gameFromProtocolBuffer(message.gameReview);
      } else if (message.gameNotFound) {
        gameSetup = null;
        game = null;
      }
    }

    if (message.userIdWhoEnteredRoom) {
      internalUserIdsInRoom.add(message.userIdWhoEnteredRoom);
      updatedUserIdsInRoom = true;
    }
    if (message.userIdWhoExitedRoom) {
      internalUserIdsInRoom.delete(message.userIdWhoExitedRoom);
      updatedUserIdsInRoom = true;
    }

    if (message.gameSetupChange) {
      gameSetup!.processChange(message.gameSetupChange);
      numberOfGameSetupChanges++;
    }

    batch(() => {
      if (gameSetup) {
        setStatus(GameManagerStatus.SettingUp);
        setGameMode(gameSetup.gameMode);
        setPlayerArrangementMode(gameSetup.playerArrangementMode);
        if (gameSetup.userIds !== userIds()) {
          const usernames = gameSetup.userIds.map((userId) =>
            userId !== null ? (internalUserIdToUsername.get(userId) ?? '?') : null,
          );
          setUsernames(usernames);
          setUsernamesWithoutNulls(usernames.map((username) => username ?? ''));
          setUserIds(gameSetup.userIds);
        }
        setApprovals(gameSetup.approvals);
        setHostUserId(gameSetup.hostUserId);
      } else if (game) {
        setStatus(GameManagerStatus.Review);
        setGameMode(game.gameMode);
        setPlayerArrangementMode(game.playerArrangementMode);
        setUsernames(game.usernames);
        setUsernamesWithoutNulls(game.usernames);
        setUserIds(game.userIds);
        setHostUserId(game.hostUserId);

        setGameStateHistory(game.gameStateHistory);
      } else {
        setStatus(GameManagerStatus.NotFound);
      }

      if (updatedUserIdToUsername) {
        setUserIdToUsername(internalUserIdToUsername);
      }
      if (updatedUserIdsInRoom) {
        setUserIdsInRoom(internalUserIdsInRoom);
      }
    });
  }

  function sitDown() {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            sitDown: {},
          },
        },
      }),
    );
  }

  function standUp() {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            standUp: {},
          },
        },
      }),
    );
  }

  function approve() {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            approve: {},
          },
        },
      }),
    );
  }

  function changeGameMode(gameMode: PB_GameMode) {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            changeGameMode: {
              gameMode,
            },
          },
        },
      }),
    );
  }

  function changePlayerArrangementMode(playerArrangementMode: PB_PlayerArrangementMode) {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            changePlayerArrangementMode: {
              playerArrangementMode,
            },
          },
        },
      }),
    );
  }

  function swapPositions(position1: number, position2: number) {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            swapPositions: {
              position1,
              position2,
            },
          },
        },
      }),
    );
  }

  function kickUser(userId: number) {
    clientCommunication.sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameSetupAction: {
            numberOfGameSetupChanges,
            kickUser: {
              userId,
            },
          },
        },
      }),
    );
  }

  return {
    connect,
    getConnectMessage,
    onMessage,
    gameSetupActions: {
      sitDown,
      standUp,
      approve,
      changeGameMode,
      changePlayerArrangementMode,
      swapPositions,
      kickUser,
    },
    signals: {
      status,
      gameMode,
      playerArrangementMode,
      usernames,
      usernamesWithoutNulls,
      userIds,
      approvals,
      hostUserId,
      userIdToUsername,
      userIdsInRoom,
      gameStateHistory,
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

const dummyGame = new Game(
  PB_GameMode.SINGLES_1,
  PB_PlayerArrangementMode.VERSION_1,
  [],
  [],
  [],
  0,
  0,
);

const dummyGameState = new GameState(dummyGame, null);

const dummyUsernames: (string | null)[] = [];
const dummyUsernamesWithoutNulls: string[] = [];
const dummyUserIds: (number | null)[] = [];
const dummyApprovals: boolean[] = [];
const dummyGameStateHistory = [dummyGameState];
