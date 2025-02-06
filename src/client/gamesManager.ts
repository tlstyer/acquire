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
import { User } from '../common/user';
import { type ClientCommunication } from './clientCommunication';

export type GamesManager = ReturnType<typeof createGamesManager>;

export function createGamesManager(
  clientCommunication: ClientCommunication,
  userIdToUser: Map<number, User>,
) {
  const gameIdToGameManager = new Map<string, GameManager>();

  let lastRequestedGameId = '';
  let lastReceivedGameId = '';

  function connect(logTime: number, gameNumber: number) {
    lastRequestedGameId = `${logTime}-${gameNumber}`;

    let gameManager = gameIdToGameManager.get(lastRequestedGameId);
    if (gameManager === undefined) {
      gameManager = createGameManager(clientCommunication, userIdToUser, logTime, gameNumber);
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
  userIdToUser: Map<number, User>,
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
  const [users, setUsers] = createSignal(dummyUsers);
  const [usersWithoutNulls, setUsersWithoutNulls] = createSignal(dummyUsersWithoutNulls);
  const [approvals, setApprovals] = createSignal(dummyApprovals);
  const [hostUser, setHostUser] = createSignal(dummyUser);
  let numberOfGameSetupChanges = 0;
  const internalUsersInRoom = new Set<User>();
  const [usersInRoom, setUsersInRoom] = createSignal(internalUsersInRoom, { equals: false });

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
    let updatedUsersInRoom = false;

    for (let i = 0; i < message.userIdsAndUsernames.length; i++) {
      const userIdAndUsername = message.userIdsAndUsernames[i];

      if (!userIdToUser.has(userIdAndUsername.userId)) {
        userIdToUser.set(
          userIdAndUsername.userId,
          new User(userIdAndUsername.userId, userIdAndUsername.username),
        );
      }
    }

    if (message.metadata || message.gameReview || message.gameNotFound) {
      if (message.metadata) {
        const metadata = message.metadata;

        gameSetup = createGameSetupLite(
          metadata.gameMode,
          metadata.playerArrangementMode,
          userIdToUser.get(metadata.hostUserId)!,
          metadata.userIds.map((userId) => (userId === 0 ? null : userIdToUser.get(userId)!)),
          metadata.approvals,
          userIdToUser,
        );

        numberOfGameSetupChanges = metadata.numberOfGameSetupChanges;

        for (let i = 0; i < metadata.userIdsInRoom.length; i++) {
          internalUsersInRoom.add(userIdToUser.get(metadata.userIdsInRoom[i])!);
          updatedUsersInRoom = true;
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
      internalUsersInRoom.add(userIdToUser.get(message.userIdWhoEnteredRoom)!);
      updatedUsersInRoom = true;
    }
    if (message.userIdWhoExitedRoom) {
      internalUsersInRoom.delete(userIdToUser.get(message.userIdWhoExitedRoom)!);
      updatedUsersInRoom = true;
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
        setUsers(gameSetup.users);
        setApprovals(gameSetup.approvals);
        setHostUser(gameSetup.hostUser);
      } else if (game) {
        setStatus(GameManagerStatus.Review);
        setGameMode(game.gameMode);
        setPlayerArrangementMode(game.playerArrangementMode);
        setUsers(game.users);
        setUsersWithoutNulls(game.users);
        setHostUser(game.hostUser);

        setGameStateHistory(game.gameStateHistory);
      } else {
        setStatus(GameManagerStatus.NotFound);
      }

      if (updatedUsersInRoom) {
        setUsersInRoom(internalUsersInRoom);
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
      users,
      usersWithoutNulls,
      approvals,
      hostUser,
      usersInRoom,
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

const dummyUser = new User(-1, '?');

const dummyGame = new Game(
  PB_GameMode.SINGLES_1,
  PB_PlayerArrangementMode.VERSION_1,
  [],
  [],
  dummyUser,
  null,
);

const dummyGameState = new GameState(dummyGame, null);

const dummyUsers: (User | null)[] = [];
const dummyUsersWithoutNulls: User[] = [];
const dummyApprovals: boolean[] = [];
const dummyGameStateHistory = [dummyGameState];
