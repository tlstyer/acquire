import { calculatePlacings } from './misc';

describe('calculatePlacings', () => {
	test('distinct scores', () => {
		expect(calculatePlacings([1, 2, 3, 4])).toEqual([4, 3, 2, 1]);
	});

	test('tie scores', () => {
		expect(calculatePlacings([4, 2, 1, 2])).toEqual([1, 2, 4, 2]);
		expect(calculatePlacings([1, 2, 1, 2])).toEqual([3, 1, 3, 1]);
		expect(calculatePlacings([3, 3, 4])).toEqual([2, 2, 1]);
	});
});
