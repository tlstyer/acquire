import seedrandom from 'seedrandom';
import { describe, expect, test } from 'vitest';
import { GameSetup } from './gameSetup';
import { gameSetupFromProtocolBuffer, gameSetupToProtocolBuffer } from './gameSetupSerialization';
import { PB_GameMode, PB_GameSetupChange, PB_PlayerArrangementMode } from './pb';

const dummyApprovals = [true];

const userIDToUsername = new Map([
	[1, 'user 1'],
	[2, 'user 2'],
	[3, 'user 3'],
	[4, 'user 4'],
	[5, 'user 5'],
	[6, 'user 6'],
	[7, 'user 7'],
]);

function getUsernameForUserID(userID: number) {
	return userIDToUsername.get(userID)!;
}

function expectEqualGameSetups(gameSetup1: GameSetup, gameSetup2: GameSetup) {
	expect(gameSetup2).toEqual(gameSetup1);
	expect(gameSetupToProtocolBuffer(gameSetup2)).toEqual(gameSetupToProtocolBuffer(gameSetup1));
}

test('can construct', () => {
	const gameSetup = new GameSetup(
		PB_GameMode.SINGLES_4,
		PB_PlayerArrangementMode.RANDOM_ORDER,
		1,
		getUsernameForUserID,
	);

	expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
	expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
	expect(gameSetup.hostUserID).toBe(1);
	expect(gameSetup.getUsernameForUserID).toBe(getUsernameForUserID);
	expect(gameSetup.hostUsername).toBe('user 1');
	expect(gameSetup.usernames).toEqual(['user 1', null, null, null]);
	expect(gameSetup.userIDs).toEqual([1, null, null, null]);
	expect(gameSetup.userIDsSet).toEqual(new Set([1]));
	expect(gameSetup.approvals).toEqual([false, false, false, false]);
	expect(gameSetup.finalUserIDs).toBe(null);
	expect(gameSetup.finalUsernames).toBe(null);
	expect(gameSetup.history).toEqual([]);
});

describe('addUser', () => {
	test('can add users until full', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.clearHistory();

		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.addUser(5);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 3', 'user 4']);
		expect(gameSetup.userIDs).toEqual([1, 3, 4]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1, 3, 4]));
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ userAdded: { userId: 3 } }),
			PB_GameSetupChange.create({ userAdded: { userId: 4 } }),
		]);
	});

	test('duplicate users are rejected', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);

		gameSetup.addUser(6);
		gameSetup.addUser(6);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 6', null]);
		expect(gameSetup.userIDs).toEqual([1, 6, null]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1, 6]));
		expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userAdded: { userId: 6 } })]);
	});

	test('approvals are reset', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.approvals = dummyApprovals;
		gameSetup.finalUserIDs = [];
		gameSetup.finalUsernames = [];

		gameSetup.addUser(3);

		expect(gameSetup.approvals).toEqual([false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
	});
});

describe('removeUser', () => {
	test('can remove users', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(7);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		gameSetup.removeUser(7);

		expect(gameSetup.usernames).toEqual(['user 1', null, 'user 2']);
		expect(gameSetup.userIDs).toEqual([1, null, 2]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1, 2]));
		expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userRemoved: { userId: 7 } })]);

		gameSetup.removeUser(2);

		expect(gameSetup.usernames).toEqual(['user 1', null, null]);
		expect(gameSetup.userIDs).toEqual([1, null, null]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1]));
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ userRemoved: { userId: 7 } }),
			PB_GameSetupChange.create({ userRemoved: { userId: 2 } }),
		]);
	});

	test('cannot remove host', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		gameSetup.removeUser(1);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null]);
		expect(gameSetup.userIDs).toEqual([1, 2, null]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1, 2]));
		expect(gameSetup.history).toEqual([]);
	});

	test('approvals are reset', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(7);
		gameSetup.clearHistory();
		gameSetup.approvals = dummyApprovals;
		gameSetup.finalUserIDs = [];
		gameSetup.finalUsernames = [];

		gameSetup.removeUser(7);

		expect(gameSetup.approvals).toEqual([false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
	});
});

