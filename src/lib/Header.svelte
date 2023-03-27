<svelte:options immutable />

<script lang="ts">
	import type { ComponentType, SvelteComponentTyped } from 'svelte';
	import { getContext } from 'svelte';
	import type { Client } from './client';
	import Dialog from './Dialog.svelte';
	import Settings from './Settings.svelte';

	const client: Client = getContext('client');

	const isConnected = client.isConnected;

	let openDialog:
		| ((title: string, component: ComponentType<SvelteComponentTyped>) => void)
		| undefined;
</script>

<div>
	<span class="name">Acquire</span>
	<span class="middle" />
	<span>{$isConnected ? 'Connected' : 'Connecting...'}</span>
	<span class="settings" on:click={() => openDialog?.('Settings', Settings)} on:keydown={undefined}>
		⚙
	</span>
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

	span:nth-last-child(n + 2) {
		margin-right: 8px;
	}

	.name {
		font-weight: bold;
	}

	.middle {
		flex-grow: 1;
		cursor: initial;
	}

	.settings:hover {
		cursor: pointer;
		font-weight: bold;
	}
</style>
