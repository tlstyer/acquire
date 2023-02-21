<script lang="ts">
	import GameHistory from '$lib/GameHistory.svelte';
	import type { GameState } from '../../common/game';
	import { getExampleGame1, getExampleGame2, getExampleGameForGameHistory } from './games';

	const gameForGameHistory = getExampleGameForGameHistory();
	const game1 = getExampleGame1();
	const game2 = getExampleGame2();

	const allGameHistoryProps: {
		usernames: string[];
		gameStateHistory: GameState[];
		selectedMove?: number;
		onMoveSelected: (index: number) => void;
	}[] = [
		{
			usernames: gameForGameHistory.usernames,
			gameStateHistory: gameForGameHistory.gameStateHistory,
			onMoveSelected(index: number) {
				console.log('onMoveSelected:', index);
				allGameHistoryProps[0].selectedMove = index;
			},
		},
		{
			usernames: game1.usernames,
			gameStateHistory: game1.gameStateHistory,
			onMoveSelected(index: number) {
				console.log('onMoveSelected:', index);
				allGameHistoryProps[1].selectedMove = index;
			},
		},
		{
			usernames: game2.usernames,
			gameStateHistory: game2.gameStateHistory,
			onMoveSelected(index: number) {
				console.log('onMoveSelected:', index);
				allGameHistoryProps[2].selectedMove = index;
			},
		},
		{
			usernames: gameForGameHistory.usernames,
			gameStateHistory: [gameForGameHistory.gameStateHistory[0]],
			onMoveSelected(index: number) {
				console.log('onMoveSelected:', index);
				allGameHistoryProps[3].selectedMove = index;
			},
		},
	];
</script>

{#each allGameHistoryProps as gameHistoryProps}
	<p>
		<GameHistory
			usernames={gameHistoryProps.usernames}
			gameStateHistory={gameHistoryProps.gameStateHistory}
			selectedMove={gameHistoryProps.selectedMove}
			onMoveSelected={gameHistoryProps.onMoveSelected}
		/>
	</p>
{/each}

<style>
	p {
		height: 300px;
	}
</style>
