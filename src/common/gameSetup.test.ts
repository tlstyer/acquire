import { List } from 'immutable';
import * as seedrandom from 'seedrandom';
import { GameMode, GameSetupChange, PlayerArrangementMode } from './enums';
import { GameSetup } from './gameSetup';

const dummyApprovals = List([true]);

const userIDToUsername = new Map([[1, 'user 1'], [2, 'user 2'], [3, 'user 3'], [4, 'user 4'], [5, 'user 5'], [6, 'user 6'], [7, 'user 7']]);

function getUsernameForUserID(userID: number) {
  return userIDToUsername.get(userID)!;
}

function expectEqualGameSetups(gameSetup1: GameSetup, gameSetup2: GameSetup) {
  gameSetup1.changeFunctions.clear();
  gameSetup2.changeFunctions.clear();
  expect(gameSetup2).toEqual(gameSetup1);
  expect(gameSetup2.toJSON()).toEqual(gameSetup1.toJSON());
}

test('can construct', () => {
  const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

  expect(gameSetup.gameMode).toBe(GameMode.Singles4);
  expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
  expect(gameSetup.hostUserID).toBe(1);
  expect(gameSetup.getUsernameForUserID).toBe(getUsernameForUserID);
  expect(gameSetup.hostUsername).toBe('user 1');
  expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, null, null]);
  expect(gameSetup.userIDs.toJS()).toEqual([1, null, null, null]);
  expect(gameSetup.userIDsSet).toEqual(new Set([1]));
  expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
  expect(gameSetup.approvedByEverybody).toBe(false);
  expect(gameSetup.history).toEqual([]);
});

describe('addUser', () => {
  test('can add users until full', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.clearHistory();

    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.addUser(5);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 3', 'user 4']);
    expect(gameSetup.userIDs.toJS()).toEqual([1, 3, 4]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1, 3, 4]));
    expect(gameSetup.history).toEqual([[GameSetupChange.UserAdded, 3], [GameSetupChange.UserAdded, 4]]);
  });

  test('duplicate users are rejected', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

    gameSetup.addUser(6);
    gameSetup.addUser(6);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 6', null]);
    expect(gameSetup.userIDs.toJS()).toEqual([1, 6, null]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1, 6]));
    expect(gameSetup.history).toEqual([[GameSetupChange.UserAdded, 6]]);
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.approvals = dummyApprovals;
    gameSetup.approvedByEverybody = true;

    gameSetup.addUser(3);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
  });
});

describe('removeUser', () => {
  test('can remove users', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(7);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    gameSetup.removeUser(7);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, 'user 2']);
    expect(gameSetup.userIDs.toJS()).toEqual([1, null, 2]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1, 2]));
    expect(gameSetup.history).toEqual([[GameSetupChange.UserRemoved, 7]]);

    gameSetup.removeUser(2);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, null]);
    expect(gameSetup.userIDs.toJS()).toEqual([1, null, null]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1]));
    expect(gameSetup.history).toEqual([[GameSetupChange.UserRemoved, 7], [GameSetupChange.UserRemoved, 2]]);
  });

  test('cannot remove host', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    gameSetup.removeUser(1);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null]);
    expect(gameSetup.userIDs.toJS()).toEqual([1, 2, null]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1, 2]));
    expect(gameSetup.history).toEqual([]);
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(7);
    gameSetup.clearHistory();
    gameSetup.approvals = dummyApprovals;
    gameSetup.approvedByEverybody = true;

    gameSetup.removeUser(7);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
  });
});