describe('approve', () => {
	test('cannot approve if not in game', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.approvals).toEqual([false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);

		gameSetup.approve(3);

		expect(gameSetup.approvals).toEqual([false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot approve if game is not full', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.approvals).toEqual([false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);

		gameSetup.approve(2);

		expect(gameSetup.approvals).toEqual([false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot approve if already approved', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.approve(2);
		gameSetup.clearHistory();

		expect(gameSetup.approvals).toEqual([false, true]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);

		gameSetup.approve(2);

		expect(gameSetup.approvals).toEqual([false, true]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
		expect(gameSetup.history).toEqual([]);
	});

	test('can approve', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.approvals).toEqual([false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);

		gameSetup.approve(2);

		expect(gameSetup.approvals).toEqual([false, true]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ userApprovedOfGameSetup: { userId: 2 } }),
		]);
	});

	describe('finalUserIds and finalUsernames are set when everybody approves', () => {
		describe('player arrangement mode is RandomOrder', () => {
			test('finalUserIds and finalUsernames are in a random order', () => {
				Math.random = seedrandom('random');

				const gameSetup = new GameSetup(
					PB_GameMode.SINGLES_4,
					PB_PlayerArrangementMode.RANDOM_ORDER,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.addUser(3);
				gameSetup.addUser(4);
				gameSetup.approve(1);
				gameSetup.approve(2);
				gameSetup.approve(3);
				gameSetup.clearHistory();
				gameSetup.approve(4);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 4,
							approvedByEverybody: true,
							finalUserIds: [3, 1, 4, 2],
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

				expect(gameSetup.finalUserIDs).toEqual([3, 1, 4, 2]);
				expect(gameSetup.finalUsernames).toEqual(['user 3', 'user 1', 'user 4', 'user 2']);
			});

			test('finalUserIds is excluded from PB_GameSetupChange when user order is the same', () => {
				Math.random = seedrandom('random!!!');

				const gameSetup = new GameSetup(
					PB_GameMode.SINGLES_2,
					PB_PlayerArrangementMode.RANDOM_ORDER,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.approve(1);
				gameSetup.clearHistory();
				gameSetup.approve(2);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 2,
							approvedByEverybody: true,
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual(['user 1', 'user 2']);

				expect(gameSetup.finalUserIDs).toBe(gameSetup.userIDs);
				expect(gameSetup.finalUsernames).toBe(gameSetup.usernames);
			});
		});

		describe('player arrangement mode is ExactOrder', () => {
			test('finalUserIds and finalUsernames are in the order specified', () => {
				const gameSetup = new GameSetup(
					PB_GameMode.TEAMS_2_VS_2,
					PB_PlayerArrangementMode.EXACT_ORDER,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.addUser(3);
				gameSetup.addUser(4);
				gameSetup.approve(1);
				gameSetup.approve(3);
				gameSetup.approve(4);
				gameSetup.clearHistory();
				gameSetup.approve(2);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 2,
							approvedByEverybody: true,
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

				expect(gameSetup.finalUserIDs).toEqual([1, 2, 3, 4]);
				expect(gameSetup.finalUsernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
			});
		});

		describe('player arrangement mode is SpecifyTeams', () => {
			test('teams and players within teams are randomized when gameMode is Teams2vs2', () => {
				Math.random = seedrandom('random');

				const gameSetup = new GameSetup(
					PB_GameMode.TEAMS_2_VS_2,
					PB_PlayerArrangementMode.SPECIFY_TEAMS,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.addUser(3);
				gameSetup.addUser(4);
				gameSetup.approve(2);
				gameSetup.approve(3);
				gameSetup.approve(4);
				gameSetup.clearHistory();
				gameSetup.approve(1);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 1,
							approvedByEverybody: true,
							finalUserIds: [2, 3, 4, 1],
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

				expect(gameSetup.finalUserIDs).toEqual([2, 3, 4, 1]);
				expect(gameSetup.finalUsernames).toEqual(['user 2', 'user 3', 'user 4', 'user 1']);
			});

			test('teams and players within teams are randomized when gameMode is Teams2vs2vs2', () => {
				Math.random = seedrandom('random');

				const gameSetup = new GameSetup(
					PB_GameMode.TEAMS_2_VS_2_VS_2,
					PB_PlayerArrangementMode.SPECIFY_TEAMS,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.addUser(3);
				gameSetup.addUser(4);
				gameSetup.addUser(5);
				gameSetup.addUser(6);
				gameSetup.approve(3);
				gameSetup.approve(6);
				gameSetup.approve(2);
				gameSetup.approve(4);
				gameSetup.approve(1);
				gameSetup.clearHistory();
				gameSetup.approve(5);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 5,
							approvedByEverybody: true,
							finalUserIds: [4, 3, 2, 1, 6, 5],
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual([
					'user 1',
					'user 2',
					'user 3',
					'user 4',
					'user 5',
					'user 6',
				]);

				expect(gameSetup.finalUserIDs).toEqual([4, 3, 2, 1, 6, 5]);
				expect(gameSetup.finalUsernames).toEqual([
					'user 4',
					'user 3',
					'user 2',
					'user 1',
					'user 6',
					'user 5',
				]);
			});

			test('teams and players within teams are randomized when gameMode is Teams3vs3', () => {
				Math.random = seedrandom('random!!!!');

				const gameSetup = new GameSetup(
					PB_GameMode.TEAMS_3_VS_3,
					PB_PlayerArrangementMode.SPECIFY_TEAMS,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.addUser(3);
				gameSetup.addUser(4);
				gameSetup.addUser(5);
				gameSetup.addUser(6);
				gameSetup.approve(4);
				gameSetup.approve(2);
				gameSetup.approve(3);
				gameSetup.approve(6);
				gameSetup.approve(1);
				gameSetup.clearHistory();
				gameSetup.approve(5);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 5,
							approvedByEverybody: true,
							finalUserIds: [5, 4, 1, 6, 3, 2],
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual([
					'user 1',
					'user 2',
					'user 3',
					'user 4',
					'user 5',
					'user 6',
				]);

				expect(gameSetup.finalUserIDs).toEqual([5, 4, 1, 6, 3, 2]);
				expect(gameSetup.finalUsernames).toEqual([
					'user 5',
					'user 4',
					'user 1',
					'user 6',
					'user 3',
					'user 2',
				]);
			});

			test('finalUserIds is excluded from PB_GameSetupChange when user order is the same', () => {
				Math.random = seedrandom('random!!!');

				const gameSetup = new GameSetup(
					PB_GameMode.TEAMS_2_VS_2,
					PB_PlayerArrangementMode.SPECIFY_TEAMS,
					1,
					getUsernameForUserID,
				);
				gameSetup.addUser(2);
				gameSetup.addUser(3);
				gameSetup.addUser(4);
				gameSetup.approve(2);
				gameSetup.approve(3);
				gameSetup.approve(4);
				gameSetup.clearHistory();
				gameSetup.approve(1);
				expect(gameSetup.history).toEqual([
					PB_GameSetupChange.create({
						userApprovedOfGameSetup: {
							userId: 1,
							approvedByEverybody: true,
						},
					}),
				]);
				gameSetup.clearHistory();

				expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

				expect(gameSetup.finalUserIDs).toBe(gameSetup.userIDs);
				expect(gameSetup.finalUsernames).toBe(gameSetup.usernames);
			});
		});
	});
});

describe('changeGameMode', () => {
	test('cannot change to a nonexistent mode', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);

		// @ts-expect-error
		gameSetup.changeGameMode('invalid mode');
		// @ts-expect-error
		gameSetup.changeGameMode(null);
		// @ts-expect-error
		gameSetup.changeGameMode({});
		gameSetup.changeGameMode(0);
		gameSetup.changeGameMode(10);

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot change to the same mode', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, null]);

		gameSetup.changeGameMode(PB_GameMode.TEAMS_2_VS_2);

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, null]);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot change to a mode where fewer players are needed than are currently in the game', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_4,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.removeUser(3);
		gameSetup.clearHistory();

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, 'user 4']);

		gameSetup.changeGameMode(PB_GameMode.SINGLES_2);

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, 'user 4']);
		expect(gameSetup.history).toEqual([]);
	});

	test('can change mode', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, null]);

		gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, null]);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
		]);
	});

	test('spots added for added player positions', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_2,
			PB_PlayerArrangementMode.EXACT_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_2);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2']);

		gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, null]);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
		]);
	});

	test('spots removed for removed player positions', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_4,
			PB_PlayerArrangementMode.EXACT_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null, null]);

		gameSetup.changeGameMode(PB_GameMode.SINGLES_2);

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_2);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 2']);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_2 } }),
		]);
	});

	test('spots removed and positions shifted for removed player positions', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_3_VS_3,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.addUser(5);
		gameSetup.addUser(6);
		gameSetup.removeUser(2);
		gameSetup.removeUser(4);
		gameSetup.clearHistory();

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_3_VS_3);
		expect(gameSetup.usernames).toEqual(['user 1', null, 'user 3', null, 'user 5', 'user 6']);

		gameSetup.changeGameMode(PB_GameMode.TEAMS_2_VS_2);

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
		expect(gameSetup.usernames).toEqual(['user 1', 'user 5', 'user 3', 'user 6']);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.TEAMS_2_VS_2 } }),
		]);
	});

	test('player arrangement mode changed to RandomOrder from SpecifyTeams when switching to a Singles game', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);

		expect(gameSetup.gameMode).toBe(PB_GameMode.TEAMS_2_VS_2);
		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);
		expect(gameSetup.usernames).toEqual(['user 1', null, null, null]);

		gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

		expect(gameSetup.gameMode).toBe(PB_GameMode.SINGLES_4);
		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
		expect(gameSetup.usernames).toEqual(['user 1', null, null, null]);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ gameModeChanged: { gameMode: PB_GameMode.SINGLES_4 } }),
		]);
	});

	test('approvals are reset', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.approvals = dummyApprovals;
		gameSetup.finalUserIDs = [];
		gameSetup.finalUsernames = [];

		gameSetup.changeGameMode(PB_GameMode.SINGLES_4);

		expect(gameSetup.approvals).toEqual([false, false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
	});
});

