<svelte:options immutable />

<script lang="ts">
  import { PB_GameBoardType } from '../common/pb';
  import GameBoardCell from './GameBoardCell.svelte';
  import type { GameBoardLabelMode } from './helpers';

  export let y: number;
  export let gameBoardRow: PB_GameBoardType[];
  export let tileRackRowBitMask: number;
  export let labelMode: GameBoardLabelMode;
  export let onCellClicked: ((tile: number) => void) | undefined = undefined;
</script>

<tr>
  {#each gameBoardRow as gameBoardType, x}
    <GameBoardCell
      tile={x * 9 + y}
      gameBoardType={((tileRackRowBitMask >> x) & 1) === 1 ? PB_GameBoardType.I_HAVE_THIS : gameBoardType}
      {labelMode}
      {onCellClicked}
    />
  {/each}
</tr>
