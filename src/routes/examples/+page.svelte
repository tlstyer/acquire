<script>
  import GameStatusExamples from './GameStatusExamples.svelte';
  import ScoreBoardExamples from './ScoreBoardExamples.svelte';
</script>

<div>
  <h1>LoginForm</h1>
  <h1>Header</h1>
  <h1>CreateGame</h1>
  <h1>GameListing</h1>
  <h1>GameSetupUI</h1>
  <h1>GameBoard</h1>
  <h1>ScoreBoard</h1>
  <ScoreBoardExamples />
  <h1>TileRack</h1>
  <h1>TileRackReadOnly</h1>
  <h1>SelectChain</h1>
  <h1>DisposeOfShares</h1>
  <h1>PurchaseShares</h1>
  <h1>GameHistory</h1>
  <h1>GameStatus</h1>
  <GameStatusExamples />
</div>

<style>
  div {
    margin-left: 25px;
    width: 600px;
  }

  .gameHistoryWrapper > div {
    height: 300px;
  }
</style>
