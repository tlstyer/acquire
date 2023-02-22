<script lang="ts">
	import { gameFromProtocolBuffer } from '../../../common/gameSerialization';
	import { PB_GameReview } from '../../../common/pb';
	import type { PageServerData } from './$types';
	import Game from './Game.svelte';

	export let data: PageServerData;

	const game = data.gamePBBinary
		? gameFromProtocolBuffer(PB_GameReview.fromBinary(new Uint8Array(data.gamePBBinary)))
		: undefined;
</script>

{#if game}
	<Game {game} />
{:else}
	Couldn't load game.
{/if}
