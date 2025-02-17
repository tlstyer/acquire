import { CreateGameExamples } from './CreateGameExamples.js';
import { DisposeOfSharesExamples } from './DisposeOfSharesExamples.js';
import {
  EnableKeyboardShortcutsButtonContext,
  makeEnableKeyboardShortcutsButtonContext,
} from './EnableKeyboardShortcutsButton.jsx';
import styles from './ExamplesPage.module.css';
import { GameBoardExamples } from './GameBoardExamples.js';
import { GameHistoryExamples } from './GameHistoryExamples.js';
import { GameListingExamples } from './GameListingExamples.js';
import { GameSetupUIExamples } from './GameSetupUIExamples.js';
import { NextGameActionExamples } from './NextGameActionExamples.js';
import { PurchaseSharesExamples } from './PurchaseSharesExamples.js';
import { ScoreBoardExamples } from './ScoreBoardExamples.js';
import { SelectChainExamples } from './SelectChainExamples.js';
import { TileRackExamples } from './TileRackExamples.js';
import { TileRackReadOnlyExamples } from './TileRackReadOnlyExamples.js';

export function ExamplesPage() {
  return (
    <EnableKeyboardShortcutsButtonContext.Provider
      value={makeEnableKeyboardShortcutsButtonContext()}
    >
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
        <h1>GameHistory</h1>
        <GameHistoryExamples />
        <h1>NextGameAction</h1>
        <NextGameActionExamples />
      </div>
    </EnableKeyboardShortcutsButtonContext.Provider>
  );
}
