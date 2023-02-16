<script lang="ts">
  import DisposeOfShares from '$lib/DisposeOfShares.svelte';
  import { PB_GameBoardType } from '../../common/pb';
  import EnableKeyboardShortcutsButton from './EnableKeyboardShortcutsButton.svelte';

  const allDisposeOfSharesProps = [
    {
      defunctChain: PB_GameBoardType.AMERICAN,
      controllingChain: PB_GameBoardType.FESTIVAL,
      sharesOwnedInDefunctChain: 10,
      sharesAvailableInControllingChain: 22,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesDisposed,
    },
    {
      defunctChain: PB_GameBoardType.IMPERIAL,
      controllingChain: PB_GameBoardType.TOWER,
      sharesOwnedInDefunctChain: 7,
      sharesAvailableInControllingChain: 2,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesDisposed,
    },
    {
      defunctChain: PB_GameBoardType.CONTINENTAL,
      controllingChain: PB_GameBoardType.WORLDWIDE,
      sharesOwnedInDefunctChain: 1,
      sharesAvailableInControllingChain: 3,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesDisposed,
    },
    {
      defunctChain: PB_GameBoardType.LUXOR,
      controllingChain: PB_GameBoardType.IMPERIAL,
      sharesOwnedInDefunctChain: 25,
      sharesAvailableInControllingChain: 10,
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onSharesDisposed,
    },
  ];

  function onSharesDisposed(traded: number, sold: number) {
    console.log('onSharesDisposed', traded, sold);
  }
</script>

{#each allDisposeOfSharesProps as disposeOfSharesProps}
  <h2>
    defunct owned: {disposeOfSharesProps.sharesOwnedInDefunctChain}, controlling available: {disposeOfSharesProps.sharesAvailableInControllingChain}
  </h2>
  <p>
    <EnableKeyboardShortcutsButton bind:enabled={disposeOfSharesProps.keyboardShortcutsEnabled} />
  </p>
  <p>
    <DisposeOfShares
      defunctChain={disposeOfSharesProps.defunctChain}
      controllingChain={disposeOfSharesProps.controllingChain}
      sharesOwnedInDefunctChain={disposeOfSharesProps.sharesOwnedInDefunctChain}
      sharesAvailableInControllingChain={disposeOfSharesProps.sharesAvailableInControllingChain}
      buttonSize={disposeOfSharesProps.buttonSize}
      keyboardShortcutsEnabled={disposeOfSharesProps.keyboardShortcutsEnabled}
      onSharesDisposed={disposeOfSharesProps.onSharesDisposed}
    />
  </p>
{/each}
