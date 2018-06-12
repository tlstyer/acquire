import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { GameBoardLabelMode } from '../enums';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getTileString } from '../helpers';
import * as style from './GameBoard.css';

const emptyTileRackSet = new Set();
let lastTileRack: List<number | null> | undefined;
let lastTileRackSet: Set<number> = emptyTileRackSet;

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

        let tileRackSet: Set<number>;
        if (tileRack === lastTileRack) {
            tileRackSet = lastTileRackSet;
        } else if (tileRack === undefined) {
            tileRackSet = emptyTileRackSet;
        } else {
            tileRackSet = new Set<number>();
            tileRack.forEach(tile => {
                if (tile !== null) {
                    tileRackSet.add(tile);
                }
            });
        }

        lastTileRack = tileRack;
        lastTileRackSet = tileRackSet;

        return (
            <table className={style.root} style={{ width: cellSize * 12 + 2, height: cellSize * 9 + 2, fontSize: Math.floor(cellSize * 0.4) }}>
                <tbody>
                    {gameBoard.map((gameBoardRow, y) => (
                        <GameBoardRow key={y} y={y} gameBoardRow={gameBoardRow} tileRackSet={tileRackSet} labelMode={labelMode} onCellClicked={onCellClicked} />
                    ))}
                </tbody>
            </table>
        );
    }
}

interface GameBoardRowProps {
    y: number;
    gameBoardRow: List<GameBoardType>;
    tileRackSet: Set<number>;
    labelMode: GameBoardLabelMode;
    onCellClicked?: (tile: number) => void;
}

class GameBoardRow extends React.PureComponent<GameBoardRowProps> {
    render() {
        const { y, gameBoardRow, tileRackSet, labelMode, onCellClicked } = this.props;

        return (
            <tr>
                {gameBoardRow.map((gameBoardType, x) => {
                    const tile = x * 9 + y;
                    if (tileRackSet.has(tile)) {
                        gameBoardType = GameBoardType.IHaveThis;
                    }

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

                    return (
                        <td key={x} className={className} {...optionalProps}>
                            {label}
                        </td>
                    );
                })}
            </tr>
        );
    }
}
