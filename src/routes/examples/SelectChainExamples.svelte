<script lang="ts">
  import { gameBoardTypeToHotelInitial } from '$lib/helpers';
  import SelectChain, { SelectChainTitle } from '$lib/SelectChain.svelte';
  import type { PB_GameBoardType } from '../../common/pb';
  import EnableKeyboardShortcutsButton from './EnableKeyboardShortcutsButton.svelte';

  const allSelectChainProps = [
    {
      type: SelectChainTitle.SelectNewChain,
      availableChains: [0, 1, 2, 3, 4, 5, 6],
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onChainSelected,
    },
    {
      type: SelectChainTitle.SelectMergerSurvivor,
      availableChains: [0, 3, 5],
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onChainSelected,
    },
    {
      type: SelectChainTitle.SelectChainToDisposeOfNext,
      availableChains: [2, 4],
      buttonSize: 40,
      keyboardShortcutsEnabled: false,
      onChainSelected,
    },
  ];

  function onChainSelected(chain: PB_GameBoardType) {
    console.log('onChainSelected:', gameBoardTypeToHotelInitial.get(chain));
  }
</script>

{#each allSelectChainProps as selectChainProps}
  <p>
    <EnableKeyboardShortcutsButton bind:enabled={selectChainProps.keyboardShortcutsEnabled} />
  </p>
  <p>
    <SelectChain
      type={selectChainProps.type}
      availableChains={selectChainProps.availableChains}
      buttonSize={selectChainProps.buttonSize}
      keyboardShortcutsEnabled={selectChainProps.keyboardShortcutsEnabled}
      onChainSelected={selectChainProps.onChainSelected}
    />
  </p>
{/each}
