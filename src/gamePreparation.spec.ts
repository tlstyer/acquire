import { assert } from 'chai';
import { getNewTileBag } from './gamePreparation';

describe('getNewTileBag', () => {
    it('should return a shuffled array containing all integers between 0 and 107 inclusive', () => {
        let tileBagInOrder: number[] = new Array(108);
        for (let i = 0; i < 108; i++) {
            tileBagInOrder[i] = i;
        }

        let tileBag = getNewTileBag();
        assert.notDeepEqual(tileBag, tileBagInOrder);

        tileBag.sort((a, b) => (a < b ? -1 : 1));
        assert.deepEqual(tileBag, tileBagInOrder);
    });
});
