<svelte:options immutable />

<script lang="ts">
  import type { GameState } from '../common/gameState';
  import { keyboardEventToKeysAlsoPressed } from './helpers';

  export let gameStateHistory: GameState[];
  export let selectedMove: number | undefined;
  export let keyboardShortcutsEnabled: boolean;
  export let onMoveSelected: (index: number) => void;

  $: lastMoveIndex = gameStateHistory.length - 1;
  $: actualSelectedMove = selectedMove ?? lastMoveIndex;

  let fastBackwardButton: HTMLButtonElement | null = null;
  let stepBackwardButton: HTMLButtonElement | null = null;
  let stepForwardButton: HTMLButtonElement | null = null;
  let fastForwardButton: HTMLButtonElement | null = null;

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardShortcutsEnabled) {
      if (keyboardEventToKeysAlsoPressed(event) === 0) {
        if (event.code === 'ArrowUp' || event.code === 'Home') {
          fastBackwardButton?.click();
          event.preventDefault();
        } else if (event.code === 'ArrowLeft') {
          stepBackwardButton?.click();
          event.preventDefault();
        } else if (event.code === 'ArrowRight') {
          stepForwardButton?.click();
          event.preventDefault();
        } else if (event.code === 'ArrowDown' || event.code === 'End') {
          fastForwardButton?.click();
          event.preventDefault();
        }
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div>
  <button
    bind:this={fastBackwardButton}
    on:click={() => onMoveSelected(0)}
    disabled={actualSelectedMove === 0}
  >
    <!-- adapted from https://www.svgrepo.com/svg/391832/fast-backward -->
    <svg viewBox="0 0 120 120">
      <path d="M0,120V0h20v55L70,5v50l50-50v110L70,65v50L20,65v55H0z" />
    </svg>
  </button>
  <button
    bind:this={stepBackwardButton}
    on:click={() => onMoveSelected(Math.max(actualSelectedMove - 1, 0))}
    disabled={actualSelectedMove === 0}
  >
    <!-- adapted from https://www.svgrepo.com/svg/391700/step-backward -->
    <svg viewBox="0 0 120 120">
      <path d="M25,120V0h20v55L95,5v110L45,65v55H25z" />
    </svg>
  </button>
  <button
    bind:this={stepForwardButton}
    on:click={() => onMoveSelected(Math.min(actualSelectedMove + 1, lastMoveIndex))}
    disabled={actualSelectedMove === lastMoveIndex}
  >
    <!-- adapted from https://www.svgrepo.com/svg/391701/step-forward -->
    <svg viewBox="0 0 120 120">
      <path d="M95,0v120H75V65l-50,50V5l50,50V0H95z" />
    </svg>
  </button>
  <button
    bind:this={fastForwardButton}
    on:click={() => onMoveSelected(lastMoveIndex)}
    disabled={actualSelectedMove === lastMoveIndex}
  >
    <!-- adapted from https://www.svgrepo.com/svg/391834/fast-forward -->
    <svg viewBox="0 0 120 120">
      <path d="M120,0v120h-20V65l-50,50V65L0,115V5l50,50V5l50,50V0H120z" />
    </svg>
  </button>
</div>

<style>
  svg {
    display: block;
    width: 16px;
    height: 16px;
  }

  button:disabled svg {
    fill: #808080;
  }
</style>
