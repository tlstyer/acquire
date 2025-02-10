import {
  batch,
  createEffect,
  createMemo,
  createSignal,
  Index,
  type JSX,
  on,
  onMount,
} from 'solid-js';
import { type PB_GameBoardType } from '../../common/pb';
import stylesApp from '../App.module.css';
import {
  allChains,
  gameBoardTypeToHotelInitial,
  keyboardEventCodeToGameBoardType,
} from '../helpers';
import { KEY_SHIFT, type ProcessMyKeyboardEventRef } from '../myKeyboardEvents';
import { gameBoardTypeToCSSClassName } from '../styleHelpers';
import styles from './PurchaseShares.module.css';

export function PurchaseShares(props: {
  ref: (ref: ProcessMyKeyboardEventRef) => void;
  scoreBoardAvailable: number[];
  scoreBoardPrice: number[];
  cash: number;
  buttonSize: number;
  onSharesPurchased: (chains: PB_GameBoardType[], endGame: boolean) => void;
}) {
  const [availableButtonStatuses, setAvailableButtonStatuses] = createSignal<
    AvailableButtonStatus[]
  >([]);
  const [costTotal, setCostTotal] = createSignal(0);
  const [costLeft, setCostLeft] = createSignal(0);
  const [cart, setCart] = createSignal<(number | null)[]>([null, null, null]);
  const [endGame, setEndGame] = createSignal(false);

  createEffect(
    on([() => props.scoreBoardAvailable, () => props.scoreBoardPrice, () => props.cash], () =>
      updateValues([null, null, null]),
    ),
  );

  function updateValues(newCart: (number | null)[]) {
    const chainToNumSharesInCart = new Map<number, number>();
    let newCostTotal = 0;
    let numItemsInCart = 0;
    for (let i = 0; i < newCart.length; i++) {
      const chain = newCart[i];
      if (chain !== null) {
        chainToNumSharesInCart.set(chain, (chainToNumSharesInCart.get(chain) ?? 0) + 1);
        newCostTotal += props.scoreBoardPrice[chain];
        numItemsInCart++;
      }
    }
    const newCostLeft = props.cash - newCostTotal;

    const newAvailableButtonStatuses = allChains.map((chain) => {
      const numAvailable = props.scoreBoardAvailable[chain];
      const price = props.scoreBoardPrice[chain];

      if (price > 0 && numAvailable > 0) {
        const numRemaining = numAvailable - (chainToNumSharesInCart.get(chain) ?? 0);
        const canAddThis = numItemsInCart < 3 && numRemaining > 0 && price <= newCostLeft;

        return canAddThis ? AvailableButtonStatus.Enabled : AvailableButtonStatus.Disabled;
      } else {
        return AvailableButtonStatus.Invisible;
      }
    });

    batch(() => {
      setAvailableButtonStatuses(newAvailableButtonStatuses);
      setCostTotal(newCostTotal);
      setCostLeft(newCostLeft);
      setCart(newCart);
    });
  }

  const buttonStyle = createMemo<JSX.CSSProperties>(() => ({
    width: `${props.buttonSize}px`,
    height: `${props.buttonSize}px`,
  }));

  const cartButtonStyle = createMemo<JSX.CSSProperties>(() => ({
    width: `${Math.floor(props.buttonSize * (4 / 3))}px`,
    height: `${props.buttonSize}px`,
  }));

  function handleOK() {
    const chains: PB_GameBoardType[] = [];
    const c = cart();
    for (let i = 0; i < c.length; i++) {
      const entry = c[i];
      if (entry !== null) {
        chains.push(entry);
      }
    }

    props.onSharesPurchased(chains, endGame());
  }

  const availableButtons: HTMLInputElement[] = new Array(allChains.length);
  const cartButtons: HTMLInputElement[] = new Array(3);
  let endGameCheckbox!: HTMLInputElement;
  let okButton!: HTMLInputElement;
  onMount(() => {
    props.ref({
      processMyKeyboardEvent: (myKeyboardEvent) => {
        const gameBoardType = keyboardEventCodeToGameBoardType.get(myKeyboardEvent.code);

        if (myKeyboardEvent.modifiers === 0) {
          if (gameBoardType !== undefined) {
            const button = availableButtons[gameBoardType];
            button.focus();
            button.click();
          } else if (
            myKeyboardEvent.code === 'Backspace' ||
            myKeyboardEvent.code === 'Delete' ||
            myKeyboardEvent.code === 'NumpadSubtract'
          ) {
            const c = cart();
            for (let i = c.length - 1; i >= 0; i--) {
              if (c[i] !== null) {
                const button = cartButtons[i];
                button.focus();
                button.click();
                break;
              }
            }
          } else if (myKeyboardEvent.code === 'KeyE' || myKeyboardEvent.code === 'NumpadMultiply') {
            endGameCheckbox.focus();
            endGameCheckbox.click();
          } else if (
            myKeyboardEvent.code === 'KeyO' ||
            myKeyboardEvent.code === 'Digit0' ||
            myKeyboardEvent.code === 'Numpad0' ||
            myKeyboardEvent.code === 'Digit8' ||
            myKeyboardEvent.code === 'Numpad8'
          ) {
            okButton.focus();
          }
        } else if (myKeyboardEvent.modifiers === KEY_SHIFT) {
          if (gameBoardType !== undefined) {
            const c = cart();
            for (let i = c.length - 1; i >= 0; i--) {
              if (c[i] === gameBoardType) {
                const button = cartButtons[i];
                button.focus();
                button.click();
                break;
              }
            }
          }
        }
      },
    });
  });

  return (
    <div class={styles.root} style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}>
      <div class={styles.topRow}>
        <fieldset>
          <legend>Available</legend>
          <Index each={availableButtonStatuses()}>
            {(availableButtonStatus, chain) => (
              <>
                <input
                  ref={availableButtons[chain]}
                  type="button"
                  classList={{
                    [stylesApp.hotelButton]: true,
                    [gameBoardTypeToCSSClassName.get(chain)!]: true,
                    [stylesApp.invisible]:
                      availableButtonStatus() === AvailableButtonStatus.Invisible,
                  }}
                  disabled={availableButtonStatus() !== AvailableButtonStatus.Enabled}
                  style={buttonStyle()}
                  value={gameBoardTypeToHotelInitial.get(chain)}
                  onClick={() => {
                    const c = cart();
                    for (let i = 0; i < c.length; i++) {
                      if (c[i] === null) {
                        const newCart = [...c];
                        newCart[i] = chain;
                        updateValues(newCart);
                        break;
                      }
                    }
                  }}
                />{' '}
              </>
            )}
          </Index>
        </fieldset>{' '}
        <fieldset>
          <legend>Cost</legend>
          <table>
            <tbody>
              <tr>
                <td>Total</td>
                <td>{costTotal() * 100}</td>
              </tr>
              <tr>
                <td>Left</td>
                <td>{costLeft() * 100}</td>
              </tr>
            </tbody>
          </table>
        </fieldset>
      </div>
      <div>
        <fieldset>
          <legend>Cart</legend>
          <Index each={cart()}>
            {(chain, i) => (
              <>
                <input
                  ref={cartButtons[i]}
                  type="button"
                  classList={{
                    [stylesApp.hotelButton]: true,
                    [gameBoardTypeToCSSClassName.get(chain() ?? 0)!]: true,
                    [stylesApp.invisible]: chain() === null,
                  }}
                  style={cartButtonStyle()}
                  value={props.scoreBoardPrice[chain() ?? 0] * 100}
                  onClick={() => {
                    const newCart = [...cart()];
                    newCart[i] = null;
                    updateValues(newCart);
                  }}
                />{' '}
              </>
            )}
          </Index>
        </fieldset>{' '}
        <label>
          <input
            ref={endGameCheckbox}
            type="checkbox"
            checked={endGame()}
            onInput={(e) => setEndGame(e.currentTarget.checked)}
          />{' '}
          End game
        </label>{' '}
        <input ref={okButton} type="button" value="OK" onClick={handleOK} />
      </div>
    </div>
  );
}

const enum AvailableButtonStatus {
  Enabled,
  Disabled,
  Invisible,
}
