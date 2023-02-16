<script lang="ts">
  import GameListing from '$lib/GameListing.svelte';
  import { defaultGameBoard } from '../../common/defaults';
  import { PB_GameMode, PB_GameStatus } from '../../common/pb';
  import { getExampleGame1, getExampleGame2 } from './games';

  const allGameListingProps = [
    {
      gameBoard: defaultGameBoard(),
      usernames: ['Host', null, 'User 2', null],
      gameDisplayNumber: 1,
      gameMode: PB_GameMode.SINGLES_4,
      gameStatus: PB_GameStatus.SETTING_UP,
      onEnterClicked,
    },
    {
      gameBoard: getExampleGame1().gameBoard,
      usernames: ['Tim', 'Rita', 'Dad', 'Mom', 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME', 'pgyqj,;'],
      gameDisplayNumber: 2,
      gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2,
      gameStatus: PB_GameStatus.IN_PROGRESS,
      onEnterClicked,
    },
    {
      gameBoard: getExampleGame2().gameBoard,
      usernames: ['player 1', 'player 2', 'player 3', 'player 4'],
      gameDisplayNumber: 3,
      gameMode: PB_GameMode.TEAMS_2_VS_2,
      gameStatus: PB_GameStatus.COMPLETED,
      onEnterClicked,
    },
  ];

  function onEnterClicked() {
    console.log('onEnterClicked');
  }
</script>

{#each allGameListingProps as gameListingProps}
  <p>
    <GameListing
      gameBoard={gameListingProps.gameBoard}
      usernames={gameListingProps.usernames}
      gameDisplayNumber={gameListingProps.gameDisplayNumber}
      gameMode={gameListingProps.gameMode}
      gameStatus={gameListingProps.gameStatus}
      onEnterClicked={gameListingProps.onEnterClicked}
    />
  </p>
{/each}
