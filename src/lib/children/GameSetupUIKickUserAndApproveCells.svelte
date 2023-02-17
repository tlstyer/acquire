<svelte:options immutable />

<script lang="ts">
  export let userID: number | null;
  export let hostUserID: number;
  export let myUserID: number;
  export let gameIsFull: boolean;
  export let approved: boolean;
  export let onKickUser: ((userID: number) => void) | undefined;
  export let onApprove: (() => void) | undefined;
</script>

{#if onKickUser}
  <td>
    {#if userID !== null && userID !== hostUserID}
      <input
        type="button"
        value="Kick"
        on:click={() => {
          if (userID) {
            onKickUser?.(userID);
          }
        }}
      />
    {/if}
  </td>
{/if}

{#if gameIsFull}
  {#if approved}
    <td class="ready">Ready</td>
  {:else if userID === myUserID}
    <td>
      <input type="button" value="Ready" on:click={onApprove} />
    </td>
  {:else}
    <td class="waiting">Waiting</td>
  {/if}
{/if}

<style>
  .ready {
    color: #008000;
    font-weight: normal;
  }

  .waiting {
    font-weight: normal;
  }
</style>
