<svelte:options immutable />

<script lang="ts">
  import type { PB_GameBoardType } from '../common/pb';
  import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelName } from './helpers';

  export let chain: PB_GameBoardType;
</script>

<span class={gameBoardTypeToCSSClassName.get(chain)}>{gameBoardTypeToHotelName.get(chain)}</span>
