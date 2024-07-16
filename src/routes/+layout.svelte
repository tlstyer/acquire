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
  import Header from '$lib/Header.svelte';
  import { colorSchemeStore } from '$lib/Settings.svelte';
  import { Client } from '$lib/client';
  import {
    ClientCommunication,
    TestClientCommunication,
    WebSocketClientCommunication,
  } from '$lib/clientCommunication';
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

  if (browser) {
    const localStorageKey = 'UsernameAndToken';

    let usernameInLocalStorage: string | undefined;
    let tokenInLocalStorage: string | undefined;

    let ignoredFirstMessage = false;
    client.usernameAndTokenStore.subscribe((usernameAndToken) => {
      if (ignoredFirstMessage) {
        if (usernameAndToken !== undefined) {
          if (
            usernameInLocalStorage !== usernameAndToken.username ||
            tokenInLocalStorage !== usernameAndToken.token
          ) {
            localStorage.setItem(
              localStorageKey,
              JSON.stringify({
                username: usernameAndToken.username,
                token: usernameAndToken.token,
              }),
            );

            usernameInLocalStorage = usernameAndToken.username;
            tokenInLocalStorage = usernameAndToken.token;
          }
        } else {
          if (usernameInLocalStorage !== undefined || tokenInLocalStorage !== undefined) {
            localStorage.removeItem(localStorageKey);

            usernameInLocalStorage = undefined;
            tokenInLocalStorage = undefined;
          }
        }
      } else {
        ignoredFirstMessage = true;
      }
    });

    processValueFromLocalStorage(localStorage.getItem(localStorageKey));

    addEventListener('storage', (event) => {
      if (event.key === localStorageKey || event.key === null) {
        processValueFromLocalStorage(event.newValue);
      }
    });

    function processValueFromLocalStorage(value: string | null) {
      usernameInLocalStorage = undefined;
      tokenInLocalStorage = undefined;

      if (value !== null) {
        try {
          const data = JSON.parse(value);
          usernameInLocalStorage = data.username;
          tokenInLocalStorage = data.token;
        } catch (error) {
          // ignore
        }
      }

      if (typeof usernameInLocalStorage === 'string' && typeof tokenInLocalStorage === 'string') {
        client.loginWithToken(usernameInLocalStorage, tokenInLocalStorage);
      } else {
        client.logout();

        usernameInLocalStorage = undefined;
        tokenInLocalStorage = undefined;
      }
    }
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
