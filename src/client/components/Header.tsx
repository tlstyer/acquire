import { Match, Show, Switch } from 'solid-js';
import { DOMElement } from 'solid-js/jsx-runtime';
import { Client, LoginState } from '../client';
import { DialogType } from './Dialog';
import styles from './Header.module.css';
import { Username } from './Username';

export function Header(props: { client: Client }) {
  function dialogClickHandler(
    dialogType: DialogType,
    e: MouseEvent & {
      currentTarget: HTMLAnchorElement;
      target: DOMElement;
    },
  ) {
    e.preventDefault();
    props.client.setDialogType(dialogType);
  }

  return (
    <div class={styles.root}>
      <span class={styles.name}>
        <a href="/">Acquire</a>
      </span>

      <span class={styles.middle} />

      <Show when={props.client.signals.username() !== ''}>
        <Username username={props.client.signals.username()} />
      </Show>

      <Switch>
        <Match when={props.client.signals.loginState() === LoginState.LoggedOut}>
          <span>
            <a href="/" onClick={[dialogClickHandler, DialogType.Login]}>
              Login
            </a>
          </span>
        </Match>
        <Match when={props.client.signals.loginState() === LoginState.TryingToLogIn}>
          <span class={styles.inProgress}>Logging in...</span>
        </Match>
        <Match when={props.client.signals.loginState() === LoginState.TryingToCreateUser}>
          <span class={styles.inProgress}>Creating user...</span>
        </Match>
        <Match when={props.client.signals.loginState() === LoginState.LoggedIn}>
          <span>
            <a href="/" onClick={[dialogClickHandler, DialogType.Logout]}>
              Logout
            </a>
          </span>
        </Match>
        <Match when={props.client.signals.loginState() === LoginState.TryingToLogOut}>
          <span class={styles.inProgress}>Logging out...</span>
        </Match>
      </Switch>

      <span>
        <a href="/" onClick={[dialogClickHandler, DialogType.Settings]}>
          ⚙
        </a>
      </span>

      <span
        classList={{
          [styles.connection]: true,
          [styles.connected]: props.client.signals.isConnected(),
          [styles.connecting]: !props.client.signals.isConnected(),
        }}
        title={props.client.signals.isConnected() ? 'Connected' : 'Connecting...'}
      />
    </div>
  );
}
