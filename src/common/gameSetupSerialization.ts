import { GameSetup } from './gameSetup';
import { PB_Game, PB_GameStatus, PB_Game_Position } from './pb';

export function gameSetupToProtocolBuffer(gameSetup: GameSetup): PB_Game {
	const positions: PB_Game_Position[] = new Array(gameSetup.userIDs.length);
	gameSetup.userIDs.forEach((userID, i) => {
		positions[i] = PB_Game_Position.create({
			userId: userID !== null ? userID : undefined,
			isHost: userID === gameSetup.hostUserID,
			approvesOfGameSetup: gameSetup.approvals[i],
		});
	});

	return PB_Game.create({
		gameStatus: PB_GameStatus.SETTING_UP,
		gameMode: gameSetup.gameMode,
		playerArrangementMode: gameSetup.playerArrangementMode,
		positions,
	});
}

export function gameSetupFromProtocolBuffer(
	gameData: PB_Game,
	getUsernameForUserID: (userID: number) => string,
) {
	const positions = gameData.positions;

	const usernames: (string | null)[] = new Array(positions.length);
	const userIDsArray: (number | null)[] = new Array(positions.length);
	const userIDsSet = new Set<number>();
	let hostUserID = 0;
	const approvals: boolean[] = new Array(positions.length);

	for (let index = 0; index < positions.length; index++) {
		const position = positions[index];
		const userID = position.userId;

		if (userID !== 0) {
			usernames[index] = getUsernameForUserID(userID);
			userIDsArray[index] = userID;
			userIDsSet.add(userID);
			if (position.isHost) {
				hostUserID = userID;
			}
			approvals[index] = position.approvesOfGameSetup;
		} else {
			usernames[index] = null;
			userIDsArray[index] = null;
			approvals[index] = false;
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

	return gameSetup;
}
