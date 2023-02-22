<svelte:options immutable />

<script lang="ts">
	import { getTileString } from '$lib/helpers';
	import HotelName from '$lib/HotelName.svelte';
	import Username from '$lib/Username.svelte';
	import { GameHistoryMessageEnum } from '../../common/enums';
	import type { GameHistoryMessageData } from '../../common/gameState';

	export let usernames: string[];
	export let gameHistoryMessageData: GameHistoryMessageData;

	const username =
		gameHistoryMessageData.playerID !== null ? usernames[gameHistoryMessageData.playerID] : '';
</script>

<div>
	{#if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.TurnBegan}
		<fieldset><legend><Username {username} /></legend></fieldset>
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.DrewPositionTile}
		<Username {username} /> drew position tile {getTileString(
			gameHistoryMessageData.parameters[0],
		)}.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.StartedGame}
		<Username {username} /> started the game.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.DrewTile}
		<Username {username} /> drew tile {getTileString(gameHistoryMessageData.parameters[0])}.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.HasNoPlayableTile}
		<Username {username} /> has no playable tile.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.PlayedTile}
		<Username {username} /> played tile {getTileString(gameHistoryMessageData.parameters[0])}.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.FormedChain}
		<Username {username} /> formed <HotelName chain={gameHistoryMessageData.parameters[0]} />.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.MergedChains}
		<Username {username} /> merged
		{#if gameHistoryMessageData.parameters[0].length === 2}
			<HotelName chain={gameHistoryMessageData.parameters[0][0]} /> and
			<HotelName chain={gameHistoryMessageData.parameters[0][1]} />.
		{:else if gameHistoryMessageData.parameters[0].length === 3}
			<HotelName chain={gameHistoryMessageData.parameters[0][0]} />,
			<HotelName chain={gameHistoryMessageData.parameters[0][1]} />, and
			<HotelName chain={gameHistoryMessageData.parameters[0][2]} />.
		{:else}
			<HotelName chain={gameHistoryMessageData.parameters[0][0]} />,
			<HotelName chain={gameHistoryMessageData.parameters[0][1]} />,
			<HotelName chain={gameHistoryMessageData.parameters[0][2]} />, and
			<HotelName chain={gameHistoryMessageData.parameters[0][3]} />.
		{/if}
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.SelectedMergerSurvivor}
		<Username {username} /> selected <HotelName chain={gameHistoryMessageData.parameters[0]} /> as merger
		survivor.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.SelectedChainToDisposeOfNext}
		<Username {username} /> selected <HotelName chain={gameHistoryMessageData.parameters[0]} /> as chain
		to dispose of next.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.ReceivedBonus}
		<Username {username} /> received a ${gameHistoryMessageData.parameters[1] * 100}
		<HotelName chain={gameHistoryMessageData.parameters[0]} /> bonus.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.DisposedOfShares}
		<Username {username} /> traded {gameHistoryMessageData.parameters[1]} and sold {gameHistoryMessageData
			.parameters[2]}
		<HotelName chain={gameHistoryMessageData.parameters[0]} /> shares.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.CouldNotAffordAnyShares}
		<Username {username} /> could not afford any shares.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.PurchasedShares}
		<Username {username} /> purchased
		{#if gameHistoryMessageData.parameters[0].length === 0}
			nothing.
		{:else if gameHistoryMessageData.parameters[0].length === 1}
			{gameHistoryMessageData.parameters[0][0][1]}
			<HotelName chain={gameHistoryMessageData.parameters[0][0][0]} />.
		{:else if gameHistoryMessageData.parameters[0].length === 2}
			{gameHistoryMessageData.parameters[0][0][1]}
			<HotelName chain={gameHistoryMessageData.parameters[0][0][0]} /> and
			{gameHistoryMessageData.parameters[0][1][1]}
			<HotelName chain={gameHistoryMessageData.parameters[0][1][0]} />.
		{:else}
			{gameHistoryMessageData.parameters[0][0][1]}
			<HotelName chain={gameHistoryMessageData.parameters[0][0][0]} />,
			{gameHistoryMessageData.parameters[0][1][1]}
			<HotelName chain={gameHistoryMessageData.parameters[0][1][0]} />, and
			{gameHistoryMessageData.parameters[0][2][1]}
			<HotelName chain={gameHistoryMessageData.parameters[0][2][0]} />.
		{/if}
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.DrewLastTile}
		<Username {username} /> drew the last tile from the tile bag.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.ReplacedDeadTile}
		<Username {username} /> replaced dead tile {getTileString(
			gameHistoryMessageData.parameters[0],
		)}.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.EndedGame}
		<Username {username} /> ended the game.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.NoTilesPlayedForEntireRound}
		No tiles played for an entire round. Game end forced.
	{:else if gameHistoryMessageData.gameHistoryMessage === GameHistoryMessageEnum.AllTilesPlayed}
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
