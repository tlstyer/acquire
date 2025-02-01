import { GameSetup } from './gameSetup';
import { PB_GameSetup, PB_GameSetup_Position } from './pb';

export function gameSetupToProtocolBuffer(gameSetup: GameSetup): PB_GameSetup {
  const positions: PB_GameSetup_Position[] = new Array(gameSetup.userIds.length);
  gameSetup.userIds.forEach((userId, i) => {
    positions[i] = PB_GameSetup_Position.create({
      userId: userId !== null ? userId : undefined,
      isHost: userId === gameSetup.hostUserId,
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
  getUsernameForUserId: (userId: number) => string,
) {
  const positions = gameSetupData.positions;

  const usernames: (string | null)[] = new Array(positions.length);
  const userIdsArray: (number | null)[] = new Array(positions.length);
  const userIdsSet = new Set<number>();
  let hostUserId = 0;
  const approvals: boolean[] = new Array(positions.length);

  for (let index = 0; index < positions.length; index++) {
    const position = positions[index];
    const userId = position.userId;

    if (userId !== 0) {
      usernames[index] = getUsernameForUserId(userId);
      userIdsArray[index] = userId;
      userIdsSet.add(userId);
      if (position.isHost) {
        hostUserId = userId;
      }
      approvals[index] = position.approvesOfGameSetup;
    } else {
      usernames[index] = null;
      userIdsArray[index] = null;
      approvals[index] = false;
    }
  }

  const gameSetup = new GameSetup(
    gameSetupData.gameMode,
    gameSetupData.playerArrangementMode,
    hostUserId,
    getUsernameForUserId,
  );
  gameSetup.usernames = usernames;
  gameSetup.userIds = userIdsArray;
  gameSetup.userIdsSet = userIdsSet;
  gameSetup.approvals = approvals;

  return gameSetup;
}
