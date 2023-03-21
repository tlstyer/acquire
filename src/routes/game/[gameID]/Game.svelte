<script lang="ts">
	import GameBoard from '$lib/GameBoard.svelte';
	import GameHistory from '$lib/GameHistory.svelte';
	import GameNavigationButtons from '$lib/GameNavigationButtons.svelte';
	import NextGameAction from '$lib/NextGameAction.svelte';
	import ScoreBoard from '$lib/ScoreBoard.svelte';
	import { gameBoardLabelMode } from '$lib/Settings.svelte';
	import TileRackReadOnly from '$lib/TileRackReadOnly.svelte';
	import { keyboardShortcutsEnabled } from '../../+layout.svelte';
	import type { Game } from '../../../common/game';
	import { ActionGameOver } from '../../../common/gameActions/gameOver';

	export let game: Game;

	let selectedMove: number | undefined;

	$: gameState = game.gameStateHistory[selectedMove ?? game.gameStateHistory.length - 1];

	let turnPlayerID = -1;
	let movePlayerID = -1;
	$: {
		const gameIsInProgress = !(gameState.nextGameAction instanceof ActionGameOver);

		turnPlayerID = gameIsInProgress ? gameState.turnPlayerID : -1;
		movePlayerID = gameIsInProgress ? gameState.nextGameAction.playerID : -1;
	}

	let followedPlayerID: number | undefined;

	let gameBoardTileRack: (number | null)[] | undefined;
	$: {
		if (game.userIDs.length > 1) {
			if (followedPlayerID !== undefined) {
				gameBoardTileRack = gameState.tileRacks[followedPlayerID];
			} else if (movePlayerID !== -1) {
				gameBoardTileRack = gameState.tileRacks[movePlayerID];
			} else {
				gameBoardTileRack = undefined;
			}
		} else {
			gameBoardTileRack = gameState.tileRacks[0];
		}
	}

	let windowInnerWidth = window.innerWidth;
	let windowInnerHeight = window.innerHeight;
	let gameBoardCellSize = 0;
	let scoreBoardCellWidth = 0;

	$: {
		const gameBoardCellSizeBasedOnWindowWidth = windowInnerWidth / 2 / 12;
		const gameBoardCellSizeBasedOnWindowHeight = (windowInnerHeight - 129) / 9;
		gameBoardCellSize = Math.floor(
			Math.min(gameBoardCellSizeBasedOnWindowWidth, gameBoardCellSizeBasedOnWindowHeight),
		);
		const gameBoardWidth = gameBoardCellSize * 12 + 2;

		const rightSideWidth = windowInnerWidth - gameBoardWidth - 2;
		scoreBoardCellWidth = Math.floor(Math.min(rightSideWidth - 2, gameBoardWidth) / 18);
	}

	function onMoveSelected(index: number) {
		selectedMove = index;
	}
</script>

<svelte:window bind:innerWidth={windowInnerWidth} bind:innerHeight={windowInnerHeight} />

<div class="root">
	<div>
		<GameBoard
			gameBoard={gameState.gameBoard}
			tileRack={gameBoardTileRack}
			labelMode={$gameBoardLabelMode}
			cellSize={gameBoardCellSize}
			onCellClicked={undefined}
		/>
	</div>
	<div class="rightSide">
		<div>
			<ScoreBoard
				usernames={game.usernames}
				scoreBoard={gameState.scoreBoard}
				scoreBoardAvailable={gameState.scoreBoardAvailable}
				scoreBoardChainSize={gameState.scoreBoardChainSize}
				scoreBoardPrice={gameState.scoreBoardPrice}
				safeChains={gameState.safeChains}
				{turnPlayerID}
				{movePlayerID}
				gameMode={game.gameMode}
				cellWidth={scoreBoardCellWidth}
			/>
		</div>
		{#each gameState.tileRacks as tileRack, playerID}
			<div>
				<div class="tileRackWrapper">
					<TileRackReadOnly
						tiles={tileRack}
						types={gameState.tileRackTypes[playerID]}
						buttonSize={gameBoardCellSize}
					/>
				</div>
				{#if game.userIDs.length > 1}
					<div class="buttonWrapper" style="height: {gameBoardCellSize}px">
						{#if playerID === followedPlayerID}
							<input type="button" value="Unlock" on:click={() => (followedPlayerID = undefined)} />
						{:else}
							<input type="button" value="Lock" on:click={() => (followedPlayerID = playerID)} />
						{/if}
					</div>
				{/if}
			</div>
		{/each}
		<GameNavigationButtons
			gameStateHistory={game.gameStateHistory}
			{selectedMove}
			keyboardShortcutsEnabled={$keyboardShortcutsEnabled}
			{onMoveSelected}
		/>
		<div>
			<GameHistory
				usernames={game.usernames}
				gameStateHistory={game.gameStateHistory}
				{selectedMove}
				{onMoveSelected}
			/>
		</div>
		<NextGameAction action={gameState.nextGameAction} />
	</div>
</div>

<style>
	.root {
		display: flex;
		flex-direction: row;
		column-gap: 2px;
		height: calc(100vh - var(--header-height));
		width: 100vw;
	}

	.root > :nth-child(2) {
		flex-grow: 1;
	}

	.rightSide {
		display: flex;
		flex-direction: column;
	}

	.rightSide > :nth-child(1) {
		margin-bottom: 2px;
		margin-left: -2px;
	}

	.rightSide > :nth-child(n + 2):nth-last-child(n + 4) {
		margin-bottom: 4px;
	}

	.rightSide > :nth-last-child(2) {
		height: 0;
		flex-grow: 1;
		margin-bottom: 2px;
	}

	.tileRackWrapper {
		display: inline-block;
		vertical-align: top;
	}

	.buttonWrapper {
		display: inline-block;
		margin-left: 4px;
	}

	.buttonWrapper > input {
		position: relative;
		top: 50%;
		transform: translateY(-50%);
	}
</style>
