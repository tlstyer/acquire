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
  }[] = [
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: gameForGameHistory.gameStateHistory,
    },
    {
      usernames: game1.usernames,
      gameStateHistory: game1.gameStateHistory,
    },
    {
      usernames: game2.usernames,
      gameStateHistory: game2.gameStateHistory,
    },
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: [gameForGameHistory.gameStateHistory[0]],
    },
  ];

  return (
    <For each={allGameHistoryProps}>
      {(gameHistoryProps) => (
        <div class={styles.root}>
          <p />
          <div>
            <GameHistory
              usernames={gameHistoryProps.usernames}
              gameStateHistory={gameHistoryProps.gameStateHistory}
            />
          </div>
        </div>
      )}
    </For>
  );
}
