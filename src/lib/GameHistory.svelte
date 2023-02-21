<svelte:options immutable />

<script lang="ts">
	import type { GameState } from '../common/game';
	import GameHistoryMessage from './children/GameHistoryMessage.svelte';

	export let usernames: string[];
	export let gameStateHistory: GameState[];
	export let selectedMove: number | undefined = undefined;
	export let onMoveClicked: (index: number) => void;

	$: lastMoveIndex = gameStateHistory.length - 1;
	$: actualSelectedMove = selectedMove ?? lastMoveIndex;
</script>

<div class="root">
	<div>
		<button on:click={() => onMoveClicked(0)} disabled={actualSelectedMove === 0}>
			<!-- adapted from https://www.svgrepo.com/svg/391832/fast-backward -->
			<svg viewBox="0 0 120 120">
				<path d="M0,120V0h20v55L70,5v50l50-50v110L70,65v50L20,65v55H0z" />
			</svg>
		</button>
		<button
			on:click={() => onMoveClicked(Math.max(actualSelectedMove - 1, 0))}
			disabled={actualSelectedMove === 0}
		>
			<!-- adapted from https://www.svgrepo.com/svg/391700/step-backward -->
			<svg viewBox="0 0 120 120">
				<path d="M25,120V0h20v55L95,5v110L45,65v55H25z" />
			</svg>
		</button>
		<button
			on:click={() => onMoveClicked(Math.min(actualSelectedMove + 1, lastMoveIndex))}
			disabled={actualSelectedMove === lastMoveIndex}
		>
			<!-- adapted from https://www.svgrepo.com/svg/391701/step-forward -->
			<svg viewBox="0 0 120 120">
				<path d="M95,0v120H75V65l-50,50V5l50,50V0H95z" />
			</svg>
		</button>
		<button
			on:click={() => onMoveClicked(lastMoveIndex)}
			disabled={actualSelectedMove === lastMoveIndex}
		>
			<!-- adapted from https://www.svgrepo.com/svg/391834/fast-forward -->
			<svg viewBox="0 0 120 120">
				<path d="M120,0v120h-20V65l-50,50V65L0,115V5l50,50V5l50,50V0H120z" />
			</svg>
		</button>
	</div>
	<div class="messages">
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
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	svg {
		display: block;
		width: 16px;
		height: 16px;
	}

	button:disabled svg {
		fill: #808080;
	}

	.messages {
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
