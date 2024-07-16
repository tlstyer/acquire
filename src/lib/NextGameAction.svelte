<svelte:options immutable />

<script lang="ts">
  import type { ActionBase } from '../common/gameActions/base';
  import { ActionDisposeOfShares } from '../common/gameActions/disposeOfShares';
  import { ActionGameOver } from '../common/gameActions/gameOver';
  import { ActionPlayTile } from '../common/gameActions/playTile';
  import { ActionPurchaseShares } from '../common/gameActions/purchaseShares';
  import { ActionSelectChainToDisposeOfNext } from '../common/gameActions/selectChainToDisposeOfNext';
  import { ActionSelectMergerSurvivor } from '../common/gameActions/selectMergerSurvivor';
  import { ActionSelectNewChain } from '../common/gameActions/selectNewChain';
  import { ActionStartGame } from '../common/gameActions/startGame';
  import NextGameActionHotelInitialsList from './children/NextGameActionHotelInitialsList.svelte';
  import HotelName from './HotelName.svelte';
  import Username from './Username.svelte';

  export let action: ActionBase;
</script>

{#if action instanceof ActionStartGame}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to start the game.
  </div>
{:else if action instanceof ActionPlayTile}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to play a tile.
  </div>
{:else if action instanceof ActionSelectNewChain}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to select new chain (<NextGameActionHotelInitialsList
      chains={action.availableChains}
    />).
  </div>
{:else if action instanceof ActionSelectMergerSurvivor}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to select merger survivor
    (<NextGameActionHotelInitialsList chains={action.chainsBySize[0]} />).
  </div>
{:else if action instanceof ActionSelectChainToDisposeOfNext}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to select chain to dispose
    of next (<NextGameActionHotelInitialsList chains={action.defunctChains} />).
  </div>
{:else if action instanceof ActionDisposeOfShares}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to dispose of <HotelName
      chain={action.defunctChain}
    /> shares.
  </div>
{:else if action instanceof ActionPurchaseShares}
  <div>
    Waiting for <Username username={action.game.usernames[action.playerID]} /> to purchase shares.
  </div>
{:else if action instanceof ActionGameOver}
  <div>Game over.</div>
{:else}
  <div>Unknown game status.</div>
{/if}

<style>
  div {
    font-weight: bold;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
