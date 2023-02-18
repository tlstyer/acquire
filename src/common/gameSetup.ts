import { gameModeToNumPlayers, gameModeToTeamSize, shuffleArray } from './helpers';
import {
	PB_Game,
	PB_GameMode,
	PB_GameSetupChange,
	PB_GameStatus,
	PB_Game_Position,
	PB_PlayerArrangementMode,
} from './pb';

function defaultApprovals(numPlayers: number) {
	const approvals: boolean[] = new Array(numPlayers);
	approvals.fill(false);
	return approvals;
}

export class GameSetup {
	hostUsername: string;
	usernames: (string | null)[];
	userIDs: (number | null)[];
	userIDsSet: Set<number>;
	approvals: boolean[];
	approvedByEverybody: boolean;
	history: PB_GameSetupChange[] = [];

	constructor(
		public gameMode: PB_GameMode,
		public playerArrangementMode: PB_PlayerArrangementMode,
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
		this.usernames = usernames;

		const userIDs: (number | null)[] = new Array(numPlayers);
		for (let position = 0; position < numPlayers; position++) {
			userIDs[position] = null;
		}
		userIDs[0] = hostUserID;
		this.userIDs = userIDs;

		this.userIDsSet = new Set([hostUserID]);

		this.approvals = defaultApprovals(numPlayers);

		this.approvedByEverybody = false;
	}

