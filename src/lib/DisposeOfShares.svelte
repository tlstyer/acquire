<svelte:options immutable />

<script lang="ts" context="module">
  const keyboardShortcutToButtonIndex = new Map([
    ['1', 0],
    ['k', 0],
    ['2', 1],
    ['t', 1],
    ['3', 2],
    ['T', 2],
    ['4', 3],
    ['5', 4],
    ['s', 4],
    ['6', 5],
    ['S', 5],
    ['7', 6],
    ['0', 7],
    ['8', 7],
    ['o', 7],
  ]);
</script>

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import { gameBoardTypeToCSSClassName } from './helpers';

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

  const inputs: (HTMLInputElement | undefined)[] = new Array(8);
  inputs.fill(undefined);

  function updateValues(tradeChange: number, sellChange: number) {
    trade = trade + tradeChange;
    sell = sell + sellChange;

    keep = sharesOwnedInDefunctChain - trade - sell;
    tradeMax = Math.min(trade + Math.floor(keep / 2) * 2, sharesAvailableInControllingChain * 2);
    sellMax = sell + keep;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardShortcutsEnabled) {
      const buttonIndex = keyboardShortcutToButtonIndex.get(event.key);

      if (buttonIndex !== undefined) {
        const button = inputs[buttonIndex];

        if (button) {
          button.focus();
          if (buttonIndex < 7) {
            button.click();
          }
        }
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div style="font-size: {Math.floor(buttonSize * 0.4)}px;">
  <fieldset class={gameBoardTypeToCSSClassName.get(defunctChain)}>
    <legend class={gameBoardTypeToCSSClassName.get(defunctChain)}>Keep</legend>
    <span>{keep}</span>
    <input type="button" value="All" disabled={keep === sharesOwnedInDefunctChain} bind:this={inputs[0]} on:click={() => updateValues(-trade, -sell)} />
  </fieldset>
  <fieldset class={gameBoardTypeToCSSClassName.get(controllingChain)}>
    <legend class={gameBoardTypeToCSSClassName.get(controllingChain)}>Trade</legend>
    <span>{trade}</span>
    <input type="button" value="▲" disabled={trade === tradeMax} bind:this={inputs[1]} on:click={() => updateValues(2, 0)} />
    <input type="button" value="▼" disabled={trade === 0} bind:this={inputs[2]} on:click={() => updateValues(-2, 0)} />
    <input type="button" value="Max" disabled={trade === tradeMax} bind:this={inputs[3]} on:click={() => updateValues(tradeMax - trade, 0)} />
  </fieldset>
  <fieldset>
    <legend>Sell</legend>
    <span>{sell}</span>
    <input type="button" value="▲" disabled={sell === sellMax} bind:this={inputs[4]} on:click={() => updateValues(0, 1)} />
    <input type="button" value="▼" disabled={sell === 0} bind:this={inputs[5]} on:click={() => updateValues(0, -1)} />
    <input type="button" value="Max" disabled={sell === sellMax} bind:this={inputs[6]} on:click={() => updateValues(0, sellMax - sell)} />
  </fieldset>
  <input type="button" value="OK" bind:this={inputs[7]} on:click={() => onSharesDisposed(trade, sell)} />
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
