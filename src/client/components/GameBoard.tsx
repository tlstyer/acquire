import { List } from 'immutable';
import React from 'react';
import { PB_GameBoardType } from '../../common/pb';
import { GameBoardLabelMode } from '../enums';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getTileString } from '../helpers';
import * as style from './GameBoard.scss';

export interface GameBoardProps {
  gameBoard: List<List<PB_GameBoardType>>;
  tileRack?: List<number | null>;
  labelMode: GameBoardLabelMode;
  cellSize: number;
  onCellClicked?: (tile: number) => void;
}

export const GameBoard = React.memo(function GameBoard({ gameBoard, tileRack, labelMode, cellSize, onCellClicked }: GameBoardProps) {
  const tileRackRowBitMasks = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  if (tileRack) {
    tileRack.forEach((tile) => {
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
});

interface GameBoardRowProps {
  y: number;
  gameBoardRow: List<PB_GameBoardType>;
  tileRackRowBitMask: number;
  labelMode: GameBoardLabelMode;
  onCellClicked?: (tile: number) => void;
}

const GameBoardRow = React.memo(function GameBoardRow({ y, gameBoardRow, tileRackRowBitMask, labelMode, onCellClicked }: GameBoardRowProps) {
  return (
    <tr>
      {gameBoardRow.map((gameBoardType, x) => {
        if (((tileRackRowBitMask >> x) & 1) === 1) {
          gameBoardType = PB_GameBoardType.I_HAVE_THIS;
        }

        const tile = x * 9 + y;

        let label;
        if (labelMode === GameBoardLabelMode.Coordinates) {
          label = getTileString(tile);
        } else if (labelMode === GameBoardLabelMode.HotelInitials) {
          if (gameBoardType === PB_GameBoardType.NOTHING || gameBoardType === PB_GameBoardType.I_HAVE_THIS) {
            label = getTileString(tile);
          } else if (gameBoardType <= PB_GameBoardType.IMPERIAL) {
            label = gameBoardTypeToHotelInitial.get(gameBoardType);
          } else {
            label = '\u00a0';
          }
        } else if (labelMode === GameBoardLabelMode.Nothing) {
          if (gameBoardType === PB_GameBoardType.NOTHING || gameBoardType === PB_GameBoardType.I_HAVE_THIS) {
            label = getTileString(tile);
          } else {
            label = '\u00a0';
          }
        }

        let className = gameBoardTypeToCSSClassName.get(gameBoardType)!;

        const optionalProps: { [key: string]: any } = {};
        if (gameBoardType === PB_GameBoardType.I_HAVE_THIS && onCellClicked) {
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
});