describe('changePlayerArrangementMode', () => {
	test('cannot change to a nonexistent mode', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);

		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);

		// @ts-expect-error
		gameSetup.changePlayerArrangementMode('invalid mode');
		// @ts-expect-error
		gameSetup.changePlayerArrangementMode(null);
		// @ts-expect-error
		gameSetup.changePlayerArrangementMode({});
		gameSetup.changePlayerArrangementMode(-1);
		gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.VERSION_1);
		gameSetup.changePlayerArrangementMode(4);

		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot change to the same mode', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);

		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);

		gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);

		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.SPECIFY_TEAMS);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot change to SpecifyTeams when game is not a teams game', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_4,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);

		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);

		gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.SPECIFY_TEAMS);

		expect(gameSetup.playerArrangementMode).toBe(PB_PlayerArrangementMode.RANDOM_ORDER);
		expect(gameSetup.history).toEqual([]);
	});

	test('can change mode', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);

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
	});

	test('approvals are reset', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.approvals = dummyApprovals;
		gameSetup.finalUserIDs = [];
		gameSetup.finalUsernames = [];

		gameSetup.changePlayerArrangementMode(PB_PlayerArrangementMode.EXACT_ORDER);

		expect(gameSetup.approvals).toEqual([false, false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
	});
});

