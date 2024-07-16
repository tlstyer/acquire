<script>
  import CreateGameExamples from './CreateGameExamples.svelte';
  import DisposeOfSharesExamples from './DisposeOfSharesExamples.svelte';
  import GameBoardExamples from './GameBoardExamples.svelte';
  import GameListingExamples from './GameListingExamples.svelte';
  import GameNavigationButtonsAndGameHistoryExamples from './GameNavigationButtonsAndGameHistoryExamples.svelte';
  import GameSetupUIExamples from './GameSetupUIExamples.svelte';
  import NextGameActionExamples from './NextGameActionExamples.svelte';
  import PurchaseSharesExamples from './PurchaseSharesExamples.svelte';
  import ScoreBoardExamples from './ScoreBoardExamples.svelte';
  import SelectChainExamples from './SelectChainExamples.svelte';
  import TileRackExamples from './TileRackExamples.svelte';
  import TileRackReadOnlyExamples from './TileRackReadOnlyExamples.svelte';
</script>

<div>
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
  <h1>GameNavigationButtons and GameHistory</h1>
  <GameNavigationButtonsAndGameHistoryExamples />
  <h1>NextGameAction</h1>
  <NextGameActionExamples />
</div>

<style>
  div {
    margin-left: 25px;
    width: 600px;
  }
</style>
