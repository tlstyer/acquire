import seedrandom from 'seedrandom';
import { describe, expect, test } from 'vitest';
import { GameSetup } from './gameSetup';
import { PB_GameMode, PB_GameSetupChange, PB_PlayerArrangementMode } from './pb';
import { User } from './user';

const dummyApprovals = [true];

const user1 = new User(1, 'user 1');
const user2 = new User(2, 'user 2');
const user3 = new User(3, 'user 3');
const user4 = new User(4, 'user 4');
const user5 = new User(5, 'user 5');
const user6 = new User(6, 'user 6');
const user7 = new User(7, 'user 7');

const userIdToUser = new Map([
  [1, user1],
  [2, user2],
  [3, user3],
  [4, user4],
  [5, user5],
  [6, user6],
  [7, user7],
]);

function expectEqualGameSetups(gameSetup1: GameSetup, gameSetup2: GameSetup) {
  expect(gameSetup2).toEqual(gameSetup1);
}

test('can construct', () => {
  const gameSetup = new GameSetup(
    PB_GameMode.SINGLES_4,
    PB_PlayerArrangementMode.RANDOM_ORDER,
    user1,
    userIdToUser,
  );
  const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

  expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
  expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
  expect(gameSetup.hostUser).toBe(user1);
  expect(gameSetup.users).toEqual([user1, null, null, null]);
  expect(gameSetup.usersSet).toEqual(new Set([user1]));
  expect(gameSetup.approvals).toEqual([false, false, false, false]);
  expect(gameSetup.finalUsers).toBe(null);
  expect(gameSetup.history).toEqual([]);

  gameSetupChangeVerifier.processChangesThenClearHistory();
  gameSetupChangeVerifier.expectEqual();
});

