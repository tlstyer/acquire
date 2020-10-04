import { shallow } from 'enzyme';
import { List } from 'immutable';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { GameBoardType } from '../../common/pb';
import { configureEnzyme } from '../configureEnzyme';
import { TileRack } from './TileRack';

configureEnzyme();

test('renders correctly', () => {
  const onTileClicked = () => {
    // do nothing
  };

  const component = renderer.create(
    <TileRack
      tiles={List([1, 28, 55, 82, 92, 40, 71, null, 99, 12, 8, 86, 38, 74])}
      types={List([
        GameBoardType.LUXOR,
        GameBoardType.TOWER,
        GameBoardType.AMERICAN,
        GameBoardType.FESTIVAL,
        GameBoardType.WORLDWIDE,
        GameBoardType.CONTINENTAL,
        GameBoardType.IMPERIAL,
        null,
        GameBoardType.WILL_MERGE_CHAINS,
        GameBoardType.WILL_PUT_LONELY_TILE_DOWN,
        GameBoardType.HAVE_NEIGHBORING_TILE_TOO,
        GameBoardType.CANT_PLAY_EVER,
        GameBoardType.WILL_FORM_NEW_CHAIN,
        GameBoardType.CANT_PLAY_NOW,
      ])}
      buttonSize={40}
      keyboardShortcutsEnabled={false}
      onTileClicked={onTileClicked}
    />,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});

test('calls onTileClicked with tile', () => {
  const onTileClicked = jest.fn();
  const tileRack = shallow(
    <TileRack tiles={List([74])} types={List([GameBoardType.LUXOR])} buttonSize={40} keyboardShortcutsEnabled={false} onTileClicked={onTileClicked} />,
  );

  tileRack.find('input').simulate('click');

  expect(onTileClicked.mock.calls.length).toBe(1);
  expect(onTileClicked.mock.calls[0]).toEqual([74]);
});
