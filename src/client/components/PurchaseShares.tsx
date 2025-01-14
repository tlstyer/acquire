import { batch, createEffect, createMemo, createSignal, Index, JSX, on } from 'solid-js';
import { PB_GameBoardType } from '../../common/pb';
import stylesApp from '../App.module.css';
import { allChains, gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial } from '../helpers';
import styles from './PurchaseShares.module.css';

export function PurchaseShares(props: {
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

  // reset upon props changing
  createEffect(
    on(
      [() => props.scoreBoardAvailable, () => props.scoreBoardPrice, () => props.cash],
      () => setCart([null, null, null]),
      { defer: true },
    ),
  );

  createEffect(() => {
    const chainToNumSharesInCart = new Map<number, number>();
    let newCostTotal = 0;
    let numItemsInCart = 0;
    const c = cart();
    for (let i = 0; i < c.length; i++) {
      const chain = c[i];
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
    });
  });

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

  return (
    <div class={styles.root} style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}>
      <div class={styles.topRow}>
        <fieldset>
          <legend>Available</legend>
          <Index each={availableButtonStatuses()}>
            {(availableButtonStatus, chain) => (
              <>
                <input
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
                        setCart(newCart);
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
                  type="button"
                  classList={{
                    [stylesApp.hotelButton]: true,
                    [gameBoardTypeToCSSClassName.get(chain() ?? 0)!]: true,
                    [stylesApp.invisible]: chain() === null,
                  }}
                  style={cartButtonStyle()}
                  value={props.scoreBoardPrice[chain() ?? 0] * 100}
                  onClick={() => {
                    setCart((c) => {
                      const newCart = [...c];
                      newCart[i] = null;
                      return newCart;
                    });
                  }}
                />{' '}
              </>
            )}
          </Index>
        </fieldset>{' '}
        <label>
          <input
            type="checkbox"
            checked={endGame()}
            onInput={(e) => setEndGame(e.currentTarget.checked)}
          />{' '}
          End game
        </label>{' '}
        <input type="button" value="OK" onClick={handleOK} />
      </div>
    </div>
  );
}

const enum AvailableButtonStatus {
  Enabled,
  Disabled,
  Invisible,
}
