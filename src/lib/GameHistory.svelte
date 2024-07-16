<svelte:options immutable />

<script lang="ts">
  import { afterUpdate } from 'svelte';
  import type { GameState } from '../common/gameState';
  import GameHistoryMessage from './children/GameHistoryMessage.svelte';

  export let usernames: string[];
  export let gameStateHistory: GameState[];
  export let selectedMove: number | undefined;
  export let onMoveSelected: (index: number) => void;

  let parentElement: HTMLDivElement | null = null;
  let moveElements: (HTMLDivElement | null)[] = [];

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
</script>

<div class="root" bind:this={parentElement}>
  {#each gameStateHistory as gameState, moveIndex}
    <div
      class="move"
      class:selected={moveIndex === selectedMove}
      title={gameState.timestamp !== null
        ? new Date(gameState.timestamp).toLocaleString()
        : undefined}
      bind:this={moveElements[moveIndex]}
      on:click={() => onMoveSelected(moveIndex)}
      on:keydown={undefined}
    >
      {#each gameState.gameHistoryMessages as gameHistoryMessage}
        <GameHistoryMessage {usernames} {gameHistoryMessage} />
      {/each}
    </div>
  {/each}
</div>

<style>
  .root {
    background-color: var(--scrolling-div-background-color);
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
