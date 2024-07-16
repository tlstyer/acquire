<svelte:options immutable />

<script lang="ts">
  import { gameModeToNumPlayers, gameModeToTeamSize } from '../common/helpers';
  import type { PB_GameBoardType, PB_GameMode } from '../common/pb';
  import {
    gameModeToString,
    GameStatus,
    gameStatusToString,
    teamNumberToCSSClassName,
  } from './helpers';
  import MiniGameBoard from './MiniGameBoard.svelte';

  export let gameBoard: PB_GameBoardType[][];
  export let usernames: (string | null)[];
  export let gameDisplayNumber: number;
  export let gameMode: PB_GameMode;
  export let gameStatus: GameStatus;

  $: isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
  $: numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;
</script>

<div>
  <div class="miniGameBoardWrapper">
    <MiniGameBoard {gameBoard} cellSize={15} />
  </div>
  <table>
    <tbody>
      {#each usernames as username, playerID}
        <tr>
          <td
            class={isTeamGame ? teamNumberToCSSClassName.get((playerID % numTeams) + 1) : 'player'}
          >
            {username !== null ? username : ''}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="other">
    <div>Game #{gameDisplayNumber}</div>
    <div>{gameModeToString.get(gameMode)}</div>
    <div>{gameStatusToString.get(gameStatus)}</div>
  </div>
</div>

<style>
  .miniGameBoardWrapper {
    display: inline-block;
  }

  table {
    border-collapse: collapse;
    display: inline-block;
    font-weight: bold;
    vertical-align: top;
  }

  td {
    border: 2px solid var(--border-color);
    height: 22px;
    max-width: 200px;
    overflow: hidden;
    padding-left: 3px;
    text-align: left;
    white-space: nowrap;
    width: 200px;
  }

  .other {
    display: inline-block;
    font-weight: bold;
    vertical-align: top;
  }

  .player {
    background-color: #ffffff;
  }
</style>
