<svelte:options immutable />

<script lang="ts">
  import { ScoreBoardIndexEnum } from '../common/enums';
  import { gameModeToNumPlayers, gameModeToTeamSize } from '../common/helpers';
  import type { PB_GameMode } from '../common/pb';
  import ScoreBoardRow from './children/ScoreBoardRow.svelte';
  import {
    allChains,
    gameBoardTypeToCSSClassName,
    gameBoardTypeToHotelInitial,
    teamNumberToCSSClassName,
  } from './helpers';

  export let usernames: string[];
  export let scoreBoard: number[][];
  export let scoreBoardAvailable: number[];
  export let scoreBoardChainSize: number[];
  export let scoreBoardPrice: number[];
  export let safeChains: boolean[];
  export let turnPlayerID: number;
  export let movePlayerID: number;
  export let gameMode: PB_GameMode;
  export let cellWidth: number;

  const isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
  const numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;

  const teamNumbers: (number | undefined)[] = new Array(3);
  if (isTeamGame) {
    if (numTeams === 2) {
      teamNumbers[1] = 1;
      teamNumbers[2] = 2;
    } else {
      teamNumbers[0] = 1;
      teamNumbers[1] = 2;
      teamNumbers[2] = 3;
    }
  }

  let teamTotals: (number | undefined)[] = new Array(3);
  $: if (isTeamGame) {
    const updatedTeamTotals = new Array(3);
    if (numTeams === 2) {
      updatedTeamTotals[1] = getTeamTotal(scoreBoard, 1);
      updatedTeamTotals[2] = getTeamTotal(scoreBoard, 2);
    } else {
      updatedTeamTotals[0] = getTeamTotal(scoreBoard, 1);
      updatedTeamTotals[1] = getTeamTotal(scoreBoard, 2);
      updatedTeamTotals[2] = getTeamTotal(scoreBoard, 3);
    }

    if (
      teamTotals[0] !== updatedTeamTotals[0] ||
      teamTotals[1] !== updatedTeamTotals[1] ||
      teamTotals[2] !== updatedTeamTotals[2]
    ) {
      teamTotals = updatedTeamTotals;
    }
  }

  const defaultClassNames: string[] = new Array(usernames.length);
  for (let playerID = 0; playerID < usernames.length; playerID++) {
    defaultClassNames[playerID] = isTeamGame
      ? teamNumberToCSSClassName.get((playerID % numTeams) + 1)!
      : 'player';
  }

  function getTeamTotal(scoreBoard: number[][], teamNumber: number) {
    let teamTotal = 0;
    for (let playerID = teamNumber - 1; playerID < scoreBoard.length; playerID += numTeams) {
      teamTotal += scoreBoard[playerID][ScoreBoardIndexEnum.Net];
    }
    return teamTotal;
  }
</script>

<table style="font-size: {Math.floor(cellWidth * 0.6)}px; width: {cellWidth * 18 + 2}px">
  <tbody>
    <tr>
      <td class="playerHeader">Player</td>
      {#each allChains as chain}
        <td class={gameBoardTypeToCSSClassName.get(chain)}>
          {gameBoardTypeToHotelInitial.get(chain)}
        </td>
      {/each}
      <td class="cashAndNetHeader">Cash</td>
      <td class="cashAndNetHeader">Net</td>
    </tr>

    {#each usernames as username, playerID}
      <ScoreBoardRow
        isPlayerRow={true}
        title={username}
        isPlayersTurn={playerID === turnPlayerID}
        isPlayersMove={playerID === movePlayerID}
        scoreBoardRow={scoreBoard[playerID]}
        {safeChains}
        defaultClassName={defaultClassNames[playerID]}
        zeroValueReplacement=""
      />
    {/each}

    <ScoreBoardRow
      isPlayerRow={false}
      title="Available"
      isPlayersTurn={false}
      isPlayersMove={false}
      scoreBoardRow={scoreBoardAvailable}
      {safeChains}
      defaultClassName="availableChainSizeAndPrice"
      zeroValueReplacement="0"
      teamNumber={teamNumbers[0]}
      teamTotal={teamTotals[0]}
    />
    <ScoreBoardRow
      isPlayerRow={false}
      title="Chain Size"
      isPlayersTurn={false}
      isPlayersMove={false}
      scoreBoardRow={scoreBoardChainSize}
      {safeChains}
      defaultClassName="availableChainSizeAndPrice"
      zeroValueReplacement="-"
      teamNumber={teamNumbers[1]}
      teamTotal={teamTotals[1]}
    />
    <ScoreBoardRow
      isPlayerRow={false}
      title="Price ($00)"
      isPlayersTurn={false}
      isPlayersMove={false}
      scoreBoardRow={scoreBoardPrice}
      {safeChains}
      defaultClassName="availableChainSizeAndPrice"
      zeroValueReplacement="-"
      teamNumber={teamNumbers[2]}
      teamTotal={teamTotals[2]}
    />
  </tbody>
</table>

<style>
  table {
    background-color: #ffffff;
    border-collapse: collapse;
    font-weight: bold;
    table-layout: fixed;
  }

  table :global(td) {
    border: 2px solid var(--border-color);
    overflow: hidden;
    white-space: nowrap;
  }

  table :global(td:nth-child(1)) {
    padding-left: 3px;
    text-align: left;
    width: calc(100% * 5 / 18);
  }

  table :global(td:nth-child(n + 2):nth-child(-n + 8)) {
    text-align: center;
    width: calc(100% / 18);
  }

  table :global(td:nth-child(n + 9)) {
    padding-right: 3px;
    text-align: right;
    width: calc(100% * 3 / 18);
  }

  .playerHeader {
    background-color: #c0c0ff;
  }

  .cashAndNetHeader {
    background-color: #008000;
    color: #ffffff;
  }

  table :global(.player) {
    background-color: #ffffff;
  }

  table :global(.availableChainSizeAndPrice) {
    background-color: #c0ffff;
  }
</style>
