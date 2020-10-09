import { List } from 'immutable';
import { gameModeToNumPlayers, gameModeToTeamSize, shuffleArray } from './helpers';
import { GameMode, PB_GameSetupChange, PB_GameSetupData, PB_GameSetupData_Position, PlayerArrangementMode } from './pb';

const defaultApprovals = new Map([
  [1, List([false])],
  [2, List([false, false])],
  [3, List([false, false, false])],
  [4, List([false, false, false, false])],
  [5, List([false, false, false, false, false])],
  [6, List([false, false, false, false, false, false])],
]);

export class GameSetup {
  hostUsername: string;
  usernames: List<string | null>;
  userIDs: List<number | null>;
  userIDsSet: Set<number>;
  approvals: List<boolean>;
  approvedByEverybody: boolean;
  history: PB_GameSetupChange[] = [];

  constructor(
    public gameMode: GameMode,
    public playerArrangementMode: PlayerArrangementMode,
    public hostUserID: number,
    public getUsernameForUserID: (userID: number) => string,
  ) {
    const numPlayers = gameModeToNumPlayers.get(gameMode)!;
    this.hostUsername = getUsernameForUserID(hostUserID);

    const usernames: (string | null)[] = new Array(numPlayers);
    for (let position = 0; position < numPlayers; position++) {
      usernames[position] = null;
    }
    usernames[0] = this.hostUsername;
    this.usernames = List(usernames);

    const userIDs: (number | null)[] = new Array(numPlayers);
    for (let position = 0; position < numPlayers; position++) {
      userIDs[position] = null;
    }
    userIDs[0] = hostUserID;
    this.userIDs = List(userIDs);

    this.userIDsSet = new Set([hostUserID]);

    this.approvals = defaultApprovals.get(numPlayers)!;

    this.approvedByEverybody = false;
  }

  addUser(userID: number) {
    if (this.userIDsSet.size === this.userIDs.size) {
      return;
    }

    if (this.userIDsSet.has(userID)) {
      return;
    }

    for (let position = 0; position < this.userIDs.size; position++) {
      if (this.userIDs.get(position) === null) {
        this.usernames = this.usernames.set(position, this.getUsernameForUserID(userID));
        this.userIDs = this.userIDs.set(position, userID);
        this.userIDsSet.add(userID);
        this.approvals = defaultApprovals.get(gameModeToNumPlayers.get(this.gameMode)!)!;
        this.approvedByEverybody = false;
        this.history.push(PB_GameSetupChange.create({ userAdded: { userId: userID } }));
        break;
      }
    }
  }

  removeUser(userID: number) {
    if (!this.userIDsSet.has(userID)) {
      return;
    }

    if (userID === this.hostUserID) {
      return;
    }

    for (let position = 0; position < this.userIDs.size; position++) {
      if (this.userIDs.get(position) === userID) {
        this.usernames = this.usernames.set(position, null);
        this.userIDs = this.userIDs.set(position, null);
        this.userIDsSet.delete(userID);
        this.approvals = defaultApprovals.get(gameModeToNumPlayers.get(this.gameMode)!)!;
        this.approvedByEverybody = false;
        this.history.push(PB_GameSetupChange.create({ userRemoved: { userId: userID } }));
        break;
      }
    }
  }

