import { shallow } from 'enzyme';
import React from 'react';
import renderer from 'react-test-renderer';
import { PB_GameBoardType } from '../../common/pb';
import { configureEnzyme } from '../configureEnzyme';
import { TileRack } from './TileRack';

configureEnzyme();

test('renders correctly', () => {
  const onTileClicked = () => {
    // do nothing
  };

  const component = renderer.create(
    <TileRack
      tiles={[1, 28, 55, 82, 92, 40, 71, null, 99, 12, 8, 86, 38, 74]}
      types={[
        PB_GameBoardType.LUXOR,
        PB_GameBoardType.TOWER,
        PB_GameBoardType.AMERICAN,
        PB_GameBoardType.FESTIVAL,
        PB_GameBoardType.WORLDWIDE,
        PB_GameBoardType.CONTINENTAL,
        PB_GameBoardType.IMPERIAL,
        null,
        PB_GameBoardType.WILL_MERGE_CHAINS,
        PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN,
        PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO,
        PB_GameBoardType.CANT_PLAY_EVER,
        PB_GameBoardType.WILL_FORM_NEW_CHAIN,
        PB_GameBoardType.CANT_PLAY_NOW,
      ]}
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
    <TileRack tiles={[74]} types={[PB_GameBoardType.LUXOR]} buttonSize={40} keyboardShortcutsEnabled={false} onTileClicked={onTileClicked} />,
  );

  tileRack.find('input').simulate('click');

  expect(onTileClicked.mock.calls.length).toBe(1);
  expect(onTileClicked.mock.calls[0]).toEqual([74]);
});
