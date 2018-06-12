import { calculateBonuses, getNewTileBag, neighboringTilesLookup, PlayerIDAndAmount } from './helpers';

describe('helpers', () => {
    describe('getNewTileBag', () => {
        it('should return a shuffled array containing all integers between 0 and 107 inclusive', () => {
            const tileBagInOrder: number[] = new Array(108);
            for (let i = 0; i < 108; i++) {
                tileBagInOrder[i] = i;
            }

            const tileBag = getNewTileBag();
            expect(tileBag).not.toEqual(tileBagInOrder);

            tileBag.sort((a, b) => (a < b ? -1 : 1));
            expect(tileBag).toEqual(tileBagInOrder);
        });
    });

    describe('neighboringTilesLookup', () => {
        it('returns neighboring tiles', () => {
            // corner tiles
            expect(neighboringTilesLookup[0]).toEqual([1, 9]);
            expect(neighboringTilesLookup[8]).toEqual([7, 17]);
            expect(neighboringTilesLookup[99]).toEqual([90, 100]);
            expect(neighboringTilesLookup[107]).toEqual([98, 106]);

            // some side tiles
            expect(neighboringTilesLookup[4]).toEqual([3, 5, 13]);
            expect(neighboringTilesLookup[54]).toEqual([45, 55, 63]);
            expect(neighboringTilesLookup[62]).toEqual([53, 61, 71]);
            expect(neighboringTilesLookup[103]).toEqual([94, 102, 104]);

            // a middle tile
            expect(neighboringTilesLookup[58]).toEqual([49, 57, 59, 67]);
        });
    });

    describe('calculateBonuses', () => {
        it('nobody owns any shares', () => {
            expect(calculateBonuses([0, 0, 0], 2)).toEqual([]);
        });

        it('only one player owns any shares', () => {
            expect(calculateBonuses([4, 0, 0], 2)).toEqual([new PlayerIDAndAmount(0, 30)]);
            expect(calculateBonuses([0, 5, 0, 0], 5)).toEqual([new PlayerIDAndAmount(1, 75)]);
            expect(calculateBonuses([0, 0, 1], 8)).toEqual([new PlayerIDAndAmount(2, 120)]);
        });

        it('tie for largest shareholder', () => {
            expect(calculateBonuses([1, 1, 0], 2)).toEqual([new PlayerIDAndAmount(0, 15), new PlayerIDAndAmount(1, 15)]);
            expect(calculateBonuses([0, 12, 0, 12], 7)).toEqual([new PlayerIDAndAmount(1, 53), new PlayerIDAndAmount(3, 53)]);
            expect(calculateBonuses([2, 1, 2, 2], 3)).toEqual([new PlayerIDAndAmount(0, 15), new PlayerIDAndAmount(2, 15), new PlayerIDAndAmount(3, 15)]);
            expect(calculateBonuses([0, 1, 1, 1, 1], 5)).toEqual([
                new PlayerIDAndAmount(1, 19),
                new PlayerIDAndAmount(2, 19),
                new PlayerIDAndAmount(3, 19),
                new PlayerIDAndAmount(4, 19),
            ]);
            expect(calculateBonuses([1, 1, 1, 1, 1, 1], 7)).toEqual([
                new PlayerIDAndAmount(0, 18),
                new PlayerIDAndAmount(1, 18),
                new PlayerIDAndAmount(2, 18),
                new PlayerIDAndAmount(3, 18),
                new PlayerIDAndAmount(4, 18),
                new PlayerIDAndAmount(5, 18),
            ]);
        });

        it('one largest shareholder, one second largest shareholder', () => {
            expect(calculateBonuses([4, 3, 0], 2)).toEqual([new PlayerIDAndAmount(0, 20), new PlayerIDAndAmount(1, 10)]);
            expect(calculateBonuses([0, 0, 3, 4], 4)).toEqual([new PlayerIDAndAmount(3, 40), new PlayerIDAndAmount(2, 20)]);
            expect(calculateBonuses([2, 4, 6, 1, 5, 3], 7)).toEqual([new PlayerIDAndAmount(2, 70), new PlayerIDAndAmount(4, 35)]);
        });

        it('one largest shareholder, multiple second largest shareholders', () => {
            expect(calculateBonuses([3, 3, 4], 4)).toEqual([new PlayerIDAndAmount(2, 40), new PlayerIDAndAmount(0, 10), new PlayerIDAndAmount(1, 10)]);
            expect(calculateBonuses([3, 3, 4, 3], 4)).toEqual([
                new PlayerIDAndAmount(2, 40),
                new PlayerIDAndAmount(0, 7),
                new PlayerIDAndAmount(1, 7),
                new PlayerIDAndAmount(3, 7),
            ]);
            expect(calculateBonuses([2, 1, 3, 2], 3)).toEqual([new PlayerIDAndAmount(2, 30), new PlayerIDAndAmount(0, 8), new PlayerIDAndAmount(3, 8)]);
            expect(calculateBonuses([2, 4, 6, 1, 4, 3], 7)).toEqual([new PlayerIDAndAmount(2, 70), new PlayerIDAndAmount(1, 18), new PlayerIDAndAmount(4, 18)]);
            expect(calculateBonuses([2, 3, 7, 1, 3, 3], 7)).toEqual([
                new PlayerIDAndAmount(2, 70),
                new PlayerIDAndAmount(1, 12),
                new PlayerIDAndAmount(4, 12),
                new PlayerIDAndAmount(5, 12),
            ]);
            expect(calculateBonuses([3, 3, 5, 1, 3, 3], 7)).toEqual([
                new PlayerIDAndAmount(2, 70),
                new PlayerIDAndAmount(0, 9),
                new PlayerIDAndAmount(1, 9),
                new PlayerIDAndAmount(4, 9),
                new PlayerIDAndAmount(5, 9),
            ]);
            expect(calculateBonuses([3, 3, 4, 3, 3, 3], 7)).toEqual([
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
