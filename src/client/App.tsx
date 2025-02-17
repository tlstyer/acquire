import { type RouteDefinition, Router } from '@solidjs/router';
import 'normalize.css';
import { createEffect, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';
import { parseDecimalInteger } from '../common/helpers.js';
import styles from './App.module.css';
import { createClient } from './client.js';
import { WebSocketClientCommunication } from './clientCommunication.js';
import { Dialog } from './components/Dialog.js';
import { Header } from './components/Header.js';
import { processBrowserMyKeyboardEvents } from './myKeyboardEvents.js';
import { ExamplesPage } from './pages/examples/ExamplesPage.js';
import { GamePage } from './pages/game/GamePage.js';
import { LobbyPage } from './pages/lobby/LobbyPage.js';

export function App() {
  const clientCommunication = new WebSocketClientCommunication();
  clientCommunication.begin();
  onCleanup(() => {
    clientCommunication.end();
  });

  const client = createClient(
    clientCommunication,
    parseDecimalInteger(import.meta.env.VITE_VERSION) ?? 0,
  );

  if (!isServer) {
    const localStorageKey = 'UsernameAndToken';

    let usernameInLocalStorage: string | undefined;
    let tokenInLocalStorage: string | undefined;

    let ignoredFirstMessage = false;
    createEffect(() => {
      const usernameAndToken = client.signals.usernameAndToken();

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
        } catch {
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

    createEffect(() => {
      const colorScheme = client.signals.colorScheme();

      document.documentElement.style.setProperty(
        '--main-background-color',
        `var(--main-background-color-${colorScheme})`,
      );
      document.documentElement.style.setProperty(
        '--scrolling-div-background-color',
        `var(--scrolling-div-background-color-${colorScheme})`,
      );
    });
  }

  const routes: RouteDefinition[] = [
    {
      path: '/',
      component: () => <LobbyPage client={client} />,
    },
    {
      path: '/game/:id',
      component: () => <GamePage client={client} />,
    },
  ];

  if (import.meta.env.VITE_INCLUDE_EXAMPLES_PAGE === 'yes') {
    routes.push({
      path: '/examples',
      component: ExamplesPage,
    });
  }

  return (
    <>
      <Header client={client} />
      <Dialog
        ref={(ref) =>
          processBrowserMyKeyboardEvents(() => client.signals.dialogType() !== undefined, ref)
        }
        client={client}
      />
      <div class={styles.content}>
        <Router>{routes}</Router>
      </div>
    </>
  );
}
