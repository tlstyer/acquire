import { List } from 'immutable';

import { GameMode, GameSetupChange, PlayerArrangementMode } from './enums';
import { GameSetup } from './gameSetup';

const dummyApprovals = List([true]);

describe('gameSetup', () => {
    it('can construct', () => {
        const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, 'Host');

        expect(gameSetup.gameMode).toBe(GameMode.Singles4);
        expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
        expect(gameSetup.hostUserID).toBe(1);
        expect(gameSetup.hostUsername).toBe('Host');
        expect(gameSetup.usernames.toJS()).toEqual(['Host', null, null, null]);
        expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
        expect(gameSetup.usernameToUserID.size).toEqual(1);
        expect(gameSetup.userIDToUsername.size).toEqual(1);
        expect(gameSetup.history).toEqual([[GameSetupChange.Created, GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1]]);

        gameSetup.clearHistory();

        expect(gameSetup.history).toEqual([]);
    });

    describe('addUser', () => {
        it('can add users until full', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.clearHistory();

            gameSetup.addUser(3, 'accepted user 1');
            gameSetup.addUser(4, 'accepted user 2');
            gameSetup.addUser(5, 'rejected user');

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'accepted user 1', 'accepted user 2']);
            expect(gameSetup.usernameToUserID.size).toEqual(3);
            expect(gameSetup.userIDToUsername.size).toEqual(3);
            expect(gameSetup.history).toEqual([[GameSetupChange.UserAdded, 3], [GameSetupChange.UserAdded, 4]]);
        });

        it('duplicate users are rejected', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.clearHistory();

            gameSetup.addUser(6, 'user');
            gameSetup.addUser(6, 'user');

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null]);
            expect(gameSetup.usernameToUserID.size).toEqual(2);
            expect(gameSetup.userIDToUsername.size).toEqual(2);
            expect(gameSetup.history).toEqual([[GameSetupChange.UserAdded, 6]]);
        });

        it('approvals are reset', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.clearHistory();
            gameSetup.approvals = dummyApprovals;

            gameSetup.addUser(3, 'user');

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
        });
    });

    describe('removeUser', () => {
        it('can remove users', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(7, 'user 1');
            gameSetup.addUser(2, 'user 2');
            gameSetup.clearHistory();

            gameSetup.removeUser(7);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', null, 'user 2']);
            expect(gameSetup.usernameToUserID.size).toEqual(2);
            expect(gameSetup.userIDToUsername.size).toEqual(2);
            expect(gameSetup.history).toEqual([[GameSetupChange.UserRemoved, 7]]);

            gameSetup.removeUser(2);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', null, null]);
            expect(gameSetup.usernameToUserID.size).toEqual(1);
            expect(gameSetup.userIDToUsername.size).toEqual(1);
            expect(gameSetup.history).toEqual([[GameSetupChange.UserRemoved, 7], [GameSetupChange.UserRemoved, 2]]);
        });

        it('cannot remove host', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            gameSetup.removeUser(1);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null]);
            expect(gameSetup.usernameToUserID.size).toEqual(2);
            expect(gameSetup.userIDToUsername.size).toEqual(2);
            expect(gameSetup.history).toEqual([]);
        });

        it('approvals are reset', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(7, 'user 1');
            gameSetup.clearHistory();
            gameSetup.approvals = dummyApprovals;

            gameSetup.removeUser(7);

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
        });
    });

    describe('approve', () => {
        it('cannot approve if not in game', () => {
            const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.approvals.toJS()).toEqual([false, false]);

            gameSetup.approve(3);

            expect(gameSetup.approvals.toJS()).toEqual([false, false]);
            expect(gameSetup.history).toEqual([]);
        });

        it('cannot approve if game is not full', () => {
            const gameSetup = new GameSetup(GameMode.Singles3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);

            gameSetup.approve(2);

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false]);
            expect(gameSetup.history).toEqual([]);
        });

        it('cannot approve if already approved', () => {
            const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.approve(2);
            gameSetup.clearHistory();

            expect(gameSetup.approvals.toJS()).toEqual([false, true]);

            gameSetup.approve(2);

            expect(gameSetup.approvals.toJS()).toEqual([false, true]);
            expect(gameSetup.history).toEqual([]);
        });

        it('can approve', () => {
            const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.approvals.toJS()).toEqual([false, false]);

            gameSetup.approve(2);

            expect(gameSetup.approvals.toJS()).toEqual([false, true]);
            expect(gameSetup.history).toEqual([[GameSetupChange.UserApprovedOfGameSetup, 2]]);
        });
    });

    describe('changeGameMode', () => {
        it('cannot change to a nonexistent mode', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.clearHistory();

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

        it('cannot change to the same mode', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null, null]);

            gameSetup.changeGameMode(GameMode.Teams2vs2);

            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null, null]);
            expect(gameSetup.history).toEqual([]);
        });

        it('cannot change to a mode where fewer players are needed than are currently in the game', () => {
            const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.addUser(4, 'user 4');
            gameSetup.removeUser(3);
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Singles4);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', null, 'user 4']);

            gameSetup.changeGameMode(GameMode.Singles2);

            expect(gameSetup.gameMode).toBe(GameMode.Singles4);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', null, 'user 4']);
            expect(gameSetup.history).toEqual([]);
        });

        it('can change mode', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null, null]);

            gameSetup.changeGameMode(GameMode.Singles4);

            expect(gameSetup.gameMode).toBe(GameMode.Singles4);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null, null]);
            expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles4]]);
        });

        it('spots added for added player positions', () => {
            const gameSetup = new GameSetup(GameMode.Singles2, PlayerArrangementMode.ExactOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Singles2);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user']);

            gameSetup.changeGameMode(GameMode.Singles4);

            expect(gameSetup.gameMode).toBe(GameMode.Singles4);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null, null]);
            expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles4]]);
        });

        it('spots removed for removed player positions', () => {
            const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.ExactOrder, 1, 'Host');
            gameSetup.addUser(2, 'user');
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Singles4);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user', null, null]);

            gameSetup.changeGameMode(GameMode.Singles2);

            expect(gameSetup.gameMode).toBe(GameMode.Singles2);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user']);
            expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles2]]);
        });

        it('spots removed and positions shifted for removed player positions', () => {
            const gameSetup = new GameSetup(GameMode.Teams3vs3, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.addUser(4, 'user 4');
            gameSetup.addUser(5, 'user 5');
            gameSetup.addUser(6, 'user 6');
            gameSetup.removeUser(2);
            gameSetup.removeUser(4);
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Teams3vs3);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', null, 'user 3', null, 'user 5', 'user 6']);

            gameSetup.changeGameMode(GameMode.Teams2vs2);

            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 5', 'user 3', 'user 6']);
            expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Teams2vs2]]);
        });

        it('player arrangement mode changed to RandomOrder from SpecifyTeams when switching to a Singles game', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.clearHistory();

            expect(gameSetup.gameMode).toBe(GameMode.Teams2vs2);
            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', null, null, null]);

            gameSetup.changeGameMode(GameMode.Singles4);

            expect(gameSetup.gameMode).toBe(GameMode.Singles4);
            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
            expect(gameSetup.usernames.toJS()).toEqual(['Host', null, null, null]);
            expect(gameSetup.history).toEqual([[GameSetupChange.GameModeChanged, GameMode.Singles4]]);
        });

        it('approvals are reset', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.clearHistory();
            gameSetup.approvals = dummyApprovals;

            gameSetup.changeGameMode(GameMode.Singles4);

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
        });
    });

    describe('changePlayerArrangementMode', () => {
        it('cannot change to a nonexistent mode', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.clearHistory();

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

        it('cannot change to the same mode', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.clearHistory();

            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);

            gameSetup.changePlayerArrangementMode(PlayerArrangementMode.SpecifyTeams);

            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);
            expect(gameSetup.history).toEqual([]);
        });

        it('cannot change to SpecifyTeams when game is not a teams game', () => {
            const gameSetup = new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, 'Host');
            gameSetup.clearHistory();

            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);

            gameSetup.changePlayerArrangementMode(PlayerArrangementMode.SpecifyTeams);

            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.RandomOrder);
            expect(gameSetup.history).toEqual([]);
        });

        it('can change mode', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.clearHistory();

            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.SpecifyTeams);

            gameSetup.changePlayerArrangementMode(PlayerArrangementMode.ExactOrder);

            expect(gameSetup.playerArrangementMode).toBe(PlayerArrangementMode.ExactOrder);
            expect(gameSetup.history).toEqual([[GameSetupChange.PlayerArrangementModeChanged, PlayerArrangementMode.ExactOrder]]);
        });

        it('approvals are reset', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.clearHistory();
            gameSetup.approvals = dummyApprovals;

            gameSetup.changePlayerArrangementMode(PlayerArrangementMode.ExactOrder);

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
        });
    });

    describe('swapPositions', () => {
        it('cannot swap invalid positions', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.addUser(4, 'user 4');
            gameSetup.clearHistory();

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', 'user 4']);

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

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', 'user 4']);
            expect(gameSetup.history).toEqual([]);
        });

        it('can swap positions', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.addUser(4, 'user 4');
            gameSetup.clearHistory();

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', 'user 4']);
            gameSetup.swapPositions(0, 1);
            expect(gameSetup.usernames.toJS()).toEqual(['user 2', 'Host', 'user 3', 'user 4']);
            expect(gameSetup.history).toEqual([[GameSetupChange.PositionsSwapped, 0, 1]]);
            gameSetup.clearHistory();

            gameSetup.swapPositions(2, 3);
            expect(gameSetup.usernames.toJS()).toEqual(['user 2', 'Host', 'user 4', 'user 3']);
            expect(gameSetup.history).toEqual([[GameSetupChange.PositionsSwapped, 2, 3]]);
            gameSetup.clearHistory();

            gameSetup.swapPositions(0, 3);
            expect(gameSetup.usernames.toJS()).toEqual(['user 3', 'Host', 'user 4', 'user 2']);
            expect(gameSetup.history).toEqual([[GameSetupChange.PositionsSwapped, 0, 3]]);
            gameSetup.clearHistory();
        });

        it('approvals are reset', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.addUser(4, 'user 4');
            gameSetup.clearHistory();
            gameSetup.approvals = dummyApprovals;

            gameSetup.swapPositions(0, 1);

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
        });
    });

    describe('kickUser', () => {
        it('cannot kick invalid position', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.addUser(4, 'user 4');
            gameSetup.clearHistory();

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', 'user 4']);

            // @ts-ignore
            gameSetup.kickUser('invalid position');
            // @ts-ignore
            gameSetup.kickUser(null);
            // @ts-ignore
            gameSetup.kickUser({});
            gameSetup.kickUser(-1);
            gameSetup.kickUser(4);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', 'user 4']);
            expect(gameSetup.history).toEqual([]);
        });

        it('cannot kick position that does not have a user', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.clearHistory();

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', null]);

            gameSetup.kickUser(3);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', null]);
            expect(gameSetup.history).toEqual([]);
        });

        it('cannot kick position that belongs to the host', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.clearHistory();

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', null]);

            gameSetup.kickUser(0);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', null]);
            expect(gameSetup.history).toEqual([]);
        });

        it('can kick user', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.clearHistory();

            expect(gameSetup.usernames.toJS()).toEqual(['Host', 'user 2', 'user 3', null]);
            expect(gameSetup.usernameToUserID.size).toEqual(3);
            expect(gameSetup.userIDToUsername.size).toEqual(3);

            gameSetup.kickUser(1);

            expect(gameSetup.usernames.toJS()).toEqual(['Host', null, 'user 3', null]);
            expect(gameSetup.usernameToUserID.size).toEqual(2);
            expect(gameSetup.userIDToUsername.size).toEqual(2);
            expect(gameSetup.history).toEqual([[GameSetupChange.UserKicked, 1]]);
        });

        it('approvals are reset', () => {
            const gameSetup = new GameSetup(GameMode.Teams2vs2, PlayerArrangementMode.SpecifyTeams, 1, 'Host');
            gameSetup.addUser(2, 'user 2');
            gameSetup.addUser(3, 'user 3');
            gameSetup.clearHistory();
            gameSetup.approvals = dummyApprovals;

            gameSetup.kickUser(1);

            expect(gameSetup.approvals.toJS()).toEqual([false, false, false, false]);
        });
    });
});
