import { batch, createSignal, For, onCleanup } from 'solid-js';
import { PB_GameBoardType } from '../../../common/pb.js';
import { DisposeOfShares } from '../../components/DisposeOfShares.js';
import { processBrowserMyKeyboardEvents } from '../../myKeyboardEvents.js';
import { EnableKeyboardShortcutsButton } from './EnableKeyboardShortcutsButton.js';

export function DisposeOfSharesExamples() {
  const allProps = [
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
      <For each={allProps}>
        {(props) => {
          const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = createSignal(false);

          return (
            <>
              <h2>
                defunct owned: {props.sharesOwnedInDefunctChain}, controlling available:{' '}
                {props.sharesAvailableInControllingChain}
              </h2>
              <p>
                <EnableKeyboardShortcutsButton onChangeEnabled={setKeyboardShortcutsEnabled} />
              </p>
              <p>
                <DisposeOfShares
                  ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
                  defunctChain={props.defunctChain}
                  controllingChain={props.controllingChain}
                  sharesOwnedInDefunctChain={props.sharesOwnedInDefunctChain}
                  sharesAvailableInControllingChain={props.sharesAvailableInControllingChain}
                  buttonSize={props.buttonSize}
                  onSharesDisposed={props.onSharesDisposed}
                />
              </p>
            </>
          );
        }}
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

  const [keyboardShortcutsEnabled, setKeyboardShortcutsEnabled] = createSignal(false);

  return (
    <>
      <h2>
        defunct owned: {sharesOwnedInDefunctChain()}, controlling available:{' '}
        {sharesAvailableInControllingChain()}, countdown: {countdown()}
      </h2>
      <p>
        <EnableKeyboardShortcutsButton onChangeEnabled={setKeyboardShortcutsEnabled} />
      </p>
      <p>
        <DisposeOfShares
          ref={(ref) => processBrowserMyKeyboardEvents(keyboardShortcutsEnabled, ref)}
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
