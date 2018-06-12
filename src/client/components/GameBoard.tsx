import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { GameBoardLabelMode } from '../enums';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getTileString } from '../helpers';
import * as style from './GameBoard.css';

export interface GameBoardProps {
    gameBoard: List<List<GameBoardType>>;
    tileRack?: List<number | null>;
    labelMode: GameBoardLabelMode;
    cellSize: number;
    onCellClicked?: (tile: number) => void;
}

export class GameBoard extends React.PureComponent<GameBoardProps> {
    render() {
        const { gameBoard, tileRack, labelMode, cellSize, onCellClicked } = this.props;

        const myTiles = new Set<number>();
        if (tileRack) {
            for (let tileIndex = 0; tileIndex < 6; tileIndex++) {
                const tile = tileRack.get(tileIndex, 0);
                if (tile !== null) {
                    myTiles.add(tile);
                }
            }
        }

        const rows = new Array(9);
        for (let y = 0; y < 9; y++) {
            const cells = new Array(12);
            for (let x = 0; x < 12; x++) {
                const tile = x * 9 + y;
                const gameBoardType = myTiles.has(tile) ? GameBoardType.IHaveThis : gameBoard.get(tile % 9)!.get(tile / 9)!;

                let label;
                if (labelMode === GameBoardLabelMode.Coordinates) {
                    label = getTileString(tile);
                } else if (labelMode === GameBoardLabelMode.HotelInitials) {
                    if (gameBoardType === GameBoardType.Nothing || gameBoardType === GameBoardType.IHaveThis) {
                        label = getTileString(tile);
                    } else if (gameBoardType <= GameBoardType.Imperial) {
                        label = gameBoardTypeToHotelInitial.get(gameBoardType);
                    } else {
                        label = '';
                    }
                } else if (labelMode === GameBoardLabelMode.Nothing) {
                    if (gameBoardType === GameBoardType.Nothing || gameBoardType === GameBoardType.IHaveThis) {
                        label = getTileString(tile);
                    } else {
                        label = '';
                    }
                }

                let className = gameBoardTypeToCSSClassName.get(gameBoardType)!;

                const optionalProps: { [key: string]: any } = {};
                if (gameBoardType === GameBoardType.IHaveThis && onCellClicked) {
                    optionalProps.onClick = () => onCellClicked(tile);
                    className = `${className} ${style.clickable}`;
                }

                cells[x] = (
                    <td key={x} className={className} {...optionalProps}>
                        {label}
                    </td>
                );
            }
            rows[y] = <tr key={y}>{cells}</tr>;
        }

        return (
            <table className={style.root} style={{ width: cellSize * 12 + 2, height: cellSize * 9 + 2, fontSize: Math.floor(cellSize * 0.4) }}>
                <tbody>{rows}</tbody>
            </table>
        );
    }
}
