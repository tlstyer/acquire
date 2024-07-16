<script lang="ts">
  import GameHistory from '$lib/GameHistory.svelte';
  import GameNavigationButtons from '$lib/GameNavigationButtons.svelte';
  import type { GameState } from '../../common/gameState';
  import EnableKeyboardShortcutsButton from './EnableKeyboardShortcutsButton.svelte';
  import { getExampleGame1, getExampleGame2, getExampleGameForGameHistory } from './games';

  const gameForGameHistory = getExampleGameForGameHistory();
  const game1 = getExampleGame1();
  const game2 = getExampleGame2();

  const allGameHistoryProps: {
    usernames: string[];
    gameStateHistory: GameState[];
    keyboardShortcutsEnabled: boolean;
    selectedMove?: number;
    onMoveSelected: (index: number) => void;
  }[] = [
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: gameForGameHistory.gameStateHistory,
      keyboardShortcutsEnabled: false,
      onMoveSelected(index: number) {
        console.log('onMoveSelected:', index);
        allGameHistoryProps[0].selectedMove = index;
      },
    },
    {
      usernames: game1.usernames,
      gameStateHistory: game1.gameStateHistory,
      keyboardShortcutsEnabled: false,
      onMoveSelected(index: number) {
        console.log('onMoveSelected:', index);
        allGameHistoryProps[1].selectedMove = index;
      },
    },
    {
      usernames: game2.usernames,
      gameStateHistory: game2.gameStateHistory,
      keyboardShortcutsEnabled: false,
      onMoveSelected(index: number) {
        console.log('onMoveSelected:', index);
        allGameHistoryProps[2].selectedMove = index;
      },
    },
    {
      usernames: gameForGameHistory.usernames,
      gameStateHistory: [gameForGameHistory.gameStateHistory[0]],
      keyboardShortcutsEnabled: false,
      onMoveSelected(index: number) {
        console.log('onMoveSelected:', index);
        allGameHistoryProps[3].selectedMove = index;
      },
    },
  ];
</script>

{#each allGameHistoryProps as gameHistoryProps}
  <p>
    <EnableKeyboardShortcutsButton bind:enabled={gameHistoryProps.keyboardShortcutsEnabled} />
  </p>
  <GameNavigationButtons
    gameStateHistory={gameHistoryProps.gameStateHistory}
    selectedMove={gameHistoryProps.selectedMove}
    keyboardShortcutsEnabled={gameHistoryProps.keyboardShortcutsEnabled}
    onMoveSelected={gameHistoryProps.onMoveSelected}
  />
  <div>
    <GameHistory
      usernames={gameHistoryProps.usernames}
      gameStateHistory={gameHistoryProps.gameStateHistory}
      selectedMove={gameHistoryProps.selectedMove}
      onMoveSelected={gameHistoryProps.onMoveSelected}
    />
  </div>
{/each}

<style>
  div {
    height: 300px;
  }
</style>
