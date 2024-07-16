<script lang="ts">
  import CreateGame from '$lib/CreateGame.svelte';
  import { PB_GameMode } from '../../common/pb';

  const allCreateGameProps = [
    { gameMode: PB_GameMode.SINGLES_4, onSubmit: onSubmitCreateGame },
    { gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2, onSubmit: onSubmitCreateGame },
    { gameMode: PB_GameMode.SINGLES_1, onSubmit: onSubmitCreateGame },
  ];

  function onSubmitCreateGame(gameMode: PB_GameMode) {
    console.log('onSubmitCreateGame:', gameMode);
  }
</script>

{#each allCreateGameProps as createGameProps}
  <p>
    <CreateGame gameMode={createGameProps.gameMode} onSubmit={createGameProps.onSubmit} />
  </p>
{/each}
