<script lang="ts">
  import { toTileString } from '../common/helpers';
  import type { PB_GameBoardType } from '../common/pb';
  import { gameBoardTypeToCSSClassName } from './helpers';

  export let tiles: (number | null)[];
  export let types: (PB_GameBoardType | null)[];
  export let buttonSize: number;

  const allTileData: ({ tile: number; type: PB_GameBoardType } | undefined)[] = new Array(6);
  allTileData.fill(undefined);

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
</script>

<div class="root" style="font-size: {Math.floor(buttonSize * 0.4)}px">
  {#each allTileData as tileData}
    {#if tileData}
      <div class="button {gameBoardTypeToCSSClassName.get(tileData.type)}" style={buttonStyle}>
        <div>{toTileString(tileData.tile)}</div>
      </div>
    {:else}
      <div class="button invisible" style={buttonStyle}>?</div>
    {/if}
  {/each}
</div>

<style>
  .root :not(:last-child) {
    margin-right: 4px;
  }

  .button {
    display: inline-block;
    font-weight: bold;
    text-align: center;
  }

  .button > div {
    position: relative;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
