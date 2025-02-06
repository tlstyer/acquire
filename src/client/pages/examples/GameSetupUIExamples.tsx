import { createMemo, createSignal, For } from 'solid-js';
import { GameSetup } from '../../../common/gameSetup';
import { PB_GameMode, PB_PlayerArrangementMode } from '../../../common/pb';
import { User } from '../../../common/user';
import { GameSetupUI } from '../../components/GameSetupUI';

export function GameSetupUIExamples() {
  const hostUser = new User(1, 'Host');

  const userIdToUser = new Map([[1, hostUser]]);

  const [gameSetup, setGameSetup] = createSignal(
    new GameSetup(
      PB_GameMode.SINGLES_4,
      PB_PlayerArrangementMode.RANDOM_ORDER,
      hostUser,
      userIdToUser,
    ),
    {
      equals: false,
    },
  );

  const [simulatedNetworkDelay, setSimulatedNetworkDelay] = createSignal(250);

  const [nonHostUsers, setNonHostUsers] = createSignal<User[]>([]);

  const usersInRoom = createMemo(
    () => new Set([hostUser, ...nonHostUsers().filter((user) => user.id % 2 === 1)]),
  );

  let nextUserId = 2;

  const numUsersInGame = () => gameSetup().usersSet.size;

  const maxUsers = () => gameSetup().users.length;

  return (
    <>
      <p>
        Simulated network delay (ms):{' '}
        <input
          type="number"
          value={simulatedNetworkDelay()}
          onInput={(e) => setSimulatedNetworkDelay(parseInt(e.currentTarget.value, 10))}
        />
      </p>

      <h2>{hostUser.name}'s view</h2>

      <p>
        <GameSetupUI
          gameMode={gameSetup().gameMode}
          playerArrangementMode={gameSetup().playerArrangementMode}
          users={gameSetup().users}
          approvals={gameSetup().approvals}
          hostUser={gameSetup().hostUser}
          myUser={gameSetup().hostUser}
          usersInRoom={usersInRoom()}
          onChangeGameMode={(gameMode) => {
            setTimeout(() => {
              console.log('changeGameMode', gameMode);
              setGameSetup((gs) => {
                gs.changeGameMode(gameMode);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onChangePlayerArrangementMode={(playerArrangementMode) => {
            setTimeout(() => {
              console.log('changePlayerArrangementMode', playerArrangementMode);
              setGameSetup((gs) => {
                gs.changePlayerArrangementMode(playerArrangementMode);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onSwapPositions={(position1, position2) => {
            setTimeout(() => {
              console.log('swapPositions', position1, position2);
              setGameSetup((gs) => {
                gs.swapPositions(position1, position2);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onKickUser={(userId) => {
            setTimeout(() => {
              console.log('kickUser', userId);
              setGameSetup((gs) => {
                gs.kickUser(userIdToUser.get(userId)!);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
          onApprove={() => {
            setTimeout(() => {
              console.log('approve', hostUser);
              setGameSetup((gs) => {
                gs.approve(hostUser);
                return gs;
              });
            }, simulatedNetworkDelay());
          }}
        />
      </p>

      <For each={nonHostUsers()}>
        {(user) => (
          <>
            <h2>{user.name}'s view</h2>

            <p>
              <input
                type="button"
                value={gameSetup().usersSet.has(user) ? 'Stand Up' : 'Sit Down'}
                disabled={!gameSetup().usersSet.has(user) && numUsersInGame === maxUsers}
                onClick={() => {
                  const inGameNow = gameSetup().usersSet.has(user);
                  setTimeout(() => {
                    if (inGameNow) {
                      console.log('removeUser', user);
                      setGameSetup((gs) => {
                        gs.removeUser(user);
                        return gs;
                      });
                    } else {
                      console.log('addUser', user);
                      setGameSetup((gs) => {
                        gs.addUser(user);
                        return gs;
                      });
                    }
                  }, simulatedNetworkDelay());
                }}
              />
            </p>

            <p>
              <GameSetupUI
                gameMode={gameSetup().gameMode}
                playerArrangementMode={gameSetup().playerArrangementMode}
                users={gameSetup().users}
                approvals={gameSetup().approvals}
                hostUser={gameSetup().hostUser}
                usersInRoom={usersInRoom()}
                myUser={user}
                onChangeGameMode={undefined}
                onChangePlayerArrangementMode={undefined}
                onSwapPositions={undefined}
                onKickUser={undefined}
                onApprove={() => {
                  setTimeout(() => {
                    console.log('approve', user);
                    setGameSetup((gs) => {
                      gs.approve(user);
                      return gs;
                    });
                  }, simulatedNetworkDelay());
                }}
              />
            </p>
          </>
        )}
      </For>

      <p>
        <input
          type="button"
          value="Add A User"
          onClick={() => {
            const userId = nextUserId++;
            const user = new User(userId, `User ${userId}`);
            userIdToUser.set(userId, user);
            setNonHostUsers((users) => [...users, user]);
          }}
        />{' '}
        <input
          type="button"
          value="Remove Users Who Are Not In The Game"
          onClick={() => {
            const filteredUsers = nonHostUsers().filter((user) => gameSetup().usersSet.has(user));
            if (filteredUsers.length !== nonHostUsers().length) {
              setNonHostUsers(filteredUsers);
            }
          }}
        />
      </p>
    </>
  );
}
