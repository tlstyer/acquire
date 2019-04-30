import * as style from './MiniGameBoard.scss';

import { List } from 'immutable';
import * as React from 'react';
import { GameBoardType } from '../../common/enums';
import { gameBoardTypeToCSSClassName } from '../helpers';

interface MiniGameBoardProps {
  gameBoard: List<List<GameBoardType>>;
  cellSize: number;
}

export class MiniGameBoard extends React.PureComponent<MiniGameBoardProps> {
  render() {
    const { gameBoard, cellSize } = this.props;

    return (
      <table className={style.root} style={{ width: cellSize * 12 + 1, height: cellSize * 9 + 1 }}>
        <tbody>
          {gameBoard.map((gameBoardRow, y) => (
            <MiniGameBoardRow key={y} gameBoardRow={gameBoardRow} />
          ))}
        </tbody>
      </table>
    );
  }
}

interface MiniGameBoardRowProps {
  gameBoardRow: List<GameBoardType>;
}

class MiniGameBoardRow extends React.PureComponent<MiniGameBoardRowProps> {
  render() {
    const { gameBoardRow } = this.props;

    return (
      <tr>
        {gameBoardRow.map((gameBoardType, x) => {
          return <td key={x} className={gameBoardTypeToCSSClassName.get(gameBoardType)!} />;
        })}
      </tr>
    );
  }
}
