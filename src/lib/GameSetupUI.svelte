<svelte:options immutable />

<script lang="ts" context="module">
  const playerArrangementModeToString = new Map([
    [PB_PlayerArrangementMode.RANDOM_ORDER, 'Random Order'],
    [PB_PlayerArrangementMode.EXACT_ORDER, 'Exact Order'],
    [PB_PlayerArrangementMode.SPECIFY_TEAMS, 'Specify Teams'],
  ]);

  const allPlayerArrangementModes = [
    PB_PlayerArrangementMode.RANDOM_ORDER,
    PB_PlayerArrangementMode.EXACT_ORDER,
    PB_PlayerArrangementMode.SPECIFY_TEAMS,
  ];

  class SpecifyTeamsEntry {
    constructor(
      public index: number,
      public upIndex: number | null,
      public downIndex: number | null,
    ) {}
  }

  const teamGameModeToSpecifyTeamsEntries = new Map([
    [
      PB_GameMode.TEAMS_2_VS_2,
      [
        new SpecifyTeamsEntry(0, null, 2),
        new SpecifyTeamsEntry(2, 0, 1),
        null,
        new SpecifyTeamsEntry(1, 2, 3),
        new SpecifyTeamsEntry(3, 1, null),
      ],
    ],
    [
      PB_GameMode.TEAMS_2_VS_2_VS_2,
      [
        new SpecifyTeamsEntry(0, null, 3),
        new SpecifyTeamsEntry(3, 0, 1),
        null,
        new SpecifyTeamsEntry(1, 3, 4),
        new SpecifyTeamsEntry(4, 1, 2),
        null,
        new SpecifyTeamsEntry(2, 4, 5),
        new SpecifyTeamsEntry(5, 2, null),
      ],
    ],
    [
      PB_GameMode.TEAMS_3_VS_3,
      [
        new SpecifyTeamsEntry(0, null, 2),
        new SpecifyTeamsEntry(2, 0, 4),
        new SpecifyTeamsEntry(4, 2, 1),
        null,
        new SpecifyTeamsEntry(1, 4, 3),
        new SpecifyTeamsEntry(3, 1, 5),
        new SpecifyTeamsEntry(5, 3, null),
      ],
    ],
  ]);
</script>

<script lang="ts">
  import { gameModeToNumPlayers, gameModeToTeamSize } from '../common/helpers';
  import { PB_GameMode, PB_PlayerArrangementMode } from '../common/pb';
  import GameSetupUIKickUserAndApproveCells from './children/GameSetupUIKickUserAndApproveCells.svelte';
  import { allGameModes, gameModeToString, teamNumberToCSSClassName } from './helpers';

  export let gameMode: PB_GameMode;
  export let playerArrangementMode: PB_PlayerArrangementMode;
  export let usernames: (string | null)[];
  export let userIDs: (number | null)[];
  export let approvals: boolean[];
  export let hostUserID: number;
  export let myUserID: number;
  export let onChangeGameMode: ((gameMode: PB_GameMode) => void) | undefined = undefined;
  export let onChangePlayerArrangementMode:
    | ((playerArrangementMode: PB_PlayerArrangementMode) => void)
    | undefined = undefined;
  export let onSwapPositions: ((position1: number, position2: number) => void) | undefined =
    undefined;
  export let onKickUser: ((userID: number) => void) | undefined = undefined;
  export let onApprove: (() => void) | undefined = undefined;

  $: numUsersInGame = usernames.reduce((count, username) => count + (username !== null ? 1 : 0), 0);
  $: gameIsFull = numUsersInGame === usernames.length;
  $: isTeamGame = gameModeToTeamSize.get(gameMode)! > 1;
  $: numTeams = gameModeToNumPlayers.get(gameMode)! / gameModeToTeamSize.get(gameMode)!;
</script>