describe('approve', () => {
  test('cannot approve if not in game', () => {
    const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.approvals.toJS()).toEqual([false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);

    gameSetup.approve(3);

    expect(gameSetup.approvals.toJS()).toEqual([false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot approve if game is not full', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);

    gameSetup.approve(2);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot approve if already approved', () => {
    const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.approve(2);
    gameSetup.clearHistory();

    expect(gameSetup.approvals.toJS()).toEqual([false, true]);
    expect(gameSetup.approvedByEverybody).toBe(false);

    gameSetup.approve(2);

    expect(gameSetup.approvals.toJS()).toEqual([false, true]);
    expect(gameSetup.approvedByEverybody).toBe(false);
    expect(gameSetup.history).toEqual([]);
  });

  test('can approve', () => {
    const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.approvals.toJS()).toEqual([false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);

    gameSetup.approve(2);

    expect(gameSetup.approvals.toJS()).toEqual([false, true]);
    expect(gameSetup.approvedByEverybody).toBe(false);
    expect(gameSetup.history).toEqual([[GameSetupChange.UserApprovedOfGameSetup, 2]]);
  });

  test('approvedByEverybody set to true when last approval received', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.approve(1);
    gameSetup.approve(3);
    gameSetup.clearHistory();

    expect(gameSetup.approvals.toJS()).toEqual([true, false, true]);
    expect(gameSetup.approvedByEverybody).toBe(false);

    gameSetup.approve(2);

    expect(gameSetup.approvals.toJS()).toEqual([true, true, true]);
    expect(gameSetup.approvedByEverybody).toBe(true);
    expect(gameSetup.history).toEqual([[GameSetupChange.UserApprovedOfGameSetup, 2]]);
  });
});

describe('changeGameMode', () => {
  test('cannot change to a nonexistent mode', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);

    // @ts-ignore
    gameSetup.changeGameMode('invalid mode');
    // @ts-ignore
    gameSetup.changeGameMode(null);
    // @ts-ignore
    gameSetup.changeGameMode({});
    gameSetup.changeGameMode(0);
    gameSetup.changeGameMode(10);

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot change to the same mode', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, null]);

    gameSetup.changeGameMode(GameMode.Teams2vs2);

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, null]);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot change to a mode where fewer players are needed than are currently in the game', () => {
    const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.removeUser(3);
    gameSetup.clearHistory();

    expect(gameSetup.gameMode).toBe(GameMode.Singles4);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, 'user 4']);

    gameSetup.changeGameMode(GameMode.Singles2);

    expect(gameSetup.gameMode).toBe(GameMode.Singles4);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, 'user 4']);
    expect(gameSetup.history).toEqual([]);
  });

  test('can change mode', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, null]);

    gameSetup.changeGameMode(GameMode.Singles4);

    expect(gameSetup.gameMode).toBe(GameMode.Singles4);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, null]);
    expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles4]]);
  });

  test('spots added for added player positions', () => {
    const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.ExactOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.gameMode).toBe(GameMode.Singles2);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2']);

    gameSetup.changeGameMode(GameMode.Singles4);

    expect(gameSetup.gameMode).toBe(GameMode.Singles4);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, null]);
    expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles4]]);
  });

  test('spots removed for removed player positions', () => {
    const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.ExactOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.clearHistory();

    expect(gameSetup.gameMode).toBe(GameMode.Singles4);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', null, null]);

    gameSetup.changeGameMode(GameMode.Singles2);

    expect(gameSetup.gameMode).toBe(GameMode.Singles2);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2']);
    expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles2]]);
  });

  test('spots removed and positions shifted for removed player positions', () => {
    const gameSetup = new GameSetup(GameMode.Teams3vs3, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.addUser(5);
    gameSetup.addUser(6);
    gameSetup.removeUser(2);
    gameSetup.removeUser(4);
    gameSetup.clearHistory();

    expect(gameSetup.gameMode).toBe(GameMode.Teams3vs3);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, 'user 3', null, 'user 5', 'user 6']);

    gameSetup.changeGameMode(GameMode.Teams2vs2);

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 5', 'user 3', 'user 6']);
    expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Teams2vs2]]);
  });

  test('player arrangement mode changed to RandomOrder from SpecifyTeams when switching to a Singles game', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, null, null]);

    gameSetup.changeGameMode(GameMode.Singles4);

    expect(gameSetup.gameMode).toBe(GameMode.Singles4);
    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
    expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, null, null]);
    expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles4]]);
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.approvals = dummyApprovals;
    gameSetup.approvedByEverybody = true;

    gameSetup.changeGameMode(GameMode.Singles4);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
  });
});

