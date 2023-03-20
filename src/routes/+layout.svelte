<script lang="ts" context="module">
	import { settingsDialogIsVisible } from '$lib/Settings.svelte';
	import { derived } from 'svelte/store';

	export const keyboardShortcutsEnabled = derived(
		settingsDialogIsVisible,
		($settingsDialogIsVisible) => !$settingsDialogIsVisible,
	);
</script>

<script>
	import { browser } from '$app/environment';
	import { Client } from '$lib/client';
	import { WebSocketClientCommunication } from '$lib/clientCommunication';
	import Header from '$lib/Header.svelte';
	import { colorScheme } from '$lib/Settings.svelte';
	import 'normalize.css';
	import { onDestroy } from 'svelte';
	import './global.css';

	colorScheme.subscribe((cs) => {
		if (browser) {
			document.documentElement.style.setProperty(
				'--main-background-color',
				`var(--main-background-color-${cs})`,
			);
			document.documentElement.style.setProperty(
				'--scrolling-div-background-color',
				`var(--scrolling-div-background-color-${cs})`,
			);
		}
	});

	if (browser) {
		const clientConnection = new WebSocketClientCommunication();
		const client = new Client(clientConnection);
		clientConnection.begin();

		onDestroy(() => {
			clientConnection.end();
		});
	}
</script>

<Header />
<div><slot /></div>

<style>
	:root {
		background-color: var(--main-background-color);
		color: #000000;
		font-family: sans-serif;
		font-size: 16px;

		--border-color: #f6f4f2;

		--main-background-color-netacquire: #f6f4f2;
		--main-background-color-white: white;
		--main-background-color: var(--main-background-color-netacquire);

		--scrolling-div-background-color-netacquire: #c0c0ff;
		--scrolling-div-background-color-white: white;
		--scrolling-div-background-color: var(--scrolling-div-background-color-netacquire);

		--header-height: 20px;
	}

	div {
		padding-top: var(--header-height);
	}
</style>