describe('addUser', () => {
  test('can add users until full', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetup.addUser(user5);

    expect(gameSetup.users).toEqual([user1, user3, user4]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user3, user4]));
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ userAdded: { userId: 3 } }),
      PB_GameSetupChange.create({ userAdded: { userId: 4 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('duplicate users are rejected', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user6);
    gameSetup.addUser(user6);

    expect(gameSetup.users).toEqual([user1, user6, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user6]));
    expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userAdded: { userId: 6 } })]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.approvals = dummyApprovals;
    gameSetup.finalUsers = [];

    gameSetup.addUser(user3);

    expect(gameSetup.approvals).toEqual([false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

describe('removeUser', () => {
  test('can remove users', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user7);
    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    gameSetup.removeUser(user7);

    expect(gameSetup.users).toEqual([user1, null, user2]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user2]));
    expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userRemoved: { userId: 7 } })]);

    gameSetup.removeUser(user2);

    expect(gameSetup.users).toEqual([user1, null, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1]));
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ userRemoved: { userId: 7 } }),
      PB_GameSetupChange.create({ userRemoved: { userId: 2 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot remove host', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    gameSetup.removeUser(user1);

    expect(gameSetup.users).toEqual([user1, user2, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user2]));
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user7);
    gameSetup.approvals = dummyApprovals;
    gameSetup.finalUsers = [];

    gameSetup.removeUser(user7);

    expect(gameSetup.approvals).toEqual([false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

describe('approve', () => {
  test('cannot approve if not in game', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.approvals).toEqual([false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user3);

    expect(gameSetup.approvals).toEqual([false, false]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot approve if game is not full', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.approvals).toEqual([false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user2);

    expect(gameSetup.approvals).toEqual([false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot approve if already approved', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.approve(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.approvals).toEqual([false, true]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user2);

    expect(gameSetup.approvals).toEqual([false, true]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('can approve', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.approvals).toEqual([false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user2);

    expect(gameSetup.approvals).toEqual([false, true]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: 2 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  describe('finalUserIds and finalUsernames are set when everybody approves', () => {
    describe('player arrangement mode is RandomOrder', () => {
      test('finalUserIds and finalUsernames are in a random order', () => {
        Math.random = seedrandom('random');

        const gameSetup = new GameSetup(
          PB_GameMode.SINGLES_4,
          PB_PlayerArrangementMode.RANDOM_ORDER,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.addUser(user3);
        gameSetup.addUser(user4);
        gameSetup.approve(user1);
        gameSetup.approve(user2);
        gameSetup.approve(user3);
        gameSetupChangeVerifier.processChangesThenClearHistory();

        gameSetup.approve(user4);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 4,
              approvedByEverybody: true,
              finalUserIds: [3, 1, 4, 2],
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

        expect(gameSetup.finalUsers).toEqual([user3, user1, user4, user2]);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });

      test('finalUserIds is excluded from PB_GameSetupChange when user order is the same', () => {
        Math.random = seedrandom('random!!!');

        const gameSetup = new GameSetup(
          PB_GameMode.SINGLES_2,
          PB_PlayerArrangementMode.RANDOM_ORDER,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.approve(user1);
        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetup.approve(user2);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 2,
              approvedByEverybody: true,
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2]);

        expect(gameSetup.finalUsers).toBe(gameSetup.users);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });
    });

    describe('player arrangement mode is ExactOrder', () => {
      test('finalUserIds and finalUsernames are in the order specified', () => {
        const gameSetup = new GameSetup(
          PB_GameMode.TEAMS_2_VS_2,
          PB_PlayerArrangementMode.EXACT_ORDER,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.addUser(user3);
        gameSetup.addUser(user4);
        gameSetup.approve(user1);
        gameSetup.approve(user3);
        gameSetup.approve(user4);
        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetup.approve(user2);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 2,
              approvedByEverybody: true,
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

        expect(gameSetup.finalUsers).toEqual([user1, user2, user3, user4]);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });
    });

    describe('player arrangement mode is SpecifyTeams', () => {
      test('teams and players within teams are randomized when gameMode is Teams2vs2', () => {
        Math.random = seedrandom('random');

        const gameSetup = new GameSetup(
          PB_GameMode.TEAMS_2_VS_2,
          PB_PlayerArrangementMode.SPECIFY_TEAMS,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.addUser(user3);
        gameSetup.addUser(user4);
        gameSetup.approve(user2);
        gameSetup.approve(user3);
        gameSetup.approve(user4);
        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetup.approve(user1);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 1,
              approvedByEverybody: true,
              finalUserIds: [2, 3, 4, 1],
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

        expect(gameSetup.finalUsers).toEqual([user2, user3, user4, user1]);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });

      test('teams and players within teams are randomized when gameMode is Teams2vs2vs2', () => {
        Math.random = seedrandom('random');

        const gameSetup = new GameSetup(
          PB_GameMode.TEAMS_2_VS_2_VS_2,
          PB_PlayerArrangementMode.SPECIFY_TEAMS,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.addUser(user3);
        gameSetup.addUser(user4);
        gameSetup.addUser(user5);
        gameSetup.addUser(user6);
        gameSetup.approve(user3);
        gameSetup.approve(user6);
        gameSetup.approve(user2);
        gameSetup.approve(user4);
        gameSetup.approve(user1);
        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetup.approve(user5);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 5,
              approvedByEverybody: true,
              finalUserIds: [4, 3, 2, 1, 6, 5],
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2, user3, user4, user5, user6]);

        expect(gameSetup.finalUsers).toEqual([user4, user3, user2, user1, user6, user5]);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });

      test('teams and players within teams are randomized when gameMode is Teams3vs3', () => {
        Math.random = seedrandom('random!!!!');

        const gameSetup = new GameSetup(
          PB_GameMode.TEAMS_3_VS_3,
          PB_PlayerArrangementMode.SPECIFY_TEAMS,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.addUser(user3);
        gameSetup.addUser(user4);
        gameSetup.addUser(user5);
        gameSetup.addUser(user6);
        gameSetup.approve(user4);
        gameSetup.approve(user2);
        gameSetup.approve(user3);
        gameSetup.approve(user6);
        gameSetup.approve(user1);
        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetup.approve(user5);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 5,
              approvedByEverybody: true,
              finalUserIds: [5, 4, 1, 6, 3, 2],
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2, user3, user4, user5, user6]);

        expect(gameSetup.finalUsers).toEqual([user5, user4, user1, user6, user3, user2]);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });

      test('finalUserIds is excluded from PB_GameSetupChange when user order is the same', () => {
        Math.random = seedrandom('random!!!');

        const gameSetup = new GameSetup(
          PB_GameMode.TEAMS_2_VS_2,
          PB_PlayerArrangementMode.SPECIFY_TEAMS,
          user1,
          userIdToUser,
        );
        const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

        gameSetup.addUser(user2);
        gameSetup.addUser(user3);
        gameSetup.addUser(user4);
        gameSetup.approve(user2);
        gameSetup.approve(user3);
        gameSetup.approve(user4);
        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetup.approve(user1);
        expect(gameSetup.history).toEqual([
          PB_GameSetupChange.create({
            userApprovedOfGameSetup: {
              userId: 1,
              approvedByEverybody: true,
            },
          }),
        ]);

        expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

        expect(gameSetup.finalUsers).toBe(gameSetup.users);

        gameSetupChangeVerifier.processChangesThenClearHistory();
        gameSetupChangeVerifier.expectEqual();
      });
    });
  });
});

describe('changeGameMode', () => {
  test('cannot change to a nonexistent mode', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);

    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changeGameMode('invalid mode');
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changeGameMode(null);
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changeGameMode({});
    gameSetup.changeGameMode(0);
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changeGameMode(10);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot change to the same mode', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);

    gameSetup.changeGameMode(PB_GameMode.TEAMS_2_VS_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot change to a mode where fewer players are needed than are currently in the game', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetup.removeUser(user3);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, user4]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, user4]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('can change mode', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('spots added for added player positions', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_2,
      PB_PlayerArrangementMode.EXACT_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_2);
    expect(gameSetup.users).toEqual([user1, user2]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('spots removed for removed player positions', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.EXACT_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_2);
    expect(gameSetup.users).toEqual([user1, user2]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_2 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('spots removed and positions shifted for removed player positions', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_3_VS_3,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetup.addUser(user5);
    gameSetup.addUser(user6);
    gameSetup.removeUser(user2);
    gameSetup.removeUser(user4);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_3_VS_3);
    expect(gameSetup.users).toEqual([user1, null, user3, null, user5, user6]);

    gameSetup.changeGameMode(PB_GameMode.TEAMS_2_VS_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user5, user3, user6]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.TEAMS_2_VS_2 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('player arrangement mode changed to RandomOrder from SpecifyTeams when switching to a Singles game', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);
    expect(gameSetup.users).toEqual([user1, null, null, null]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.users).toEqual([user1, null, null, null]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.approvals = dummyApprovals;
    gameSetup.finalUsers = [];

    gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

    expect(gameSetup.approvals).toEqual([false, false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

describe('changePlayerArrangementMode', () => {
  test('cannot change to a nonexistent mode', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);

    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changePlayerArrangementMode('invalid mode');
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changePlayerArrangementMode(null);
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changePlayerArrangementMode({});
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changePlayerArrangementMode(-1);
    gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.VERSION_1);
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.changePlayerArrangementMode(4);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot change to the same mode', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);

    gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot change to SpecifyTeams when game is not a teams game', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);

    gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('can change mode', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);

    gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER);

    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.EXACT_ORDER);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({
        playerArrangementModeChanged: {
          playerArrangementMode: PB_PlayerArrangementMode.EXACT_ORDER,
        },
      }),
    ]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.approvals = dummyApprovals;
    gameSetup.finalUsers = [];

    gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER);

    expect(gameSetup.approvals).toEqual([false, false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

describe('swapPositions', () => {
  test('cannot swap invalid positions', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

    gameSetup.swapPositions(-1, 0);
    gameSetup.swapPositions(4, 0);

    gameSetup.swapPositions(0, -1);
    gameSetup.swapPositions(0, 4);

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot swap position with itself', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.EXACT_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, null]);

    gameSetup.swapPositions(1, 1);

    expect(gameSetup.users).toEqual([user1, user2, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetup.swapPositions(2, 2);

    expect(gameSetup.users).toEqual([user1, user2, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot swap empty positions', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_3,
      PB_PlayerArrangementMode.EXACT_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    expect(gameSetup.users).toEqual([user1, null, null]);

    gameSetup.swapPositions(1, 2);

    expect(gameSetup.users).toEqual([user1, null, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('can swap positions', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);
    gameSetup.swapPositions(0, 1);
    expect(gameSetup.users).toEqual([user2, user1, user3, user4]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 1 } }),
    ]);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    gameSetup.swapPositions(2, 3);
    expect(gameSetup.users).toEqual([user2, user1, user4, user3]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ positionsSwapped: { position1: 2, position2: 3 } }),
    ]);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    gameSetup.swapPositions(0, 3);
    expect(gameSetup.users).toEqual([user3, user1, user4, user2]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 3 } }),
    ]);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    gameSetupChangeVerifier.expectEqual();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetup.approvals = dummyApprovals;
    gameSetup.finalUsers = [];

    gameSetup.swapPositions(0, 1);

    expect(gameSetup.approvals).toEqual([false, false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

describe('kickUser', () => {
  test('cannot kick invalid user', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.addUser(user4);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.kickUser('invalid user');
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.kickUser(null);
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.kickUser({});
    // @ts-expect-error intentionally invalid parameter for testing
    gameSetup.kickUser(-1);

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot kick user that is not in the game', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);

    gameSetup.kickUser(user4);

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('cannot kick the host', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);

    gameSetup.kickUser(user1);

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('can kick user', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetupChangeVerifier.processChangesThenClearHistory();

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user2, user3]));

    gameSetup.kickUser(user2);

    expect(gameSetup.users).toEqual([user1, null, user3, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user3]));
    expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userKicked: { userId: 2 } })]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('approvals are reset', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.TEAMS_2_VS_2,
      PB_PlayerArrangementMode.SPECIFY_TEAMS,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.addUser(user2);
    gameSetup.addUser(user3);
    gameSetup.approvals = dummyApprovals;
    gameSetup.finalUsers = [];

    gameSetup.kickUser(user2);

    expect(gameSetup.approvals).toEqual([false, false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

describe('processChange', () => {
  test('no changes upon invalid message', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.processChange(PB_GameSetupChange.create());
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });

  test('changes are processed', () => {
    const gameSetup = new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      user1,
      userIdToUser,
    );
    const gameSetupChangeVerifier = new GameSetupChangeVerifier(gameSetup);

    gameSetup.processChange(PB_GameSetupChange.create({ userAdded: { userId: 2 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userAdded: { userId: 3 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userAdded: { userId: 4 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userRemoved: { userId: 3 } }));
    gameSetup.processChange(
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.TEAMS_2_VS_2 } }),
    );
    gameSetup.processChange(
      PB_GameSetupChange.create({
        playerArrangementModeChanged: {
          playerArrangementMode: PB_PlayerArrangementMode.EXACT_ORDER,
        },
      }),
    );
    gameSetup.processChange(
      PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 3 } }),
    );
    gameSetup.processChange(PB_GameSetupChange.create({ userKicked: { userId: 2 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userAdded: { userId: 5 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userAdded: { userId: 6 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: 1 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: 4 } }));
    gameSetup.processChange(PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: 5 } }));
    gameSetup.processChange(
      PB_GameSetupChange.create({
        userApprovedOfGameSetup: { userId: 6, approvedByEverybody: true },
      }),
    );

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.EXACT_ORDER);
    expect(gameSetup.hostUser).toBe(user1);
    expect(gameSetup.users).toEqual([user4, user5, user6, user1]);
    expect(gameSetup.usersSet).toEqual(new Set([user4, user5, user6, user1]));
    expect(gameSetup.approvals).toEqual([true, true, true, true]);
    expect(gameSetup.finalUsers).toBe(gameSetup.users);

    gameSetupChangeVerifier.processChangesThenClearHistory();
    gameSetupChangeVerifier.expectEqual();
  });
});

class GameSetupChangeVerifier {
  private gameSetup: GameSetup;

  constructor(private initialGameSetup: GameSetup) {
    this.gameSetup = new GameSetup(
      initialGameSetup.gameMode,
      initialGameSetup.playerArrangementMode,
      initialGameSetup.hostUser,
      userIdToUser,
    );
  }

  processChangesThenClearHistory() {
    for (const gameSetupChange of this.initialGameSetup.history) {
      this.gameSetup.processChange(gameSetupChange);
    }

    this.initialGameSetup.clearHistory();
    this.gameSetup.clearHistory();
  }

  expectEqual() {
    expectEqualGameSetups(this.gameSetup, this.initialGameSetup);
  }
}
