import { CreateGameExamples } from './CreateGameExamples.jsx';
import { DisposeOfSharesExamples } from './DisposeOfSharesExamples.jsx';
import {
  EnableKeyboardShortcutsButtonContext,
  makeEnableKeyboardShortcutsButtonContext,
} from './EnableKeyboardShortcutsButton.jsx';
import * as styles from './ExamplesPage.module.css';
import { GameBoardExamples } from './GameBoardExamples.jsx';
import { GameHistoryExamples } from './GameHistoryExamples.jsx';
import { GameListingExamples } from './GameListingExamples.jsx';
import { GameSetupUIExamples } from './GameSetupUIExamples.jsx';
import { NextGameActionExamples } from './NextGameActionExamples.jsx';
import { PurchaseSharesExamples } from './PurchaseSharesExamples.jsx';
import { ScoreBoardExamples } from './ScoreBoardExamples.jsx';
import { SelectChainExamples } from './SelectChainExamples.jsx';
import { TileRackExamples } from './TileRackExamples.jsx';
import { TileRackReadOnlyExamples } from './TileRackReadOnlyExamples.jsx';

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
