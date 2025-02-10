import { createSignal, Match, Switch } from 'solid-js';
import {
  cleanUpWhitespaceInUsername,
  isValidPassword,
  isValidUsername,
} from '../../common/helpers';
import { PB_MessageToClient_LoginLogout_ResponseCode } from '../../common/pb';
import { type Client, LoginState } from '../client';
import { DialogType, loginLogoutResponseCodeToString } from '../helpers';
import styles from './Login.module.css';

export function CreateUser(props: { client: Client }) {
  const [username, setUsername] = createSignal('');
  const [usernameError, setUsernameError] = createSignal('');
  const [password, setPassword] = createSignal('');
  const [passwordError, setPasswordError] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [confirmPasswordError, setConfirmPasswordError] = createSignal('');
  const [submitted, setSubmitted] = createSignal(false);

  function validateUsername() {
    setUsername(cleanUpWhitespaceInUsername(username()));
    if (isValidUsername(username())) {
      setUsernameError('');
    } else {
      setUsernameError('Username must have between 1 and 32 ASCII characters.');
    }
  }

  function validatePassword() {
    if (isValidPassword(password())) {
      setPasswordError('');
    } else {
      setPasswordError('Password must have at least 8 characters.');
    }
  }

  function validateConfirmPassword() {
    if (confirmPassword() === password()) {
      setConfirmPasswordError('');
    } else {
      setConfirmPasswordError('Passwords must match.');
    }
  }

  return (
    <div class={styles.root}>
      <form
        onSubmit={(event) => {
          event.preventDefault();

          validateUsername();
          validatePassword();
          validateConfirmPassword();

          if (usernameError() === '' && passwordError() === '' && confirmPasswordError() === '') {
            props.client.createUserAndLogin(username(), password());
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
          <label>
            Confirm Password:{' '}
            <input
              classList={{
                [styles.inputError]: confirmPasswordError() !== '',
              }}
              type="password"
              value={confirmPassword()}
              onInput={(e) => setConfirmPassword(e.currentTarget.value)}
              onBlur={validateConfirmPassword}
            />
          </label>
          <div class={styles.error}>{confirmPasswordError()}</div>
        </div>
        <div>
          <button
            type="submit"
            disabled={props.client.signals.loginState() !== LoginState.LoggedOut}
          >
            Create User
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
              <span class={styles.inProgress}>Creating user...</span>
            </Match>
          </Switch>
        </div>
      </form>

      <hr />

      <div>
        If you already created a user:{' '}
        <button
          disabled={props.client.signals.loginState() !== LoginState.LoggedOut}
          onClick={() => props.client.setDialogType(DialogType.Login)}
        >
          Login
        </button>
      </div>
    </div>
  );
}
