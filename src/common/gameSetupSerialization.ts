import { GameSetup } from './gameSetup';
import { PB_GameSetup, PB_GameSetup_Position } from './pb';

export function gameSetupToProtocolBuffer(gameSetup: GameSetup): PB_GameSetup {
  const positions: PB_GameSetup_Position[] = new Array(gameSetup.userIDs.length);
  gameSetup.userIDs.forEach((userID, i) => {
    positions[i] = PB_GameSetup_Position.create({
      userId: userID !== null ? userID : undefined,
      isHost: userID === gameSetup.hostUserID,
      approvesOfGameSetup: gameSetup.approvals[i],
    });
  });

  return PB_GameSetup.create({
    gameMode: gameSetup.gameMode,
    playerArrangementMode: gameSetup.playerArrangementMode,
    positions,
  });
}

export function gameSetupFromProtocolBuffer(
  gameSetupData: PB_GameSetup,
  getUsernameForUserID: (userID: number) => string,
) {
  const positions = gameSetupData.positions;

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
    gameSetupData.gameMode,
    gameSetupData.playerArrangementMode,
    hostUserID,
    getUsernameForUserID,
  );
  gameSetup.usernames = usernames;
  gameSetup.userIDs = userIDsArray;
  gameSetup.userIDsSet = userIDsSet;
  gameSetup.approvals = approvals;

  return gameSetup;
}
