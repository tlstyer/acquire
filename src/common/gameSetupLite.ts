import { defaultApprovals, gameModeToNumPlayers, gameModeToTeamSize } from './helpers';
import { PB_PlayerArrangementMode, type PB_GameMode, type PB_GameSetupChange } from './pb';

export type GameSetupLite = ReturnType<typeof createGameSetupLite>;

export function createGameSetupLite(
  gameMode: PB_GameMode,
  playerArrangementMode: PB_PlayerArrangementMode,
  hostUserId: number,
  userIds: (number | null)[],
  approvals: boolean[],
) {
  let finalUserIds: number[] | undefined;

  function processChange(gameSetupChange: PB_GameSetupChange) {
    if (gameSetupChange.userAdded) {
      addUser(gameSetupChange.userAdded.userId);
    } else if (gameSetupChange.userRemoved) {
      removeUser(gameSetupChange.userRemoved.userId);
    } else if (gameSetupChange.userApprovedOfGameSetup) {
      approve(gameSetupChange.userApprovedOfGameSetup.userId);

      if (gameSetupChange.userApprovedOfGameSetup.approvedByEverybody) {
        if (gameSetupChange.userApprovedOfGameSetup.finalUserIds.length > 0) {
          finalUserIds = gameSetupChange.userApprovedOfGameSetup.finalUserIds;
        } else {
          // @ts-expect-error userIds has no nulls
          finalUserIds = userIds;
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
      removeUser(gameSetupChange.userKicked.userId);
    }
  }

  function addUser(userId: number) {
    userIds = [...userIds];
    userIds[userIds.indexOf(null)] = userId;
    approvals = defaultApprovals[gameModeToNumPlayers.get(gameMode)!];
  }

  function removeUser(userId: number) {
    userIds = [...userIds];
    userIds[userIds.indexOf(userId)] = null;
    approvals = defaultApprovals[gameModeToNumPlayers.get(gameMode)!];
  }

  function approve(userId: number) {
    approvals = [...approvals];
    approvals[userIds.indexOf(userId)] = true;
  }

  function changeGameMode(newGameMode: PB_GameMode) {
    const newNumPlayers = gameModeToNumPlayers.get(newGameMode)!;
    const oldNumPlayers = gameModeToNumPlayers.get(gameMode)!;

    if (newNumPlayers !== oldNumPlayers) {
      userIds = [...userIds];

      if (newNumPlayers > oldNumPlayers) {
        const numSpotsToAdd = newNumPlayers - oldNumPlayers;
        for (let i = 0; i < numSpotsToAdd; i++) {
          userIds.push(null);
        }
      } else {
        for (let oldPosition = oldNumPlayers - 1; oldPosition >= newNumPlayers; oldPosition--) {
          if (userIds[oldPosition] !== null) {
            for (let newPosition = newNumPlayers - 1; newPosition >= 0; newPosition--) {
              if (userIds[newPosition] === null) {
                userIds[newPosition] = userIds[oldPosition];
                break;
              }
            }
          }

          userIds.pop();
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
    const newUserIds = [...userIds];
    newUserIds[position1] = userIds[position2];
    newUserIds[position2] = userIds[position1];
    userIds = newUserIds;

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
    get hostUserId() {
      return hostUserId;
    },
    get userIds() {
      return userIds;
    },
    get approvals() {
      return approvals;
    },
    get finalUserIds() {
      return finalUserIds;
    },
  };
}
