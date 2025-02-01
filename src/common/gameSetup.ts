import { gameModeToNumPlayers, gameModeToTeamSize, shuffleArray } from './helpers';
import { PB_GameMode, PB_GameSetupChange, PB_PlayerArrangementMode } from './pb';

const defaultApprovals = [
  [],
  [false],
  [false, false],
  [false, false, false],
  [false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false, false],
];

export class GameSetup {
  hostUsername: string;
  usernames: (string | null)[];
  userIds: (number | null)[];
  userIdsSet: Set<number>;
  approvals: boolean[];
  finalUserIds: number[] | null = null;
  finalUsernames: string[] | null = null;
  history: PB_GameSetupChange[] = [];

  constructor(
    public gameMode: PB_GameMode,
    public playerArrangementMode: PB_PlayerArrangementMode,
    public hostUserId: number,
    public getUsernameForUserId: (userId: number) => string,
    initialUserIds?: (number | null)[],
  ) {
    const numPlayers = gameModeToNumPlayers.get(gameMode)!;
    this.hostUsername = getUsernameForUserId(hostUserId);

    if (initialUserIds !== undefined) {
      this.usernames = initialUserIds.map((userId) =>
        userId !== null ? this.getUsernameForUserId(userId) : null,
      );

      this.userIds = initialUserIds;

      this.userIdsSet = new Set();
      for (const userId of initialUserIds) {
        if (userId !== null) {
          this.userIdsSet.add(userId);
        }
      }
    } else {
      const usernames: (string | null)[] = new Array(numPlayers);
      usernames.fill(null);
      usernames[0] = this.hostUsername;
      this.usernames = usernames;

      const userIds: (number | null)[] = new Array(numPlayers);
      userIds.fill(null);
      userIds[0] = hostUserId;
      this.userIds = userIds;

      this.userIdsSet = new Set([hostUserId]);
    }

    this.approvals = defaultApprovals[numPlayers];
  }

  addUser(userId: number) {
    if (this.userIdsSet.size === this.userIds.length) {
      return;
    }

    if (this.userIdsSet.has(userId)) {
      return;
    }

    for (let position = 0; position < this.userIds.length; position++) {
      if (this.userIds[position] === null) {
        this.usernames = [...this.usernames];
        this.usernames[position] = this.getUsernameForUserId(userId);

        this.userIds = [...this.userIds];
        this.userIds[position] = userId;

        this.userIdsSet.add(userId);
        this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
        this.finalUserIds = null;
        this.finalUsernames = null;
        this.history.push(
          PB_GameSetupChange.create({
            userAdded: {
              userId,
            },
          }),
        );
        break;
      }
    }
  }

  removeUser(userId: number) {
    if (!this.userIdsSet.has(userId)) {
      return;
    }

    if (userId === this.hostUserId) {
      return;
    }

    for (let position = 0; position < this.userIds.length; position++) {
      if (this.userIds[position] === userId) {
        this.usernames = [...this.usernames];
        this.usernames[position] = null;

        this.userIds = [...this.userIds];
        this.userIds[position] = null;

        this.userIdsSet.delete(userId);
        this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
        this.finalUserIds = null;
        this.finalUsernames = null;
        this.history.push(
          PB_GameSetupChange.create({
            userRemoved: {
              userId,
            },
          }),
        );
        break;
      }
    }
  }

