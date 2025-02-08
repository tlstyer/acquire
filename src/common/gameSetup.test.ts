import seedrandom from 'seedrandom';
import { describe, expect, test } from 'vitest';
import { user1, user2, user3, user4, user5, user6, user7 } from './clientAndServerTests/common';
import { GameSetup } from './gameSetup';
import { createGameSetupLite, type GameSetupLite } from './gameSetupLite';
import { PB_GameMode, PB_GameSetupChange, PB_PlayerArrangementMode } from './pb';

const dummyApprovals = [true];

const userIdToUser = new Map([
  [1, user1],
  [2, user2],
  [3, user3],
  [4, user4],
  [5, user5],
  [6, user6],
  [7, user7],
]);

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

  gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    gameSetup.removeUser(user1);

    expect(gameSetup.users).toEqual([user1, user2, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user2]));
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.approvals).toEqual([false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user3);

    expect(gameSetup.approvals).toEqual([false, false]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.approvals).toEqual([false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user2);

    expect(gameSetup.approvals).toEqual([false, false, false]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.approvals).toEqual([false, true]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user2);

    expect(gameSetup.approvals).toEqual([false, true]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.approvals).toEqual([false, false]);
    expect(gameSetup.finalUsers).toBe(null);

    gameSetup.approve(user2);

    expect(gameSetup.approvals).toEqual([false, true]);
    expect(gameSetup.finalUsers).toBe(null);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: 2 } }),
    ]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

        gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);

    gameSetup.changeGameMode(PB_GameMode.TEAMS_2_VS_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, user4]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, user4]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
    ]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_2);
    expect(gameSetup.users).toEqual([user1, user2]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
    ]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
    expect(gameSetup.users).toEqual([user1, user2, null, null]);

    gameSetup.changeGameMode(PB_GameMode.SINGLES_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_2);
    expect(gameSetup.users).toEqual([user1, user2]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_2 } }),
    ]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_3_VS_3);
    expect(gameSetup.users).toEqual([user1, null, user3, null, user5, user6]);

    gameSetup.changeGameMode(PB_GameMode.TEAMS_2_VS_2);

    expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
    expect(gameSetup.users).toEqual([user1, user5, user3, user6]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.TEAMS_2_VS_2 } }),
    ]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);

    gameSetup.swapPositions(-1, 0);
    gameSetup.swapPositions(4, 0);

    gameSetup.swapPositions(0, -1);
    gameSetup.swapPositions(0, 4);

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.users).toEqual([user1, user2, null]);

    gameSetup.swapPositions(1, 1);

    expect(gameSetup.users).toEqual([user1, user2, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetup.swapPositions(2, 2);

    expect(gameSetup.users).toEqual([user1, user2, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.users).toEqual([user1, user2, user3, user4]);
    gameSetup.swapPositions(0, 1);
    expect(gameSetup.users).toEqual([user2, user1, user3, user4]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 1 } }),
    ]);
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    gameSetup.swapPositions(2, 3);
    expect(gameSetup.users).toEqual([user2, user1, user4, user3]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ positionsSwapped: { position1: 2, position2: 3 } }),
    ]);
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    gameSetup.swapPositions(0, 3);
    expect(gameSetup.users).toEqual([user3, user1, user4, user2]);
    expect(gameSetup.history).toEqual([
      PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 3 } }),
    ]);
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);

    gameSetup.kickUser(user4);

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);

    gameSetup.kickUser(user1);

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);
    expect(gameSetup.history).toEqual([]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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
    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();

    expect(gameSetup.users).toEqual([user1, user2, user3, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user2, user3]));

    gameSetup.kickUser(user2);

    expect(gameSetup.users).toEqual([user1, null, user3, null]);
    expect(gameSetup.usersSet).toEqual(new Set([user1, user3]));
    expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userKicked: { userId: 2 } })]);

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
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

    gameSetupChangeVerifier.processChangesAndExpectEqualAndClearHistories();
  });
});

class GameSetupChangeVerifier {
  private gameSetup: GameSetup;
  private gameSetupLite: GameSetupLite;

  constructor(private initialGameSetup: GameSetup) {
    this.gameSetup = new GameSetup(
      initialGameSetup.gameMode,
      initialGameSetup.playerArrangementMode,
      initialGameSetup.hostUser,
      userIdToUser,
    );

    this.gameSetupLite = createGameSetupLite(
      initialGameSetup.gameMode,
      initialGameSetup.playerArrangementMode,
      initialGameSetup.hostUser,
      initialGameSetup.users,
      initialGameSetup.approvals,
      userIdToUser,
    );
  }

  processChangesAndExpectEqualAndClearHistories() {
    for (const gameSetupChange of this.initialGameSetup.history) {
      this.gameSetup.processChange(gameSetupChange);
      this.gameSetupLite.processChange(gameSetupChange);

      expectGameSetupLiteToEqualGameSetup(this.gameSetupLite, this.gameSetup);
    }

    expect(this.gameSetup).toEqual(this.initialGameSetup);
    expectGameSetupLiteToEqualGameSetup(this.gameSetupLite, this.initialGameSetup);

    this.initialGameSetup.clearHistory();
    this.gameSetup.clearHistory();
  }
}

function expectGameSetupLiteToEqualGameSetup(gameSetupLite: GameSetupLite, gameSetup: GameSetup) {
  expect(gameSetupLite.gameMode).toEqual(gameSetup.gameMode);
  expect(gameSetupLite.playerArrangementMode).toEqual(gameSetup.playerArrangementMode);
  expect(gameSetupLite.hostUser).toEqual(gameSetup.hostUser);
  expect(gameSetupLite.users).toEqual(gameSetup.users);
  expect(gameSetupLite.approvals).toEqual(gameSetup.approvals);
  expect(gameSetupLite.finalUsers).toEqual(gameSetup.finalUsers);
}