	addUser(userID: number) {
		if (this.userIDsSet.size === this.userIDs.length) {
			return;
		}

		if (this.userIDsSet.has(userID)) {
			return;
		}

		for (let position = 0; position < this.userIDs.length; position++) {
			if (this.userIDs[position] === null) {
				this.usernames = [...this.usernames];
				this.usernames[position] = this.getUsernameForUserID(userID);

				this.userIDs = [...this.userIDs];
				this.userIDs[position] = userID;

				this.userIDsSet.add(userID);
				this.approvals = defaultApprovals(gameModeToNumPlayers.get(this.gameMode)!);
				this.approvedByEverybody = false;
				this.history.push(
					PB_GameSetupChange.create({
						userAdded: {
							userId: userID,
						},
					}),
				);
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

		for (let position = 0; position < this.userIDs.length; position++) {
			if (this.userIDs[position] === userID) {
				this.usernames = [...this.usernames];
				this.usernames[position] = null;

				this.userIDs = [...this.userIDs];
				this.userIDs[position] = null;

				this.userIDsSet.delete(userID);
				this.approvals = defaultApprovals(gameModeToNumPlayers.get(this.gameMode)!);
				this.approvedByEverybody = false;
				this.history.push(
					PB_GameSetupChange.create({
						userRemoved: {
							userId: userID,
						},
					}),
				);
				break;
			}
		}
	}

	approve(userID: number) {
		if (!this.userIDsSet.has(userID)) {
			return;
		}

		if (this.userIDsSet.size !== this.userIDs.length) {
			return;
		}

		for (let position = 0; position < this.userIDs.length; position++) {
			if (this.userIDs[position] === userID) {
				if (this.approvals[position] === false) {
					this.approvals = [...this.approvals];
					this.approvals[position] = true;

					this.history.push(
						PB_GameSetupChange.create({
							userApprovedOfGameSetup: {
								userId: userID,
							},
						}),
					);
				}
				break;
			}
		}

		this.approvedByEverybody = this.approvals.indexOf(false) === -1;
	}

	changeGameMode(gameMode: PB_GameMode) {
		if (gameMode === this.gameMode) {
			return;
		}

		const newNumPlayers = gameModeToNumPlayers.get(gameMode) || 0;
		if (this.userIDsSet.size > newNumPlayers) {
			return;
		}

		const oldNumPlayers = gameModeToNumPlayers.get(this.gameMode)!;

		if (newNumPlayers !== oldNumPlayers) {
			const usernames = [...this.usernames];
			const userIDs = [...this.userIDs];

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

			this.usernames = usernames;
			this.userIDs = userIDs;
		}

		this.approvals = defaultApprovals(newNumPlayers);
		this.approvedByEverybody = false;

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
		this.approvals = defaultApprovals(gameModeToNumPlayers.get(this.gameMode)!);
		this.approvedByEverybody = false;
		this.history.push(
			PB_GameSetupChange.create({
				playerArrangementModeChanged: {
					playerArrangementMode,
				},
			}),
		);
	}

	swapPositions(position1: number, position2: number) {
		if (position1 < 0 || position1 >= this.userIDs.length) {
			return;
		}

		if (position2 < 0 || position2 >= this.userIDs.length) {
			return;
		}

		if (position1 === position2) {
			return;
		}

		const usernames = [...this.usernames];
		usernames[position1] = this.usernames[position2];
		usernames[position2] = this.usernames[position1];
		this.usernames = usernames;

		const userIDs = [...this.userIDs];
		userIDs[position1] = this.userIDs[position2];
		userIDs[position2] = this.userIDs[position1];
		this.userIDs = userIDs;

		this.approvals = defaultApprovals(gameModeToNumPlayers.get(this.gameMode)!);
		this.approvedByEverybody = false;

		this.history.push(
			PB_GameSetupChange.create({
				positionsSwapped: {
					position1,
					position2,
				},
			}),
		);
	}

	kickUser(userID: number) {
		if (!this.userIDsSet.has(userID)) {
			return;
		}

		if (userID === this.hostUserID) {
			return;
		}

		for (let position = 0; position < this.userIDs.length; position++) {
			if (this.userIDs[position] === userID) {
				this.usernames = [...this.usernames];
				this.usernames[position] = null;

				this.userIDs = [...this.userIDs];
				this.userIDs[position] = null;

				this.userIDsSet.delete(userID);
				this.approvals = defaultApprovals(gameModeToNumPlayers.get(this.gameMode)!);
				this.approvedByEverybody = false;
				this.history.push(
					PB_GameSetupChange.create({
						userKicked: {
							userId: userID,
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

	getFinalUserIDsAndUsernames(): [number[], string[]] {
		// @ts-expect-error
		const userIDs: number[] = this.userIDs;

		if (this.playerArrangementMode === PB_PlayerArrangementMode.RANDOM_ORDER) {
			shuffleArray(userIDs);
		} else if (this.playerArrangementMode === PB_PlayerArrangementMode.SPECIFY_TEAMS) {
			let teams: number[][];
			if (this.gameMode === PB_GameMode.TEAMS_2_VS_2) {
				teams = [
					[userIDs[0], userIDs[2]],
					[userIDs[1], userIDs[3]],
				];
			} else if (this.gameMode === PB_GameMode.TEAMS_2_VS_2_VS_2) {
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

		return [userIDs, usernames];
	}

	toGameData(): PB_Game {
		const positions: PB_Game_Position[] = new Array(this.userIDs.length);
		this.userIDs.forEach((userID, i) => {
			positions[i] = PB_Game_Position.create({
				userId: userID !== null ? userID : undefined,
				isHost: userID === this.hostUserID,
				approvesOfGameSetup: this.approvals[i],
			});
		});

		return PB_Game.create({
			gameStatus: PB_GameStatus.SETTING_UP,
			gameMode: this.gameMode,
			playerArrangementMode: this.playerArrangementMode,
			positions,
		});
	}

	static fromGameData(gameData: PB_Game, getUsernameForUserID: (userID: number) => string) {
		const positions = gameData.positions;

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

		const gameSetup = new GameSetup(
			gameData.gameMode,
			gameData.playerArrangementMode,
			hostUserID,
			getUsernameForUserID,
		);
		gameSetup.usernames = usernames;
		gameSetup.userIDs = userIDsArray;
		gameSetup.userIDsSet = userIDsSet;
		gameSetup.approvals = approvals;
		gameSetup.approvedByEverybody = approvedByEverybody;

		return gameSetup;
	}
}
