<svelte:options immutable />

<script lang="ts">
	import Settings from './Settings.svelte';

	let showSettings: (() => void) | undefined;
</script>

<div>
	<span class="name">Acquire</span>
	<span class="middle" />
	<span class="settings" on:click={showSettings} on:keydown={undefined}>⚙</span>
</div>

<Settings bind:show={showSettings} />

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
