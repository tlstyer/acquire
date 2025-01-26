import { RouteDefinition, Router } from '@solidjs/router';
import 'normalize.css';
import { createEffect, onCleanup } from 'solid-js';
import { isServer } from 'solid-js/web';
import { TestServerCommunication } from '../server/serverCommunication';
import styles from './App.module.css';
import { createClient } from './client';
import {
  ClientCommunication,
  TestClientCommunication,
  WebSocketClientCommunication,
} from './clientCommunication';
import { Dialog } from './components/Dialog';
import { Header } from './components/Header';
import { ExamplesPage } from './pages/examples/ExamplesPage';
import { GamePage } from './pages/game/GamePage';
import { HomePage } from './pages/home/HomePage';

export function App() {
  let clientCommunication: ClientCommunication;
  if (isServer) {
    const serverCommunication = new TestServerCommunication();

    clientCommunication = new TestClientCommunication(serverCommunication);
  } else {
    const webSocketClientCommunication = new WebSocketClientCommunication();
    webSocketClientCommunication.begin();

    onCleanup(() => {
      webSocketClientCommunication.end();
    });

    clientCommunication = webSocketClientCommunication;
  }

  const client = createClient(clientCommunication, parseInt(import.meta.env.VITE_VERSION, 10));

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
      component: HomePage,
    },
    {
      path: '/game',
      component: () => <GamePage client={client} />,
    },
    {
      path: '/examples',
      component: ExamplesPage,
    },
  ];

  return (
    <>
      <Header client={client} />
      <Dialog client={client} />
      <div class={styles.content}>
        <Router>{routes}</Router>
      </div>
    </>
  );
}
