import { For, Show } from 'solid-js';
import { Client } from '../../client';
import { Username } from '../../components/Username';

export function LobbyPage(props: { client: Client }) {
  // eslint-disable-next-line solid/reactivity
  props.client.connectToLobby();

  return (
    <Show when={props.client.lobbyManager.signals.connected()}>
      <h2>Usernames</h2>
      <ul>
        <For each={props.client.lobbyManager.signals.usernames()}>
          {(username) => (
            <li>
              <Username username={username} />
            </li>
          )}
        </For>
      </ul>
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
    </Show>
  );
}
