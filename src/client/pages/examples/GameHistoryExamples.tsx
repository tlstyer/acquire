import { createSignal, For } from 'solid-js';
import { type GameState } from '../../../common/gameState.js';
import { type User } from '../../../common/user.js';
import { GameHistory } from '../../components/GameHistory.jsx';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents.js';
import { EnableKeyboardShortcutsButton } from './EnableKeyboardShortcutsButton.jsx';
import styles from './GameHistoryExamples.module.css';
import {
  getExampleGame1,
  getExampleGame2,
  getExampleGame3,
  getExampleGameForGameHistory,
} from './games.js';

export function GameHistoryExamples() {
  const gameForGameHistory = getExampleGameForGameHistory();
  const game1 = getExampleGame1();
  const game2 = getExampleGame2();
  const game3 = getExampleGame3();

  const allProps: {
    users: User[];
    gameStateHistory: GameState[];
  }[] = [
    {
      users: gameForGameHistory.users,
      gameStateHistory: gameForGameHistory.gameStateHistory,
    },
    {
      users: game1.users,
      gameStateHistory: game1.gameStateHistory,
    },
    {
      users: game2.users,
      gameStateHistory: game2.gameStateHistory,
    },
    {
      users: game3.users,
      gameStateHistory: game3.gameStateHistory,
    },
    {
      users: gameForGameHistory.users,
      gameStateHistory: [gameForGameHistory.gameStateHistory[0]],
    },
  ];

  return (
    <For each={allProps}>
      {(props) => {
        const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = createSignal(false);
        const [selectedMoveIndex, setSelectedMoveIndex] = createSignal(
          props.gameStateHistory.length - 1,
        );

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
                selectedMoveIndex={selectedMoveIndex()}
                onMoveSelected={(index: number) => {
                  console.log('onMoveSelected:', index);
                  setSelectedMoveIndex(index);
                }}
              />
            </div>
          </>
        );
      }}
    </For>
  );
}
