import { batch, createSignal, For, onCleanup } from 'solid-js';
import { PB_GameBoardType } from '../../../common/pb';
import { PurchaseShares } from '../../components/PurchaseShares';
import { gameBoardTypeToHotelInitial } from '../../helpers';

export function PurchaseSharesExamples() {
  const allPurchaseSharesProps = [
    {
      scoreBoardAvailable: [3, 3, 3, 3, 3, 3, 3],
      scoreBoardPrice: [2, 3, 4, 5, 6, 7, 8],
      cash: 15,
      buttonSize: 40,
      onSharesPurchased,
    },
    {
      scoreBoardAvailable: [0, 1, 2, 3, 0, 1, 2],
      scoreBoardPrice: [0, 3, 4, 5, 0, 6, 5],
      cash: 15,
      buttonSize: 40,
      onSharesPurchased,
    },
    {
      scoreBoardAvailable: [1, 23, 6, 1, 1, 4, 1],
      scoreBoardPrice: [2, 0, 0, 5, 6, 0, 0],
      cash: 5,
      buttonSize: 40,
      onSharesPurchased,
    },
  ];

  return (
    <>
      <For each={allPurchaseSharesProps}>
        {(purchaseSharesProps) => (
          <>
            <h2>
              {getPurchaseSharesDescription(
                purchaseSharesProps.scoreBoardAvailable,
                purchaseSharesProps.scoreBoardPrice,
              )}
            </h2>
            <p>
              <PurchaseShares
                scoreBoardAvailable={purchaseSharesProps.scoreBoardAvailable}
                scoreBoardPrice={purchaseSharesProps.scoreBoardPrice}
                cash={purchaseSharesProps.cash}
                buttonSize={purchaseSharesProps.buttonSize}
                onSharesPurchased={purchaseSharesProps.onSharesPurchased}
              />
            </p>
          </>
        )}
      </For>
      <TestPurchaseSharesPropsChanging />
    </>
  );
}

function TestPurchaseSharesPropsChanging() {
  const [scoreBoardAvailable, setScoreBoardAvailable] = createSignal<number[]>([]);
  const [scoreBoardPrice, setScoreBoardPrice] = createSignal<number[]>([]);
  const [cash, setCash] = createSignal(0);
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
        setScoreBoardAvailable([
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
          Math.floor(Math.random() * 4),
        ]);
        setScoreBoardPrice([
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
          Math.random() < 0.5 ? Math.floor(Math.random() * 4) + 4 : 0,
        ]);
        setCash(Math.floor(Math.random() * 25));
      }

      setCountdown(newCountdown);
    });
  }

  return (
    <>
      <h2>
        {getPurchaseSharesDescription(scoreBoardAvailable(), scoreBoardPrice())}, countdown:{' '}
        {countdown()}
      </h2>
      <p>
        <PurchaseShares
          scoreBoardAvailable={scoreBoardAvailable()}
          scoreBoardPrice={scoreBoardPrice()}
          cash={cash()}
          buttonSize={40}
          onSharesPurchased={onSharesPurchased}
        />
      </p>
    </>
  );
}

function getPurchaseSharesDescription(scoreBoardAvailable: number[], scoreBoardPrice: number[]) {
  const parts: string[] = [];

  for (let chain = 0; chain < 7; chain++) {
    const numAvailable = scoreBoardAvailable[chain];
    const price = scoreBoardPrice[chain];
    if (numAvailable !== 0 && price !== 0) {
      parts.push(`${numAvailable}${gameBoardTypeToHotelInitial.get(chain)}@$${price * 100}`);
    }
  }

  return parts.join(', ');
}

function onSharesPurchased(chains: PB_GameBoardType[], endGame: boolean) {
  console.log('onSharesPurchased', chains, endGame);
}
