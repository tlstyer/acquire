import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { GameBoardLabelMode } from '../enums';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getTileString } from '../helpers';
import * as style from './GameBoard.scss';

/* tslint:disable:no-bitwise */

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

    const tileRackRowBitMasks = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (tileRack) {
      tileRack.forEach(tile => {
        if (tile !== null) {
          const y = tile % 9;
          const x = tile / 9;
          tileRackRowBitMasks[y] |= 1 << x;
        }
      });
    }

    return (
      <table className={style.root} style={{ width: cellSize * 12 + 2, height: cellSize * 9 + 2, fontSize: Math.floor(cellSize * 0.4) }}>
        <tbody>
          {gameBoard.map((gameBoardRow, y) => (
            <GameBoardRow
              key={y}
              y={y}
              gameBoardRow={gameBoardRow}
              tileRackRowBitMask={tileRackRowBitMasks[y]}
              labelMode={labelMode}
              onCellClicked={onCellClicked}
            />
          ))}
        </tbody>
      </table>
    );
  }
}

interface GameBoardRowProps {
  y: number;
  gameBoardRow: List<GameBoardType>;
  tileRackRowBitMask: number;
  labelMode: GameBoardLabelMode;
  onCellClicked?: (tile: number) => void;
}

class GameBoardRow extends React.PureComponent<GameBoardRowProps> {
  render() {
    const { y, gameBoardRow, tileRackRowBitMask, labelMode, onCellClicked } = this.props;

    return (
      <tr>
        {gameBoardRow.map((gameBoardType, x) => {
          if (((tileRackRowBitMask >> x) & 1) === 1) {
            gameBoardType = GameBoardType.IHaveThis;
          }

          const tile = x * 9 + y;

          let label;
          if (labelMode === GameBoardLabelMode.Coordinates) {
            label = getTileString(tile);
          } else if (labelMode === GameBoardLabelMode.HotelInitials) {
            if (gameBoardType === GameBoardType.Nothing || gameBoardType === GameBoardType.IHaveThis) {
              label = getTileString(tile);
            } else if (gameBoardType <= GameBoardType.Imperial) {
              label = gameBoardTypeToHotelInitial.get(gameBoardType);
            } else {
              label = '\u00a0';
            }
          } else if (labelMode === GameBoardLabelMode.Nothing) {
            if (gameBoardType === GameBoardType.Nothing || gameBoardType === GameBoardType.IHaveThis) {
              label = getTileString(tile);
            } else {
              label = '\u00a0';
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
