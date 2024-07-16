<svelte:options immutable />

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import GameBoardRow from './children/GameBoardRow.svelte';
  import type { GameBoardLabelMode } from './helpers';

  export let gameBoard: PB_GameBoardType[][];
  export let tileRack: (number | null)[] | undefined;
  export let labelMode: GameBoardLabelMode;
  export let cellSize: number;
  export let onCellClicked: ((tile: number) => void) | undefined;

  let tileRackRowBitMasks: number[];
  $: {
    tileRackRowBitMasks = new Array(9);
    tileRackRowBitMasks.fill(0);

    if (tileRack) {
      for (let i = 0; i < tileRack.length; i++) {
        const tile = tileRack[i];

        if (tile !== null) {
          const y = tile % 9;
          const x = (tile - y) / 9;
          tileRackRowBitMasks[y] |= 1 << x;
        }
      }
    }
  }
</script>

<table
  style="width: {cellSize * 12 + 2}px; height: {cellSize * 9 + 2}px; font-size: {Math.floor(
    cellSize * 0.4,
  )}px"
>
  <tbody>
    {#each gameBoard as gameBoardRow, y}
      <GameBoardRow
        {y}
        {gameBoardRow}
        tileRackRowBitMask={tileRackRowBitMasks[y]}
        {labelMode}
        {onCellClicked}
      />
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
    font-weight: bold;
    table-layout: fixed;
    text-align: center;
  }
</style>
