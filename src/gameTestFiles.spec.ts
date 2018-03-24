import { runGameTestFile } from './runGameTestFile';

describe('game test files', () => {
    describe('start game', () => {
        it('it works', () => runGameTestFile('start game/it works.txt'));
    });
});
