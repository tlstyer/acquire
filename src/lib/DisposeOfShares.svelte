<svelte:options immutable />

<script lang="ts" context="module">
  export const keyboardEventCodeToButtonIndex = new Map([
    // Keep All
    ['KeyK', 0],
    ['Digit1', 0],
    ['Numpad1', 0],
    // Trade ▲
    ['KeyT', 1],
    ['Digit2', 1],
    ['Numpad2', 1],
    // Trade ▼
    ['Digit3', 2],
    ['Numpad3', 2],
    // Trade Max
    ['Digit4', 3],
    ['Numpad4', 3],
    // Sell ▲
    ['KeyS', 4],
    ['Digit5', 4],
    ['Numpad5', 4],
    // Sell ▼
    ['Digit6', 5],
    ['Numpad6', 5],
    // Sell Max
    ['Digit7', 6],
    ['Numpad7', 6],
    // OK
    ['KeyO', 7],
    ['Digit0', 7],
    ['Numpad0', 7],
    ['Digit8', 7],
    ['Numpad8', 7],
  ]);

  function keyboardShortcutToButtonIndex(event: KeyboardEvent) {
    const keysAlsoPressed = keyboardEventToKeysAlsoPressed(event);

    if (keysAlsoPressed === 0) {
      return keyboardEventCodeToButtonIndex.get(event.code);
    } else if (keysAlsoPressed === KEY_SHIFT) {
      if (event.code === 'KeyT') {
        // Trade ▼
        return 2;
      } else if (event.code === 'KeyS') {
        // Sell ▼
        return 5;
      }
    }
  }
</script>

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import {
    KEY_SHIFT,
    gameBoardTypeToCSSClassName,
    keyboardEventToKeysAlsoPressed,
  } from './helpers';

  export let defunctChain: PB_GameBoardType;
  export let controllingChain: PB_GameBoardType;
  export let sharesOwnedInDefunctChain: number;
  export let sharesAvailableInControllingChain: number;
  export let buttonSize: number;
  export let keyboardShortcutsEnabled: boolean;
  export let onSharesDisposed: (traded: number, sold: number) => void;

  let keep = 0;
  let trade = 0;
  let tradeMax = 0;
  let sell = 0;
  let sellMax = 0;
  updateValues(0, 0);

  const inputs: (HTMLInputElement | null)[] = new Array(8);
  inputs.fill(null);

  function updateValues(tradeChange: number, sellChange: number) {
    trade = trade + tradeChange;
    sell = sell + sellChange;

    keep = sharesOwnedInDefunctChain - trade - sell;
    tradeMax = Math.min(trade + Math.floor(keep / 2) * 2, sharesAvailableInControllingChain * 2);
    sellMax = sell + keep;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardShortcutsEnabled) {
      const buttonIndex = keyboardShortcutToButtonIndex(event);

      if (buttonIndex !== undefined) {
        const button = inputs[buttonIndex];

        if (button) {
          button.focus();
          if (buttonIndex < 7) {
            button.click();
          }
        }

        event.preventDefault();
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div style="font-size: {Math.floor(buttonSize * 0.4)}px">
  <fieldset class={gameBoardTypeToCSSClassName.get(defunctChain)}>
    <legend class={gameBoardTypeToCSSClassName.get(defunctChain)}>Keep</legend>
    <span>{keep}</span>
    <input
      type="button"
      value="All"
      disabled={keep === sharesOwnedInDefunctChain}
      bind:this={inputs[0]}
      on:click={() => updateValues(-trade, -sell)}
    />
  </fieldset>
  <fieldset class={gameBoardTypeToCSSClassName.get(controllingChain)}>
    <legend class={gameBoardTypeToCSSClassName.get(controllingChain)}>Trade</legend>
    <span>{trade}</span>
    <input
      type="button"
      value="▲"
      disabled={trade === tradeMax}
      bind:this={inputs[1]}
      on:click={() => updateValues(2, 0)}
    />
    <input
      type="button"
      value="▼"
      disabled={trade === 0}
      bind:this={inputs[2]}
      on:click={() => updateValues(-2, 0)}
    />
    <input
      type="button"
      value="Max"
      disabled={trade === tradeMax}
      bind:this={inputs[3]}
      on:click={() => updateValues(tradeMax - trade, 0)}
    />
  </fieldset>
  <fieldset>
    <legend>Sell</legend>
    <span>{sell}</span>
    <input
      type="button"
      value="▲"
      disabled={sell === sellMax}
      bind:this={inputs[4]}
      on:click={() => updateValues(0, 1)}
    />
    <input
      type="button"
      value="▼"
      disabled={sell === 0}
      bind:this={inputs[5]}
      on:click={() => updateValues(0, -1)}
    />
    <input
      type="button"
      value="Max"
      disabled={sell === sellMax}
      bind:this={inputs[6]}
      on:click={() => updateValues(0, sellMax - sell)}
    />
  </fieldset>
  <input
    type="button"
    value="OK"
    bind:this={inputs[7]}
    on:click={() => onSharesDisposed(trade, sell)}
  />
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

  span {
    display: inline-block;
    text-align: right;
    width: 1.5em;
  }

  input {
    color: #000000;
  }

  input:disabled {
    color: #808080;
  }
</style>
