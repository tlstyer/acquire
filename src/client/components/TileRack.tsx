import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../enums';
import * as style from './TileRack.css';
import { getTileString, getCssStyleForGameBoardType } from '../helpers';

export function TileRack({ tiles, types, buttonSize }: { tiles: List<number | null>; types: List<GameBoardType | null>; buttonSize: number }) {
    let buttons = new Array(6);

    const buttonStyle = {
        width: buttonSize,
        height: buttonSize,
    };

    for (let i = 0; i < 6; i++) {
        const tile = tiles.get(i, 0);
        const type = types.get(i, 0);

        if (tile !== null && type !== null) {
            const disabled = type === GameBoardType.CantPlayEver || type === GameBoardType.CantPlayNow;
            buttons[i] = (
                <input
                    key={i}
                    type="button"
                    className={getCssStyleForGameBoardType(type)}
                    style={buttonStyle}
                    value={getTileString(tile)}
                    disabled={disabled}
                />
            );
        } else {
            buttons[i] = <input key={i} type="button" className={style.hidden} style={buttonStyle} value={'?'} />;
        }
    }

    return <div className={style.root}>{buttons}</div>;
}
