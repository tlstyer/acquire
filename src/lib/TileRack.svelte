<script lang="ts" context="module">
  type TileData = {
    tile: number;
    type: PB_GameBoardType;
  };

  export const keyboardEventCodeToTileIndex = new Map([
    ['Digit1', 0],
    ['Numpad1', 0],
    ['Digit2', 1],
    ['Numpad2', 1],
    ['Digit3', 2],
    ['Numpad3', 2],
    ['Digit4', 3],
    ['Numpad4', 3],
    ['Digit5', 4],
    ['Numpad5', 4],
    ['Digit6', 5],
    ['Numpad6', 5],
  ]);
</script>

<script lang="ts">
  import { toTileString } from '../common/helpers';
  import { PB_GameBoardType } from '../common/pb';
  import { gameBoardTypeToCSSClassName, keyboardEventToKeysAlsoPressed } from './helpers';

  export let tiles: (number | null)[];
  export let types: (PB_GameBoardType | null)[];
  export let buttonSize: number;
  export let keyboardShortcutsEnabled: boolean;
  export let onTileClicked: (tile: number) => void;

  const allTileData: (TileData | undefined)[] = new Array(6);
  allTileData.fill(undefined);

  const inputs: (HTMLInputElement | null)[] = new Array(6);
  inputs.fill(null);

  $: for (let i = 0; i < tiles.length; i++) {
    const tile = tiles[i];
    const type = types[i];

    if (tile !== null && type !== null) {
      if (allTileData[i]) {
        allTileData[i]!.tile = tile;
        allTileData[i]!.type = type;
      } else {
        allTileData[i] = { tile, type };
      }
    } else {
      allTileData[i] = undefined;
    }
  }

  $: buttonStyle = `width: ${buttonSize}px; height: ${buttonSize}px`;

  function handleKeydown(event: KeyboardEvent) {
    if (keyboardShortcutsEnabled) {
      const tileIndex = keyboardEventCodeToTileIndex.get(event.code);

      if (tileIndex !== undefined && keyboardEventToKeysAlsoPressed(event) === 0) {
        inputs[tileIndex]?.focus();

        event.preventDefault();
      }
    }
  }

  function onClick(tileData: TileData | undefined) {
    if (tileData) {
      onTileClicked(tileData.tile);
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="root" style="font-size: {Math.floor(buttonSize * 0.4)}px">
  {#each allTileData as tileData, tileIndex}
    {#if tileData}
      <input
        type="button"
        class="hotelButton {gameBoardTypeToCSSClassName.get(tileData.type)}"
        style={buttonStyle}
        value={toTileString(tileData.tile)}
        disabled={tileData.type === PB_GameBoardType.CANT_PLAY_EVER ||
          tileData.type === PB_GameBoardType.CANT_PLAY_NOW}
        on:click={() => onClick(tileData)}
        bind:this={inputs[tileIndex]}
      />
    {:else}
      <input type="button" class="invisible" style={buttonStyle} value="?" />
    {/if}
  {/each}
</div>

<style>
  .root :not(:last-child) {
    margin-right: 4px;
  }
</style>
