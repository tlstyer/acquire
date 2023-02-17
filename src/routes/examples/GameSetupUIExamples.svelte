<script lang="ts">
  import GameSetupUI from '$lib/GameSetupUI.svelte';
  import { GameSetup } from '../../common/gameSetup';
  import { PB_GameMode, PB_PlayerArrangementMode } from '../../common/pb';

  const hostUserID = 1;
  let gameSetup = new GameSetup(PB_GameMode.SINGLES_4, PB_PlayerArrangementMode.RANDOM_ORDER, hostUserID, getUsernameForUserID);
  let simulatedNetworkDelay = 250;
  let nextUserId = 2;

  $: numUsersInGame = gameSetup.userIDsSet.size;
  $: maxUsers = gameSetup.userIDs.length;
  $: userIDs = [...gameSetup.userIDsSet.values()].sort((a, b) => a - b);

  function getUsernameForUserID(userID: number) {
    if (userID === hostUserID) {
      return 'Host';
    } else {
      return `User ${userID}`;
    }
  }
</script>

<p>
  Simulated network delay (ms): <input type="number" bind:value={simulatedNetworkDelay} />
</p>

<p>
  <input
    type="button"
    value="Add a user"
    disabled={numUsersInGame === maxUsers}
    on:click={() => {
      const userID = nextUserId++;
      console.log('addUser', userID);
      gameSetup.addUser(userID);
      gameSetup = gameSetup;
    }}
  />
</p>

<h2>{getUsernameForUserID(hostUserID)}'s view</h2>

<p>
  <GameSetupUI
    gameMode={gameSetup.gameMode}
    playerArrangementMode={gameSetup.playerArrangementMode}
    usernames={gameSetup.usernames}
    userIDs={gameSetup.userIDs}
    approvals={gameSetup.approvals}
    hostUserID={gameSetup.hostUserID}
    myUserID={gameSetup.hostUserID}
    onChangeGameMode={(gameMode) => {
      setTimeout(() => {
        console.log('changeGameMode', gameMode);
        gameSetup.changeGameMode(gameMode);
        gameSetup = gameSetup;
      }, simulatedNetworkDelay);
    }}
    onChangePlayerArrangementMode={(playerArrangementMode) => {
      setTimeout(() => {
        console.log('changePlayerArrangementMode', playerArrangementMode);
        gameSetup.changePlayerArrangementMode(playerArrangementMode);
        gameSetup = gameSetup;
      }, simulatedNetworkDelay);
    }}
    onSwapPositions={(position1, position2) => {
      setTimeout(() => {
        console.log('swapPositions', position1, position2);
        gameSetup.swapPositions(position1, position2);
        gameSetup = gameSetup;
      }, simulatedNetworkDelay);
    }}
    onKickUser={(userID) => {
      setTimeout(() => {
        console.log('kickUser', userID);
        gameSetup.kickUser(userID);
        gameSetup = gameSetup;
      }, simulatedNetworkDelay);
    }}
    onApprove={() => {
      setTimeout(() => {
        console.log('approve', hostUserID);
        gameSetup.approve(hostUserID);
        gameSetup = gameSetup;
      }, simulatedNetworkDelay);
    }}
  />
</p>

{#each userIDs as userID}
  {#if userID !== gameSetup.hostUserID}
    <h2>
      {getUsernameForUserID(userID)}'s view
    </h2>

    <p>
      <input
        type="button"
        value="Leave game"
        on:click={() => {
          setTimeout(() => {
            console.log('removeUser', userID);
            gameSetup.removeUser(userID);
            gameSetup = gameSetup;
          }, simulatedNetworkDelay);
        }}
      />
    </p>

    <p>
      <GameSetupUI
        gameMode={gameSetup.gameMode}
        playerArrangementMode={gameSetup.playerArrangementMode}
        usernames={gameSetup.usernames}
        userIDs={gameSetup.userIDs}
        approvals={gameSetup.approvals}
        hostUserID={gameSetup.hostUserID}
        myUserID={userID}
        onApprove={() => {
          setTimeout(() => {
            console.log('approve', userID);
            gameSetup.approve(userID);
            gameSetup = gameSetup;
          }, simulatedNetworkDelay);
        }}
      />
    </p>
  {/if}
{/each}

<h2>Watcher view</h2>

<p>
  <GameSetupUI
    gameMode={gameSetup.gameMode}
    playerArrangementMode={gameSetup.playerArrangementMode}
    usernames={gameSetup.usernames}
    userIDs={gameSetup.userIDs}
    approvals={gameSetup.approvals}
    hostUserID={gameSetup.hostUserID}
    myUserID={-1}
  />
</p>
