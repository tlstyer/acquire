import { CreateGameExamples } from './CreateGameExamples';
import styles from './Examples.module.css';
import { GameBoardExamples } from './GameBoardExamples';
import { GameListingExamples } from './GameListingExamples';
import { GameSetupUIExamples } from './GameSetupUIExamples';
import { ScoreBoardExamples } from './ScoreBoardExamples';
import { TileRackExamples } from './TileRackExamples';
import { TileRackReadOnlyExamples } from './TileRackReadOnlyExamples';

export function Examples() {
  return (
    <div class={styles.root}>
      <h1>CreateGame</h1>
      <CreateGameExamples />
      <h1>GameListing</h1>
      <GameListingExamples />
      <h1>GameSetupUI</h1>
      <GameSetupUIExamples />
      <h1>GameBoard</h1>
      <GameBoardExamples />
      <h1>ScoreBoard</h1>
      <ScoreBoardExamples />
      <h1>TileRack</h1>
      <TileRackExamples />
      <h1>TileRackReadOnly</h1>
      <TileRackReadOnlyExamples />
    </div>
  );
}
