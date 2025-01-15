import { For } from 'solid-js';
import { GameState } from '../../../common/gameState';
import { GameHistory } from '../../components/GameHistory';
import styles from './GameHistoryExamples.module.css';
import { getExampleGame1, getExampleGame2, getExampleGameForGameHistory } from './games';

export function GameHistoryExamples() {
  const gameForGameHistory = getExampleGameForGameHistory();
  const game1 = getExampleGame1();
  const game2 = getExampleGame2();

  const allGameHistoryProps: {
    usernames: string[];
    gameStateHistory: GameState[];
    onMoveSelected: (index: number) => void;
  }[] = [
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: gameForGameHistory.gameStateHistory,
      onMoveSelected,
    },
    {
      usernames: game1.usernames,
      gameStateHistory: game1.gameStateHistory,
      onMoveSelected,
    },
    {
      usernames: game2.usernames,
      gameStateHistory: game2.gameStateHistory,
      onMoveSelected,
    },
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: [gameForGameHistory.gameStateHistory[0]],
      onMoveSelected,
    },
  ];

  function onMoveSelected(index: number) {
    console.log('onMoveSelected:', index);
  }

  return (
    <For each={allGameHistoryProps}>
      {(gameHistoryProps) => (
        <div class={styles.gameHistoryWrapper}>
          <GameHistory
            usernames={gameHistoryProps.usernames}
            gameStateHistory={gameHistoryProps.gameStateHistory}
            onMoveSelected={gameHistoryProps.onMoveSelected}
          />
        </div>
      )}
    </For>
  );
}
