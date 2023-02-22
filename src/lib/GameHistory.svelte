<svelte:options immutable />

<script lang="ts">
	import { afterUpdate } from 'svelte';
	import type { GameState } from '../common/game';
	import GameHistoryMessage from './children/GameHistoryMessage.svelte';

	export let usernames: string[];
	export let gameStateHistory: GameState[];
	export let selectedMove: number | undefined = undefined;
	export let keyboardShortcutsEnabled: boolean;
	export let onMoveSelected: (index: number) => void;

	let parentElement: HTMLDivElement | undefined;
	let moveElements: (HTMLDivElement | undefined)[] = [];

	let lastSelectedMove = -1;

	$: lastMoveIndex = gameStateHistory.length - 1;
	$: actualSelectedMove = selectedMove ?? lastMoveIndex;

	afterUpdate(() => {
		if (actualSelectedMove !== lastSelectedMove) {
			const selectedMoveElement = moveElements[actualSelectedMove];

			if (parentElement && selectedMoveElement) {
				// scroll so that selected move element is in view

				const parentScrollTop = parentElement.scrollTop;
				const parentScrollBottom = parentScrollTop + parentElement.clientHeight;

				const selectedMoveRelativeOffsetTop =
					selectedMoveElement.offsetTop - parentElement.offsetTop;
				const selectedMoveRelativeOffsetBottom =
					selectedMoveRelativeOffsetTop + selectedMoveElement.clientHeight;

				if (
					selectedMoveRelativeOffsetTop < parentScrollTop ||
					selectedMoveElement.clientHeight > parentElement.clientHeight
				) {
					parentElement.scrollTop = selectedMoveRelativeOffsetTop;
				} else if (selectedMoveRelativeOffsetBottom > parentScrollBottom) {
					parentElement.scrollTop = selectedMoveRelativeOffsetBottom - parentElement.clientHeight;
				}
			}

			lastSelectedMove = actualSelectedMove;
		}
	});

	function handleKeydown(event: KeyboardEvent) {
		if (keyboardShortcutsEnabled) {
			switch (event.key) {
				case 'ArrowLeft': {
					const nextSelectedMove = actualSelectedMove - 1;
					if (nextSelectedMove >= 0) {
						onMoveSelected(nextSelectedMove);
					}
					break;
				}
				case 'ArrowRight': {
					const nextSelectedMove = actualSelectedMove + 1;
					if (nextSelectedMove <= lastMoveIndex) {
						onMoveSelected(nextSelectedMove);
					}
					break;
				}
			}
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="root">
	<div>
		<button on:click={() => onMoveSelected(0)} disabled={actualSelectedMove === 0}>
			<!-- adapted from https://www.svgrepo.com/svg/391832/fast-backward -->
			<svg viewBox="0 0 120 120">
				<path d="M0,120V0h20v55L70,5v50l50-50v110L70,65v50L20,65v55H0z" />
			</svg>
		</button>
		<button
			on:click={() => onMoveSelected(Math.max(actualSelectedMove - 1, 0))}
			disabled={actualSelectedMove === 0}
		>
			<!-- adapted from https://www.svgrepo.com/svg/391700/step-backward -->
			<svg viewBox="0 0 120 120">
				<path d="M25,120V0h20v55L95,5v110L45,65v55H25z" />
			</svg>
		</button>
		<button
			on:click={() => onMoveSelected(Math.min(actualSelectedMove + 1, lastMoveIndex))}
			disabled={actualSelectedMove === lastMoveIndex}
		>
			<!-- adapted from https://www.svgrepo.com/svg/391701/step-forward -->
			<svg viewBox="0 0 120 120">
				<path d="M95,0v120H75V65l-50,50V5l50,50V0H95z" />
			</svg>
		</button>
		<button
			on:click={() => onMoveSelected(lastMoveIndex)}
			disabled={actualSelectedMove === lastMoveIndex}
		>
			<!-- adapted from https://www.svgrepo.com/svg/391834/fast-forward -->
			<svg viewBox="0 0 120 120">
				<path d="M120,0v120h-20V65l-50,50V65L0,115V5l50,50V5l50,50V0H120z" />
			</svg>
		</button>
	</div>
	<div class="messages" bind:this={parentElement}>
		{#each gameStateHistory as gameState, moveIndex}
			<div
				class="move"
				class:selected={moveIndex === selectedMove}
				bind:this={moveElements[moveIndex]}
				on:click={() => onMoveSelected(moveIndex)}
				on:keydown={undefined}
			>
				{#each gameState.gameHistoryMessages as gameHistoryMessageData}
					<GameHistoryMessage {usernames} {gameHistoryMessageData} />
				{/each}
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
