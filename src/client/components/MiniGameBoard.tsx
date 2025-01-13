import { For } from 'solid-js';
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
        <For each={props.gameBoard}>
          {(gameBoardRow) => (
            <tr>
              <For each={gameBoardRow}>
                {(gameBoardType) => <td class={gameBoardTypeToCSSClassName.get(gameBoardType)} />}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );
}
