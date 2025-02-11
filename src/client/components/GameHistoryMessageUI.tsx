import { Match, Switch } from 'solid-js';
import {
  type GameHistoryMessage,
  GameHistoryMessageAllTilesPlayed,
  GameHistoryMessageCouldNotAffordAnyShares,
  GameHistoryMessageDisposedOfShares,
  GameHistoryMessageDrewLastTile,
  GameHistoryMessageDrewPositionTile,
  GameHistoryMessageDrewTile,
  GameHistoryMessageEndedGame,
  GameHistoryMessageFormedChain,
  GameHistoryMessageHasNoPlayableTile,
  GameHistoryMessageMergedChains,
  GameHistoryMessageNoTilesPlayedForEntireRound,
  GameHistoryMessagePlayedTile,
  GameHistoryMessagePurchasedShares,
  GameHistoryMessageReceivedBonus,
  GameHistoryMessageReplacedDeadTile,
  GameHistoryMessageSelectedChainToDisposeOfNext,
  GameHistoryMessageSelectedMergerSurvivor,
  GameHistoryMessageStartedGame,
  GameHistoryMessageTurnBegan,
} from '../../common/gameHistoryMessage.js';
import { toTileString } from '../../common/helpers.js';
import { type User } from '../../common/user.js';
import styles from './GameHistoryMessageUI.module.css';
import { HotelName } from './HotelName.js';
import { Username } from './Username.js';

export function GameHistoryMessageUI(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessage;
}) {
  return (
    <div class={styles.root}>
      <Switch fallback={<>Mystery message!</>}>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageTurnBegan}>
          <GameHistoryMessageUITurnBegan
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageTurnBegan}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile}>
          <GameHistoryMessageUIDrewPositionTile
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDrewPositionTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageStartedGame}>
          <GameHistoryMessageUIStartedGame
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageStartedGame}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewTile}>
          <GameHistoryMessageUIDrewTile
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDrewTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile}>
          <GameHistoryMessageUIHasNoPlayableTile
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageHasNoPlayableTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessagePlayedTile}>
          <GameHistoryMessageUIPlayedTile
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessagePlayedTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageFormedChain}>
          <GameHistoryMessageUIFormedChain
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageFormedChain}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageMergedChains}>
          <GameHistoryMessageUIMergedChains
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageMergedChains}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor}>
          <GameHistoryMessageUISelectedMergerSurvivor
            users={props.users}
            gameHistoryMessage={
              props.gameHistoryMessage as GameHistoryMessageSelectedMergerSurvivor
            }
          />
        </Match>
        <Match
          when={props.gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext}
        >
          <GameHistoryMessageUISelectedChainToDisposeOfNext
            users={props.users}
            gameHistoryMessage={
              props.gameHistoryMessage as GameHistoryMessageSelectedChainToDisposeOfNext
            }
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageReceivedBonus}>
          <GameHistoryMessageUIReceivedBonus
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageReceivedBonus}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares}>
          <GameHistoryMessageUIDisposedOfShares
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDisposedOfShares}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares}>
          <GameHistoryMessageUICouldNotAffordAnyShares
            users={props.users}
            gameHistoryMessage={
              props.gameHistoryMessage as GameHistoryMessageCouldNotAffordAnyShares
            }
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessagePurchasedShares}>
          <GameHistoryMessageUIPurchasedShares
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessagePurchasedShares}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewLastTile}>
          <GameHistoryMessageUIDrewLastTile
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDrewLastTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile}>
          <GameHistoryMessageUIReplacedDeadTile
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageReplacedDeadTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageEndedGame}>
          <GameHistoryMessageUIEndedGame
            users={props.users}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageEndedGame}
          />
        </Match>
        <Match
          when={props.gameHistoryMessage instanceof GameHistoryMessageNoTilesPlayedForEntireRound}
        >
          No tiles played for an entire round. Game end forced.
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageAllTilesPlayed}>
          All tiles have been played. Game end forced.
        </Match>
      </Switch>
    </div>
  );
}

function GameHistoryMessageUITurnBegan(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageTurnBegan;
}) {
  return (
    <>
      <fieldset>
        <legend>
          <Username username={props.users[props.gameHistoryMessage.playerId].name} />
        </legend>
      </fieldset>
    </>
  );
}

function GameHistoryMessageUIDrewPositionTile(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageDrewPositionTile;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> drew position tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIStartedGame(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageStartedGame;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> started the game.
    </>
  );
}

function GameHistoryMessageUIDrewTile(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageDrewTile;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> drew tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIHasNoPlayableTile(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageHasNoPlayableTile;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> has no playable
      tile.
    </>
  );
}