describe('swapPositions', () => {
	test('cannot swap invalid positions', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

		gameSetup.swapPositions(-1, 0);
		gameSetup.swapPositions(4, 0);

		gameSetup.swapPositions(0, -1);
		gameSetup.swapPositions(0, 4);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot swap position with itself', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.EXACT_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null]);

		gameSetup.swapPositions(1, 1);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null]);
		expect(gameSetup.history).toEqual([]);

		gameSetup.swapPositions(2, 2);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', null]);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot swap empty positions', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_3,
			PB_PlayerArrangementMode.EXACT_ORDER,
			1,
			getUsernameForUserID,
		);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', null, null]);

		gameSetup.swapPositions(1, 2);

		expect(gameSetup.usernames).toEqual(['user 1', null, null]);
		expect(gameSetup.history).toEqual([]);
	});

	test('can swap positions', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
		gameSetup.swapPositions(0, 1);
		expect(gameSetup.usernames).toEqual(['user 2', 'user 1', 'user 3', 'user 4']);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 1 } }),
		]);
		gameSetup.clearHistory();

		gameSetup.swapPositions(2, 3);
		expect(gameSetup.usernames).toEqual(['user 2', 'user 1', 'user 4', 'user 3']);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ positionsSwapped: { position1: 2, position2: 3 } }),
		]);
		gameSetup.clearHistory();

		gameSetup.swapPositions(0, 3);
		expect(gameSetup.usernames).toEqual(['user 3', 'user 1', 'user 4', 'user 2']);
		expect(gameSetup.history).toEqual([
			PB_GameSetupChange.create({ positionsSwapped: { position1: 0, position2: 3 } }),
		]);
		gameSetup.clearHistory();
	});

	test('approvals are reset', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.clearHistory();
		gameSetup.approvals = dummyApprovals;
		gameSetup.finalUserIDs = [];
		gameSetup.finalUsernames = [];

		gameSetup.swapPositions(0, 1);

		expect(gameSetup.approvals).toEqual([false, false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
	});
});

