<svelte:options immutable />

<script lang="ts">
	import { getContext } from 'svelte';
	import type { Client } from './client';

	const client: Client = getContext('client');
</script>

<form
	on:submit={(event) => {
		event.preventDefault();

		client.logout();
	}}
>
	<div>Are you sure you want to log out?</div>
	<div><button type="submit">Logout</button></div>
</form>

<style>
	div {
		margin-top: 8px;
	}
</style>
