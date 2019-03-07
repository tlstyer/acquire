import { List } from 'immutable';
import { GameMode, GameSetupChange, PlayerArrangementMode } from './enums';
import { gameModeToNumPlayers, gameModeToTeamSize, shuffleArray } from './helpers';

const defaultApprovals = new Map([
  [1, List([false])],
  [2, List([false, false])],
  [3, List([false, false, false])],
  [4, List([false, false, false, false])],
  [5, List([false, false, false, false, false])],
  [6, List([false, false, false, false, false, false])],
]);

type GameSetupJSON = [GameMode, PlayerArrangementMode, number, number[], number[]];

export class GameSetup {
  hostUsername: string;
  usernames: List<string | null>;
  userIDs: List<number | null>;
  userIDsSet: Set<number>;
  approvals: List<boolean>;
  approvedByEverybody: boolean;
  history: any[] = [];
  changeFunctions: Map<GameSetupChange, (...params: any[]) => void>;

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

    const cf: [GameSetupChange, (...params: any[]) => void][] = [
      [GameSetupChange.UserAdded, this.addUser],
      [GameSetupChange.UserRemoved, this.removeUser],
      [GameSetupChange.UserApprovedOfGameSetup, this.approve],
      [GameSetupChange.GameModeChanged, this.changeGameMode],
      [GameSetupChange.PlayerArrangementModeChanged, this.changePlayerArrangementMode],
      [GameSetupChange.PositionsSwapped, this.swapPositions],
      [GameSetupChange.UserKicked, this.kickUser],
    ];
    this.changeFunctions = new Map(cf);
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
        this.history.push([GameSetupChange.UserAdded, userID]);
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
        this.history.push([GameSetupChange.UserRemoved, userID]);
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
          this.history.push([GameSetupChange.UserApprovedOfGameSetup, userID]);
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
    if (!isTeamGame && this.playerArrangementMode === PlayerArrangementMode.SpecifyTeams) {
      this.playerArrangementMode = PlayerArrangementMode.RandomOrder;
    }

    this.gameMode = gameMode;
    this.history.push([GameSetupChange.GameModeChanged, gameMode]);
  }

  changePlayerArrangementMode(playerArrangementMode: PlayerArrangementMode) {
    if (
      playerArrangementMode !== PlayerArrangementMode.RandomOrder &&
      playerArrangementMode !== PlayerArrangementMode.ExactOrder &&
      playerArrangementMode !== PlayerArrangementMode.SpecifyTeams
    ) {
      return;
    }

    if (playerArrangementMode === this.playerArrangementMode) {
      return;
    }

    const isTeamGame = gameModeToTeamSize.get(this.gameMode)! > 1;
    if (!isTeamGame && playerArrangementMode === PlayerArrangementMode.SpecifyTeams) {
      return;
    }

    this.playerArrangementMode = playerArrangementMode;
    this.approvals = defaultApprovals.get(gameModeToNumPlayers.get(this.gameMode)!)!;
    this.approvedByEverybody = false;
    this.history.push([GameSetupChange.PlayerArrangementModeChanged, playerArrangementMode]);
  }

  swapPositions(position1: number, position2: number) {
    if (!Number.isInteger(position1) || position1 < 0 || position1 >= this.userIDs.size) {
      return;
    }

    if (!Number.isInteger(position2) || position2 < 0 || position2 >= this.userIDs.size) {
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

    this.history.push([GameSetupChange.PositionsSwapped, position1, position2]);
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
        this.history.push([GameSetupChange.UserKicked, userID]);
        break;
      }
    }
  }

  processChange(message: any[]) {
    if (!Array.isArray(message)) {
      return;
    }

    const changeFunction = this.changeFunctions.get(message[0]);
    if (changeFunction === undefined) {
      return;
    }

    const parameters = message.slice(1);
    if (parameters.length !== changeFunction.length) {
      return;
    }

    changeFunction.apply(this, parameters);
  }

  clearHistory() {
    this.history = [];
  }

  getFinalUserIDsAndUsernames(): [List<number>, List<string>] {
    const userIDs: number[] = this.userIDs.toJS();

    if (this.playerArrangementMode === PlayerArrangementMode.RandomOrder) {
      shuffleArray(userIDs);
    } else if (this.playerArrangementMode === PlayerArrangementMode.SpecifyTeams) {
      let teams: number[][];
      if (this.gameMode === GameMode.Teams2vs2) {
        teams = [[userIDs[0], userIDs[2]], [userIDs[1], userIDs[3]]];
      } else if (this.gameMode === GameMode.Teams2vs2vs2) {
        teams = [[userIDs[0], userIDs[3]], [userIDs[1], userIDs[4]], [userIDs[2], userIDs[5]]];
      } else {
        teams = [[userIDs[0], userIDs[2], userIDs[4]], [userIDs[1], userIDs[3], userIDs[5]]];
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

    const usernames = userIDs.map(userID => this.getUsernameForUserID(userID));

    return [List(userIDs), List(usernames)];
  }

  toJSON(): GameSetupJSON {
    const userIDs: number[] = new Array(this.userIDs.size);
    this.userIDs.forEach((userID, position) => {
      userIDs[position] = userID || 0;
    });

    const approvals: number[] = new Array(this.approvals.size);
    this.approvals.forEach((approved, position) => {
      approvals[position] = approved ? 1 : 0;
    });

    return [this.gameMode, this.playerArrangementMode, this.hostUserID, userIDs, approvals];
  }

  static fromJSON(json: GameSetupJSON, getUsernameForUserID: (userID: number) => string) {
    const [gameMode, playerArrangementMode, hostUserID, userIDs, intApprovals] = json;

    const gameSetup = new GameSetup(gameMode, playerArrangementMode, hostUserID, getUsernameForUserID);

    const usernames: (string | null)[] = new Array(userIDs.length);
    const userIDsArray: (number | null)[] = new Array(userIDs.length);

    for (let position = 0; position < userIDs.length; position++) {
      const userID = userIDs[position];

      if (userID !== 0) {
        usernames[position] = getUsernameForUserID(userID);
        userIDsArray[position] = userID;
        gameSetup.userIDsSet.add(userID);
      } else {
        usernames[position] = null;
        userIDsArray[position] = null;
      }
    }

    gameSetup.usernames = List(usernames);
    gameSetup.userIDs = List(userIDsArray);

    const approvals: boolean[] = new Array(intApprovals.length);
    let approvedByEverybody = true;
    for (let position = 0; position < intApprovals.length; position++) {
      const approved = intApprovals[position] === 1;

      approvals[position] = approved;

      if (!approved) {
        approvedByEverybody = false;
      }
    }

    gameSetup.approvals = List(approvals);
    gameSetup.approvedByEverybody = approvedByEverybody;

    return gameSetup;
  }
}
