import { For } from 'solid-js';
import { PB_GameBoardType } from '../../../common/pb';
import { SelectChain, SelectChainTitle } from '../../components/SelectChain';
import { gameBoardTypeToHotelInitial } from '../../helpers';

export function SelectChainExamples() {
  const allSelectChainProps = [
    {
      type: SelectChainTitle.SelectNewChain,
      availableChains: [0, 1, 2, 3, 4, 5, 6],
      buttonSize: 40,
      onChainSelected,
    },
    {
      type: SelectChainTitle.SelectMergerSurvivor,
      availableChains: [0, 3, 5],
      buttonSize: 40,
      onChainSelected,
    },
    {
      type: SelectChainTitle.SelectChainToDisposeOfNext,
      availableChains: [2, 4],
      buttonSize: 40,
      onChainSelected,
    },
  ];

  function onChainSelected(chain: PB_GameBoardType) {
    console.log('onChainSelected:', gameBoardTypeToHotelInitial.get(chain));
  }

  return (
    <For each={allSelectChainProps}>
      {(selectChainProps) => (
        <p>
          <SelectChain
            type={selectChainProps.type}
            availableChains={selectChainProps.availableChains}
            buttonSize={selectChainProps.buttonSize}
            onChainSelected={selectChainProps.onChainSelected}
          />
        </p>
      )}
    </For>
  );
}
