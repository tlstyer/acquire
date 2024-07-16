<svelte:options immutable />

<script lang="ts">
  import HotelName from '$lib/HotelName.svelte';
  import Username from '$lib/Username.svelte';
  import {
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
    type GameHistoryMessage,
  } from '../../common/gameHistoryMessage';
  import { toTileString } from '../../common/helpers';

  export let usernames: string[];
  export let gameHistoryMessage: GameHistoryMessage;
</script>

<div>
  {#if gameHistoryMessage instanceof GameHistoryMessageTurnBegan}
    <fieldset>
      <legend><Username username={usernames[gameHistoryMessage.playerID]} /></legend>
    </fieldset>
  {:else if gameHistoryMessage instanceof GameHistoryMessageDrewPositionTile}
    <Username username={usernames[gameHistoryMessage.playerID]} /> drew position tile {toTileString(
      gameHistoryMessage.tile,
    )}.
  {:else if gameHistoryMessage instanceof GameHistoryMessageStartedGame}
    <Username username={usernames[gameHistoryMessage.playerID]} /> started the game.
  {:else if gameHistoryMessage instanceof GameHistoryMessageDrewTile}
    <Username username={usernames[gameHistoryMessage.playerID]} /> drew tile {toTileString(
      gameHistoryMessage.tile,
    )}.
  {:else if gameHistoryMessage instanceof GameHistoryMessageHasNoPlayableTile}
    <Username username={usernames[gameHistoryMessage.playerID]} /> has no playable tile.
  {:else if gameHistoryMessage instanceof GameHistoryMessagePlayedTile}
    <Username username={usernames[gameHistoryMessage.playerID]} /> played tile {toTileString(
      gameHistoryMessage.tile,
    )}.
  {:else if gameHistoryMessage instanceof GameHistoryMessageFormedChain}
    <Username username={usernames[gameHistoryMessage.playerID]} /> formed <HotelName
      chain={gameHistoryMessage.chain}
    />.
  {:else if gameHistoryMessage instanceof GameHistoryMessageMergedChains}
    <Username username={usernames[gameHistoryMessage.playerID]} /> merged
    {#if gameHistoryMessage.chains.length === 2}
      <HotelName chain={gameHistoryMessage.chains[0]} /> and
      <HotelName chain={gameHistoryMessage.chains[1]} />.
    {:else if gameHistoryMessage.chains.length === 3}
      <HotelName chain={gameHistoryMessage.chains[0]} />,
      <HotelName chain={gameHistoryMessage.chains[1]} />, and
      <HotelName chain={gameHistoryMessage.chains[2]} />.
    {:else}
      <HotelName chain={gameHistoryMessage.chains[0]} />,
      <HotelName chain={gameHistoryMessage.chains[1]} />,
      <HotelName chain={gameHistoryMessage.chains[2]} />, and
      <HotelName chain={gameHistoryMessage.chains[3]} />.
    {/if}
  {:else if gameHistoryMessage instanceof GameHistoryMessageSelectedMergerSurvivor}
    <Username username={usernames[gameHistoryMessage.playerID]} /> selected <HotelName
      chain={gameHistoryMessage.chain}
    /> as merger survivor.
  {:else if gameHistoryMessage instanceof GameHistoryMessageSelectedChainToDisposeOfNext}
    <Username username={usernames[gameHistoryMessage.playerID]} /> selected <HotelName
      chain={gameHistoryMessage.chain}
    /> as chain to dispose of next.
  {:else if gameHistoryMessage instanceof GameHistoryMessageReceivedBonus}
    <Username username={usernames[gameHistoryMessage.playerID]} /> received a ${gameHistoryMessage.amount *
      100}
    <HotelName chain={gameHistoryMessage.chain} /> bonus.
  {:else if gameHistoryMessage instanceof GameHistoryMessageDisposedOfShares}
    <Username username={usernames[gameHistoryMessage.playerID]} /> traded {gameHistoryMessage.tradeAmount}
    and sold {gameHistoryMessage.sellAmount}
    <HotelName chain={gameHistoryMessage.chain} /> shares.
  {:else if gameHistoryMessage instanceof GameHistoryMessageCouldNotAffordAnyShares}
    <Username username={usernames[gameHistoryMessage.playerID]} /> could not afford any shares.
  {:else if gameHistoryMessage instanceof GameHistoryMessagePurchasedShares}
    <Username username={usernames[gameHistoryMessage.playerID]} /> purchased
    {#if gameHistoryMessage.chainsAndCounts.length === 0}
      nothing.
    {:else if gameHistoryMessage.chainsAndCounts.length === 1}
      {gameHistoryMessage.chainsAndCounts[0].count}
      <HotelName chain={gameHistoryMessage.chainsAndCounts[0].chain} />.
    {:else if gameHistoryMessage.chainsAndCounts.length === 2}
      {gameHistoryMessage.chainsAndCounts[0].count}
      <HotelName chain={gameHistoryMessage.chainsAndCounts[0].chain} /> and
      {gameHistoryMessage.chainsAndCounts[1].count}
      <HotelName chain={gameHistoryMessage.chainsAndCounts[1].chain} />.
    {:else}
      {gameHistoryMessage.chainsAndCounts[0].count}
      <HotelName chain={gameHistoryMessage.chainsAndCounts[0].chain} />,
      {gameHistoryMessage.chainsAndCounts[1].count}
      <HotelName chain={gameHistoryMessage.chainsAndCounts[1].chain} />, and
      {gameHistoryMessage.chainsAndCounts[2].count}
      <HotelName chain={gameHistoryMessage.chainsAndCounts[2].chain} />.
    {/if}
  {:else if gameHistoryMessage instanceof GameHistoryMessageDrewLastTile}
    <Username username={usernames[gameHistoryMessage.playerID]} /> drew the last tile from the tile bag.
  {:else if gameHistoryMessage instanceof GameHistoryMessageReplacedDeadTile}
    <Username username={usernames[gameHistoryMessage.playerID]} /> replaced dead tile {toTileString(
      gameHistoryMessage.tile,
    )}.
  {:else if gameHistoryMessage instanceof GameHistoryMessageEndedGame}
    <Username username={usernames[gameHistoryMessage.playerID]} /> ended the game.
  {:else if gameHistoryMessage instanceof GameHistoryMessageNoTilesPlayedForEntireRound}
    No tiles played for an entire round. Game end forced.
  {:else if gameHistoryMessage instanceof GameHistoryMessageAllTilesPlayed}
    All tiles have been played. Game end forced.
  {:else}
    Mystery message!
  {/if}
</div>

<style>
  fieldset {
    border-bottom: none;
    border-left: none;
    border-right: none;
    border-top: 1px solid #000000;
    margin: 0;
    padding: 0;
    text-align: center;
  }

  legend {
    padding: 0 5px;
  }
</style>