describe('changePlayerArrangementMode', () => {
  test('cannot change to a nonexistent mode', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);

    // @ts-ignore
    gameSetup.changePlayerArrangementMode('invalid mode');
    // @ts-ignore
    gameSetup.changePlayerArrangementMode(null);
    // @ts-ignore
    gameSetup.changePlayerArrangementMode({});
    gameSetup.changePlayerArrangementMode(-1);
    gameSetup.changePlayerArrangementMode(PlayerArrangementMode.Version1);
    gameSetup.changePlayerArrangementMode(4);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot change to the same mode', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);

    gameSetup.changePlayerArrangementMode(PlayerArrangementMode.SpecifyTeams);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot change to SpecifyTeams when game is not a teams game', () => {
    const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);

    gameSetup.changePlayerArrangementMode(PlayerArrangementMode.SpecifyTeams);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
    expect(gameSetup.history).toEqual([]);
  });

  test('can change mode', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);

    gameSetup.changePlayerArrangementMode(PlayerArrangementMode.ExactOrder);

    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.ExactOrder);
    expect(gameSetup.history).toEqual([[GameSetupChange.PlayerArrangementModeChanged, PlayerArrangementMode.ExactOrder]]);
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.approvals = dummyApprovals;
    gameSetup.approvedByEverybody = true;

    gameSetup.changePlayerArrangementMode(PlayerArrangementMode.ExactOrder);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
  });
});

describe('swapPositions', () => {
  test('cannot swap invalid positions', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

    // @ts-ignore
    gameSetup.swapPositions('invalid mode', 0);
    // @ts-ignore
    gameSetup.swapPositions(null, 0);
    // @ts-ignore
    gameSetup.swapPositions({}, 0);
    gameSetup.swapPositions(-1, 0);
    gameSetup.swapPositions(4, 0);

    // @ts-ignore
    gameSetup.swapPositions(0, 'invalid mode');
    // @ts-ignore
    gameSetup.swapPositions(0, null);
    // @ts-ignore
    gameSetup.swapPositions(0, {});
    gameSetup.swapPositions(0, -1);
    gameSetup.swapPositions(0, 4);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot swap position with itself', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.ExactOrder, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3']);

    gameSetup.swapPositions(1, 1);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3']);
    expect(gameSetup.history).toEqual([]);
  });

  test('can swap positions', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
    gameSetup.swapPositions(0, 1);
    expect(gameSetup.usernames.toJS()).toEqual(['user 2', 'user 1', 'user 3', 'user 4']);
    expect(gameSetup.history).toEqual([[GameSetupChange.PositionsSwapped, 0, 1]]);
    gameSetup.clearHistory();

    gameSetup.swapPositions(2, 3);
    expect(gameSetup.usernames.toJS()).toEqual(['user 2', 'user 1', 'user 4', 'user 3']);
    expect(gameSetup.history).toEqual([[GameSetupChange.PositionsSwapped, 2, 3]]);
    gameSetup.clearHistory();

    gameSetup.swapPositions(0, 3);
    expect(gameSetup.usernames.toJS()).toEqual(['user 3', 'user 1', 'user 4', 'user 2']);
    expect(gameSetup.history).toEqual([[GameSetupChange.PositionsSwapped, 0, 3]]);
    gameSetup.clearHistory();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.clearHistory();
    gameSetup.approvals = dummyApprovals;
    gameSetup.approvedByEverybody = true;

    gameSetup.swapPositions(0, 1);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
  });
});

describe('kickUser', () => {
  test('cannot kick invalid user', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.addUser(4);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

    // @ts-ignore
    gameSetup.kickUser('invalid user');
    // @ts-ignore
    gameSetup.kickUser(null);
    // @ts-ignore
    gameSetup.kickUser({});
    gameSetup.kickUser(-1);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot kick user that is not in the game', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', null]);

    gameSetup.kickUser(4);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', null]);
    expect(gameSetup.history).toEqual([]);
  });

  test('cannot kick the host', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', null]);

    gameSetup.kickUser(1);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', null]);
    expect(gameSetup.history).toEqual([]);
  });

  test('can kick user', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.clearHistory();

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', null]);
    expect(gameSetup.userIDs.toJS()).toEqual([1, 2, 3, null]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1, 2, 3]));

    gameSetup.kickUser(2);

    expect(gameSetup.usernames.toJS()).toEqual(['user 1', null, 'user 3', null]);
    expect(gameSetup.userIDs.toJS()).toEqual([1, null, 3, null]);
    expect(gameSetup.userIDsSet).toEqual(new Set([1, 3]));
    expect(gameSetup.history).toEqual([[GameSetupChange.UserKicked, 2]]);
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.addUser(2);
    gameSetup.addUser(3);
    gameSetup.clearHistory();
    gameSetup.approvals = dummyApprovals;
    gameSetup.approvedByEverybody = true;

    gameSetup.kickUser(2);

    expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
    expect(gameSetup.approvedByEverybody).toBe(false);
  });
});

