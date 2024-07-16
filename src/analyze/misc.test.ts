import { describe, expect, test } from 'vitest';
import { MovingAverage, calculatePlacings } from './misc';

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

describe('MovingAverage', () => {
  test('one entry', () => {
    const movingAverage = new MovingAverage(1);

    expect(movingAverage.getAverage()).toEqual(0);

    movingAverage.includeNewEntry(5);
    expect(movingAverage.getAverage()).toEqual(5);

    movingAverage.includeNewEntry(10);
    expect(movingAverage.getAverage()).toEqual(10);
  });

  test('multiple entries', () => {
    const movingAverage = new MovingAverage(3);

    expect(movingAverage.getAverage()).toEqual(0);

    movingAverage.includeNewEntry(3);
    expect(movingAverage.getAverage()).toEqual(1);
    movingAverage.includeNewEntry(6);
    expect(movingAverage.getAverage()).toEqual(3);
    movingAverage.includeNewEntry(9);
    expect(movingAverage.getAverage()).toEqual(6);

    movingAverage.includeNewEntry(12);
    expect(movingAverage.getAverage()).toEqual(9);
  });
});
