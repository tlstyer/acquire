<svelte:options immutable />

<script lang="ts" context="module">
	import type { ComponentType, SvelteComponentTyped } from 'svelte';
	import { writable } from 'svelte/store';

	const dialogIsVisibleWritable = writable(false);
	export const dialogIsVisible = { subscribe: dialogIsVisibleWritable.subscribe };
</script>

<script lang="ts">
	export const open = function open(title: string, component: ComponentType<SvelteComponentTyped>) {
		dialogTitle = title;
		dialogComponent = component;
		earliestTimeToCloseByClickingOutside = Date.now() + 100;
		dialogIsVisibleWritable.set(true);
	};

	let dialogTitle: string;
	let dialogComponent: ComponentType<SvelteComponentTyped> | null;
	let earliestTimeToCloseByClickingOutside = 0; // HACK: don't close dialog immediately

	let dialogDiv: HTMLDivElement | null = null;

	function close() {
		dialogComponent = null;
		dialogIsVisibleWritable.set(false);
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

{#if dialogComponent}
	<div bind:this={dialogDiv} class="root">
		<div class="header">
			<span class="title">{dialogTitle}</span>
			<span class="close" on:click={close} on:keydown={undefined}>&nbsp;x&nbsp;</span>
		</div>
		<svelte:component this={dialogComponent} />
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
