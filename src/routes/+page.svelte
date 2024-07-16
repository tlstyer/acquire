<svelte:options immutable />

<script lang="ts">
  import { goto } from '$app/navigation';
  import type { Client } from '$lib/client';
  import { allGameModes, gameModeToString } from '$lib/helpers';
  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { PB_GameMode } from '../common/pb';

  const client: Client = getContext('client');

  client.connectToLobby();

  let connectedStore = client.lobbyManager.connectedStore;
  let usernamesStore = client.lobbyManager.usernamesStore;
  let createdGameNumberStore = client.lobbyManager.createdGameNumberStore;

  $: if ($createdGameNumberStore !== undefined) {
    goto(`/game/${client.logTime}-${$createdGameNumberStore}`);
  }

  let newGameMode = PB_GameMode.SINGLES_4;
</script>

{#if $connectedStore}
  <div class="root">
    <div class="gameListings">
      <div>
        <form
          on:submit={(event) => {
            event.preventDefault();

            client.lobbyManager.createGame(newGameMode);
          }}
        >
          Game mode:
          <select bind:value={newGameMode}>
            {#each allGameModes as gameMode}
              <option value={gameMode}>
                {gameModeToString.get(gameMode)}
              </option>
            {/each}
          </select>
          <button type="submit">Create Game</button>
        </form>
      </div>
    </div>
    <div class="rightSide">
      {#each $usernamesStore as username (username)}
        <div transition:slide>{username}</div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .root {
    display: flex;
    flex-direction: row;
    height: calc(100vh - var(--header-height));
    width: 100vw;
  }

  .gameListings {
    padding: 12px;
    overflow-y: scroll;
  }

  .rightSide {
    flex-grow: 1;
    padding: 4px;
  }
</style>
