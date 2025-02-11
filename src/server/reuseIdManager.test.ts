import { expect, test } from 'vitest';
import { ReuseIdManager } from './reuseIdManager.js';

test('new IDs are sequential starting with 1', () => {
  const reuseIdManager = new ReuseIdManager(60000);

  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(2);
  expect(reuseIdManager.getId()).toBe(3);
});

test('nothing bad happens when returning an ID that was not being used', () => {
  const reuseIdManager = new ReuseIdManager(60000);

  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(2);
  expect(reuseIdManager.getId()).toBe(3);

  reuseIdManager.returnId(99);
});

test('IDs are not reused when in their waiting period', () => {
  const reuseIdManager = new ReuseIdManager(1);

  Date.now = () => 0;

  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(2);
  expect(reuseIdManager.getId()).toBe(3);
  expect(reuseIdManager.getId()).toBe(4);
  reuseIdManager.returnId(1);
  reuseIdManager.returnId(3);
  expect(reuseIdManager.getId()).toBe(5);
});

test('IDs are reused right away when they do not have a waiting period', () => {
  const reuseIdManager = new ReuseIdManager(0);

  Date.now = () => 0;

  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(2);
  expect(reuseIdManager.getId()).toBe(3);
  expect(reuseIdManager.getId()).toBe(4);
  reuseIdManager.returnId(3);
  reuseIdManager.returnId(1);
  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(3);
});

test('IDs are reused after their waiting periods complete', () => {
  const reuseIdManager = new ReuseIdManager(100);

  let now = 0;
  Date.now = () => now;

  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(2);
  expect(reuseIdManager.getId()).toBe(3);
  expect(reuseIdManager.getId()).toBe(4);

  now = 25;
  reuseIdManager.returnId(3);

  now = 35;
  reuseIdManager.returnId(1);

  now = 124;
  expect(reuseIdManager.getId()).toBe(5);

  now = 125;
  expect(reuseIdManager.getId()).toBe(3);

  now = 134;
  expect(reuseIdManager.getId()).toBe(6);

  now = 135;
  expect(reuseIdManager.getId()).toBe(1);
});

test('IDs are reused in numerical order after their waiting periods complete', () => {
  const reuseIdManager = new ReuseIdManager(10);

  let now = 0;
  Date.now = () => now;

  for (let id = 1; id <= 10; id++) {
    expect(reuseIdManager.getId()).toBe(id);
  }

  now = 2;
  reuseIdManager.returnId(9);
  now = 3;
  reuseIdManager.returnId(6);
  now = 4;
  reuseIdManager.returnId(2);

  now = 5;
  reuseIdManager.returnId(3);
  now = 6;
  reuseIdManager.returnId(1);
  now = 7;
  reuseIdManager.returnId(8);

  now = 11;
  expect(reuseIdManager.getId()).toBe(11);

  now = 14;
  expect(reuseIdManager.getId()).toBe(2);
  expect(reuseIdManager.getId()).toBe(6);
  expect(reuseIdManager.getId()).toBe(9);
  expect(reuseIdManager.getId()).toBe(12);

  now = 17;
  expect(reuseIdManager.getId()).toBe(1);
  expect(reuseIdManager.getId()).toBe(3);
  expect(reuseIdManager.getId()).toBe(8);
  expect(reuseIdManager.getId()).toBe(13);
});
