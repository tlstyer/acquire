import { defaultApprovals, gameModeToNumPlayers, gameModeToTeamSize } from './helpers.js';
import { PB_PlayerArrangementMode, type PB_GameMode, type PB_GameSetupChange } from './pb.js';
import { type User } from './user.js';

export type GameSetupLite = ReturnType<typeof createGameSetupLite>;

export function createGameSetupLite(
  gameMode: PB_GameMode,
  playerArrangementMode: PB_PlayerArrangementMode,
  hostUser: User,
  users: (User | null)[],
  approvals: boolean[],
  userIdToUser: Map<number, User>,
) {
  let finalUsers: User[] | null = null;

  function processChange(gameSetupChange: PB_GameSetupChange) {
    if (gameSetupChange.userAdded) {
      addUser(userIdToUser.get(gameSetupChange.userAdded.userId)!);
    } else if (gameSetupChange.userRemoved) {
      removeUser(userIdToUser.get(gameSetupChange.userRemoved.userId)!);
    } else if (gameSetupChange.userApprovedOfGameSetup) {
      approve(userIdToUser.get(gameSetupChange.userApprovedOfGameSetup.userId)!);

      if (gameSetupChange.userApprovedOfGameSetup.approvedByEverybody) {
        if (gameSetupChange.userApprovedOfGameSetup.finalUserIds.length > 0) {
          finalUsers = gameSetupChange.userApprovedOfGameSetup.finalUserIds.map(
            (userId) => userIdToUser.get(userId)!,
          );
        } else {
          // @ts-expect-error userIds has no nulls
          finalUsers = users;
        }
      }
    } else if (gameSetupChange.gameModeChanged) {
      changeGameMode(gameSetupChange.gameModeChanged.gameMode);
    } else if (gameSetupChange.playerArrangementModeChanged) {
      changePlayerArrangementMode(
        gameSetupChange.playerArrangementModeChanged.playerArrangementMode,
      );
    } else if (gameSetupChange.positionsSwapped) {
      swapPositions(
        gameSetupChange.positionsSwapped.position1,
        gameSetupChange.positionsSwapped.position2,
      );
    } else if (gameSetupChange.userKicked) {
      removeUser(userIdToUser.get(gameSetupChange.userKicked.userId)!);
    }
  }

  function addUser(user: User) {
    users = [...users];
    users[users.indexOf(null)] = user;
    approvals = defaultApprovals[gameModeToNumPlayers.get(gameMode)!];
  }

  function removeUser(user: User) {
    users = [...users];
    users[users.indexOf(user)] = null;
    approvals = defaultApprovals[gameModeToNumPlayers.get(gameMode)!];
  }

  function approve(user: User) {
    approvals = [...approvals];
    approvals[users.indexOf(user)] = true;
  }

  function changeGameMode(newGameMode: PB_GameMode) {
    const newNumPlayers = gameModeToNumPlayers.get(newGameMode)!;
    const oldNumPlayers = gameModeToNumPlayers.get(gameMode)!;

    if (newNumPlayers !== oldNumPlayers) {
      users = [...users];

      if (newNumPlayers > oldNumPlayers) {
        const numSpotsToAdd = newNumPlayers - oldNumPlayers;
        for (let i = 0; i < numSpotsToAdd; i++) {
          users.push(null);
        }
      } else {
        for (let oldPosition = oldNumPlayers - 1; oldPosition >= newNumPlayers; oldPosition--) {
          if (users[oldPosition] !== null) {
            for (let newPosition = newNumPlayers - 1; newPosition >= 0; newPosition--) {
              if (users[newPosition] === null) {
                users[newPosition] = users[oldPosition];
                break;
              }
            }
          }

          users.pop();
        }
      }
    }

    approvals = defaultApprovals[gameModeToNumPlayers.get(newGameMode)!];

    const isTeamGame = gameModeToTeamSize.get(newGameMode)! > 1;
    if (!isTeamGame && playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS) {
      playerArrangementMode = PB_PlayerArrangementMode.RANDOM_ORDER;
    }

    gameMode = newGameMode;
  }

  function changePlayerArrangementMode(newPlayerArrangementMode: PB_PlayerArrangementMode) {
    playerArrangementMode = newPlayerArrangementMode;
    approvals = defaultApprovals[gameModeToNumPlayers.get(gameMode)!];
  }

  function swapPositions(position1: number, position2: number) {
    const newUserIds = [...users];
    newUserIds[position1] = users[position2];
    newUserIds[position2] = users[position1];
    users = newUserIds;

    approvals = defaultApprovals[gameModeToNumPlayers.get(gameMode)!];
  }

  return {
    processChange,
    get gameMode() {
      return gameMode;
    },
    get playerArrangementMode() {
      return playerArrangementMode;
    },
    get hostUser() {
      return hostUser;
    },
    get users() {
      return users;
    },
    get approvals() {
      return approvals;
    },
    get finalUsers() {
      return finalUsers;
    },
  };
}
