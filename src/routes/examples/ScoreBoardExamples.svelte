<script lang="ts">
  import ScoreBoard from '$lib/ScoreBoard.svelte';
  import { PB_GameMode } from '../../common/pb';

  const scoreBoardProps = [
    {
      usernames: ['winning player', 'losing player'],
      scoreBoard: [
        [6, 1, 13, 10, 4, 4, 6, 207, 785],
        [1, 0, 11, 0, 3, 1, 1, 256, 533],
      ],
      scoreBoardAvailable: [18, 24, 1, 15, 18, 20, 18],
      scoreBoardChainSize: [3, 0, 39, 5, 2, 4, 13],
      scoreBoardPrice: [3, 0, 10, 6, 3, 6, 9],
      safeChains: [false, false, true, false, false, false, true],
      turnPlayerID: 1,
      movePlayerID: 0,
      gameMode: PB_GameMode.SINGLES_2,
      cellWidth: 30,
    },
    {
      usernames: [
        'tlstyer',
        'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME',
        'Somebody Else',
        'hi!',
      ],
      scoreBoard: [
        [4, 0, 0, 0, 0, 0, 0, 74, 82],
        [0, 4, 0, 0, 0, 0, 0, 74, 82],
        [0, 0, 0, 0, 0, 4, 0, 88, 104],
        [1, 1, 0, 0, 0, 1, 1, 92, 228],
      ],
      scoreBoardAvailable: [20, 20, 25, 25, 25, 20, 24],
      scoreBoardChainSize: [2, 2, 0, 0, 0, 2, 9],
      scoreBoardPrice: [2, 2, 0, 0, 0, 4, 8],
      safeChains: [false, false, false, false, false, false, false],
      turnPlayerID: 0,
      movePlayerID: 0,
      gameMode: PB_GameMode.SINGLES_4,
      cellWidth: 30,
    },
    {
      usernames: ['player 1', 'player 2', 'player 3', 'player 4'],
      scoreBoard: [
        [0, 0, 5, 9, 0, 13, 0, 0, 427],
        [8, 1, 0, 13, 0, 12, 0, 63, 474],
        [7, 1, 11, 0, 0, 0, 0, 107, 212],
        [1, 3, 9, 3, 0, 0, 0, 213, 310],
      ],
      scoreBoardAvailable: [9, 20, 0, 0, 25, 0, 25],
      scoreBoardChainSize: [0, 0, 4, 27, 0, 42, 0],
      scoreBoardPrice: [0, 0, 5, 9, 0, 12, 0],
      safeChains: [false, false, false, true, false, true, false],
      turnPlayerID: 3,
      movePlayerID: 2,
      gameMode: PB_GameMode.TEAMS_2_VS_2,
      cellWidth: 30,
    },
    {
      usernames: ['player 1', 'player 2', 'player 3', 'player 4', 'player 5', 'player 6'],
      scoreBoard: [
        [1, 0, 0, 9, 2, 3, 0, 188, 386],
        [0, 3, 7, 0, 0, 0, 0, 35, 121],
        [0, 0, 7, 2, 0, 1, 0, 22, 135],
        [0, 0, 0, 8, 0, 9, 0, 87, 375],
        [0, 0, 8, 6, 0, 7, 0, 84, 408],
        [0, 0, 3, 0, 0, 5, 0, 120, 192],
      ],
      scoreBoardAvailable: [24, 22, 0, 0, 23, 0, 25],
      scoreBoardChainSize: [0, 0, 22, 30, 0, 15, 0],
      scoreBoardPrice: [0, 0, 9, 9, 0, 9, 0],
      safeChains: [false, false, true, true, false, true, false],
      turnPlayerID: 3,
      movePlayerID: 2,
      gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2,
      cellWidth: 30,
    },
  ];
  scoreBoardProps.push({
    ...scoreBoardProps[3],
    gameMode: PB_GameMode.TEAMS_3_VS_3,
  });
</script>

{#each scoreBoardProps as props}
  <p>
    <ScoreBoard
      usernames={props.usernames}
      scoreBoard={props.scoreBoard}
      scoreBoardAvailable={props.scoreBoardAvailable}
      scoreBoardChainSize={props.scoreBoardChainSize}
      scoreBoardPrice={props.scoreBoardPrice}
      safeChains={props.safeChains}
      turnPlayerID={props.turnPlayerID}
      movePlayerID={props.movePlayerID}
      gameMode={props.gameMode}
      cellWidth={props.cellWidth}
    />
  </p>
{/each}
