<svelte:options immutable />

<script lang="ts" context="module">
  const onlyEnabledSymbolWritableStore = writable(Symbol());
</script>

<script lang="ts">
  import { writable } from 'svelte/store';

  export let enabled = false;

  const symbol = Symbol();

  $: enabled = symbol === $onlyEnabledSymbolWritableStore;
</script>

<input
  type="button"
  value={enabled ? 'Keyboard Shortcuts Enabled' : 'Enable Keyboard Shortcuts'}
  disabled={enabled}
  on:click={() => onlyEnabledSymbolWritableStore.set(symbol)}
/>