  approve(userID: number) {
    if (!this.userIDsSet.has(userID)) {
      return;
    }

    if (this.userIDsSet.size !== this.userIDs.size) {
      return;
    }

    for (let position = 0; position < this.userIDs.size; position++) {
      if (this.userIDs.get(position) === userID) {
        if (this.approvals.get(position)! === false) {
          this.approvals = this.approvals.set(position, true);
          this.history.push(PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: userID } }));
        }
        break;
      }
    }

    this.approvedByEverybody = this.approvals.indexOf(false) === -1;
  }

  changeGameMode(gameMode: GameMode) {
    if (gameMode === this.gameMode) {
      return;
    }

    const newNumPlayers = gameModeToNumPlayers.get(gameMode) || 0;
    if (this.userIDsSet.size > newNumPlayers) {
      return;
    }

    const oldNumPlayers = gameModeToNumPlayers.get(this.gameMode)!;

    if (newNumPlayers !== oldNumPlayers) {
      const usernames = this.usernames.toJS();
      const userIDs = this.userIDs.toJS();

      if (newNumPlayers > oldNumPlayers) {
        const numSpotsToAdd = newNumPlayers - oldNumPlayers;
        for (let i = 0; i < numSpotsToAdd; i++) {
          usernames.push(null);
          userIDs.push(null);
        }
      } else {
        for (let oldPosition = oldNumPlayers - 1; oldPosition >= newNumPlayers; oldPosition--) {
          if (usernames[oldPosition] !== null) {
            for (let newPosition = newNumPlayers - 1; newPosition >= 0; newPosition--) {
              if (usernames[newPosition] === null) {
                usernames[newPosition] = usernames[oldPosition];
                userIDs[newPosition] = userIDs[oldPosition];
                break;
              }
            }
          }

          usernames.pop();
          userIDs.pop();
        }
      }

      this.usernames = List(usernames);
      this.userIDs = List(userIDs);
    }

    this.approvals = defaultApprovals.get(newNumPlayers)!;
    this.approvedByEverybody = false;

    const isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
    if (!isTeamGame && this.playerArrangementMode === PlayerArrangementMode.SPECIFY_TEAMS) {
      this.playerArrangementMode = PlayerArrangementMode.RANDOM_ORDER;
    }

    this.gameMode = gameMode;
    this.history.push(PB_GameSetupChange.create({ gameModeChanged: { gameMode } }));
  }

  changePlayerArrangementMode(playerArrangementMode: PlayerArrangementMode) {
    if (
      playerArrangementMode !== PlayerArrangementMode.RANDOM_ORDER &&
      playerArrangementMode !== PlayerArrangementMode.EXACT_ORDER &&
      playerArrangementMode !== PlayerArrangementMode.SPECIFY_TEAMS
    ) {
      return;
    }

    if (playerArrangementMode === this.playerArrangementMode) {
      return;
    }

    const isTeamGame = gameModeToTeamSize.get(this.gameMode)! > 1;
    if (!isTeamGame && playerArrangementMode === PlayerArrangementMode.SPECIFY_TEAMS) {
      return;
    }

    this.playerArrangementMode = playerArrangementMode;
    this.approvals = defaultApprovals.get(gameModeToNumPlayers.get(this.gameMode)!)!;
    this.approvedByEverybody = false;
    this.history.push(PB_GameSetupChange.create({ playerArrangementModeChanged: { playerArrangementMode } }));
  }

  swapPositions(position1: number, position2: number) {
    if (position1 < 0 || position1 >= this.userIDs.size) {
      return;
    }

    if (position2 < 0 || position2 >= this.userIDs.size) {
      return;
    }

    if (position1 === position2) {
      return;
    }

    const usernames = this.usernames.asMutable();
    usernames.set(position1, this.usernames.get(position2, null));
    usernames.set(position2, this.usernames.get(position1, null));
    this.usernames = usernames.asImmutable();

    const userIDs = this.userIDs.asMutable();
    userIDs.set(position1, this.userIDs.get(position2, null));
    userIDs.set(position2, this.userIDs.get(position1, null));
    this.userIDs = userIDs.asImmutable();

    this.approvals = defaultApprovals.get(gameModeToNumPlayers.get(this.gameMode)!)!;
    this.approvedByEverybody = false;

    this.history.push(PB_GameSetupChange.create({ positionsSwapped: { position1, position2 } }));
  }

  kickUser(userID: number) {
    if (!this.userIDsSet.has(userID)) {
      return;
    }

    if (userID === this.hostUserID) {
      return;
    }

    for (let position = 0; position < this.userIDs.size; position++) {
      if (this.userIDs.get(position) === userID) {
        this.usernames = this.usernames.set(position, null);
        this.userIDs = this.userIDs.set(position, null);
        this.userIDsSet.delete(userID);
        this.approvals = defaultApprovals.get(gameModeToNumPlayers.get(this.gameMode)!)!;
        this.approvedByEverybody = false;
        this.history.push(PB_GameSetupChange.create({ userKicked: { userId: userID } }));
        break;
      }
    }
  }

  processChange(gameSetupChange: PB_GameSetupChange) {
    if (gameSetupChange.userAdded) {
      this.addUser(gameSetupChange.userAdded.userId!);
    } else if (gameSetupChange.userRemoved) {
      this.removeUser(gameSetupChange.userRemoved.userId!);
    } else if (gameSetupChange.userApprovedOfGameSetup) {
      this.approve(gameSetupChange.userApprovedOfGameSetup.userId!);
    } else if (gameSetupChange.gameModeChanged) {
      this.changeGameMode(gameSetupChange.gameModeChanged.gameMode!);
    } else if (gameSetupChange.playerArrangementModeChanged) {
      this.changePlayerArrangementMode(gameSetupChange.playerArrangementModeChanged.playerArrangementMode!);
    } else if (gameSetupChange.positionsSwapped) {
      this.swapPositions(gameSetupChange.positionsSwapped.position1!, gameSetupChange.positionsSwapped.position2!);
    } else if (gameSetupChange.userKicked) {
      this.kickUser(gameSetupChange.userKicked.userId!);
    }
  }

  clearHistory() {
    this.history = [];
  }

  getFinalUserIDsAndUsernames(): [List<number>, List<string>] {
    const userIDs: number[] = this.userIDs.toJS();

    if (this.playerArrangementMode === PlayerArrangementMode.RANDOM_ORDER) {
      shuffleArray(userIDs);
    } else if (this.playerArrangementMode === PlayerArrangementMode.SPECIFY_TEAMS) {
      let teams: number[][];
      if (this.gameMode === GameMode.TEAMS_2_VS_2) {
        teams = [
          [userIDs[0], userIDs[2]],
          [userIDs[1], userIDs[3]],
        ];
      } else if (this.gameMode === GameMode.TEAMS_2_VS_2_VS_2) {
        teams = [
          [userIDs[0], userIDs[3]],
          [userIDs[1], userIDs[4]],
          [userIDs[2], userIDs[5]],
        ];
      } else {
        teams = [
          [userIDs[0], userIDs[2], userIDs[4]],
          [userIDs[1], userIDs[3], userIDs[5]],
        ];
      }

      shuffleArray(teams);
      for (let i = 0; i < teams.length; i++) {
        shuffleArray(teams[i]);
      }

      const numPlayersPerTeam = teams[0].length;
      const numTeams = teams.length;
      let nextPlayerID = 0;

      for (let playerIndexInTeam = 0; playerIndexInTeam < numPlayersPerTeam; playerIndexInTeam++) {
        for (let teamIndex = 0; teamIndex < numTeams; teamIndex++) {
          userIDs[nextPlayerID++] = teams[teamIndex][playerIndexInTeam];
        }
      }
    }

    const usernames = userIDs.map((userID) => this.getUsernameForUserID(userID));

    return [List(userIDs), List(usernames)];
  }

  toGameSetupData(): PB_GameSetupData {
    const gameSetupData = PB_GameSetupData.create();
    gameSetupData.gameMode = this.gameMode;
    gameSetupData.playerArrangementMode = this.playerArrangementMode;
    gameSetupData.positions = [];

    this.userIDs.forEach((userID, position) => {
      const positionData = PB_GameSetupData_Position.create();

      if (userID !== null) {
        positionData.userId = userID;
        if (userID === this.hostUserID) {
          positionData.isHost = true;
        }
        if (this.approvals.get(position)) {
          positionData.approvesOfGameSetup = true;
        }
      }

      gameSetupData.positions.push(positionData);
    });

    return gameSetupData;
  }

  static fromGameSetupData(gameSetupData: PB_GameSetupData, getUsernameForUserID: (userID: number) => string) {
    const positions = gameSetupData.positions;

    const usernames: (string | null)[] = new Array(positions.length);
    const userIDsArray: (number | null)[] = new Array(positions.length);
    const userIDsSet = new Set<number>();
    let hostUserID = 0;
    const approvals: boolean[] = new Array(positions.length);
    let approvedByEverybody = true;

    for (let index = 0; index < positions.length; index++) {
      const position = positions[index];
      const userID = position.userId;

      if (userID !== 0) {
        const isHost = position.isHost;
        const approvesOfGameSetup = position.approvesOfGameSetup;

        usernames[index] = getUsernameForUserID(userID);
        userIDsArray[index] = userID;
        userIDsSet.add(userID);
        if (isHost) {
          hostUserID = userID;
        }
        approvals[index] = approvesOfGameSetup ? true : false;
        if (!approvesOfGameSetup) {
          approvedByEverybody = false;
        }
      } else {
        usernames[index] = null;
        userIDsArray[index] = null;
        approvals[index] = false;
        approvedByEverybody = false;
      }
    }

    const gameSetup = new GameSetup(gameSetupData.gameMode, gameSetupData.playerArrangementMode, hostUserID, getUsernameForUserID);
    gameSetup.usernames = List(usernames);
    gameSetup.userIDs = List(userIDsArray);
    gameSetup.userIDsSet = userIDsSet;
    gameSetup.approvals = List(approvals);
    gameSetup.approvedByEverybody = approvedByEverybody;

    return gameSetup;
  }
}
