import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../enums';
import { getCssStyleForGameBoardType } from '../helpers';
import * as style from './GameBoard.css';

const yTileNames = 'ABCDEFGHI';

export const GameBoard = ({ gameBoard }: { gameBoard: List<GameBoardType> }) => {
    const rows = new Array(9);
    for (let y = 0; y < 9; y++) {
        const cells = new Array(12);
        for (let x = 0; x < 12; x++) {
            const gameBoardType = gameBoard.get(x * 9 + y, 0);
            const tileName = `${x + 1}${yTileNames[y]}`;
            cells[x] = (
                <td key={x} className={getCssStyleForGameBoardType(gameBoardType)}>
                    {tileName}
                </td>
            );
        }
        rows[y] = <tr key={y}>{cells}</tr>;
    }
    return (
        <table className={style.root}>
            <tbody>{rows}</tbody>
        </table>
    );
};
