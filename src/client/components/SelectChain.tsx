import { createMemo, For, JSX } from 'solid-js';
import { PB_GameBoardType } from '../../common/pb';
import stylesApp from '../App.module.css';
import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';
import styles from './SelectChain.module.css';

export function SelectChain(props: {
  type: SelectChainTitle;
  availableChains: PB_GameBoardType[];
  buttonSize: number;
  onChainSelected: (chain: PB_GameBoardType) => void;
}) {
  const buttonStyle = createMemo<JSX.CSSProperties>(() => ({
    width: `${props.buttonSize}px`,
    height: `${props.buttonSize}px`,
  }));

  return (
    <div>
      <fieldset
        class={styles.fieldset}
        style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}
      >
        <legend class={styles.legend}>{typeToInstructions.get(props.type)}</legend>
        <For each={allChains}>
          {(chain) => (
            <input
              class={styles.input}
              type="button"
              classList={{
                [stylesApp.hotelButton]: true,
                [gameBoardTypeToCSSClassName.get(chain)!]: true,
                [stylesApp.invisible]: props.availableChains.indexOf(chain) === -1,
              }}
              style={buttonStyle()}
              value={gameBoardTypeToHotelInitial.get(chain)}
              onClick={() => props.onChainSelected(chain)}
            />
          )}
        </For>
      </fieldset>
    </div>
  );
}

export const enum SelectChainTitle {
  SelectNewChain,
  SelectMergerSurvivor,
  SelectChainToDisposeOfNext,
}

const typeToInstructions = new Map([
  [SelectChainTitle.SelectNewChain, 'New chain'],
  [SelectChainTitle.SelectMergerSurvivor, 'Merger survivor'],
  [SelectChainTitle.SelectChainToDisposeOfNext, 'Chain to dispose of next'],
]);
