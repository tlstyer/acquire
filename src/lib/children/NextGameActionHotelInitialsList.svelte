<svelte:options immutable />

<script lang="ts">
  import type { PB_GameBoardType } from '../../common/pb';
  import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';

  export let chains: PB_GameBoardType[] = [];

  let chainsData: { chain: PB_GameBoardType; separator: string }[];
  $: {
    chainsData = chains.map((chain) => ({ chain, separator: ', ' }));

    if (chainsData.length > 0) {
      chainsData[chainsData.length - 1].separator = '';
    }

    if (chainsData.length === 2) {
      chainsData[0].separator = ' or ';
    } else if (chainsData.length > 2) {
      chainsData[chainsData.length - 2].separator = ', or ';
    }
  }
</script>

{#each chainsData as { chain, separator }}
  <span class={gameBoardTypeToCSSClassName.get(chain)}
    >{gameBoardTypeToHotelInitial.get(chain)}</span
  >{separator}
{/each}
