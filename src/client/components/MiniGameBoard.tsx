import { List } from 'immutable';
import * as React from 'react';
import { PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToCSSClassName } from '../helpers';
import * as style from './MiniGameBoard.scss';

interface MiniGameBoardProps {
  gameBoard: List<List<PB_GameBoardType>>;
  cellSize: number;
}

export const MiniGameBoard = React.memo(function MiniGameBoard({ gameBoard, cellSize }: MiniGameBoardProps) {
  return (
    <table className={style.root} style={{ width: cellSize * 12 + 1, height: cellSize * 9 + 1 }}>
      <tbody>
        {gameBoard.map((gameBoardRow, y) => (
          <MiniGameBoardRow key={y} gameBoardRow={gameBoardRow} />
        ))}
      </tbody>
    </table>
  );
});

interface MiniGameBoardRowProps {
  gameBoardRow: List<PB_GameBoardType>;
}

const MiniGameBoardRow = React.memo(function MiniGameBoardRow({ gameBoardRow }: MiniGameBoardRowProps) {
  return (
    <tr>
      {gameBoardRow.map((gameBoardType, x) => {
        return <td key={x} className={gameBoardTypeToCSSClassName.get(gameBoardType)!} />;
      })}
    </tr>
  );
});
