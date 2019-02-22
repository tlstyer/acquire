import { shallow } from 'enzyme';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { GameBoardType } from '../../common/enums';
import { configureEnzyme } from '../configureEnzyme';
import { DisposeOfShares } from './DisposeOfShares';

configureEnzyme();

enum inputIndex {
  keepAll,
  tradeIncrement,
  tradeDecrement,
  tradeMax,
  sellIncrement,
  sellDecrement,
  sellMax,
  ok,
}

function getNewComponent(
  sharesOwnedInDefunctChain: number,
  sharesAvailableInControllingChain: number,
  onSharesDisposed: (traded: number, sold: number) => void,
) {
  return shallow(
    <DisposeOfShares
      defunctChain={GameBoardType.Imperial}
      controllingChain={GameBoardType.Tower}
      sharesOwnedInDefunctChain={sharesOwnedInDefunctChain}
      sharesAvailableInControllingChain={sharesAvailableInControllingChain}
      buttonSize={40}
      keyboardShortcutsEnabled={false}
      onSharesDisposed={onSharesDisposed}
    />,
  );
}

function clickInput(component: any, index: inputIndex) {
  component
    .find('input')
    .at(index)
    .simulate('click');
}

function expectValues(component: any, keepValue: number, tradeValue: number, sellValue: number) {
  const fieldsets = component.find('fieldset');
  expect(fieldsets.at(0).text()).toBe(`Keep${keepValue}`);
  expect(fieldsets.at(1).text()).toBe(`Trade${tradeValue}`);
  expect(fieldsets.at(2).text()).toBe(`Sell${sellValue}`);
}

test('renders correctly', () => {
  const onSharesDisposed = () => {
    // do nothing
  };

  const component = renderer.create(
    <DisposeOfShares
      defunctChain={GameBoardType.Imperial}
      controllingChain={GameBoardType.Tower}
      sharesOwnedInDefunctChain={7}
      sharesAvailableInControllingChain={2}
      buttonSize={40}
      keyboardShortcutsEnabled={false}
      onSharesDisposed={onSharesDisposed}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('works correctly', () => {
  const onSharesDisposed = jest.fn();
  const component = getNewComponent(7, 2, onSharesDisposed);

  expectValues(component, 7, 0, 0);
  clickInput(component, inputIndex.tradeIncrement);
  expectValues(component, 5, 2, 0);
  clickInput(component, inputIndex.tradeIncrement);
  expectValues(component, 3, 4, 0);
  clickInput(component, inputIndex.tradeIncrement);
  expectValues(component, 3, 4, 0);
  clickInput(component, inputIndex.ok);
  expect(onSharesDisposed.mock.calls.length).toBe(1);
  expect(onSharesDisposed.mock.calls[0]).toEqual([4, 0]);

  clickInput(component, inputIndex.keepAll);
  expectValues(component, 7, 0, 0);
  clickInput(component, inputIndex.tradeMax);
  expectValues(component, 3, 4, 0);
  clickInput(component, inputIndex.tradeIncrement);
  expectValues(component, 3, 4, 0);
  clickInput(component, inputIndex.sellMax);
  expectValues(component, 0, 4, 3);
  clickInput(component, inputIndex.ok);
  expect(onSharesDisposed.mock.calls.length).toBe(2);
  expect(onSharesDisposed.mock.calls[1]).toEqual([4, 3]);

  clickInput(component, inputIndex.keepAll);
  expectValues(component, 7, 0, 0);
  clickInput(component, inputIndex.sellIncrement);
  clickInput(component, inputIndex.sellIncrement);
  clickInput(component, inputIndex.sellIncrement);
  clickInput(component, inputIndex.sellIncrement);
  expectValues(component, 3, 0, 4);
  clickInput(component, inputIndex.tradeMax);
  expectValues(component, 1, 2, 4);
  clickInput(component, inputIndex.tradeIncrement);
  expectValues(component, 1, 2, 4);
  clickInput(component, inputIndex.sellMax);
  expectValues(component, 0, 2, 5);
  clickInput(component, inputIndex.ok);
  expect(onSharesDisposed.mock.calls.length).toBe(3);
  expect(onSharesDisposed.mock.calls[2]).toEqual([2, 5]);

  clickInput(component, inputIndex.keepAll);
  expectValues(component, 7, 0, 0);
  clickInput(component, inputIndex.sellMax);
  clickInput(component, inputIndex.sellDecrement);
  expectValues(component, 1, 0, 6);
  clickInput(component, inputIndex.tradeMax);
  expectValues(component, 1, 0, 6);
  clickInput(component, inputIndex.ok);
  expect(onSharesDisposed.mock.calls.length).toBe(4);
  expect(onSharesDisposed.mock.calls[3]).toEqual([0, 6]);

  clickInput(component, inputIndex.keepAll);
  expectValues(component, 7, 0, 0);
  clickInput(component, inputIndex.ok);
  expect(onSharesDisposed.mock.calls.length).toBe(5);
  expect(onSharesDisposed.mock.calls[4]).toEqual([0, 0]);
});
