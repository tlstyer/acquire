import { CreateGameExamples } from './CreateGameExamples';
import styles from './Examples.module.css';
import { GameBoardExamples } from './GameBoardExamples';
import { ScoreBoardExamples } from './ScoreBoardExamples';

export function Examples() {
  return (
    <div class={styles.root}>
      <h1>CreateGame</h1>
      <CreateGameExamples />
      <h1>GameBoard</h1>
      <GameBoardExamples />
      <h1>ScoreBoard</h1>
      <ScoreBoardExamples />
    </div>
  );
}