describe('processChange', () => {
  test('no changes upon invalid message', () => {
    const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

    // @ts-ignore
    gameSetup.processChange(null);
    expect(gameSetup.history).toEqual([]);

    // @ts-ignore
    gameSetup.processChange({});
    expect(gameSetup.history).toEqual([]);

    gameSetup.processChange([]);
    expect(gameSetup.history).toEqual([]);

    gameSetup.processChange(['not an integer']);
    expect(gameSetup.history).toEqual([]);

    gameSetup.processChange([-1]);
    expect(gameSetup.history).toEqual([]);

    gameSetup.processChange([GameSetupChange.UserAdded]);
    expect(gameSetup.history).toEqual([]);

    gameSetup.processChange([GameSetupChange.UserAdded, 1, 2]);
    expect(gameSetup.history).toEqual([]);
  });

  test('changes are processed', () => {
    const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);

    gameSetup.processChange([GameSetupChange.UserAdded, 2]);
    gameSetup.processChange([GameSetupChange.UserAdded, 3]);
    gameSetup.processChange([GameSetupChange.UserAdded, 4]);
    gameSetup.processChange([GameSetupChange.UserRemoved, 3]);
    gameSetup.processChange([GameSetupChange.GameModeChanged, GameMode.Teams2vs2]);
    gameSetup.processChange([GameSetupChange.PlayerArrangementModeChanged, PlayerArrangementMode.ExactOrder]);
    gameSetup.processChange([GameSetupChange.PositionsSwapped, 0, 3]);
    gameSetup.processChange([GameSetupChange.UserKicked, 2]);
    gameSetup.processChange([GameSetupChange.UserAdded, 5]);
    gameSetup.processChange([GameSetupChange.UserAdded, 6]);
    gameSetup.processChange([GameSetupChange.UserApprovedOfGameSetup, 1]);
    gameSetup.processChange([GameSetupChange.UserApprovedOfGameSetup, 4]);
    gameSetup.processChange([GameSetupChange.UserApprovedOfGameSetup, 5]);
    gameSetup.processChange([GameSetupChange.UserApprovedOfGameSetup, 6]);

    expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
    expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.ExactOrder);
    expect(gameSetup.hostUserID).toBe(1);
    expect(gameSetup.getUsernameForUserID).toBe(getUsernameForUserID);
    expect(gameSetup.hostUsername).toBe('user 1');
    expect(gameSetup.usernames.toJS()).toEqual(['user 4', 'user 5', 'user 6', 'user 1']);
    expect(gameSetup.userIDs.toJS()).toEqual([4, 5, 6, 1]);
    expect(gameSetup.userIDsSet).toEqual(new Set([4, 5, 6, 1]));
    expect(gameSetup.approvals.toJS()).toEqual([true, true, true, true]);
    expect(gameSetup.approvedByEverybody).toBe(true);
  });
});

