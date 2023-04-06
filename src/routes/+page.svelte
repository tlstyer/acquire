<svelte:options immutable />

<script lang="ts">
	import type { Client } from '$lib/client';
	import { getContext } from 'svelte';

	const client: Client = getContext('client');

	client.connectToLobby();

	let connectedStore = client.lobbyManager.connectedStore;
</script>

{#if $connectedStore}
	<div class="gameListings">Lobby</div>
{/if}

<style>
	.gameListings {
		padding: 4px 0 0 12px;
	}
</style>
