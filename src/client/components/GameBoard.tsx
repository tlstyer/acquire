import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType } from '../../enums';
import { getCssStyleForGameBoardType } from '../helpers';
import * as style from './GameBoard.css';

const yTileNames = 'ABCDEFGHI';

export function GameBoard({ gameBoard, tileRack }: { gameBoard: List<GameBoardType>; tileRack: List<number | null> }) {
    let myTiles: { [key: number]: boolean } = {};
    for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
        const tile = tileRack.get(tileIndex, 0);
        if (tile !== null) {
            myTiles[tile] = true;
        }
    }

    const rows = new Array(9);
    for (let y = 0; y < 9; y++) {
        const cells = new Array(12);
        for (let x = 0; x < 12; x++) {
            const tile = x * 9 + y;
            const gameBoardType = myTiles[tile] ? GameBoardType.IHaveThis : gameBoard.get(tile, 0);
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
}
