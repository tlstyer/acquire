import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { gameBoardTypeToCSSClassName } from '../helpers';
import * as style from './MiniGameBoard.css';

interface MiniGameBoardProps {
    gameBoard: List<GameBoardType>;
    cellSize: number;
}

export class MiniGameBoard extends React.PureComponent<MiniGameBoardProps> {
    render() {
        const { gameBoard, cellSize } = this.props;

        const rows = new Array(9);
        for (let y = 0; y < 9; y++) {
            const cells = new Array(12);
            for (let x = 0; x < 12; x++) {
                const tile = x * 9 + y;
                const gameBoardType = gameBoard.get(tile, 0);

                cells[x] = <td key={x} className={gameBoardTypeToCSSClassName.get(gameBoardType)} />;
            }
            rows[y] = <tr key={y}>{cells}</tr>;
        }

        return (
            <table className={style.root} style={{ width: cellSize * 12 + 1, height: cellSize * 9 + 1 }}>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}
