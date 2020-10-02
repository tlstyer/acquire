import * as commonStyle from '../common.scss';
import * as style from './TileRack.scss';

import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { gameBoardTypeToCSSClassName, getTileString } from '../helpers';

export interface TileRackProps {
  tiles: List<number | null>;
  types: List<GameBoardType | null>;
  buttonSize: number;
  keyboardShortcutsEnabled: boolean;
  onTileClicked: (tile: number) => void;
}

const keyboardShortcutToTileIndex = new Map([
  ['1', 0],
  ['2', 1],
  ['3', 2],
  ['4', 3],
  ['5', 4],
  ['6', 5],
]);

export class TileRack extends React.Component<TileRackProps> {
  buttonRefs: React.RefObject<HTMLInputElement>[];

  constructor(props: TileRackProps) {
    super(props);

    this.buttonRefs = new Array(6);
    for (let i = 0; i < 6; i++) {
      this.buttonRefs[i] = React.createRef();
    }
  }

  shouldComponentUpdate(nextProps: TileRackProps) {
    // everything except keyboardShortcutsEnabled
    return (
      nextProps.tiles !== this.props.tiles ||
      nextProps.types !== this.props.types ||
      nextProps.buttonSize !== this.props.buttonSize ||
      nextProps.onTileClicked !== this.props.onTileClicked
    );
  }

  componentDidMount() {
    window.addEventListener('keydown', this.onWindowKeydown);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onWindowKeydown);
  }

  onWindowKeydown = (event: KeyboardEvent) => {
    if (!this.props.keyboardShortcutsEnabled) {
      return;
    }

    const keyName = event.key;

    if (keyboardShortcutToTileIndex.has(keyName)) {
      const tileIndex = keyboardShortcutToTileIndex.get(keyName)!;
      const button = this.buttonRefs[tileIndex].current;
      if (button !== null) {
        button.focus();
      }
    }
  };

  render() {
    const { tiles, types, buttonSize, onTileClicked } = this.props;

    const buttonStyle = {
      width: buttonSize,
      height: buttonSize,
    };

    return (
      <div className={style.root} style={{ fontSize: Math.floor(buttonSize * 0.4) }}>
        {tiles.map((tile, i) => {
          const type = types.get(i, null);

          if (tile !== null && type !== null) {
            const disabled = type === GameBoardType.CantPlayEver || type === GameBoardType.CantPlayNow;
            return (
              <input
                key={i}
                type={'button'}
                className={`${commonStyle.hotelButton} ${gameBoardTypeToCSSClassName.get(type)}`}
                style={buttonStyle}
                value={getTileString(tile)}
                disabled={disabled}
                ref={this.buttonRefs[i]}
                onClick={() => onTileClicked(tile)}
              />
            );
          } else {
            return <input key={i} type={'button'} className={commonStyle.invisible} style={buttonStyle} value={'?'} ref={this.buttonRefs[i]} />;
          }
        })}
      </div>
    );
  }
}
