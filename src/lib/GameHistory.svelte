<svelte:options immutable />

<script lang="ts">
	import type { GameState } from '../common/game';
	import GameHistoryMessage from './children/GameHistoryMessage.svelte';

	export let usernames: string[];
	export let gameStateHistory: GameState[];
	export let selectedMove: number | undefined = undefined;
	export let onMoveClicked: (index: number) => void;
</script>

<div class="root">
	{#each gameStateHistory as gameState, moveIndex}
		<div>
			<div
				class="move"
				class:selected={moveIndex === selectedMove}
				on:click={() => onMoveClicked(moveIndex)}
				on:keydown={undefined}
			>
				{#each gameState.gameHistoryMessages as gameHistoryMessageData}
					<GameHistoryMessage {usernames} {gameHistoryMessageData} />
				{/each}
			</div>
		</div>
	{/each}
</div>

<style>
	.root {
		background-color: #c0c0ff;
		height: 100%;
		overflow-y: scroll;
	}

	.move {
		padding: 0 2px;
	}

	.move:hover {
		cursor: pointer;
	}

	.move:not(.selected):hover {
		background-color: #ffefc0;
	}

	.move.selected {
		background-color: #ffd0c0;
	}
</style>
