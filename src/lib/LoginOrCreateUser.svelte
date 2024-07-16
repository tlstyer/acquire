<script lang="ts" context="module">
  abstract class BaseStuff {
    abstract submitButtonTitle: string;
    abstract otherIntro: string;
    abstract otherTitle: string;
    abstract submittedMessage: string;

    username = '';
    usernameError = '';
    password = '';
    passwordError = '';
    confirmPassword = '';
    confirmPasswordError = '';

    submitted = false;

    constructor(public client: Client) {}

    abstract validateUsername(): void;
    abstract validatePassword(): void;
    validateConfirmPassword() {}

    validateAll() {
      this.validateUsername();
      this.validatePassword();
      this.validateConfirmPassword();
    }

    isValid() {
      return !this.usernameError && !this.passwordError && !this.confirmPasswordError;
    }

    submit() {
      this.submitted = true;
    }
  }

  class LoginStuff extends BaseStuff {
    submitButtonTitle = 'Login';
    otherIntro = 'If you have not created a user:';
    otherTitle = 'Create User';
    submittedMessage = 'Logging in...';

    validateUsername() {
      this.username = cleanUpWhitespaceInUsername(this.username);
      if (this.username.length > 0) {
        this.usernameError = '';
      } else {
        this.usernameError = 'Username is required.';
      }
    }

    validatePassword() {
      if (this.password.length > 0) {
        this.passwordError = '';
      } else {
        this.passwordError = 'Password is required.';
      }
    }

    submit() {
      this.client.loginWithPassword(this.username, this.password);
      super.submit();
    }
  }

  class CreateUserStuff extends BaseStuff {
    submitButtonTitle = 'Create User';
    otherIntro = 'If you already created a user:';
    otherTitle = 'Login';
    submittedMessage = 'Creating user...';

    validateUsername() {
      this.username = cleanUpWhitespaceInUsername(this.username);
      if (isValidUsername(this.username)) {
        this.usernameError = '';
      } else {
        this.usernameError = 'Username must have between 1 and 32 ASCII characters.';
      }
    }

    validatePassword() {
      if (isValidPassword(this.password)) {
        this.passwordError = '';
      } else {
        this.passwordError = 'Password must have at least 8 characters.';
      }
    }

    validateConfirmPassword() {
      if (this.confirmPassword === this.password) {
        this.confirmPasswordError = '';
      } else {
        this.confirmPasswordError = 'Passwords must match.';
      }
    }

    submit() {
      this.client.createUserAndLogin(this.username, this.password);
      super.submit();
    }
  }
</script>

<script lang="ts">
  import { getContext } from 'svelte';
  import { cleanUpWhitespaceInUsername, isValidPassword, isValidUsername } from '../common/helpers';
  import { PB_MessageToClient_LoginLogout_ResponseCode } from '../common/pb';
  import { LoginState, type Client } from './client';
  import { loginLogoutResponseCodeToString } from './helpers';

  export let loginMode: boolean;
  export let onSwitch: () => void;

  const client: Client = getContext('client');

  const loginStateStore = client.loginStateStore;
  const loginLogoutResponseCodeStore = client.loginLogoutResponseCodeStore;

  let stuff: BaseStuff = loginMode ? new LoginStuff(client) : new CreateUserStuff(client);
</script>

<form
  on:submit={(event) => {
    event.preventDefault();

    stuff.validateAll();

    if (stuff.isValid()) {
      stuff.submit();
    }

    stuff = stuff;
  }}
>
  <div>
    <label>
      Username:
      <input
        class:inputError={stuff.usernameError}
        type="text"
        bind:value={stuff.username}
        on:blur={() => {
          stuff.validateUsername();
          stuff = stuff;
        }}
      />
    </label>
    <div class="error">{stuff.usernameError}</div>
  </div>
  <div>
    <label>
      Password:
      <input
        class:inputError={stuff.passwordError}
        type="password"
        bind:value={stuff.password}
        on:blur={() => {
          stuff.validatePassword();
          stuff = stuff;
        }}
      />
    </label>
    <div class="error">{stuff.passwordError}</div>
  </div>
  {#if stuff instanceof CreateUserStuff}
    <div>
      <label>
        Confirm Password:
        <input
          class:inputError={stuff.confirmPasswordError}
          type="password"
          bind:value={stuff.confirmPassword}
          on:blur={() => {
            stuff.validateConfirmPassword();
            stuff = stuff;
          }}
        />
      </label>
      <div class="error">{stuff.confirmPasswordError}</div>
    </div>
  {/if}
  <div>
    <button type="submit" disabled={$loginStateStore !== LoginState.LoggedOut}>
      {stuff.submitButtonTitle}
    </button>
    {#if stuff.submitted}
      {#if $loginLogoutResponseCodeStore === undefined}
        <span class="inProgress">{stuff.submittedMessage}</span>
      {:else}
        <span
          class:success={$loginLogoutResponseCodeStore ===
            PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS}
          class:error={$loginLogoutResponseCodeStore !==
            PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS}
        >
          {loginLogoutResponseCodeToString.get($loginLogoutResponseCodeStore)}
        </span>
      {/if}
    {/if}
  </div>
</form>

<hr />

<div>
  {stuff.otherIntro}
  <button disabled={$loginStateStore !== LoginState.LoggedOut} on:click={onSwitch}>
    {stuff.otherTitle}
  </button>
</div>

<style>
  div {
    margin-top: 8px;
  }

  hr {
    margin: 1em 0;
  }

  .inputError {
    border-color: red;
    border-style: solid;
  }

  .inProgress {
    font-style: italic;
  }

  .success {
    color: green;
  }

  .error {
    color: red;
  }
</style>
