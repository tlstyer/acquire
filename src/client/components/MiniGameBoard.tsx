import { Index } from 'solid-js';
import { PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToCSSClassName } from '../helpers';
import styles from './MiniGameBoard.module.css';

export function MiniGameBoard(props: { gameBoard: PB_GameBoardType[][]; cellSize: number }) {
  return (
    <table
      class={styles.root}
      style={{ width: `${props.cellSize * 12 + 1}px`, height: `${props.cellSize * 9 + 1}px` }}
    >
      <tbody>
        <Index each={props.gameBoard}>
          {(gameBoardRow) => (
            <tr>
              <Index each={gameBoardRow()}>
                {(gameBoardType) => <td class={gameBoardTypeToCSSClassName.get(gameBoardType())} />}
              </Index>
            </tr>
          )}
        </Index>
      </tbody>
    </table>
  );
}
