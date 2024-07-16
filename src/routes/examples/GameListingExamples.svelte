<script lang="ts">
  import GameListing from '$lib/GameListing.svelte';
  import { GameStatus } from '$lib/helpers';
  import { defaultGameBoard } from '../../common/defaults';
  import { PB_GameMode } from '../../common/pb';
  import { getExampleGame1, getExampleGame2 } from './games';

  const allGameListingProps = [
    {
      gameBoard: defaultGameBoard,
      usernames: ['Host', null, 'User 2', null],
      gameDisplayNumber: 1,
      gameMode: PB_GameMode.SINGLES_4,
      gameStatus: GameStatus.SETTING_UP,
    },
    {
      gameBoard: getExampleGame1().gameBoard,
      usernames: [
        'Tim',
        'Rita',
        'Dad',
        'Mom',
        'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME',
        'pgyqj,;',
      ],
      gameDisplayNumber: 2,
      gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2,
      gameStatus: GameStatus.IN_PROGRESS,
    },
    {
      gameBoard: getExampleGame2().gameBoard,
      usernames: ['player 1', 'player 2', 'player 3', 'player 4'],
      gameDisplayNumber: 3,
      gameMode: PB_GameMode.TEAMS_2_VS_2,
      gameStatus: GameStatus.COMPLETED,
    },
  ];
</script>

{#each allGameListingProps as gameListingProps}
  <p>
    <GameListing
      gameBoard={gameListingProps.gameBoard}
      usernames={gameListingProps.usernames}
      gameDisplayNumber={gameListingProps.gameDisplayNumber}
      gameMode={gameListingProps.gameMode}
      gameStatus={gameListingProps.gameStatus}
    />
  </p>
{/each}
