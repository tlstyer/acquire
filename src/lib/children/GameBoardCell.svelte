<svelte:options immutable />

<script lang="ts">
  import { toTileString } from '../../common/helpers';
  import { PB_GameBoardType } from '../../common/pb';
  import {
    GameBoardLabelMode,
    gameBoardTypeToCSSClassName,
    gameBoardTypeToHotelInitial,
  } from '../helpers';

  export let tile: number;
  export let gameBoardType: PB_GameBoardType;
  export let labelMode: GameBoardLabelMode;
  export let onCellClicked: ((tile: number) => void) | undefined = undefined;

  let label: string;
  $: {
    if (labelMode === GameBoardLabelMode.Nothing) {
      if (
        gameBoardType === PB_GameBoardType.NOTHING ||
        gameBoardType === PB_GameBoardType.I_HAVE_THIS
      ) {
        label = toTileString(tile);
      } else {
        label = '\u00a0';
      }
    } else if (labelMode === GameBoardLabelMode.Coordinates) {
      label = toTileString(tile);
    } else if (labelMode === GameBoardLabelMode.HotelInitials) {
      if (
        gameBoardType === PB_GameBoardType.NOTHING ||
        gameBoardType === PB_GameBoardType.I_HAVE_THIS
      ) {
        label = toTileString(tile);
      } else if (gameBoardType <= PB_GameBoardType.IMPERIAL) {
        label = gameBoardTypeToHotelInitial.get(gameBoardType)!;
      } else {
        label = '\u00a0';
      }
    }
  }

  $: clickable = gameBoardType === PB_GameBoardType.I_HAVE_THIS && onCellClicked;

  function onClick() {
    if (clickable) {
      onCellClicked?.(tile);
    }
  }
</script>

<td
  class={gameBoardTypeToCSSClassName.get(gameBoardType)}
  class:clickable
  on:click={onClick}
  on:keydown={undefined}
>
  {label}
</td>

<style>
  td {
    border: 2px solid var(--border-color);
    overflow: hidden;
  }

  .clickable {
    cursor: pointer;
  }
</style>
