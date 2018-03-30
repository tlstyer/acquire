import { assert } from 'chai';
import { getNewTileBag, calculateBonuses, PlayerIDAndAmount, getNeighboringTiles } from './helpers';

describe('helpers', () => {
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

    describe('getNeighboringTiles', () => {
        it('returns neighboring tiles', () => {
            // corner tiles
            assert.deepEqual(getNeighboringTiles(0), [1, 9]);
            assert.deepEqual(getNeighboringTiles(8), [7, 17]);
            assert.deepEqual(getNeighboringTiles(99), [90, 100]);
            assert.deepEqual(getNeighboringTiles(107), [98, 106]);

            // some side tiles
            assert.deepEqual(getNeighboringTiles(4), [3, 5, 13]);
            assert.deepEqual(getNeighboringTiles(54), [45, 55, 63]);
            assert.deepEqual(getNeighboringTiles(62), [53, 61, 71]);
            assert.deepEqual(getNeighboringTiles(103), [94, 102, 104]);

            // a middle tile
            assert.deepEqual(getNeighboringTiles(58), [49, 57, 59, 67]);
        });
    });

    describe('calculateBonuses', () => {
        it('nobody owns any shares', () => {
            assert.deepEqual(calculateBonuses([0, 0, 0], 2), []);
        });

        it('only one player owns any shares', () => {
            assert.deepEqual(calculateBonuses([4, 0, 0], 2), [new PlayerIDAndAmount(0, 30)]);
            assert.deepEqual(calculateBonuses([0, 5, 0, 0], 5), [new PlayerIDAndAmount(1, 75)]);
            assert.deepEqual(calculateBonuses([0, 0, 1], 8), [new PlayerIDAndAmount(2, 120)]);
        });

        it('tie for largest shareholder', () => {
            assert.deepEqual(calculateBonuses([1, 1, 0], 2), [new PlayerIDAndAmount(0, 15), new PlayerIDAndAmount(1, 15)]);
            assert.deepEqual(calculateBonuses([0, 12, 0, 12], 7), [new PlayerIDAndAmount(1, 53), new PlayerIDAndAmount(3, 53)]);
            assert.deepEqual(calculateBonuses([2, 1, 2, 2], 3), [new PlayerIDAndAmount(0, 15), new PlayerIDAndAmount(2, 15), new PlayerIDAndAmount(3, 15)]);
            assert.deepEqual(calculateBonuses([0, 1, 1, 1, 1], 5), [
                new PlayerIDAndAmount(1, 19),
                new PlayerIDAndAmount(2, 19),
                new PlayerIDAndAmount(3, 19),
                new PlayerIDAndAmount(4, 19),
            ]);
            assert.deepEqual(calculateBonuses([1, 1, 1, 1, 1, 1], 7), [
                new PlayerIDAndAmount(0, 18),
                new PlayerIDAndAmount(1, 18),
                new PlayerIDAndAmount(2, 18),
                new PlayerIDAndAmount(3, 18),
                new PlayerIDAndAmount(4, 18),
                new PlayerIDAndAmount(5, 18),
            ]);
        });

        it('one largest shareholder, one second largest shareholder', () => {
            assert.deepEqual(calculateBonuses([4, 3, 0], 2), [new PlayerIDAndAmount(0, 20), new PlayerIDAndAmount(1, 10)]);
            assert.deepEqual(calculateBonuses([0, 0, 3, 4], 4), [new PlayerIDAndAmount(3, 40), new PlayerIDAndAmount(2, 20)]);
            assert.deepEqual(calculateBonuses([2, 4, 6, 1, 5, 3], 7), [new PlayerIDAndAmount(2, 70), new PlayerIDAndAmount(4, 35)]);
        });

        it('one largest shareholder, multiple second largest shareholders', () => {
            assert.deepEqual(calculateBonuses([3, 3, 4], 4), [new PlayerIDAndAmount(2, 40), new PlayerIDAndAmount(0, 10), new PlayerIDAndAmount(1, 10)]);
            assert.deepEqual(calculateBonuses([3, 3, 4, 3], 4), [
                new PlayerIDAndAmount(2, 40),
                new PlayerIDAndAmount(0, 7),
                new PlayerIDAndAmount(1, 7),
                new PlayerIDAndAmount(3, 7),
            ]);
            assert.deepEqual(calculateBonuses([2, 1, 3, 2], 3), [new PlayerIDAndAmount(2, 30), new PlayerIDAndAmount(0, 8), new PlayerIDAndAmount(3, 8)]);
            assert.deepEqual(calculateBonuses([2, 4, 6, 1, 4, 3], 7), [
                new PlayerIDAndAmount(2, 70),
                new PlayerIDAndAmount(1, 18),
                new PlayerIDAndAmount(4, 18),
            ]);
            assert.deepEqual(calculateBonuses([2, 3, 7, 1, 3, 3], 7), [
                new PlayerIDAndAmount(2, 70),
                new PlayerIDAndAmount(1, 12),
                new PlayerIDAndAmount(4, 12),
                new PlayerIDAndAmount(5, 12),
            ]);
            assert.deepEqual(calculateBonuses([3, 3, 5, 1, 3, 3], 7), [
                new PlayerIDAndAmount(2, 70),
                new PlayerIDAndAmount(0, 9),
                new PlayerIDAndAmount(1, 9),
                new PlayerIDAndAmount(4, 9),
                new PlayerIDAndAmount(5, 9),
            ]);
            assert.deepEqual(calculateBonuses([3, 3, 4, 3, 3, 3], 7), [
                new PlayerIDAndAmount(2, 70),
                new PlayerIDAndAmount(0, 7),
                new PlayerIDAndAmount(1, 7),
                new PlayerIDAndAmount(3, 7),
                new PlayerIDAndAmount(4, 7),
                new PlayerIDAndAmount(5, 7),
            ]);
        });
    });
});
