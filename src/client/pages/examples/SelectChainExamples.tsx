import { createSignal, For } from 'solid-js';
import { type PB_GameBoardType } from '../../../common/pb.js';
import { SelectChain, SelectChainTitle } from '../../components/SelectChain.js';
import { gameBoardTypeToHotelInitial } from '../../helpers.js';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents.js';
import { EnableKeyboardShortcutsButton } from './EnableKeyboardShortcutsButton.js';

export function SelectChainExamples() {
  const allProps = [
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
    <For each={allProps}>
      {(props) => {
        const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = createSignal(false);

        return (
          <>
            <p>
              <EnableKeyboardShortcutsButton onChangeEnabled={setKeyboardShortcutsEnabled} />
            </p>
            <p>
              <SelectChain
                ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
                type={props.type}
                availableChains={props.availableChains}
                buttonSize={props.buttonSize}
                onChainSelected={props.onChainSelected}
              />
            </p>
          </>
        );
      }}
    </For>
  );
}
