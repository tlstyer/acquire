import {
  defaultApprovals,
  gameModeToNumPlayers,
  gameModeToTeamSize,
  shuffleArray,
} from './helpers';
import { PB_GameMode, PB_GameSetupChange, PB_PlayerArrangementMode } from './pb';
import { type User } from './user';

export class GameSetup {
  users: (User | null)[];
  usersSet: Set<User>;
  approvals: boolean[];
  finalUsers: User[] | null = null;
  history: PB_GameSetupChange[] = [];

  constructor(
    public gameMode: PB_GameMode,
    public playerArrangementMode: PB_PlayerArrangementMode,
    public hostUser: User,
    public userIdToUser: Map<number, User>,
    initialUsers?: (User | null)[],
  ) {
    const numPlayers = gameModeToNumPlayers.get(gameMode)!;

    if (initialUsers !== undefined) {
      this.users = initialUsers;

      this.usersSet = new Set(initialUsers.filter((user) => user !== null));
    } else {
      this.users = new Array(numPlayers);
      this.users.fill(null);
      this.users[0] = hostUser;

      this.usersSet = new Set([hostUser]);
    }

    this.approvals = defaultApprovals[numPlayers];
  }

  addUser(user: User) {
    if (this.usersSet.size === this.users.length) {
      return;
    }

    if (this.usersSet.has(user)) {
      return;
    }

    for (let position = 0; position < this.users.length; position++) {
      if (this.users[position] === null) {
        this.users = [...this.users];
        this.users[position] = user;

        this.usersSet.add(user);
        this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
        this.finalUsers = null;
        this.history.push(
          PB_GameSetupChange.create({
            userAdded: {
              userId: user.id,
            },
          }),
        );
        break;
      }
    }
  }

  removeUser(user: User) {
    if (!this.usersSet.has(user)) {
      return;
    }

    if (user === this.hostUser) {
      return;
    }

    for (let position = 0; position < this.users.length; position++) {
      if (this.users[position] === user) {
        this.users = [...this.users];
        this.users[position] = null;

        this.usersSet.delete(user);
        this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
        this.finalUsers = null;
        this.history.push(
          PB_GameSetupChange.create({
            userRemoved: {
              userId: user.id,
            },
          }),
        );
        break;
      }
    }
  }

  approve(user: User) {
    if (!this.usersSet.has(user)) {
      return;
    }

    if (this.usersSet.size !== this.users.length) {
      return;
    }

    for (let position = 0; position < this.users.length; position++) {
      if (this.users[position] === user) {
        if (this.approvals[position] === false) {
          this.approvals = [...this.approvals];
          this.approvals[position] = true;

          const gameSetupChange = PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: user.id,
            },
          });

          const approvedByEverybody = this.approvals.indexOf(false) === -1;
          if (approvedByEverybody) {
            this.finalUsers = this.getFinalUsers();

            gameSetupChange.userApprovedOfGameSetup!.approvedByEverybody = true;

            if (this.finalUsers !== this.users) {
              gameSetupChange.userApprovedOfGameSetup!.finalUserIds = this.finalUsers.map(
                (user) => user.id,
              );
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
    if (this.usersSet.size > newNumPlayers) {
      return;
    }

    const oldNumPlayers = gameModeToNumPlayers.get(this.gameMode)!;

    if (newNumPlayers !== oldNumPlayers) {
      const users = [...this.users];

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

      this.users = users;
    }

    this.approvals = defaultApprovals[newNumPlayers];
    this.finalUsers = null;

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
    this.finalUsers = null;
    this.history.push(
      PB_GameSetupChange.create({
        playerArrangementModeChanged: {
          playerArrangementMode,
        },
      }),
    );
  }

  swapPositions(position1: number, position2: number) {
    if (position1 < 0 || position1 >= this.users.length) {
      return;
    }

    if (position2 < 0 || position2 >= this.users.length) {
      return;
    }

    if (this.users[position1] === this.users[position2]) {
      return;
    }

    const users = [...this.users];
    users[position1] = this.users[position2];
    users[position2] = this.users[position1];
    this.users = users;

    this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
    this.finalUsers = null;

    this.history.push(
      PB_GameSetupChange.create({
        positionsSwapped: {
          position1,
          position2,
        },
      }),
    );
  }

  kickUser(user: User) {
    if (!this.usersSet.has(user)) {
      return;
    }

    if (user === this.hostUser) {
      return;
    }

    for (let position = 0; position < this.users.length; position++) {
      if (this.users[position] === user) {
        this.users = [...this.users];
        this.users[position] = null;

        this.usersSet.delete(user);
        this.approvals = defaultApprovals[gameModeToNumPlayers.get(this.gameMode)!];
        this.finalUsers = null;
        this.history.push(
          PB_GameSetupChange.create({
            userKicked: {
              userId: user.id,
            },
          }),
        );
        break;
      }
    }
  }

  processChange(gameSetupChange: PB_GameSetupChange) {
    if (gameSetupChange.userAdded) {
      this.addUser(this.userIdToUser.get(gameSetupChange.userAdded.userId)!);
    } else if (gameSetupChange.userRemoved) {
      this.removeUser(this.userIdToUser.get(gameSetupChange.userRemoved.userId)!);
    } else if (gameSetupChange.userApprovedOfGameSetup) {
      this.approve(this.userIdToUser.get(gameSetupChange.userApprovedOfGameSetup.userId)!);

      if (gameSetupChange.userApprovedOfGameSetup.approvedByEverybody) {
        if (gameSetupChange.userApprovedOfGameSetup.finalUserIds.length > 0) {
          this.finalUsers = gameSetupChange.userApprovedOfGameSetup.finalUserIds.map(
            (userId) => this.userIdToUser.get(userId)!,
          );
        } else {
          // @ts-expect-error this.users has no nulls
          this.finalUsers = this.users;
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
      this.kickUser(this.userIdToUser.get(gameSetupChange.userKicked.userId)!);
    }
  }

  clearHistory() {
    this.history.length = 0;
  }

  private getFinalUsers(): User[] {
    // @ts-expect-error this.users has no nulls
    const users: User[] = [...this.users];

    if (this.playerArrangementMode === PB_PlayerArrangementMode.RANDOM_ORDER) {
      shuffleArray(users);
    } else if (this.playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS) {
      let teams: User[][];
      if (this.gameMode === PB_GameMode.TEAMS_2_VS_2) {
        teams = [
          [users[0], users[2]],
          [users[1], users[3]],
        ];
      } else if (this.gameMode === PB_GameMode.TEAMS_2_VS_2_VS_2) {
        teams = [
          [users[0], users[3]],
          [users[1], users[4]],
          [users[2], users[5]],
        ];
      } else {
        teams = [
          [users[0], users[2], users[4]],
          [users[1], users[3], users[5]],
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
          users[nextPlayerId++] = teams[teamIndex][playerIndexInTeam];
        }
      }
    }

    let userIdsOrderIsTheSame = true;
    for (let playerId = 0; playerId < users.length; playerId++) {
      if (users[playerId] !== this.users[playerId]) {
        userIdsOrderIsTheSame = false;
        break;
      }
    }

    if (userIdsOrderIsTheSame) {
      // @ts-expect-error this.users has no nulls
      return this.users;
    } else {
      return users;
    }
  }
}
