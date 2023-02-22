<script lang="ts">
	import { PB_GameMode } from '$common/pb';
	import CreateGame from '$lib/CreateGame.svelte';

	const allCreateGameProps = [
		{ onSubmit: onSubmitCreateGame },
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
