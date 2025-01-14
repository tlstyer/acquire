import { CreateGameExamples } from './CreateGameExamples';
import { DisposeOfSharesExamples } from './DisposeOfSharesExamples';
import styles from './Examples.module.css';
import { GameBoardExamples } from './GameBoardExamples';
import { GameListingExamples } from './GameListingExamples';
import { GameSetupUIExamples } from './GameSetupUIExamples';
import { NextGameActionExamples } from './NextGameActionExamples';
import { PurchaseSharesExamples } from './PurchaseSharesExamples';
import { ScoreBoardExamples } from './ScoreBoardExamples';
import { SelectChainExamples } from './SelectChainExamples';
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
      <h1>SelectChain</h1>
      <SelectChainExamples />
      <h1>DisposeOfShares</h1>
      <DisposeOfSharesExamples />
      <h1>PurchaseShares</h1>
      <PurchaseSharesExamples />
      <h1>NextGameAction</h1>
      <NextGameActionExamples />
    </div>
  );
}
