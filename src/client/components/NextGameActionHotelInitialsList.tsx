import { createMemo, For } from 'solid-js';
import { PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';

export function NextGameActionHotelInitialsList(props: { chains: PB_GameBoardType[] }) {
  const chainsData = createMemo(() => {
    const chainsData = props.chains.map((chain) => ({ chain, separator: ', ' }));

    if (chainsData.length > 0) {
      chainsData[chainsData.length - 1].separator = '';
    }

    if (chainsData.length === 2) {
      chainsData[0].separator = ' or ';
    } else if (chainsData.length > 2) {
      chainsData[chainsData.length - 2].separator = ', or ';
    }

    return chainsData;
  });

  return (
    <For each={chainsData()}>
      {({ chain, separator }) => (
        <>
          <span class={gameBoardTypeToCSSClassName.get(chain)}>
            {gameBoardTypeToHotelInitial.get(chain)}
          </span>
          {separator}
        </>
      )}
    </For>
  );
}
