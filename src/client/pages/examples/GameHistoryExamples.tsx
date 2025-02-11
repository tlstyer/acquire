import { createSignal, For } from 'solid-js';
import { type GameState } from '../../../common/gameState.js';
import { type User } from '../../../common/user.js';
import { GameHistory } from '../../components/GameHistory.js';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents.js';
import { EnableKeyboardShortcutsButton } from './EnableKeyboardShortcutsButton.js';
import styles from './GameHistoryExamples.module.css';
import { getExampleGame1, getExampleGame2, getExampleGameForGameHistory } from './games.js';

export function GameHistoryExamples() {
  const gameForGameHistory = getExampleGameForGameHistory();
  const game1 = getExampleGame1();
  const game2 = getExampleGame2();

  const allProps: {
    users: User[];
    gameStateHistory: GameState[];
    onMoveSelected: (index: number) => void;
  }[] = [
    {
      users: gameForGameHistory.users,
      gameStateHistory: gameForGameHistory.gameStateHistory,
      onMoveSelected,
    },
    {
      users: game1.users,
      gameStateHistory: game1.gameStateHistory,
      onMoveSelected,
    },
    {
      users: game2.users,
      gameStateHistory: game2.gameStateHistory,
      onMoveSelected,
    },
    {
      users: gameForGameHistory.users,
      gameStateHistory: [gameForGameHistory.gameStateHistory[0]],
      onMoveSelected,
    },
  ];

  function onMoveSelected(index: number) {
    console.log('onMoveSelected:', index);
  }

  return (
    <For each={allProps}>
      {(props) => {
        const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = createSignal(false);

        return (
          <>
            <p>
              <EnableKeyboardShortcutsButton onChangeEnabled={setKeyboardShortcutsEnabled} />
            </p>
            <div class={styles.gameHistoryWrapper}>
              <GameHistory
                ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
                users={props.users}
                gameStateHistory={props.gameStateHistory}
                onMoveSelected={props.onMoveSelected}
              />
            </div>
          </>
        );
      }}
    </For>
  );
}
