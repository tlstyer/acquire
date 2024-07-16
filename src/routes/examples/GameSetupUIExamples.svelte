<script lang="ts">
  import GameSetupUI from '$lib/GameSetupUI.svelte';
  import { GameSetup } from '../../common/gameSetup';
  import { PB_GameMode, PB_PlayerArrangementMode } from '../../common/pb';

  const hostUserID = 1;
  let gameSetup = new GameSetup(
    PB_GameMode.SINGLES_4,
    PB_PlayerArrangementMode.RANDOM_ORDER,
    hostUserID,
    getUsernameForUserID,
  );
  let simulatedNetworkDelay = 250;
  let nonHostUserIDs: number[] = [];
  let nextUserId = 2;

  $: numUsersInGame = gameSetup.userIDsSet.size;
  $: maxUsers = gameSetup.userIDs.length;

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

{#each nonHostUserIDs as userID (userID)}
  <h2>
    {getUsernameForUserID(userID)}'s view
  </h2>

  <p>
    <input
      type="button"
      value={gameSetup.userIDsSet.has(userID) ? 'Stand Up' : 'Sit Down'}
      disabled={!gameSetup.userIDsSet.has(userID) && numUsersInGame === maxUsers}
      on:click={() => {
        const inGameNow = gameSetup.userIDsSet.has(userID);
        setTimeout(() => {
          if (inGameNow) {
            console.log('removeUser', userID);
            gameSetup.removeUser(userID);
          } else {
            console.log('addUser', userID);
            gameSetup.addUser(userID);
          }
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
{/each}

<p>
  <input
    type="button"
    value="Add A User"
    on:click={() => {
      const userID = nextUserId++;
      nonHostUserIDs.push(userID);
      nonHostUserIDs = nonHostUserIDs;
    }}
  />

  <input
    type="button"
    value="Remove Users Who Are Not In The Game"
    on:click={() => {
      const filteredUserIDs = nonHostUserIDs.filter((userID) => gameSetup.userIDsSet.has(userID));
      if (filteredUserIDs.length !== nonHostUserIDs.length) {
        nonHostUserIDs = filteredUserIDs;
      }
    }}
  />
</p>
