import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../common/enums';
import * as commonStyle from '../common.css';
import { gameBoardTypeToCSSClassName, getTileString } from '../helpers';
import * as style from './TileRack.css';

export interface TileRackProps {
    tiles: List<number | null>;
    types: List<GameBoardType | null>;
    buttonSize: number;
    onTileClicked: (tile: number) => void;
}

export class TileRack extends React.PureComponent<TileRackProps> {
    render() {
        const { tiles, types, buttonSize, onTileClicked } = this.props;

        let buttons = new Array(tiles.size);

        const buttonStyle = {
            width: buttonSize,
            height: buttonSize,
        };

        for (let i = 0; i < tiles.size; i++) {
            const tile = tiles.get(i, 0);
            const type = types.get(i, 0);

            if (tile !== null && type !== null) {
                const disabled = type === GameBoardType.CantPlayEver || type === GameBoardType.CantPlayNow;
                buttons[i] = (
                    <input
                        key={i}
                        type={'button'}
                        className={commonStyle.hotelButton + ' ' + gameBoardTypeToCSSClassName[type]}
                        style={buttonStyle}
                        value={getTileString(tile)}
                        disabled={disabled}
                        onClick={() => onTileClicked(tile)}
                    />
                );
            } else {
                buttons[i] = <input key={i} type={'button'} className={commonStyle.invisible} style={buttonStyle} value={'?'} />;
            }
        }

        return (
            <div className={style.root} style={{ fontSize: Math.floor(buttonSize * 0.4) }}>
                {buttons}
            </div>
        );
    }
}
