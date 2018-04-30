import { List, Map } from 'immutable';

import { username } from '../client/common.css';
import { GameMode, GameSetupChange, PlayerArrangementMode } from './enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from './helpers';

export class GameSetup {
    usernames: List<string | null>;
    usernameToUserID: Map<string, number>;
    userIDToUsername: Map<number, string>;
    history: any[] = [];

    constructor(public gameMode: GameMode, public playerArrangementMode: PlayerArrangementMode, public hostUserID: number, public hostUsername: string) {
        const usernames: (string | null)[] = new Array(gameModeToNumPlayers[gameMode]);
        for (let i = 0; i < usernames.length; i++) {
            usernames[i] = null;
        }
        usernames[0] = hostUsername;
        this.usernames = List(usernames);

        this.usernameToUserID = Map([[hostUsername, hostUserID]]);

        this.userIDToUsername = Map([[hostUserID, hostUsername]]);

        this.history.push([GameSetupChange.Created, gameMode, playerArrangementMode, hostUserID]);
    }

    clearHistory() {
        this.history = [];
    }

    addUser(userID: number, username: string) {
        if (this.usernameToUserID.size === this.usernames.size) {
            return;
        }

        if (this.usernameToUserID.has(username)) {
            return;
        }

        for (let i = 0; i < this.usernames.size; i++) {
            if (this.usernames.get(i, null) === null) {
                this.usernames = this.usernames.set(i, username);
                this.usernameToUserID = this.usernameToUserID.set(username, userID);
                this.userIDToUsername = this.userIDToUsername.set(userID, username);
                this.history.push([GameSetupChange.UserAdded, userID]);
                break;
            }
        }
    }

    removeUser(userID: number) {
        if (!this.userIDToUsername.has(userID)) {
            return;
        }

        const username = this.userIDToUsername.get(userID, '');

        if (username === this.hostUsername) {
            return;
        }

        for (let i = 0; i < this.usernames.size; i++) {
            if (this.usernames.get(i, null) === username) {
                this.usernames = this.usernames.set(i, null);
                this.usernameToUserID = this.usernameToUserID.delete(username);
                this.userIDToUsername = this.userIDToUsername.delete(userID);
                this.history.push([GameSetupChange.UserRemoved, userID]);
                break;
            }
        }
    }

    changeGameMode(gameMode: GameMode) {
        if (gameMode === this.gameMode) {
            return;
        }

        const newNumPlayers = gameModeToNumPlayers[gameMode] || 0;
        if (this.usernameToUserID.size > newNumPlayers) {
            return;
        }

        const oldNumPlayers = gameModeToNumPlayers[this.gameMode];

        if (newNumPlayers !== oldNumPlayers) {
            const usernames = this.usernames.toJS();

            if (newNumPlayers > oldNumPlayers) {
                const numSpotsToAdd = newNumPlayers - oldNumPlayers;
                for (let i = 0; i < numSpotsToAdd; i++) {
                    usernames.push(null);
                }
            } else {
                for (let oldIndex = oldNumPlayers - 1; oldIndex >= newNumPlayers; oldIndex--) {
                    if (usernames[oldIndex] !== null) {
                        for (let newIndex = newNumPlayers - 1; newIndex >= 0; newIndex--) {
                            if (usernames[newIndex] === null) {
                                usernames[newIndex] = usernames[oldIndex];
                                break;
                            }
                        }
                    }

                    usernames.pop();
                }
            }

            this.usernames = List(usernames);
        }

        const isTeamGame = gameModeToTeamSize[gameMode] > 1;
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

        const isTeamGame = gameModeToTeamSize[this.gameMode] > 1;
        if (!isTeamGame && playerArrangementMode === PlayerArrangementMode.SpecifyTeams) {
            return;
        }

        this.playerArrangementMode = playerArrangementMode;
        this.history.push([GameSetupChange.PlayerArrangementModeChanged, playerArrangementMode]);
    }

    swapPositions(position1: number, position2: number) {
        if (!Number.isInteger(position1) || position1 < 0 || position1 >= this.usernames.size) {
            return;
        }

        if (!Number.isInteger(position2) || position2 < 0 || position2 >= this.usernames.size) {
            return;
        }

        const usernames = this.usernames.asMutable();
        usernames.set(position1, this.usernames.get(position2, null));
        usernames.set(position2, this.usernames.get(position1, null));
        this.usernames = usernames.asImmutable();

        this.history.push([GameSetupChange.PositionsSwapped, position1, position2]);
    }

    kickUser(position: number) {
        if (!Number.isInteger(position) || position < 0 || position >= this.usernames.size) {
            return;
        }

        const username = this.usernames.get(position, null);
        if (username === null) {
            return;
        }

        if (username === this.hostUsername) {
            return;
        }

        const userID = this.usernameToUserID.get(username, 0);

        this.usernames = this.usernames.set(position, null);
        this.usernameToUserID = this.usernameToUserID.delete(username);
        this.userIDToUsername = this.userIDToUsername.delete(userID);
        this.history.push([GameSetupChange.UserKicked, position]);
    }
}
