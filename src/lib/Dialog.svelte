<svelte:options immutable />

<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const enum DialogType {
    Login,
    CreateUser,
    Logout,
    Settings,
  }

  const dialogIsVisibleWritableStore = writable(false);
  export const dialogIsVisibleStore = { subscribe: dialogIsVisibleWritableStore.subscribe };
</script>

<script lang="ts">
  import LoginOrCreateUser from './LoginOrCreateUser.svelte';
  import Logout from './Logout.svelte';
  import Settings from './Settings.svelte';

  export const open = function open(dialogType: DialogType) {
    selectedDialogType = dialogType;
    earliestTimeToCloseByClickingOutside = Date.now() + 100;
    dialogIsVisibleWritableStore.set(true);
  };

  let selectedDialogType: DialogType | undefined;
  let earliestTimeToCloseByClickingOutside = 0; // HACK: don't close dialog immediately

  let dialogDiv: HTMLDivElement | null = null;

  function close() {
    selectedDialogType = undefined;
    dialogIsVisibleWritableStore.set(false);
  }
</script>

<svelte:window
  on:click={(event) => {
    if (
      dialogDiv &&
      event.target instanceof Node &&
      !dialogDiv.contains(event.target) &&
      Date.now() >= earliestTimeToCloseByClickingOutside
    ) {
      close();
    }
  }}
/>

{#if selectedDialogType !== undefined}
  <div bind:this={dialogDiv} class="root">
    <div class="header">
      <span class="title">
        {selectedDialogType === DialogType.Login
          ? 'Login'
          : selectedDialogType === DialogType.CreateUser
            ? 'Create User'
            : selectedDialogType === DialogType.Logout
              ? 'Logout'
              : 'Settings'}
      </span>
      <span class="close" on:click={close} on:keydown={undefined}>&nbsp;x&nbsp;</span>
    </div>
    {#if selectedDialogType === DialogType.Login}
      <LoginOrCreateUser loginMode={true} onSwitch={() => open(DialogType.CreateUser)} />
    {:else if selectedDialogType === DialogType.CreateUser}
      <LoginOrCreateUser loginMode={false} onSwitch={() => open(DialogType.Login)} />
    {:else if selectedDialogType === DialogType.Logout}
      <Logout />
    {:else}
      <Settings />
    {/if}
  </div>
{/if}

<style>
  .root {
    position: fixed;
    top: calc(var(--header-height) + 4px);
    right: 8px;

    background-color: white;
    border: 1px solid black;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 4px 4px 4px black;
  }

  .header {
    display: flex;
    flex-direction: row;
  }

  .title {
    flex-grow: 1;

    font-weight: bold;
  }

  .close {
    cursor: pointer;
    color: gray;
  }
</style>
