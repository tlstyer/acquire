import { batch, createSignal } from 'solid-js';
import { defaultGameBoard } from '../common/defaults';
import { createGameSetupLite } from '../common/gameSetupLite';
import { defaultApprovals, gameModeToNumPlayers } from '../common/helpers';
import {
  type PB_GameBoardChanges,
  PB_GameBoardType,
  type PB_GameMode,
  type PB_GameSetupChange,
  type PB_MessageToClient_Lobby,
  type PB_MessageToClient_Lobby_CreateGameResponse,
  type PB_MessageToClient_Lobby_Event,
  type PB_MessageToClient_Lobby_Event_AddUserToGameRoom,
  type PB_MessageToClient_Lobby_Event_AddUserToLobby,
  type PB_MessageToClient_Lobby_Event_GameBoardChanges,
  type PB_MessageToClient_Lobby_Event_GameCreated,
  type PB_MessageToClient_Lobby_Event_GameSetupChange,
  type PB_MessageToClient_Lobby_Event_RemoveUserFromGameRoom,
  type PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
  type PB_MessageToClient_Lobby_LastStateCheckpoint,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import { User } from '../common/user';
import { GameStatus } from './helpers';

export type LobbyManager = ReturnType<typeof createLobbyManager>;

export function createLobbyManager(
  sendMessage: (message: Uint8Array) => void,
  userIdToUser: Map<number, User>,
) {
  let lastEventIndex = 0;

  const userIds = new Set<number>();
  const gameDisplayNumberToLobbyGame = new Map<number, LobbyGame>();

  const [connected, setConnected] = createSignal(false);

  let shouldUpdateUsersSignal = false;
  const [users, setUsers] = createSignal<User[]>([]);

  let shouldUpdateLobbyGamesSignal = false;
  const [lobbyGames, setLobbyGames] = createSignal<LobbyGame[]>([]);

  const [createdGameNumber, setCreatedGameNumber] = createSignal<number | undefined>();

  function connect() {
    setConnected(false);
    setCreatedGameNumber(undefined);

    sendMessage(getConnectMessage());
  }

  function getConnectMessage() {
    return PB_MessageToServer.toBinary({
      lobby: {
        connect: {
          lastEventIndex,
        },
      },
    });
  }

  function createGame(gameMode: PB_GameMode) {
    sendMessage(
      PB_MessageToServer.toBinary({
        lobby: {
          createGame: {
            gameMode,
          },
        },
      }),
    );
  }

  function onMessage(message: PB_MessageToClient_Lobby) {
    batch(() => {
      if (message.lastStateCheckpoint) {
        onMessage_LastStateCheckpoint(message.lastStateCheckpoint);
      }
      if (message.events.length > 0) {
        onMessage_Events(message.events);
      }
      if (message.createGameResponse) {
        onMessage_CreateGameResponse(message.createGameResponse);
      }

      setConnected(true);

      if (shouldUpdateUsersSignal) {
        setUsers([...userIds].map((userId) => userIdToUser.get(userId) ?? unknownUser));
        shouldUpdateUsersSignal = false;
      }
      if (shouldUpdateLobbyGamesSignal) {
        const newLobbyGames = [...gameDisplayNumberToLobbyGame.values()];
        newLobbyGames.reverse();
        setLobbyGames(newLobbyGames);
        shouldUpdateLobbyGamesSignal = false;
      }
    });
  }

  function onMessage_LastStateCheckpoint(message: PB_MessageToClient_Lobby_LastStateCheckpoint) {
    userIds.clear();
    gameDisplayNumberToLobbyGame.clear();

    const users = message.users;
    for (let i = 0; i < users.length; i++) {
      const user = users[i];

      if (!userIdToUser.has(user.userId)) {
        userIdToUser.set(user.userId, new User(user.userId, user.username));
      }
      if (user.isInLobby) {
        userIds.add(user.userId);
      }
    }

    const games = message.games;
    for (let i = 0; i < games.length; i++) {
      const game = games[i];

      gameDisplayNumberToLobbyGame.set(
        game.gameDisplayNumber,
        createLobbyGame(
          game.gameNumber,
          game.gameDisplayNumber,
          game.gameMode,
          userIdToUser.get(game.hostUserId)!,
          game.userIds.map((userId) => userIdToUser.get(userId) ?? null),
          userIdToUser,
        ),
      );
    }

    for (let i = 0; i < users.length; i++) {
      const userMessage = users[i];
      const user = userIdToUser.get(userMessage.userId)!;

      for (let j = 0; j < userMessage.gameDisplayNumbersWherePresent.length; j++) {
        const gameDisplayNumberWherePresent = userMessage.gameDisplayNumbersWherePresent[j];

        gameDisplayNumberToLobbyGame
          .get(gameDisplayNumberWherePresent)!
          .private.addUserToRoom(user);
      }
    }

    lastEventIndex = message.lastEventIndex;

    shouldUpdateUsersSignal = true;
    shouldUpdateLobbyGamesSignal = true;
  }

  function onMessage_Events(events: PB_MessageToClient_Lobby_Event[]) {
    for (let i = 0; i < events.length; i++) {
      const event = events[i];

      if (event.gameCreated) {
        onMessage_Event_GameCreated(event.gameCreated);
      } else if (event.gameSetupChange) {
        onMessage_Event_GameSetupChange(event.gameSetupChange);
      } else if (event.gameBoardChanges) {
        onMessage_Event_GameBoardChanges(event.gameBoardChanges);
      } else if (event.addUserToLobby) {
        onMessage_Event_AddUserToLobby(event.addUserToLobby);
      } else if (event.removeUserFromLobby) {
        onMessage_Event_RemoveUserFromLobby(event.removeUserFromLobby);
      } else if (event.addUserToGameRoom) {
        onMessage_Event_AddUserToGameRoom(event.addUserToGameRoom);
      } else if (event.removeUserFromGameRoom) {
        onMessage_Event_RemoveUserFromGameRoom(event.removeUserFromGameRoom);
      }
    }

    lastEventIndex += events.length;
  }

  function onMessage_Event_GameCreated(event: PB_MessageToClient_Lobby_Event_GameCreated) {
    const userIds: number[] = new Array(gameModeToNumPlayers.get(event.gameMode));
    userIds.fill(0);
    userIds[0] = event.hostUserId;

    gameDisplayNumberToLobbyGame.set(
      event.gameDisplayNumber,
      createLobbyGame(
        event.gameNumber,
        event.gameDisplayNumber,
        event.gameMode,
        userIdToUser.get(event.hostUserId)!,
        userIds.map((userId) => userIdToUser.get(userId) ?? null),
        userIdToUser,
      ),
    );

    shouldUpdateLobbyGamesSignal = true;
  }

  function onMessage_Event_GameSetupChange(event: PB_MessageToClient_Lobby_Event_GameSetupChange) {
    gameDisplayNumberToLobbyGame
      .get(event.gameDisplayNumber)!
      .private.changeGameSetup(event.gameSetupChange!);
  }

  function onMessage_Event_GameBoardChanges(
    event: PB_MessageToClient_Lobby_Event_GameBoardChanges,
  ) {
    gameDisplayNumberToLobbyGame
      .get(event.gameDisplayNumber)!
      .private.processGameBoardChanges(event.gameBoardChanges!);
  }

  function onMessage_Event_AddUserToLobby(event: PB_MessageToClient_Lobby_Event_AddUserToLobby) {
    if (event.username && !userIdToUser.has(event.userId)) {
      userIdToUser.set(event.userId, new User(event.userId, event.username));
    }

    userIds.add(event.userId);

    shouldUpdateUsersSignal = true;
  }

  function onMessage_Event_RemoveUserFromLobby(
    event: PB_MessageToClient_Lobby_Event_RemoveUserFromLobby,
  ) {
    userIds.delete(event.userId);

    shouldUpdateUsersSignal = true;
  }

  function onMessage_Event_AddUserToGameRoom(
    event: PB_MessageToClient_Lobby_Event_AddUserToGameRoom,
  ) {
    let user = userIdToUser.get(event.userId);
    if (!user) {
      user = new User(event.userId, event.username);
      userIdToUser.set(event.userId, user);
    }

    gameDisplayNumberToLobbyGame.get(event.gameDisplayNumber)!.private.addUserToRoom(user);
  }

  function onMessage_Event_RemoveUserFromGameRoom(
    event: PB_MessageToClient_Lobby_Event_RemoveUserFromGameRoom,
  ) {
    const user = userIdToUser.get(event.userId)!;

    gameDisplayNumberToLobbyGame.get(event.gameDisplayNumber)!.private.removeUserFromRoom(user);
  }

  function onMessage_CreateGameResponse(message: PB_MessageToClient_Lobby_CreateGameResponse) {
    setCreatedGameNumber(message.gameNumber);
  }

  return {
    connect,
    getConnectMessage,
    createGame,
    onMessage,
    get lastEventIndex() {
      return lastEventIndex;
    },
    signals: {
      connected,
      users,
      lobbyGames,
      createdGameNumber,
    },
  };
}

export type LobbyGame = ReturnType<typeof createLobbyGame>;

function createLobbyGame(
  gameNumber: number,
  gameDisplayNumber: number,
  initialGameMode: PB_GameMode,
  hostUser: User,
  initialUsers: (User | null)[],
  userIdToUser: Map<number, User>,
) {
  const gameSetup = createGameSetupLite(
    initialGameMode,
    PB_PlayerArrangementMode.EXACT_ORDER,
    hostUser,
    initialUsers,
    defaultApprovals[gameModeToNumPlayers.get(initialGameMode)!],
    userIdToUser,
  );

  let internalGameBoard = defaultGameBoard;
  const [gameBoard, setGameBoard] = createSignal(internalGameBoard);
  const [users, setUsers] = createSignal(gameSetup.users);
  const [gameMode, setGameMode] = createSignal(gameSetup.gameMode);
  let internalGameStatus = GameStatus.SETTING_UP;
  const [gameStatus, setGameStatus] = createSignal<GameStatus>(internalGameStatus);
  const internalUsersInRoom = new Set<User>();
  const [usersInRoom, setUsersInRoom] = createSignal(internalUsersInRoom, { equals: false });

  function changeGameSetup(gameSetupChange: PB_GameSetupChange) {
    gameSetup.processChange(gameSetupChange);
    setUsers(gameSetup.users);
    setGameMode(gameSetup.gameMode);
  }

  function processGameBoardChanges(gameBoardChanges: PB_GameBoardChanges) {
    if (internalGameStatus === GameStatus.SETTING_UP) {
      setUsers(gameSetup.finalUsers!);

      internalGameStatus = GameStatus.IN_PROGRESS;
      setGameStatus(internalGameStatus);
    }

    internalGameBoard = doGameBoardChanges(internalGameBoard, gameBoardChanges);
    setGameBoard(internalGameBoard);
  }

  function addUserToRoom(user: User) {
    internalUsersInRoom.add(user);
    setUsersInRoom(internalUsersInRoom);
  }

  function removeUserFromRoom(user: User) {
    internalUsersInRoom.delete(user);
    setUsersInRoom(internalUsersInRoom);
  }

  return {
    gameNumber,
    gameDisplayNumber,
    hostUser,
    signals: {
      gameBoard,
      users,
      gameMode,
      gameStatus,
      usersInRoom,
    },
    private: {
      changeGameSetup,
      processGameBoardChanges,
      addUserToRoom,
      removeUserFromRoom,
    },
  };
}

const unknownUser = new User(-1, '?');

class GameBoardCellChange {
  constructor(
    public gameBoardType: PB_GameBoardType,
    public x: number,
  ) {}
}

function doGameBoardChanges(
  currentGameBoard: PB_GameBoardType[][],
  gameBoardChanges: PB_GameBoardChanges,
) {
  const rowChanges: (GameBoardCellChange[] | undefined)[] = new Array(9);
  rowChanges.fill(undefined);

  processGameBoardType(PB_GameBoardType.LUXOR, gameBoardChanges.luxorTiles);
  processGameBoardType(PB_GameBoardType.TOWER, gameBoardChanges.towerTiles);
  processGameBoardType(PB_GameBoardType.AMERICAN, gameBoardChanges.americanTiles);
  processGameBoardType(PB_GameBoardType.FESTIVAL, gameBoardChanges.festivalTiles);
  processGameBoardType(PB_GameBoardType.WORLDWIDE, gameBoardChanges.worldwideTiles);
  processGameBoardType(PB_GameBoardType.CONTINENTAL, gameBoardChanges.continentalTiles);
  processGameBoardType(PB_GameBoardType.IMPERIAL, gameBoardChanges.imperialTiles);
  processGameBoardType(PB_GameBoardType.NOTHING_YET, gameBoardChanges.nothingYetTiles);
  processGameBoardType(PB_GameBoardType.CANT_PLAY_EVER, gameBoardChanges.cantPlayEverTiles);

  const newGameBoard = [...currentGameBoard];
  for (let y = 0; y < rowChanges.length; y++) {
    const gameBoardCellChanges = rowChanges[y];
    if (gameBoardCellChanges) {
      const row = [...newGameBoard[y]];

      for (let i = 0; i < gameBoardCellChanges.length; i++) {
        const gameBoardCellChange = gameBoardCellChanges[i];
        row[gameBoardCellChange.x] = gameBoardCellChange.gameBoardType;
      }
      newGameBoard[y] = row;
    }
  }

  return newGameBoard;

  function processGameBoardType(gameBoardType: PB_GameBoardType, tiles: number[]) {
    for (let i = 0; i < tiles.length; i++) {
      const tile = tiles[i];
      const y = tile % 9;
      const x = (tile - y) / 9;

      if (rowChanges[y] === undefined) {
        rowChanges[y] = [];
      }

      rowChanges[y]!.push(new GameBoardCellChange(gameBoardType, x));
    }
  }
}
