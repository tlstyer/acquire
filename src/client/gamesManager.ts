import { batch, createSignal } from 'solid-js';
import { Game } from '../common/game.js';
import { gameFromProtocolBuffer } from '../common/gameSerialization.js';
import { createGameSetupLite, type GameSetupLite } from '../common/gameSetupLite.js';
import { GameState } from '../common/gameState.js';
import {
  PB_GameMode,
  type PB_MessageToClient_Game,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb.js';
import { User } from '../common/user.js';

export type GamesManager = ReturnType<typeof createGamesManager>;

export function createGamesManager(
  sendMessage: (message: Uint8Array) => void,
  myUser: () => User | null,
  userIdToUser: Map<number, User>,
) {
  const gameIdToGameManager = new Map<string, GameManager>();

  let lastRequestedGameId = '';
  let lastReceivedGameId = '';

  function connect(logTime: number, gameNumber: number) {
    lastRequestedGameId = `${logTime}-${gameNumber}`;

    let gameManager = gameIdToGameManager.get(lastRequestedGameId);
    if (gameManager === undefined) {
      gameManager = createGameManager(sendMessage, myUser, userIdToUser, logTime, gameNumber);
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
    if (message.connectResponse) {
      const connectResponse = message.connectResponse;
      lastReceivedGameId = `${connectResponse.logTime}-${connectResponse.gameNumber}`;
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
  sendMessage: (message: Uint8Array) => void,
  myUser: () => User | null,
  userIdToUser: Map<number, User>,
  logTime: number,
  gameNumber: number,
) {
  let gameSetup: GameSetupLite | null;
  let game: Game | null;

  let numberOfUserIdAndUsernameMessages = 0;

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

    sendMessage(getConnectMessage());
  }

  function getConnectMessage() {
    return PB_MessageToServer.toBinary({
      game: {
        connect: {
          logTime,
          gameNumber,
          numberOfUserIdAndUsernameMessages,
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

    numberOfUserIdAndUsernameMessages += message.userIdsAndUsernames.length;

    if (message.connectResponse) {
      const connectResponse = message.connectResponse;

      if (connectResponse.metadata) {
        const metadata = connectResponse.metadata;

        gameSetup = createGameSetupLite(
          metadata.gameMode,
          metadata.playerArrangementMode,
          userIdToUser.get(metadata.hostUserId)!,
          metadata.userIds.map((userId) => (userId === 0 ? null : userIdToUser.get(userId)!)),
          metadata.approvals,
          userIdToUser,
        );

        numberOfGameSetupChanges = metadata.numberOfGameSetupChanges;

        game = null;
      } else if (connectResponse.gameReview) {
        gameSetup = null;
        game = gameFromProtocolBuffer(connectResponse.gameReview);
      } else if (connectResponse.gameNotFound) {
        gameSetup = null;
        game = null;
      }

      const userIdsInRoom = connectResponse.userIdsInRoom;
      for (let i = 0; i < userIdsInRoom.length; i++) {
        internalUsersInRoom.add(userIdToUser.get(userIdsInRoom[i])!);
        updatedUsersInRoom = true;
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

    if (message.gameStates.length > 0) {
      if (gameSetup && !game) {
        game = new Game(
          gameSetup.gameMode,
          gameSetup.playerArrangementMode,
          [],
          gameSetup.finalUsers!,
          gameSetup.hostUser,
          myUser(),
        );

        gameSetup = null;
      }

      for (let i = 0; i < message.gameStates.length; i++) {
        game!.processGameState(message.gameStates[i]);
      }
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
    sendMessage(
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
    sendMessage(
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
    sendMessage(
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
    sendMessage(
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
    sendMessage(
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
    sendMessage(
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
    sendMessage(
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
