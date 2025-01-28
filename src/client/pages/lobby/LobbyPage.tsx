import { For, Show } from 'solid-js';
import { PB_GameMode } from '../../../common/pb';
import { Client } from '../../client';
import { CreateGame } from '../../components/CreateGame';
import { Username } from '../../components/Username';
import styles from './LobbyPage.module.css';

export function LobbyPage(props: { client: Client }) {
  // eslint-disable-next-line solid/reactivity
  props.client.connectToLobby();

  return (
    <Show when={props.client.lobbyManager.signals.connected()}>
      <div class={styles.root}>
        <div class={styles.gameListings}>
          <CreateGame
            initialGameMode={PB_GameMode.SINGLES_4}
            onSubmit={props.client.lobbyManager.createGame}
          />
        </div>
        <div class={styles.rightSide}>
          <For each={props.client.lobbyManager.signals.usernames()}>
            {(username) => (
              <div>
                <Username username={username} />
              </div>
            )}
          </For>
          <h2>Created Game Number</h2>
          {props.client.lobbyManager.signals.createdGameNumber() ?? 'undefined'}
          <h2>Links</h2>
          <ul>
            <li>
              <a href="/examples">Examples</a>
            </li>
            <li>
              <a href="/game">Game</a>
            </li>
          </ul>
        </div>
      </div>
    </Show>
  );
}
