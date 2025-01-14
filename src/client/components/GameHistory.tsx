import { For } from 'solid-js';
import { GameState } from '../../common/gameState';
import styles from './GameHistory.module.css';
import { GameHistoryMessageUI } from './GameHistoryMessageUI';

export function GameHistory(props: { usernames: string[]; gameStateHistory: GameState[] }) {
  return (
    <div class={styles.root}>
      <For each={props.gameStateHistory}>
        {(gameState) => (
          <div
            class={styles.move}
            title={
              gameState.timestamp !== null
                ? new Date(gameState.timestamp).toLocaleString()
                : undefined
            }
          >
            <For each={gameState.gameHistoryMessages}>
              {(gameHistoryMessage) => (
                <GameHistoryMessageUI
                  usernames={props.usernames}
                  gameHistoryMessage={gameHistoryMessage}
                />
              )}
            </For>
          </div>
        )}
      </For>
    </div>
  );
}
