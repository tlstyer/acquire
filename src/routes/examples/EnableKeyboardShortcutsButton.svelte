<svelte:options immutable />

<script lang="ts" context="module">
	const onlyEnabledSymbol = writable(Symbol());
</script>

<script lang="ts">
	import { writable } from 'svelte/store';

	export let enabled = false;

	const symbol = Symbol();

	$: enabled = symbol === $onlyEnabledSymbol;
</script>

<input
	type="button"
	value={enabled ? 'Keyboard Shortcuts Enabled' : 'Enable Keyboard Shortcuts'}
	disabled={enabled}
	on:click={() => {
		onlyEnabledSymbol.set(symbol);
	}}
/>
