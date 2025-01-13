import { CreateGameExamples } from './CreateGameExamples';
import styles from './Examples.module.css';
import { GameBoardExamples } from './GameBoardExamples';
import { GameListingExamples } from './GameListingExamples';
import { ScoreBoardExamples } from './ScoreBoardExamples';

export function Examples() {
  return (
    <div class={styles.root}>
      <h1>CreateGame</h1>
      <CreateGameExamples />
      <h1>GameListing</h1>
      <GameListingExamples />
      <h1>GameBoard</h1>
      <GameBoardExamples />
      <h1>ScoreBoard</h1>
      <ScoreBoardExamples />
    </div>
  );
}
