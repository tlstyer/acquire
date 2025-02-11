import { Match, Switch } from 'solid-js';
import { type ActionBase } from '../../common/gameActions/base.js';
import { ActionDisposeOfShares } from '../../common/gameActions/disposeOfShares.js';
import { ActionGameOver } from '../../common/gameActions/gameOver.js';
import { ActionPlayTile } from '../../common/gameActions/playTile.js';
import { ActionPurchaseShares } from '../../common/gameActions/purchaseShares.js';
import { ActionSelectChainToDisposeOfNext } from '../../common/gameActions/selectChainToDisposeOfNext.js';
import { ActionSelectMergerSurvivor } from '../../common/gameActions/selectMergerSurvivor.js';
import { ActionSelectNewChain } from '../../common/gameActions/selectNewChain.js';
import { ActionStartGame } from '../../common/gameActions/startGame.js';
import { HotelName } from './HotelName.js';
import styles from './NextGameAction.module.css';
import { NextGameActionHotelInitialsList } from './NextGameActionHotelInitialsList.js';
import { Username } from './Username.js';

export function NextGameAction(props: { action: ActionBase }) {
  return (
    <div class={styles.root}>
      <Switch fallback={<>Unknown game status.</>}>
        <Match when={props.action instanceof ActionStartGame}>
          <NextGameActionStartGame action={props.action as ActionStartGame} />
        </Match>
        <Match when={props.action instanceof ActionPlayTile}>
          <NextGameActionPlayTile action={props.action as ActionPlayTile} />
        </Match>
        <Match when={props.action instanceof ActionSelectNewChain}>
          <NextGameActionSelectNewChain action={props.action as ActionSelectNewChain} />
        </Match>
        <Match when={props.action instanceof ActionSelectMergerSurvivor}>
          <NextGameActionSelectMergerSurvivor action={props.action as ActionSelectMergerSurvivor} />
        </Match>
        <Match when={props.action instanceof ActionSelectChainToDisposeOfNext}>
          <NextGameActionSelectChainToDisposeOfNext
            action={props.action as ActionSelectChainToDisposeOfNext}
          />
        </Match>
        <Match when={props.action instanceof ActionDisposeOfShares}>
          <NextGameActionDisposeOfShares action={props.action as ActionDisposeOfShares} />
        </Match>
        <Match when={props.action instanceof ActionPurchaseShares}>
          <NextGameActionPurchaseShares action={props.action as ActionPurchaseShares} />
        </Match>
        <Match when={props.action instanceof ActionGameOver}>Game over.</Match>
      </Switch>
    </div>
  );
}

function NextGameActionStartGame(props: { action: ActionStartGame }) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      start the game.
    </>
  );
}

function NextGameActionPlayTile(props: { action: ActionPlayTile }) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      play a tile.
    </>
  );
}

function NextGameActionSelectNewChain(props: { action: ActionSelectNewChain }) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      select new chain (<NextGameActionHotelInitialsList chains={props.action.availableChains} />
      ).
    </>
  );
}

function NextGameActionSelectMergerSurvivor(props: { action: ActionSelectMergerSurvivor }) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      select merger survivor (
      <NextGameActionHotelInitialsList chains={props.action.chainsBySize[0]} />
      ).
    </>
  );
}

function NextGameActionSelectChainToDisposeOfNext(props: {
  action: ActionSelectChainToDisposeOfNext;
}) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      select chain to dispose of next (
      <NextGameActionHotelInitialsList chains={props.action.defunctChains} />
      ).
    </>
  );
}

function NextGameActionDisposeOfShares(props: { action: ActionDisposeOfShares }) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      dispose of <HotelName chain={props.action.defunctChain} /> shares.
    </>
  );
}

function NextGameActionPurchaseShares(props: { action: ActionPurchaseShares }) {
  return (
    <>
      Waiting for <Username username={props.action.game.users[props.action.playerId].name} /> to
      purchase shares.
    </>
  );
}
