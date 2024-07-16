<svelte:options immutable />

<script lang="ts">
  import { getContext } from 'svelte';
  import { PB_MessageToClient_LoginLogout_ResponseCode } from '../common/pb';
  import { LoginState, type Client } from './client';
  import { loginLogoutResponseCodeToString } from './helpers';

  const client: Client = getContext('client');

  const loginStateStore = client.loginStateStore;
  const loginLogoutResponseCodeStore = client.loginLogoutResponseCodeStore;

  let submitted = false;
</script>

<form
  on:submit={(event) => {
    event.preventDefault();

    client.logout();

    submitted = true;
  }}
>
  <div>Are you sure you want to log out?</div>
  <div>
    <button type="submit" disabled={$loginStateStore !== LoginState.LoggedIn}>Logout</button>
    {#if submitted}
      {#if $loginLogoutResponseCodeStore === undefined}
        <span class="inProgress">Logging out...</span>
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

<style>
  div {
    margin-top: 8px;
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
