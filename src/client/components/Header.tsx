import { Match, Show, Switch } from 'solid-js';
import { Client, LoginState } from '../client';
import { DialogType } from './Dialog';
import styles from './Header.module.css';
import { Username } from './Username';

export function Header(props: { client: Client }) {
  return (
    <div class={styles.root}>
      <span class={styles.name}>
        <a href="/">Acquire</a>
      </span>

      <span class={styles.middle} />

      <Show when={props.client.usernameSignal() !== ''}>
        <Username username={props.client.usernameSignal()} />
      </Show>

      <Switch>
        <Match when={props.client.loginStateSignal() === LoginState.LoggedOut}>
          <span class={styles.dialog} onClick={() => props.client.setDialogType(DialogType.Login)}>
            Login
          </span>
        </Match>
        <Match when={props.client.loginStateSignal() === LoginState.TryingToLogIn}>
          <span class={styles.inProgress}>Logging in...</span>
        </Match>
        <Match when={props.client.loginStateSignal() === LoginState.TryingToCreateUser}>
          <span class={styles.inProgress}>Creating user...</span>
        </Match>
        <Match when={props.client.loginStateSignal() === LoginState.LoggedIn}>
          <span class={styles.dialog} onClick={() => props.client.setDialogType(DialogType.Logout)}>
            Logout
          </span>
        </Match>
        <Match when={props.client.loginStateSignal() === LoginState.TryingToLogOut}>
          <span class={styles.inProgress}>Logging out...</span>
        </Match>
      </Switch>

      <span class={styles.dialog} onClick={() => props.client.setDialogType(DialogType.Settings)}>
        ⚙
      </span>

      <span
        classList={{
          [styles.connection]: true,
          [styles.connected]: props.client.isConnectedSignal(),
          [styles.connecting]: !props.client.isConnectedSignal(),
        }}
        title={props.client.isConnectedSignal() ? 'Connected' : 'Connecting...'}
      />
    </div>
  );
}
