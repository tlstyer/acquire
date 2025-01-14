import { Match, Switch } from 'solid-js';
import {
  GameHistoryMessage,
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
} from '../../common/gameHistoryMessage';
import { toTileString } from '../../common/helpers';
import styles from './GameHistoryMessageUI.module.css';
import { HotelName } from './HotelName';
import { Username } from './Username';

export function GameHistoryMessageUI(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessage;
}) {
  return (
    <div class={styles.root}>
      <Switch fallback={<>Mystery message!</>}>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageTurnBegan}>
          <GameHistoryMessageUITurnBegan
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageTurnBegan}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile}>
          <GameHistoryMessageUIDrewPositionTile
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDrewPositionTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageStartedGame}>
          <GameHistoryMessageUIStartedGame
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageStartedGame}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewTile}>
          <GameHistoryMessageUIDrewTile
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDrewTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile}>
          <GameHistoryMessageUIHasNoPlayableTile
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageHasNoPlayableTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessagePlayedTile}>
          <GameHistoryMessageUIPlayedTile
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessagePlayedTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageFormedChain}>
          <GameHistoryMessageUIFormedChain
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageFormedChain}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageMergedChains}>
          <GameHistoryMessageUIMergedChains
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageMergedChains}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor}>
          <GameHistoryMessageUISelectedMergerSurvivor
            usernames={props.usernames}
            gameHistoryMessage={
              props.gameHistoryMessage as GameHistoryMessageSelectedMergerSurvivor
            }
          />
        </Match>
        <Match
          when={props.gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext}
        >
          <GameHistoryMessageUISelectedChainToDisposeOfNext
            usernames={props.usernames}
            gameHistoryMessage={
              props.gameHistoryMessage as GameHistoryMessageSelectedChainToDisposeOfNext
            }
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageReceivedBonus}>
          <GameHistoryMessageUIReceivedBonus
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageReceivedBonus}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares}>
          <GameHistoryMessageUIDisposedOfShares
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDisposedOfShares}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares}>
          <GameHistoryMessageUICouldNotAffordAnyShares
            usernames={props.usernames}
            gameHistoryMessage={
              props.gameHistoryMessage as GameHistoryMessageCouldNotAffordAnyShares
            }
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessagePurchasedShares}>
          <GameHistoryMessageUIPurchasedShares
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessagePurchasedShares}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageDrewLastTile}>
          <GameHistoryMessageUIDrewLastTile
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageDrewLastTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile}>
          <GameHistoryMessageUIReplacedDeadTile
            usernames={props.usernames}
            gameHistoryMessage={props.gameHistoryMessage as GameHistoryMessageReplacedDeadTile}
          />
        </Match>
        <Match when={props.gameHistoryMessage instanceof GameHistoryMessageEndedGame}>
          <GameHistoryMessageUIEndedGame
            usernames={props.usernames}
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
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageTurnBegan;
}) {
  return (
    <>
      <fieldset>
        <legend>
          <Username username={props.usernames[props.gameHistoryMessage.playerID]} />
        </legend>
      </fieldset>
    </>
  );
}

function GameHistoryMessageUIDrewPositionTile(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageDrewPositionTile;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> drew position tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIStartedGame(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageStartedGame;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> started the game.
    </>
  );
}

function GameHistoryMessageUIDrewTile(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageDrewTile;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> drew tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIHasNoPlayableTile(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageHasNoPlayableTile;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> has no playable
      tile.
    </>
  );
}

function GameHistoryMessageUIPlayedTile(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessagePlayedTile;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> played tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIFormedChain(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageFormedChain;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> formed{' '}
      <HotelName chain={props.gameHistoryMessage.chain} />.
    </>
  );
}

function GameHistoryMessageUIMergedChains(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageMergedChains;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> merged{' '}
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
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageSelectedMergerSurvivor;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> selected{' '}
      <HotelName chain={props.gameHistoryMessage.chain} /> as merger survivor.
    </>
  );
}

function GameHistoryMessageUISelectedChainToDisposeOfNext(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageSelectedChainToDisposeOfNext;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> selected{' '}
      <HotelName chain={props.gameHistoryMessage.chain} /> as chain to dispose of next.
    </>
  );
}

function GameHistoryMessageUIReceivedBonus(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageReceivedBonus;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> received a $
      {props.gameHistoryMessage.amount * 100} <HotelName chain={props.gameHistoryMessage.chain} />{' '}
      bonus.
    </>
  );
}

function GameHistoryMessageUIDisposedOfShares(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageDisposedOfShares;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> traded{' '}
      {props.gameHistoryMessage.tradeAmount} and sold {props.gameHistoryMessage.sellAmount}{' '}
      <HotelName chain={props.gameHistoryMessage.chain} /> shares.
    </>
  );
}

function GameHistoryMessageUICouldNotAffordAnyShares(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageCouldNotAffordAnyShares;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> could not afford
      any shares.
    </>
  );
}

function GameHistoryMessageUIPurchasedShares(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessagePurchasedShares;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> purchased{' '}
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
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageDrewLastTile;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> drew the last tile
      from the tile bag.
    </>
  );
}

function GameHistoryMessageUIReplacedDeadTile(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageReplacedDeadTile;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> replaced dead tile{' '}
      {toTileString(props.gameHistoryMessage.tile)}.
    </>
  );
}

function GameHistoryMessageUIEndedGame(props: {
  usernames: string[];
  gameHistoryMessage: GameHistoryMessageEndedGame;
}) {
  return (
    <>
      <Username username={props.usernames[props.gameHistoryMessage.playerID]} /> ended the game.
    </>
  );
}
