import { batch, createEffect, createSignal, on } from 'solid-js';
import { PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToCSSClassName } from '../helpers';
import styles from './DisposeOfShares.module.css';

export function DisposeOfShares(props: {
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

  return (
    <div class={styles.root} style={{ 'font-size': `${Math.floor(props.buttonSize * 0.4)}px` }}>
      <fieldset class={gameBoardTypeToCSSClassName.get(props.defunctChain)}>
        <legend class={gameBoardTypeToCSSClassName.get(props.defunctChain)}>Keep</legend>
        <span>{keep()}</span>{' '}
        <input
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
          type="button"
          value="▲"
          disabled={trade() === tradeMax()}
          onClick={() => updateValues(2, 0)}
        />{' '}
        <input
          type="button"
          value="▼"
          disabled={trade() === 0}
          onClick={() => updateValues(-2, 0)}
        />{' '}
        <input
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
          type="button"
          value="▲"
          disabled={sell() === sellMax()}
          onClick={() => updateValues(0, 1)}
        />{' '}
        <input
          type="button"
          value="▼"
          disabled={sell() === 0}
          onClick={() => updateValues(0, -1)}
        />{' '}
        <input
          type="button"
          value="Max"
          disabled={sell() === sellMax()}
          onClick={() => updateValues(0, sellMax() - sell())}
        />
      </fieldset>{' '}
      <input type="button" value="OK" onClick={() => props.onSharesDisposed(trade(), sell())} />
    </div>
  );
}
