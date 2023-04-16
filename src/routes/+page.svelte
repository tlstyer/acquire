<svelte:options immutable />

<script lang="ts">
	import type { Client } from '$lib/client';
	import { getContext } from 'svelte';
	import { slide } from 'svelte/transition';

	const client: Client = getContext('client');

	client.connectToLobby();

	let connectedStore = client.lobbyManager.connectedStore;
	let usernamesStore = client.lobbyManager.usernamesStore;
</script>

{#if $connectedStore}
	<div class="root">
		<div class="gameListings">Lobby</div>
		<div class="rightSide">
			{#each $usernamesStore as username (username)}
				<div transition:slide|local>{username}</div>
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
