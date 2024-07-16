<svelte:options immutable />

<script lang="ts" context="module">
  export enum SelectChainTitle {
    SelectNewChain,
    SelectMergerSurvivor,
    SelectChainToDisposeOfNext,
  }

  const typeToInstructions = new Map([
    [SelectChainTitle.SelectNewChain, 'New chain'],
    [SelectChainTitle.SelectMergerSurvivor, 'Merger survivor'],
    [SelectChainTitle.SelectChainToDisposeOfNext, 'Chain to dispose of next'],
  ]);
</script>

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import {
    allChains,
    gameBoardTypeToCSSClassName,
    gameBoardTypeToHotelInitial,
    keyboardEventCodeToGameBoardType,
    keyboardEventToKeysAlsoPressed,
  } from './helpers';

  export let type: SelectChainTitle;
  export let availableChains: PB_GameBoardType[];
  export let buttonSize: number;
  export let keyboardShortcutsEnabled: boolean;
  export let onChainSelected: (chain: PB_GameBoardType) => void;

  const inputs: (HTMLInputElement | null)[] = new Array(allChains.length);
  inputs.fill(null);

  $: buttonStyle = `width: ${buttonSize}px; height: ${buttonSize}px`;

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardShortcutsEnabled) {
      const gameBoardType = keyboardEventCodeToGameBoardType.get(event.code);

      if (gameBoardType !== undefined && keyboardEventToKeysAlsoPressed(event) === 0) {
        inputs[gameBoardType]?.focus();

        event.preventDefault();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div>
  <fieldset style="font-size: {Math.floor(buttonSize * 0.4)}px">
    <legend>{typeToInstructions.get(type)}</legend>
    {#each allChains as chain}
      {#if availableChains.indexOf(chain) >= 0}
        <input
          type="button"
          class="hotelButton {gameBoardTypeToCSSClassName.get(chain)}"
          style={buttonStyle}
          value={gameBoardTypeToHotelInitial.get(chain)}
          bind:this={inputs[chain]}
          on:click={() => onChainSelected(chain)}
        />
      {:else}
        <input
          type="button"
          class="invisible"
          style={buttonStyle}
          value="?"
          bind:this={inputs[chain]}
        />
      {/if}
    {/each}
  </fieldset>
</div>

<style>
  fieldset {
    display: inline-block;
    margin: 0;
    padding: 0 3px 3px;
  }

  legend {
    padding: 0 5px;
  }

  input:not(:last-child) {
    margin-right: 4px;
  }
</style>
