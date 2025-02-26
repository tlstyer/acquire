import { batch, createSignal } from 'solid-js';
import { Game } from '../common/game.js';
import { type ActionBase } from '../common/gameActions/base.js';
import { gameFromProtocolBuffer } from '../common/gameSerialization.js';
import { createGameSetupLite, type GameSetupLite } from '../common/gameSetupLite.js';
import { type GameState } from '../common/gameState.js';
import {
  PB_GameAction,
  type PB_GameBoardType,
  PB_GameMode,
  type PB_MessageToClient_Game,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb.js';
import { User } from '../common/user.js';

export type GamesManager = ReturnType<typeof createGamesManager>;

export function createGamesManager(
  sendMessage: (message: Uint8Array) => void,
  myUserAccessor: () => User | null,
  userIdToUser: Map<number, User>,
) {
  const gameIdToGameManager = new Map<string, GameManager>();

  let lastRequestedGameId = '';
  let lastReceivedGameId = '';

  function connect(logTime: number, gameNumber: number) {
    lastRequestedGameId = `${logTime}-${gameNumber}`;

    let gameManager = gameIdToGameManager.get(lastRequestedGameId);
    if (gameManager === undefined) {
      gameManager = createGameManager(
        sendMessage,
        myUserAccessor,
        userIdToUser,
        logTime,
        gameNumber,
      );
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
  myUserAccessor: () => User | null,
  userIdToUser: Map<number, User>,
  logTime: number,
  gameNumber: number,
) {
  let gameSetup: GameSetupLite | null = null;
  let game: Game | null = null;
  let gameReview: Game | null = null;

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

  const [myPlayerId, setMyPlayerId] = createSignal(-1);
  const [myRequiredGameAction, setMyRequiredGameAction] = createSignal<ActionBase | null>(null);

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
          numberOfGameStates: game ? game.gameStateHistory.length : 0,
        },
      },
    });
  }

  function onMessage(message: PB_MessageToClient_Game) {
    const myUser = myUserAccessor();

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
        gameReview = null;
      } else if (connectResponse.gameReview) {
        gameSetup = null;
        game = null;
        gameReview = gameFromProtocolBuffer(connectResponse.gameReview);
      } else if (connectResponse.gameNotFound) {
        gameSetup = null;
        game = null;
        gameReview = null;
      }

      internalUsersInRoom.clear();
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
          // @ts-expect-error gameSetup's users has no nulls when starting a game
          gameSetup.finalUsers ?? gameSetup.users,
          gameSetup.hostUser,
          myUser ?? dummyUser,
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
      } else if (game || gameReview) {
        const g = game || gameReview!;

        setStatus(game ? GameManagerStatus.Game : GameManagerStatus.Review);
        setGameMode(g.gameMode);
        setPlayerArrangementMode(g.playerArrangementMode);
        setUsers(g.users);
        setUsersWithoutNulls(g.users);
        setHostUser(g.hostUser);

        setGameStateHistory(g.gameStateHistory);

        if (game) {
          const playerId = myUser !== null ? game.users.indexOf(myUser) : -1;
          setMyPlayerId(playerId);

          const nextGameAction =
            game.gameStateHistory[game.gameStateHistory.length - 1].nextGameAction;
          setMyRequiredGameAction(nextGameAction.playerId === playerId ? nextGameAction : null);
        }
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

  function sendGameActionMessage(gameAction: PB_GameAction) {
    sendMessage(
      PB_MessageToServer.toBinary({
        game: {
          gameAction: {
            numberOfGameStates: game!.gameStateHistory.length,
            gameAction,
          },
        },
      }),
    );
  }

  function playTile(tile: number) {
    sendGameActionMessage(
      PB_GameAction.create({
        playTile: {
          tile,
        },
      }),
    );
  }

  function selectNewChain(chain: PB_GameBoardType) {
    sendGameActionMessage(
      PB_GameAction.create({
        selectNewChain: {
          chain,
        },
      }),
    );
  }

  function selectMergerSurvivor(chain: PB_GameBoardType) {
    sendGameActionMessage(
      PB_GameAction.create({
        selectMergerSurvivor: {
          chain,
        },
      }),
    );
  }

  function selectChainToDisposeOfNext(chain: PB_GameBoardType) {
    sendGameActionMessage(
      PB_GameAction.create({
        selectChainToDisposeOfNext: {
          chain,
        },
      }),
    );
  }

  function disposeOfShares(tradeAmount: number, sellAmount: number) {
    sendGameActionMessage(
      PB_GameAction.create({
        disposeOfShares: {
          tradeAmount,
          sellAmount,
        },
      }),
    );
  }

  function purchaseShares(chains: PB_GameBoardType[], endGame: boolean) {
    sendGameActionMessage(
      PB_GameAction.create({
        purchaseShares: {
          chains,
          endGame,
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
    gameActions: {
      playTile,
      selectNewChain,
      selectMergerSurvivor,
      selectChainToDisposeOfNext,
      disposeOfShares,
      purchaseShares,
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
      myPlayerId,
      myRequiredGameAction,
    },
  };
}

export const enum GameManagerStatus {
  Connecting,
  NotFound,
  SettingUp,
  Game,
  Review,
}

const dummyUser = new User(-1, '?');
const dummyUsers: (User | null)[] = [];
const dummyUsersWithoutNulls: User[] = [];
const dummyApprovals: boolean[] = [];
const dummyGameStateHistory: GameState[] = [];