  approve(userId: number) {
    if (!this.userIdsSet.has(userId)) {
      return;
    }

    if (this.userIdsSet.size !== this.userIds.length) {
      return;
    }

    for (let position = 0; position < this.userIds.length; position++) {
      if (this.userIds[position] === userId) {
        if (this.approvals[position] === false) {
          this.approvals = [...this.approvals];
          this.approvals[position] = true;

          const gameSetupChange = PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId,
            },
          });

          const approvedByEverybody = this.approvals.indexOf(false) === -1;
          if (approvedByEverybody) {
            const [userIds, usernames] = this.getFinalUserIdsAndUsernames();
            this.finalUserIds = userIds;
            this.finalUsernames = usernames;

            gameSetupChange.userApprovedOfGameSetup!.approvedByEverybody = true;

            if (userIds !== this.userIds) {
              gameSetupChange.userApprovedOfGameSetup!.finalUserIds = userIds;
            }
          }

          this.history.push(gameSetupChange);
        }
        break;
      }
    }
  }

  changeGameMode(gameMode: PB_GameMode) {
    if (gameMode === this.gameMode) {
      return;
    }

    const newNumPlayers = gameModeToNumPlayers.get(gameMode) ?? 0;
    if (this.userIdsSet.size > newNumPlayers) {
      return;
    }

    const oldNumPlayers = gameModeToNumPlayers.get(this.gameMode)!;

    if (newNumPlayers !== oldNumPlayers) {
      const usernames = [...this.usernames];
      const userIds = [...this.userIds];

      if (newNumPlayers > oldNumPlayers) {
        const numSpotsToAdd = newNumPlayers - oldNumPlayers;
        for (let i = 0; i < numSpotsToAdd; i++) {
          usernames.push(null);
          userIds.push(null);
        }
      } else {
        for (let oldPosition = oldNumPlayers - 1; oldPosition >= newNumPlayers; oldPosition--) {
          if (usernames[oldPosition] !== null) {
            for (let newPosition = newNumPlayers - 1; newPosition >= 0; newPosition--) {
              if (usernames[newPosition] === null) {
                usernames[newPosition] = usernames[oldPosition];
                userIds[newPosition] = userIds[oldPosition];
                break;
              }
            }
          }

          usernames.pop();
          userIds.pop();
        }
      }

      this.usernames = usernames;
      this.userIds = userIds;
    }

    this.approvals = defaultApprovals[newNumPlayers];
    this.finalUserIds = null;
    this.finalUsernames = null;

    const isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
    if (!isTeamGame && this.playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS) {
      this.playerArrangementMode = PB_PlayerArrangementMode.RANDOM_ORDER;
    }

    this.gameMode = gameMode;
    this.history.push(
      PB_GameSetupChange.create({
        gameModeChanged: {
          gameMode,
        },
      }),
    );
  }

  changePlayerArrangementMode(playerArrangementMode: PB_PlayerArrangementMode) {
    if (
      playerArrangementMode !== PB_PlayerArrangementMode.RANDOM_ORDER &&
      playerArrangementMode !== PB_PlayerArrangementMode.EXACT_ORDER &&
      playerArrangementMode !== PB_PlayerArrangementMode.SPECIFY_TEAMS
    ) {
      return;
    }

    if (playerArrangementMode === this.playerArrangementMode) {
      return;
    }

    const isTeamGame = gameModeToTeamSize.get(this.gameMode)! > 1;
    if (!isTeamGame && playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS) {
      return;
    }

    this.playerArrangementMode = playerArrangementMode;
    this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
    this.finalUserIds = null;
    this.finalUsernames = null;
    this.history.push(
      PB_GameSetupChange.create({
        playerArrangementModeChanged: {
          playerArrangementMode,
        },
      }),
    );
  }

  swapPositions(position1: number, position2: number) {
    if (position1 < 0 || position1 >= this.userIds.length) {
      return;
    }

    if (position2 < 0 || position2 >= this.userIds.length) {
      return;
    }

    if (this.userIds[position1] === this.userIds[position2]) {
      return;
    }

    const usernames = [...this.usernames];
    usernames[position1] = this.usernames[position2];
    usernames[position2] = this.usernames[position1];
    this.usernames = usernames;

    const userIds = [...this.userIds];
    userIds[position1] = this.userIds[position2];
    userIds[position2] = this.userIds[position1];
    this.userIds = userIds;

    this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
    this.finalUserIds = null;
    this.finalUsernames = null;

    this.history.push(
      PB_GameSetupChange.create({
        positionsSwapped: {
          position1,
          position2,
        },
      }),
    );
  }

  kickUser(userId: number) {
    if (!this.userIdsSet.has(userId)) {
      return;
    }

    if (userId === this.hostUserId) {
      return;
    }

    for (let position = 0; position < this.userIds.length; position++) {
      if (this.userIds[position] === userId) {
        this.usernames = [...this.usernames];
        this.usernames[position] = null;

        this.userIds = [...this.userIds];
        this.userIds[position] = null;

        this.userIdsSet.delete(userId);
        this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
        this.finalUserIds = null;
        this.finalUsernames = null;
        this.history.push(
          PB_GameSetupChange.create({
            userKicked: {
              userId,
            },
          }),
        );
        break;
      }
    }
  }

  processChange(gameSetupChange: PB_GameSetupChange) {
    if (gameSetupChange.userAdded) {
      this.addUser(gameSetupChange.userAdded.userId);
    } else if (gameSetupChange.userRemoved) {
      this.removeUser(gameSetupChange.userRemoved.userId);
    } else if (gameSetupChange.userApprovedOfGameSetup) {
      this.approve(gameSetupChange.userApprovedOfGameSetup.userId);

      if (gameSetupChange.userApprovedOfGameSetup.approvedByEverybody) {
        if (gameSetupChange.userApprovedOfGameSetup.finalUserIds.length > 0) {
          this.finalUserIds = gameSetupChange.userApprovedOfGameSetup.finalUserIds;
          this.finalUsernames = gameSetupChange.userApprovedOfGameSetup.finalUserIds.map((userId) =>
            this.getUsernameForUserId(userId),
          );
        } else {
          // @ts-expect-error this.userIds has no nulls
          this.finalUserIds = this.userIds;
          // @ts-expect-error this.usernames has no nulls
          this.finalUsernames = this.usernames;
        }
      }
    } else if (gameSetupChange.gameModeChanged) {
      this.changeGameMode(gameSetupChange.gameModeChanged.gameMode);
    } else if (gameSetupChange.playerArrangementModeChanged) {
      this.changePlayerArrangementMode(
        gameSetupChange.playerArrangementModeChanged.playerArrangementMode,
      );
    } else if (gameSetupChange.positionsSwapped) {
      this.swapPositions(
        gameSetupChange.positionsSwapped.position1,
        gameSetupChange.positionsSwapped.position2,
      );
    } else if (gameSetupChange.userKicked) {
      this.kickUser(gameSetupChange.userKicked.userId);
    }
  }

  clearHistory() {
    this.history = [];
  }

  private getFinalUserIdsAndUsernames(): [number[], string[]] {
    // @ts-expect-error this.userIds has no nulls
    const userIds: number[] = [...this.userIds];

    if (this.playerArrangementMode === PB_PlayerArrangementMode.RANDOM_ORDER) {
      shuffleArray(userIds);
    } else if (this.playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS) {
      let teams: number[][];
      if (this.gameMode === PB_GameMode.TEAMS_2_VS_2) {
        teams = [
          [userIds[0], userIds[2]],
          [userIds[1], userIds[3]],
        ];
      } else if (this.gameMode === PB_GameMode.TEAMS_2_VS_2_VS_2) {
        teams = [
          [userIds[0], userIds[3]],
          [userIds[1], userIds[4]],
          [userIds[2], userIds[5]],
        ];
      } else {
        teams = [
          [userIds[0], userIds[2], userIds[4]],
          [userIds[1], userIds[3], userIds[5]],
        ];
      }

      shuffleArray(teams);
      for (let i = 0; i < teams.length; i++) {
        shuffleArray(teams[i]);
      }

      const numPlayersPerTeam = teams[0].length;
      const numTeams = teams.length;
      let nextPlayerId = 0;

      for (let playerIndexInTeam = 0; playerIndexInTeam < numPlayersPerTeam; playerIndexInTeam++) {
        for (let teamIndex = 0; teamIndex < numTeams; teamIndex++) {
          userIds[nextPlayerId++] = teams[teamIndex][playerIndexInTeam];
        }
      }
    }

    let userIdsOrderIsTheSame = true;
    for (let playerId = 0; playerId < userIds.length; playerId++) {
      if (userIds[playerId] !== this.userIds[playerId]) {
        userIdsOrderIsTheSame = false;
        break;
      }
    }

    if (userIdsOrderIsTheSame) {
      // @ts-expect-error this.userIds and this.usernames have no nulls
      return [this.userIds, this.usernames];
    } else {
      const usernames = userIds.map((userId) => this.getUsernameForUserId(userId));

      return [userIds, usernames];
    }
  }
}
