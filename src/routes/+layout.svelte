<script lang="ts" context="module">
	import { dialogIsVisibleStore } from '$lib/Dialog.svelte';
	import { derived } from 'svelte/store';

	export const keyboardShortcutsEnabledStore = derived(
		dialogIsVisibleStore,
		($dialogIsVisible) => !$dialogIsVisible,
	);
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import { PUBLIC_VERSION } from '$env/static/public';
	import { Client } from '$lib/client';
	import {
		ClientCommunication,
		TestClientCommunication,
		WebSocketClientCommunication,
	} from '$lib/clientCommunication';
	import Header from '$lib/Header.svelte';
	import { colorSchemeStore } from '$lib/Settings.svelte';
	import 'normalize.css';
	import { onDestroy, setContext } from 'svelte';
	import { TestServerCommunication } from '../server/serverCommunication';
	import './global.css';

	if (browser) {
		colorSchemeStore.subscribe((cs) => {
			document.documentElement.style.setProperty(
				'--main-background-color',
				`var(--main-background-color-${cs})`,
			);
			document.documentElement.style.setProperty(
				'--scrolling-div-background-color',
				`var(--scrolling-div-background-color-${cs})`,
			);
		});
	}

	let clientCommunication: ClientCommunication;
	if (browser) {
		const webSocketClientCommunication = new WebSocketClientCommunication();
		webSocketClientCommunication.begin();

		onDestroy(() => {
			webSocketClientCommunication.end();
		});

		clientCommunication = webSocketClientCommunication;
	} else {
		const serverCommunication = new TestServerCommunication();

		clientCommunication = new TestClientCommunication(serverCommunication);
	}

	const client = new Client(clientCommunication, parseInt(PUBLIC_VERSION, 10));
	setContext('client', client);
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
