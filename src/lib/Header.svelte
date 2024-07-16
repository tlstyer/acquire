<svelte:options immutable />

<script lang="ts">
  import { getContext } from 'svelte';
  import Dialog, { DialogType } from './Dialog.svelte';
  import Username from './Username.svelte';
  import { LoginState, type Client } from './client';

  const client: Client = getContext('client');

  const isConnectedStore = client.isConnectedStore;
  const usernameStore = client.usernameStore;
  const loginStateStore = client.loginStateStore;

  let openDialog: ((dialogType: DialogType) => void) | undefined;
</script>

<div>
  <span class="name"><a href="/">Acquire</a></span>

  <span class="middle" />

  {#if $usernameStore !== ''}
    <span><Username username={$usernameStore} /></span>
  {/if}

  {#if $loginStateStore === LoginState.LoggedOut}
    <span class="dialog" on:click={() => openDialog?.(DialogType.Login)} on:keydown={undefined}>
      Login
    </span>
  {:else if $loginStateStore === LoginState.TryingToLogIn}
    <span class="inProgress">Logging in...</span>
  {:else if $loginStateStore === LoginState.TryingToCreateUser}
    <span class="inProgress">Creating user...</span>
  {:else if $loginStateStore === LoginState.LoggedIn}
    <span class="dialog" on:click={() => openDialog?.(DialogType.Logout)} on:keydown={undefined}>
      Logout
    </span>
  {:else if $loginStateStore === LoginState.TryingToLogOut}
    <span class="inProgress">Logging out...</span>
  {/if}

  <span class="dialog" on:click={() => openDialog?.(DialogType.Settings)} on:keydown={undefined}>
    ⚙
  </span>

  <span
    class="connection"
    class:connected={$isConnectedStore}
    class:connecting={!$isConnectedStore}
    title={$isConnectedStore ? 'Connected' : 'Connecting...'}
  />
</div>

<Dialog bind:open={openDialog} />

<style>
  div {
    position: fixed;
    top: 0;
    left: 0;
    height: var(--header-height);
    width: 100%;
    padding: 2px 12px;
    background-color: #e6e6e6;

    display: flex;
    flex-direction: row;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  a:focus,
  a:hover {
    text-decoration: underline;
  }

  a:active {
    color: red;
  }

  span:nth-last-child(n + 2) {
    margin-right: 1em;
  }

  .name {
    font-weight: bold;
  }

  .middle {
    flex-grow: 1;
    cursor: initial;
  }

  .dialog:hover {
    cursor: pointer;
    text-shadow: 0px 0px 1px black;
  }

  .inProgress {
    font-style: italic;
  }

  .connection {
    width: calc(var(--header-height) - 4px);
    height: calc(var(--header-height) - 4px);
    border-radius: 50%;
    border: 1px solid black;
  }

  .connected {
    background-color: #0c0;
  }

  .connecting {
    animation-name: connecting;
    animation-duration: 1.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: linear;
  }

  @keyframes connecting {
    from {
      background-color: #ff0;
    }
    to {
      background-color: #aa0;
    }
  }
</style>
