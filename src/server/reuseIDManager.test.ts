import { expect, test } from 'vitest';
import { ReuseIDManager } from './reuseIDManager';

test('new IDs are sequential starting with 1', () => {
  const reuseIDManager = new ReuseIDManager(60000);

  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(2);
  expect(reuseIDManager.getID()).toBe(3);
});

test('nothing bad happens when returning an ID that was not being used', () => {
  const reuseIDManager = new ReuseIDManager(60000);

  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(2);
  expect(reuseIDManager.getID()).toBe(3);

  reuseIDManager.returnID(99);
});

test('IDs are not reused when in their waiting period', () => {
  const reuseIDManager = new ReuseIDManager(1);

  Date.now = () => 0;

  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(2);
  expect(reuseIDManager.getID()).toBe(3);
  expect(reuseIDManager.getID()).toBe(4);
  reuseIDManager.returnID(1);
  reuseIDManager.returnID(3);
  expect(reuseIDManager.getID()).toBe(5);
});

test('IDs are reused right away when they do not have a waiting period', () => {
  const reuseIDManager = new ReuseIDManager(0);

  Date.now = () => 0;

  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(2);
  expect(reuseIDManager.getID()).toBe(3);
  expect(reuseIDManager.getID()).toBe(4);
  reuseIDManager.returnID(3);
  reuseIDManager.returnID(1);
  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(3);
});

test('IDs are reused after their waiting periods complete', () => {
  const reuseIDManager = new ReuseIDManager(100);

  let now = 0;
  Date.now = () => now;

  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(2);
  expect(reuseIDManager.getID()).toBe(3);
  expect(reuseIDManager.getID()).toBe(4);

  now = 25;
  reuseIDManager.returnID(3);

  now = 35;
  reuseIDManager.returnID(1);

  now = 124;
  expect(reuseIDManager.getID()).toBe(5);

  now = 125;
  expect(reuseIDManager.getID()).toBe(3);

  now = 134;
  expect(reuseIDManager.getID()).toBe(6);

  now = 135;
  expect(reuseIDManager.getID()).toBe(1);
});

test('IDs are reused in numerical order after their waiting periods complete', () => {
  const reuseIDManager = new ReuseIDManager(10);

  let now = 0;
  Date.now = () => now;

  for (let id = 1; id <= 10; id++) {
    expect(reuseIDManager.getID()).toBe(id);
  }

  now = 2;
  reuseIDManager.returnID(9);
  now = 3;
  reuseIDManager.returnID(6);
  now = 4;
  reuseIDManager.returnID(2);

  now = 5;
  reuseIDManager.returnID(3);
  now = 6;
  reuseIDManager.returnID(1);
  now = 7;
  reuseIDManager.returnID(8);

  now = 11;
  expect(reuseIDManager.getID()).toBe(11);

  now = 14;
  expect(reuseIDManager.getID()).toBe(2);
  expect(reuseIDManager.getID()).toBe(6);
  expect(reuseIDManager.getID()).toBe(9);
  expect(reuseIDManager.getID()).toBe(12);

  now = 17;
  expect(reuseIDManager.getID()).toBe(1);
  expect(reuseIDManager.getID()).toBe(3);
  expect(reuseIDManager.getID()).toBe(8);
  expect(reuseIDManager.getID()).toBe(13);
});
