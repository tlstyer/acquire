import { createSignal, Show } from 'solid-js';
import { PB_MessageToClient_LoginLogout_ResponseCode } from '../../common/pb';
import { Client, LoginState } from '../client';
import { loginLogoutResponseCodeToString } from '../helpers';
import styles from './Login.module.css';

export function Logout(props: { client: Client }) {
  const [submitted, setSubmitted] = createSignal(false);

  return (
    <div class={styles.root}>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          props.client.logout();

          setSubmitted(true);
        }}
      >
        <div>Are you sure you want to log out?</div>
        <div>
          <button type="submit" disabled={props.client.loginStateSignal() !== LoginState.LoggedIn}>
            Logout
          </button>{' '}
          <Show when={submitted()}>
            <Show
              when={props.client.loginLogoutResponseCodeSignal() !== undefined}
              fallback={<span class={styles.inProgress}>Logging out...</span>}
            >
              <span
                classList={{
                  [styles.success]:
                    props.client.loginLogoutResponseCodeSignal() ===
                    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
                  [styles.error]:
                    props.client.loginLogoutResponseCodeSignal() !==
                    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
                }}
              >
                {loginLogoutResponseCodeToString.get(props.client.loginLogoutResponseCodeSignal()!)}
              </span>
            </Show>
          </Show>
        </div>
      </form>
    </div>
  );
}
