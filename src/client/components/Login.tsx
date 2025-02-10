import { createSignal, Match, Switch } from 'solid-js';
import { cleanUpWhitespaceInUsername } from '../../common/helpers';
import { PB_MessageToClient_LoginLogout_ResponseCode } from '../../common/pb';
import { type Client, LoginState } from '../client';
import { DialogType, loginLogoutResponseCodeToString } from '../helpers';
import styles from './Login.module.css';

export function Login(props: { client: Client }) {
  const [username, setUsername] = createSignal('');
  const [usernameError, setUsernameError] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);

  function validateUsername() {
    setUsername(cleanUpWhitespaceInUsername(username()));
    if (username().length > 0) {
      setUsernameError('');
    } else {
      setUsernameError('Username is required.');
    }
  }

  function validatePassword() {
    if (password().length > 0) {
      setPasswordError('');
    } else {
      setPasswordError('Password is required.');
    }
  }

  return (
    <div class={styles.root}>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          validateUsername();
          validatePassword();

          if (usernameError() === '' && passwordError() === '') {
            props.client.loginWithPassword(username(), password());
            setSubmitted(true);
          }
        }}
      >
        <div>
          <label>
            Username:{' '}
            <input
              classList={{
                [styles.inputError]: usernameError() !== '',
              }}
              type="text"
              value={username()}
              onInput={(e) => setUsername(e.currentTarget.value)}
              onBlur={validateUsername}
            />
          </label>
          <div class={styles.error}>{usernameError()}</div>
        </div>
        <div>
          <label>
            Password:{' '}
            <input
              classList={{
                [styles.inputError]: passwordError() !== '',
              }}
              type="password"
              value={password()}
              onInput={(e) => setPassword(e.currentTarget.value)}
              onBlur={validatePassword}
            />
          </label>
          <div class={styles.error}>{passwordError()}</div>
        </div>
        <div>
          <button
            type="submit"
            disabled={props.client.signals.loginState() !== LoginState.LoggedOut}
          >
            Login
          </button>{' '}
          <Switch>
            <Match
              when={submitted() && props.client.signals.loginLogoutResponseCode() !== undefined}
            >
              <span
                classList={{
                  [styles.success]:
                    props.client.signals.loginLogoutResponseCode() ===
                    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
                  [styles.error]:
                    props.client.signals.loginLogoutResponseCode() !==
                    PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS,
                }}
              >
                {loginLogoutResponseCodeToString.get(
                  props.client.signals.loginLogoutResponseCode()!,
                )}
              </span>
            </Match>
            <Match when={submitted()}>
              <span class={styles.inProgress}>Logging in...</span>
            </Match>
          </Switch>
        </div>
      </form>

      <hr />

      <div>
        If you have not created a user:{' '}
        <button
          disabled={props.client.signals.loginState() !== LoginState.LoggedOut}
          onClick={() => props.client.setDialogType(DialogType.CreateUser)}
        >
          Create User
        </button>
      </div>
    </div>
  );
}
