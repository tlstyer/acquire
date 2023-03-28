<svelte:options immutable />

<script lang="ts">
	import { getContext } from 'svelte';
	import type { Client } from './client';
	import Dialog, { DialogType } from './Dialog.svelte';

	const client: Client = getContext('client');

	const isConnected = client.isConnected;

	let openDialog: ((dialogType: DialogType) => void) | undefined;
</script>

<div>
	<span class="name">Acquire</span>
	<span class="middle" />
	<span>{$isConnected ? 'Connected' : 'Connecting...'}</span>
	<span class="dialog" on:click={() => openDialog?.(DialogType.Login)} on:keydown={undefined}>
		Login
	</span>
	<span class="dialog" on:click={() => openDialog?.(DialogType.Settings)} on:keydown={undefined}>
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
</style>