<div>
  Game mode:
  {#if onChangeGameMode !== undefined}
    <select
      value={gameMode}
      on:change={(event) => onChangeGameMode?.(parseInt(event.currentTarget.value, 10))}
    >
      {#each allGameModes as gameMode}
        <option
          value={gameMode}
          disabled={(gameModeToNumPlayers.get(gameMode) ?? 0) < numUsersInGame}
        >
          {gameModeToString.get(gameMode)}
        </option>
      {/each}
    </select>
  {:else}
    {gameModeToString.get(gameMode)}
  {/if}
</div>

<div>
  Player arrangement mode:
  {#if onChangePlayerArrangementMode !== undefined}
    <select
      value={playerArrangementMode}
      on:change={(event) =>
        onChangePlayerArrangementMode?.(parseInt(event.currentTarget.value, 10))}
    >
      {#each allPlayerArrangementModes as playerArrangementMode}
        {#if playerArrangementMode !== PB_PlayerArrangementMode.SPECIFY_TEAMS || isTeamGame}
          <option value={playerArrangementMode}>
            {playerArrangementModeToString.get(playerArrangementMode)}
          </option>
        {/if}
      {/each}
    </select>
  {:else}
    {playerArrangementModeToString.get(playerArrangementMode)}
  {/if}
</div>

<table>
  <tbody>
    {#if playerArrangementMode === PB_PlayerArrangementMode.RANDOM_ORDER}
      {#each usernames as username, index}
        <tr>
          <td class="user">{username !== null ? username : ''}</td>
          <GameSetupUIKickUserAndApproveCells
            userID={userIDs[index]}
            {hostUserID}
            {myUserID}
            {gameIsFull}
            approved={approvals[index]}
            {onKickUser}
            {onApprove}
          />
        </tr>
      {/each}
    {:else if playerArrangementMode === PB_PlayerArrangementMode.EXACT_ORDER}
      {#each usernames as username, index}
        <tr>
          <td class={isTeamGame ? teamNumberToCSSClassName.get((index % numTeams) + 1) : 'user'}>
            {username !== null ? username : ''}
          </td>
          {#if onSwapPositions !== undefined}
            <td>
              {#if index > 0}
                <input
                  type="button"
                  value="▲"
                  disabled={userIDs[index] === userIDs[index - 1]}
                  on:click={() => onSwapPositions?.(index, index - 1)}
                />
              {/if}
            </td>
            <td>
              {#if index < usernames.length - 1}
                <input
                  type="button"
                  value="▼"
                  disabled={userIDs[index] === userIDs[index + 1]}
                  on:click={() => onSwapPositions?.(index, index + 1)}
                />
              {/if}
            </td>
          {/if}
          <GameSetupUIKickUserAndApproveCells
            userID={userIDs[index]}
            {hostUserID}
            {myUserID}
            {gameIsFull}
            approved={approvals[index]}
            {onKickUser}
            {onApprove}
          />
        </tr>
      {/each}
    {:else}
      {#each teamGameModeToSpecifyTeamsEntries.get(gameMode) ?? [] as entry}
        {#if entry}
          <tr>
            <td class="user">{usernames[entry.index] !== null ? usernames[entry.index] : ''}</td>
            {#if onSwapPositions !== undefined}
              <td>
                {#if entry.upIndex !== null}
                  <input
                    type="button"
                    value="▲"
                    disabled={userIDs[entry.index] === userIDs[entry.upIndex]}
                    on:click={() => {
                      if (entry && entry.upIndex !== null) {
                        onSwapPositions?.(entry.index, entry.upIndex);
                      }
                    }}
                  />
                {/if}
              </td>
              <td>
                {#if entry.downIndex !== null}
                  <input
                    type="button"
                    value="▼"
                    disabled={userIDs[entry.index] === userIDs[entry.downIndex]}
                    on:click={() => {
                      if (entry && entry.downIndex !== null) {
                        onSwapPositions?.(entry.index, entry.downIndex);
                      }
                    }}
                  />
                {/if}
              </td>
            {/if}
            <GameSetupUIKickUserAndApproveCells
              userID={userIDs[entry.index]}
              {hostUserID}
              {myUserID}
              {gameIsFull}
              approved={approvals[entry.index]}
              {onKickUser}
              {onApprove}
            />
          </tr>
        {:else}
          <tr class="versus">
            <td>versus</td>
          </tr>
        {/if}
      {/each}
    {/if}
  </tbody>
</table>

<style>
  div {
    margin-bottom: 0.5em;
  }

  table {
    border-collapse: collapse;
    font-weight: bold;
  }

  table :global(td) {
    border: 2px solid transparent;
    height: 28px;
    overflow: hidden;
    white-space: nowrap;
  }

  td:nth-child(1) {
    border-color: var(--border-color);
    max-width: 300px;
    padding-left: 3px;
    text-align: left;
    width: 300px;
  }

  .user {
    background-color: #ffffff;
  }

  .versus {
    font-weight: normal;
  }
</style>
