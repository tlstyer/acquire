<svelte:options immutable />

<script lang="ts">
  import { PB_GameMode } from '../common/pb';
  import { allGameModes, gameModeToString } from './helpers';

  export let gameMode: PB_GameMode = PB_GameMode.SINGLES_4;
  export let onSubmit: (gameMode: PB_GameMode) => void;
</script>

<div>
  Mode:
  <select bind:value={gameMode}>
    {#each allGameModes as gameMode}
      <option value={gameMode}>
        {gameModeToString.get(gameMode)}
      </option>
    {/each}
  </select>
  <input
    type="button"
    value="Create Game"
    on:click={() => {
      onSubmit(gameMode);
    }}
  />
</div>
