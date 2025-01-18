import { batch, createEffect, createSignal, on, onMount } from 'solid-js';
import { PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToCSSClassName } from '../helpers';
import { KEY_SHIFT, MyKeyboardEvent, ProcessMyKeyboardEventRef } from '../myKeyboardEvents';
import styles from './DisposeOfShares.module.css';

export function DisposeOfShares(props: {
  ref: (ref: ProcessMyKeyboardEventRef) => void;
  defunctChain: PB_GameBoardType;
  controllingChain: PB_GameBoardType;
  sharesOwnedInDefunctChain: number;
  sharesAvailableInControllingChain: number;
  buttonSize: number;
  onSharesDisposed: (traded: number, sold: number) => void;
}) {
  const [keep, setKeep] = createSignal(0);
  const [trade, setTrade] = createSignal(0);
  const [tradeMax, setTradeMax] = createSignal(0);
  const [sell, setSell] = createSignal(0);
  const [sellMax, setSellMax] = createSignal(0);

  createEffect(
    on(
      [() => props.sharesOwnedInDefunctChain, () => props.sharesAvailableInControllingChain],
      () => {
        batch(() => {
          setTrade(0);
          setSell(0);
          updateValues(0, 0);
        });
      },
    ),
  );

  function updateValues(tradeChange: number, sellChange: number) {
    const newTrade = trade() + tradeChange;
    const newSell = sell() + sellChange;

    const newKeep = props.sharesOwnedInDefunctChain - newTrade - newSell;
    const newTradeMax = Math.min(
      newTrade + Math.floor(newKeep / 2) * 2,
      props.sharesAvailableInControllingChain * 2,
    );
    const newSellMax = newSell + newKeep;

    batch(() => {
      setKeep(newKeep);
      setTrade(newTrade);
      setTradeMax(newTradeMax);
      setSell(newSell);
      setSellMax(newSellMax);
    });
  }

  const inputs: HTMLInputElement[] = new Array(8);
  onMount(() => {
    props.ref({
      processMyKeyboardEvent: (myKeyboardEvent) => {
        const buttonIndex = keyboardShortcutToButtonIndex(myKeyboardEvent);

        if (buttonIndex !== undefined) {
          const button = inputs[buttonIndex];

          button.focus();
          if (buttonIndex < 7) {
            button.click();
          }
        }
      },
    });
  });

  return (
    <div class={styles.root} style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}>
      <fieldset class={gameBoardTypeToCSSClassName.get(props.defunctChain)}>
        <legend class={gameBoardTypeToCSSClassName.get(props.defunctChain)}>Keep</legend>
        <span>{keep()}</span>{' '}
        <input
          ref={inputs[0]}
          type="button"
          value="All"
          disabled={keep() === props.sharesOwnedInDefunctChain}
          onClick={() => updateValues(-trade(), -sell())}
        />
      </fieldset>{' '}
      <fieldset class={gameBoardTypeToCSSClassName.get(props.controllingChain)}>
        <legend class={gameBoardTypeToCSSClassName.get(props.controllingChain)}>Trade</legend>
        <span>{trade()}</span>{' '}
        <input
          ref={inputs[1]}
          type="button"
          value="▲"
          disabled={trade() === tradeMax()}
          onClick={() => updateValues(2, 0)}
        />{' '}
        <input
          ref={inputs[2]}
          type="button"
          value="▼"
          disabled={trade() === 0}
          onClick={() => updateValues(-2, 0)}
        />{' '}
        <input
          ref={inputs[3]}
          type="button"
          value="Max"
          disabled={trade() === tradeMax()}
          onClick={() => updateValues(tradeMax() - trade(), 0)}
        />
      </fieldset>{' '}
      <fieldset>
        <legend>Sell</legend>
        <span>{sell()}</span>{' '}
        <input
          ref={inputs[4]}
          type="button"
          value="▲"
          disabled={sell() === sellMax()}
          onClick={() => updateValues(0, 1)}
        />{' '}
        <input
          ref={inputs[5]}
          type="button"
          value="▼"
          disabled={sell() === 0}
          onClick={() => updateValues(0, -1)}
        />{' '}
        <input
          ref={inputs[6]}
          type="button"
          value="Max"
          disabled={sell() === sellMax()}
          onClick={() => updateValues(0, sellMax() - sell())}
        />
      </fieldset>{' '}
      <input
        ref={inputs[7]}
        type="button"
        value="OK"
        onClick={() => props.onSharesDisposed(trade(), sell())}
      />
    </div>
  );
}

export const keyboardEventCodeToButtonIndex = new Map([
  // Keep All
  ['KeyK', 0],
  ['Digit1', 0],
  ['Numpad1', 0],
  // Trade ▲
  ['KeyT', 1],
  ['Digit2', 1],
  ['Numpad2', 1],
  // Trade ▼
  ['Digit3', 2],
  ['Numpad3', 2],
  // Trade Max
  ['Digit4', 3],
  ['Numpad4', 3],
  // Sell ▲
  ['KeyS', 4],
  ['Digit5', 4],
  ['Numpad5', 4],
  // Sell ▼
  ['Digit6', 5],
  ['Numpad6', 5],
  // Sell Max
  ['Digit7', 6],
  ['Numpad7', 6],
  // OK
  ['KeyO', 7],
  ['Digit0', 7],
  ['Numpad0', 7],
  ['Digit8', 7],
  ['Numpad8', 7],
]);

function keyboardShortcutToButtonIndex(myKeyboardEvent: MyKeyboardEvent) {
  if (myKeyboardEvent.modifiers === 0) {
    return keyboardEventCodeToButtonIndex.get(myKeyboardEvent.code);
  } else if (myKeyboardEvent.modifiers === KEY_SHIFT) {
    if (myKeyboardEvent.code === 'KeyT') {
      // Trade ▼
      return 2;
    } else if (myKeyboardEvent.code === 'KeyS') {
      // Sell ▼
      return 5;
    }
  }
}
