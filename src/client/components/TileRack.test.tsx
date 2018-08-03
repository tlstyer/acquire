import { shallow } from 'enzyme';
import { List } from 'immutable';
import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { GameBoardType } from '../../common/enums';
import { configureEnzyme } from '../configureEnzyme';
import { TileRack } from './TileRack';

configureEnzyme();

describe('TileRack', () => {
  it('renders correctly', () => {
    // tslint:disable-next-line:no-empty
    const onTileClicked = (tile: number) => {};

    const component = renderer.create(
      <TileRack
        tiles={List([1, 28, 55, 82, 92, 40, 71, null, 99, 12, 8, 86, 38, 74])}
        types={List([
          GameBoardType.Luxor,
          GameBoardType.Tower,
          GameBoardType.American,
          GameBoardType.Festival,
          GameBoardType.Worldwide,
          GameBoardType.Continental,
          GameBoardType.Imperial,
          null,
          GameBoardType.WillMergeChains,
          GameBoardType.WillPutLonelyTileDown,
          GameBoardType.HaveNeighboringTileToo,
          GameBoardType.CantPlayEver,
          GameBoardType.WillFormNewChain,
          GameBoardType.CantPlayNow,
        ])}
        buttonSize={40}
        keyboardShortcutsEnabled={false}
        onTileClicked={onTileClicked}
      />,
    );
    const tree = component.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onTileClicked with tile', () => {
    const onTileClicked = jest.fn();
    const tileRack = shallow(
      <TileRack tiles={List([74])} types={List([GameBoardType.Luxor])} buttonSize={40} keyboardShortcutsEnabled={false} onTileClicked={onTileClicked} />,
    );

    tileRack.find('input').simulate('click');

    expect(onTileClicked.mock.calls.length).toBe(1);
    expect(onTileClicked.mock.calls[0]).toEqual([74]);
  });
});