function GameHistoryMessageUIPlayedTile(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessagePlayedTile;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> played tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIFormedChain(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageFormedChain;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> formed{' '}
      <HotelName chain={props.gameHistoryMessage.chain} />.
    </>
  );
}

function GameHistoryMessageUIMergedChains(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageMergedChains;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> merged{' '}
      <Switch>
        <Match when={props.gameHistoryMessage.chains.length === 2}>
          <HotelName chain={props.gameHistoryMessage.chains[0]} /> and{' '}
          <HotelName chain={props.gameHistoryMessage.chains[1]} />.
        </Match>
        <Match when={props.gameHistoryMessage.chains.length === 3}>
          <HotelName chain={props.gameHistoryMessage.chains[0]} />,{' '}
          <HotelName chain={props.gameHistoryMessage.chains[1]} />, and{' '}
          <HotelName chain={props.gameHistoryMessage.chains[2]} />.
        </Match>
        <Match when={true}>
          <HotelName chain={props.gameHistoryMessage.chains[0]} />,{' '}
          <HotelName chain={props.gameHistoryMessage.chains[1]} />,{' '}
          <HotelName chain={props.gameHistoryMessage.chains[2]} />, and{' '}
          <HotelName chain={props.gameHistoryMessage.chains[3]} />.
        </Match>
      </Switch>
    </>
  );
}

function GameHistoryMessageUISelectedMergerSurvivor(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageSelectedMergerSurvivor;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> selected{' '}
      <HotelName chain={props.gameHistoryMessage.chain} /> as merger survivor.
    </>
  );
}

function GameHistoryMessageUISelectedChainToDisposeOfNext(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageSelectedChainToDisposeOfNext;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> selected{' '}
      <HotelName chain={props.gameHistoryMessage.chain} /> as chain to dispose of next.
    </>
  );
}

function GameHistoryMessageUIReceivedBonus(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageReceivedBonus;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> received a $
      {props.gameHistoryMessage.amount * 100} <HotelName chain={props.gameHistoryMessage.chain} />{' '}
      bonus.
    </>
  );
}

function GameHistoryMessageUIDisposedOfShares(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageDisposedOfShares;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> traded{' '}
      {props.gameHistoryMessage.tradeAmount} and sold {props.gameHistoryMessage.sellAmount}{' '}
      <HotelName chain={props.gameHistoryMessage.chain} /> shares.
    </>
  );
}

function GameHistoryMessageUICouldNotAffordAnyShares(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageCouldNotAffordAnyShares;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> could not afford
      any shares.
    </>
  );
}

function GameHistoryMessageUIPurchasedShares(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessagePurchasedShares;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> purchased{' '}
      <Switch>
        <Match when={props.gameHistoryMessage.chainsAndCounts.length === 0}>nothing.</Match>
        <Match when={props.gameHistoryMessage.chainsAndCounts.length === 1}>
          {props.gameHistoryMessage.chainsAndCounts[0].count}{' '}
          <HotelName chain={props.gameHistoryMessage.chainsAndCounts[0].chain} />.
        </Match>
        <Match when={props.gameHistoryMessage.chainsAndCounts.length === 2}>
          {props.gameHistoryMessage.chainsAndCounts[0].count}{' '}
          <HotelName chain={props.gameHistoryMessage.chainsAndCounts[0].chain} /> and{' '}
          {props.gameHistoryMessage.chainsAndCounts[1].count}{' '}
          <HotelName chain={props.gameHistoryMessage.chainsAndCounts[1].chain} />.
        </Match>
        <Match when={true}>
          {props.gameHistoryMessage.chainsAndCounts[0].count}{' '}
          <HotelName chain={props.gameHistoryMessage.chainsAndCounts[0].chain} />,{' '}
          {props.gameHistoryMessage.chainsAndCounts[1].count}{' '}
          <HotelName chain={props.gameHistoryMessage.chainsAndCounts[1].chain} />, and{' '}
          {props.gameHistoryMessage.chainsAndCounts[2].count}{' '}
          <HotelName chain={props.gameHistoryMessage.chainsAndCounts[2].chain} />.
        </Match>
      </Switch>
    </>
  );
}

function GameHistoryMessageUIDrewLastTile(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageDrewLastTile;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> drew the last tile
      from the tile bag.
    </>
  );
}

function GameHistoryMessageUIReplacedDeadTile(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageReplacedDeadTile;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> replaced dead tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIEndedGame(props: {
  users: User[];
  gameHistoryMessage: GameHistoryMessageEndedGame;
}) {
  return (
    <>
      <Username username={props.users[props.gameHistoryMessage.playerId].name} /> ended the game.
    </>
  );
}
