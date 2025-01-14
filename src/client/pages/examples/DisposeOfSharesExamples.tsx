import { batch, createSignal, For, onCleanup } from 'solid-js';
import { PB_GameBoardType } from '../../../common/pb';
import { DisposeOfShares } from '../../components/DisposeOfShares';

export function DisposeOfSharesExamples() {
  const allDisposeOfSharesProps = [
    {
      defunctChain: PB_GameBoardType.AMERICAN,
      controllingChain: PB_GameBoardType.FESTIVAL,
      sharesOwnedInDefunctChain: 10,
      sharesAvailableInControllingChain: 22,
      buttonSize: 40,
      onSharesDisposed,
    },
    {
      defunctChain: PB_GameBoardType.IMPERIAL,
      controllingChain: PB_GameBoardType.TOWER,
      sharesOwnedInDefunctChain: 7,
      sharesAvailableInControllingChain: 2,
      buttonSize: 40,
      onSharesDisposed,
    },
    {
      defunctChain: PB_GameBoardType.CONTINENTAL,
      controllingChain: PB_GameBoardType.WORLDWIDE,
      sharesOwnedInDefunctChain: 1,
      sharesAvailableInControllingChain: 3,
      buttonSize: 40,
      onSharesDisposed,
    },
    {
      defunctChain: PB_GameBoardType.LUXOR,
      controllingChain: PB_GameBoardType.IMPERIAL,
      sharesOwnedInDefunctChain: 25,
      sharesAvailableInControllingChain: 10,
      buttonSize: 40,
      onSharesDisposed,
    },
  ];

  function onSharesDisposed(traded: number, sold: number) {
    console.log('onSharesDisposed', traded, sold);
  }

  return (
    <>
      <For each={allDisposeOfSharesProps}>
        {(disposeOfSharesProps) => (
          <>
            <h2>
              defunct owned: {disposeOfSharesProps.sharesOwnedInDefunctChain}, controlling
              available: {disposeOfSharesProps.sharesAvailableInControllingChain}
            </h2>
            <p>
              <DisposeOfShares
                defunctChain={disposeOfSharesProps.defunctChain}
                controllingChain={disposeOfSharesProps.controllingChain}
                sharesOwnedInDefunctChain={disposeOfSharesProps.sharesOwnedInDefunctChain}
                sharesAvailableInControllingChain={
                  disposeOfSharesProps.sharesAvailableInControllingChain
                }
                buttonSize={disposeOfSharesProps.buttonSize}
                onSharesDisposed={disposeOfSharesProps.onSharesDisposed}
              />
            </p>
          </>
        )}
      </For>
      <TestDisposeOfSharesPropsChanging />
    </>
  );
}

function TestDisposeOfSharesPropsChanging() {
  const [defunctChain, setDefunctChain] = createSignal(0);
  const [controllingChain, setControllingChain] = createSignal(0);
  const [sharesOwnedInDefunctChain, setSharesOwnedInDefunctChain] = createSignal(0);
  const [sharesAvailableInControllingChain, setSharesAvailableInControllingChain] = createSignal(0);
  const [countdown, setCountdown] = createSignal(0);

  // eslint-disable-next-line solid/reactivity
  countdownTick();

  const intervalId = setInterval(countdownTick, 1000);
  onCleanup(() => clearInterval(intervalId));

  function countdownTick() {
    batch(() => {
      let newCountdown = countdown() - 1;

      if (newCountdown < 0) {
        newCountdown = 9;
        setDefunctChain(Math.floor(Math.random() * 7));
        setControllingChain(Math.floor(Math.random() * 7));
        setSharesOwnedInDefunctChain(Math.floor(Math.random() * 25) + 1);
        setSharesAvailableInControllingChain(Math.floor(Math.random() * 24) + 1);
      }

      setCountdown(newCountdown);
    });
  }

  function onSharesDisposed(traded: number, sold: number) {
    console.log('onSharesDisposed', traded, sold);
  }

  return (
    <>
      <h2>
        defunct owned: {sharesOwnedInDefunctChain()}, controlling available:{' '}
        {sharesAvailableInControllingChain()}, countdown: {countdown()}
      </h2>
      <p>
        <DisposeOfShares
          defunctChain={defunctChain()}
          controllingChain={controllingChain()}
          sharesOwnedInDefunctChain={sharesOwnedInDefunctChain()}
          sharesAvailableInControllingChain={sharesAvailableInControllingChain()}
          buttonSize={40}
          onSharesDisposed={onSharesDisposed}
        />
      </p>
    </>
  );
}
