import * as commonStyle from '../common.scss';
import * as style from './TileRackReadOnly.scss';

import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { gameBoardTypeToCSSClassName, getTileString } from '../helpers';

export interface TileRackReadOnlyProps {
  tiles: List<number | null>;
  types: List<GameBoardType | null>;
  buttonSize: number;
}

export class TileRackReadOnly extends React.PureComponent<TileRackReadOnlyProps> {
  render() {
    const { tiles, types, buttonSize } = this.props;

    const buttonStyle = {
      width: buttonSize,
      minWidth: buttonSize,
      height: buttonSize,
      minHeight: buttonSize,
    };

    return (
      <div className={style.root} style={{ fontSize: Math.floor(buttonSize * 0.4) }}>
        {tiles.map((tile, i) => {
          const type = types.get(i, null);

          if (tile !== null && type !== null) {
            return (
              <div key={i} className={`${style.button} ${gameBoardTypeToCSSClassName.get(type)}`} style={buttonStyle}>
                <div>{getTileString(tile)}</div>
              </div>
            );
          } else {
            return (
              <div key={i} className={`${style.button} ${commonStyle.invisible}`} style={buttonStyle}>
                ?
              </div>
            );
          }
        })}
      </div>
    );
  }
}
