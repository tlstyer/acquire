<script lang="ts">
  import { gameBoardTypeToHotelInitial } from '$lib/helpers';
  import PurchaseShares from '$lib/PurchaseShares.svelte';
  import type { PB_GameBoardType } from '../../common/pb';
  import EnableKeyboardShortcutsButton from './EnableKeyboardShortcutsButton.svelte';

  const allPurchaseSharesProps = [
    {
      scoreBoardAvailable: [3, 3, 3, 3, 3, 3, 3],
      scoreBoardPrice: [2, 3, 4, 5, 6, 7, 8],
      cash: 15,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesPurchased,
    },
    {
      scoreBoardAvailable: [0, 1, 2, 3, 0, 1, 2],
      scoreBoardPrice: [0, 3, 4, 5, 0, 6, 5],
      cash: 15,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesPurchased,
    },
    {
      scoreBoardAvailable: [1, 23, 6, 1, 1, 4, 1],
      scoreBoardPrice: [2, 0, 0, 5, 6, 0, 0],
      cash: 5,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesPurchased,
    },
  ];

  function getPurchaseSharesDescription(scoreBoardAvailable: number[], scoreBoardPrice: number[]) {
    const parts: string[] = [];

    for (let chain = 0; chain < 7; chain++) {
      const numAvailable = scoreBoardAvailable[chain];
      const price = scoreBoardPrice[chain];
      if (numAvailable !== 0 && price !== 0) {
        parts.push(`${numAvailable}${gameBoardTypeToHotelInitial.get(chain)}@$${price * 100}`);
      }
    }

    return parts.join(', ');
  }

  function onSharesPurchased(chains: PB_GameBoardType[], endGame: boolean) {
    console.log('onSharesPurchased', chains, endGame);
  }
</script>

{#each allPurchaseSharesProps as purchaseSharesProps}
  <h2>
    {getPurchaseSharesDescription(
      purchaseSharesProps.scoreBoardAvailable,
      purchaseSharesProps.scoreBoardPrice,
    )}
  </h2>
  <p>
    <EnableKeyboardShortcutsButton bind:enabled={purchaseSharesProps.keyboardShortcutsEnabled} />
  </p>
  <p>
    <PurchaseShares
      scoreBoardAvailable={purchaseSharesProps.scoreBoardAvailable}
      scoreBoardPrice={purchaseSharesProps.scoreBoardPrice}
      cash={purchaseSharesProps.cash}
      buttonSize={purchaseSharesProps.buttonSize}
      keyboardShortcutsEnabled={purchaseSharesProps.keyboardShortcutsEnabled}
      onSharesPurchased={purchaseSharesProps.onSharesPurchased}
    />
  </p>
{/each}
