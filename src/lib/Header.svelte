<svelte:options immutable />

<script lang="ts">
	import { getContext } from 'svelte';
	import { LoginState, type Client } from './client';
	import Dialog, { DialogType } from './Dialog.svelte';
	import Username from './Username.svelte';

	const client: Client = getContext('client');

	const isConnectedStore = client.isConnectedStore;
	const usernameStore = client.usernameStore;
	const loginStateStore = client.loginStateStore;

	let openDialog: ((dialogType: DialogType) => void) | undefined;
</script>

<div>
	<span class="name">Acquire</span>

	<span class="middle" />

	{#if $loginStateStore === LoginState.LoggedOut}
		<span class="dialog" on:click={() => openDialog?.(DialogType.Login)} on:keydown={undefined}>
			Login
		</span>
	{:else if $loginStateStore === LoginState.TryingToLogIn}
		<span>Logging in...</span>
	{:else if $loginStateStore === LoginState.LoggedIn}
		<span><Username username={$usernameStore} /></span>
		<span class="dialog" on:click={() => openDialog?.(DialogType.Logout)} on:keydown={undefined}>
			Logout
		</span>
	{:else if $loginStateStore === LoginState.TryingToLogOut}
		<span><Username username={$usernameStore} /></span>
		<span>Logging out...</span>
	{/if}

	<span class="dialog" on:click={() => openDialog?.(DialogType.Settings)} on:keydown={undefined}>
		⚙
	</span>

	<span
		class="connection"
		class:connected={$isConnectedStore}
		class:connecting={!$isConnectedStore}
		title={$isConnectedStore ? 'Connected' : 'Connecting...'}
	/>
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

	.connection {
		width: calc(var(--header-height) - 4px);
		height: calc(var(--header-height) - 4px);
		border-radius: 50%;
		border: 1px solid black;
	}

	.connected {
		background-color: #0c0;
	}

	.connecting {
		animation-name: connecting;
		animation-duration: 1.5s;
		animation-iteration-count: infinite;
		animation-direction: alternate;
		animation-timing-function: linear;
	}

	@keyframes connecting {
		from {
			background-color: #ff0;
		}
		to {
			background-color: #aa0;
		}
	}
</style>
