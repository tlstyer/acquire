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
    onMoveClicked: (index: number) => void;
  }[] = [
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: gameForGameHistory.gameStateHistory,
      onMoveClicked,
    },
    {
      usernames: game1.usernames,
      gameStateHistory: game1.gameStateHistory,
      onMoveClicked,
    },
    {
      usernames: game2.usernames,
      gameStateHistory: game2.gameStateHistory,
      onMoveClicked,
    },
  ];

  function onMoveClicked(index: number) {
    console.log('onMoveClicked:', index);

    allGameHistoryProps[0].selectedMove = index;
    allGameHistoryProps[1].selectedMove = index;
    allGameHistoryProps[2].selectedMove = index;
  }
</script>

{#each allGameHistoryProps as gameHistoryProps}
  <p>
    <GameHistory
      usernames={gameHistoryProps.usernames}
      gameStateHistory={gameHistoryProps.gameStateHistory}
      selectedMove={gameHistoryProps.selectedMove}
      onMoveClicked={gameHistoryProps.onMoveClicked}
    />
  </p>
{/each}

<style>
  p {
    height: 300px;
  }
</style>