describe('kickUser', () => {
	test('cannot kick invalid user', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.addUser(4);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);

		// @ts-expect-error
		gameSetup.kickUser('invalid user');
		// @ts-expect-error
		gameSetup.kickUser(null);
		// @ts-expect-error
		gameSetup.kickUser({});
		gameSetup.kickUser(-1);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', 'user 4']);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot kick user that is not in the game', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', null]);

		gameSetup.kickUser(4);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', null]);
		expect(gameSetup.history).toEqual([]);
	});

	test('cannot kick the host', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', null]);

		gameSetup.kickUser(1);

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', null]);
		expect(gameSetup.history).toEqual([]);
	});

	test('can kick user', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.clearHistory();

		expect(gameSetup.usernames).toEqual(['user 1', 'user 2', 'user 3', null]);
		expect(gameSetup.userIDs).toEqual([1, 2, 3, null]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1, 2, 3]));

		gameSetup.kickUser(2);

		expect(gameSetup.usernames).toEqual(['user 1', null, 'user 3', null]);
		expect(gameSetup.userIDs).toEqual([1, null, 3, null]);
		expect(gameSetup.userIDsSet).toEqual(new Set([1, 3]));
		expect(gameSetup.history).toEqual([PB_GameSetupChange.create({ userKicked: { userId: 2 } })]);
	});

	test('approvals are reset', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.addUser(2);
		gameSetup.addUser(3);
		gameSetup.clearHistory();
		gameSetup.approvals = dummyApprovals;
		gameSetup.finalUserIDs = [];
		gameSetup.finalUsernames = [];

		gameSetup.kickUser(2);

		expect(gameSetup.approvals).toEqual([false, false, false, false]);
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);
	});
});

describe('processChange', () => {
	test('no changes upon invalid message', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_4,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);

		gameSetup.processChange(PB_GameSetupChange.create());
		expect(gameSetup.history).toEqual([]);
	});

	test('changes are processed', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.SINGLES_4,
			PB_PlayerArrangementMode.RANDOM_ORDER,
			1,
			getUsernameForUserID,
		);

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
		expect(gameSetup.hostUserID).toBe(1);
		expect(gameSetup.getUsernameForUserID).toBe(getUsernameForUserID);
		expect(gameSetup.hostUsername).toBe('user 1');
		expect(gameSetup.usernames).toEqual(['user 4', 'user 5', 'user 6', 'user 1']);
		expect(gameSetup.userIDs).toEqual([4, 5, 6, 1]);
		expect(gameSetup.userIDsSet).toEqual(new Set([4, 5, 6, 1]));
		expect(gameSetup.approvals).toEqual([true, true, true, true]);
		expect(gameSetup.finalUserIDs).toBe(gameSetup.userIDs);
		expect(gameSetup.finalUsernames).toBe(gameSetup.usernames);
	});
});

describe('gameSetupToProtocolBuffer and gameSetupFromProtocolBuffer', () => {
	test('just the host', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_2_VS_2,
			PB_PlayerArrangementMode.SPECIFY_TEAMS,
			1,
			getUsernameForUserID,
		);
		gameSetup.swapPositions(0, 2);
		gameSetup.clearHistory();

		const gameSetup2 = gameSetupFromProtocolBuffer(
			gameSetupToProtocolBuffer(gameSetup),
			getUsernameForUserID,
		);
		gameSetup2.clearHistory();

		expectEqualGameSetups(gameSetup, gameSetup2);
	});

	test('approved by some users', () => {
		const gameSetup = new GameSetup(
			PB_GameMode.TEAMS_3_VS_3,
			PB_PlayerArrangementMode.EXACT_ORDER,
			3,
			getUsernameForUserID,
		);
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
		expect(gameSetup.finalUserIDs).toBe(null);
		expect(gameSetup.finalUsernames).toBe(null);

		const gameSetup2 = gameSetupFromProtocolBuffer(
			gameSetupToProtocolBuffer(gameSetup),
			getUsernameForUserID,
		);
		gameSetup2.clearHistory();

		expectEqualGameSetups(gameSetup, gameSetup2);
	});
});