describe('getFinalUserIDsAndUsernames', () => {
  describe('player arrangement mode is RandomOrder', () => {
    test('returns user IDs and usernames in a random order', () => {
      const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, getUsernameForUserID);
      gameSetup.addUser(2);
      gameSetup.addUser(3);
      gameSetup.addUser(4);
      gameSetup.clearHistory();

      expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

      Math.random = seedrandom('random');

      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      expect(userIDs.toJS()).toEqual([3, 1, 4, 2]);
      expect(usernames.toJS()).toEqual(['user 3', 'user 1', 'user 4', 'user 2']);
    });
  });

  describe('player arrangement mode is ExactOrder', () => {
    test('returns user IDs and usernames in the order specified', () => {
      const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.ExactOrder, 1, getUsernameForUserID);
      gameSetup.addUser(2);
      gameSetup.addUser(3);
      gameSetup.addUser(4);
      gameSetup.clearHistory();

      expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      expect(userIDs.toJS()).toEqual([1, 2, 3, 4]);
      expect(usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
    });
  });

  describe('player arrangement mode is SpecifyTeams', () => {
    test('teams and players within teams are randomized when gameMode is Teams2vs2', () => {
      const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
      gameSetup.addUser(2);
      gameSetup.addUser(3);
      gameSetup.addUser(4);
      gameSetup.clearHistory();

      expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

      Math.random = seedrandom('random');

      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      expect(userIDs.toJS()).toEqual([2, 3, 4, 1]);
      expect(usernames.toJS()).toEqual(['user 2', 'user 3', 'user 4', 'user 1']);
    });

    test('teams and players within teams are randomized when gameMode is Teams2vs2vs2', () => {
      const gameSetup = new GameSetup(GameMode.Teams2vs2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
      gameSetup.addUser(2);
      gameSetup.addUser(3);
      gameSetup.addUser(4);
      gameSetup.addUser(5);
      gameSetup.addUser(6);
      gameSetup.clearHistory();

      expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6']);

      Math.random = seedrandom('random');

      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      expect(userIDs.toJS()).toEqual([4, 3, 2, 1, 6, 5]);
      expect(usernames.toJS()).toEqual(['user 4', 'user 3', 'user 2', 'user 1', 'user 6', 'user 5']);
    });

    test('teams and players within teams are randomized when gameMode is Teams3vs3', () => {
      const gameSetup = new GameSetup(GameMode.Teams3vs3, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
      gameSetup.addUser(2);
      gameSetup.addUser(3);
      gameSetup.addUser(4);
      gameSetup.addUser(5);
      gameSetup.addUser(6);
      gameSetup.clearHistory();

      expect(gameSetup.usernames.toJS()).toEqual(['user 1', 'user 2', 'user 3', 'user 4', 'user 5', 'user 6']);

      Math.random = seedrandom('random!!!!');

      const [userIDs, usernames] = gameSetup.getFinalUserIDsAndUsernames();

      expect(userIDs.toJS()).toEqual([5, 4, 1, 6, 3, 2]);
      expect(usernames.toJS()).toEqual(['user 5', 'user 4', 'user 1', 'user 6', 'user 3', 'user 2']);
    });
  });
});

describe('toJSON and fromJSON', () => {
  test('just the host', () => {
    const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, getUsernameForUserID);
    gameSetup.swapPositions(0, 2);
    gameSetup.clearHistory();

    const gameSetup2 = GameSetup.fromJSON(gameSetup.toJSON(), getUsernameForUserID);
    gameSetup2.clearHistory();

    expectEqualGameSetups(gameSetup, gameSetup2);
  });

  test('approved by some users', () => {
    const gameSetup = new GameSetup(GameMode.Teams3vs3, PlayerArrangementMode.ExactOrder, 3, getUsernameForUserID);
    gameSetup.addUser(6);
    gameSetup.addUser(1);
    gameSetup.addUser(5);
    gameSetup.addUser(4);
    gameSetup.addUser(2);
    gameSetup.swapPositions(0, 4);
    gameSetup.approve(2);
    gameSetup.approve(5);
    gameSetup.approve(6);
    gameSetup.clearHistory();
    expect(gameSetup.approvedByEverybody).toBe(false);

    const gameSetup2 = GameSetup.fromJSON(gameSetup.toJSON(), getUsernameForUserID);
    gameSetup2.clearHistory();

    expectEqualGameSetups(gameSetup, gameSetup2);
  });

  test('approved by everybody', () => {
    const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 2, getUsernameForUserID);
    gameSetup.addUser(3);
    gameSetup.addUser(1);
    gameSetup.swapPositions(0, 1);
    gameSetup.swapPositions(1, 2);
    gameSetup.approve(3);
    gameSetup.approve(2);
    gameSetup.approve(1);
    gameSetup.clearHistory();
    expect(gameSetup.approvedByEverybody).toBe(true);

    const gameSetup2 = GameSetup.fromJSON(gameSetup.toJSON(), getUsernameForUserID);
    gameSetup2.clearHistory();

    expectEqualGameSetups(gameSetup, gameSetup2);
  });
});
