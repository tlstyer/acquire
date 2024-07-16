<svelte:options immutable />

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import { gameBoardTypeToCSSClassName } from './helpers';

  export let gameBoard: PB_GameBoardType[][];
  export let cellSize: number;
</script>

<table style="width: {cellSize * 12 + 1}px; height: {cellSize * 9 + 1}px">
  <tbody>
    {#each gameBoard as gameBoardRow}
      <tr>
        {#each gameBoardRow as gameBoardType}
          <td class={gameBoardTypeToCSSClassName.get(gameBoardType)} />
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    border-collapse: collapse;
    table-layout: fixed;
  }

  td {
    border: 1px solid var(--border-color);
  }
</style>
