/* tslint:disable:no-console */

import * as React from 'react';
import { GameMode, PlayerArrangementMode } from '../../common/enums';
import { GameSetup } from '../../common/gameSetup';
import { GameSetupUI } from './GameSetupUI';

export interface ExampleGameSetupMasterProps {}

interface ExampleGameSetupMasterState {
    gameSetup: GameSetup;
    simulatedNetworkDelay: number;
    nextUserId: number;
}

const watcherUsername = '';

export class ExampleGameSetupMaster extends React.Component<ExampleGameSetupMasterProps, ExampleGameSetupMasterState> {
    constructor(props: ExampleGameSetupMasterProps) {
        super(props);

        this.state = {
            gameSetup: new GameSetup(GameMode.Singles4, PlayerArrangementMode.RandomOrder, 1, 'Host'),
            simulatedNetworkDelay: 250,
            nextUserId: 2,
        };
    }

    static getDerivedStateFromProps(nextProps: ExampleGameSetupMasterProps, prevState: ExampleGameSetupMasterState) {
        return null;
    }

    render() {
        const { gameSetup, simulatedNetworkDelay } = this.state;

        const numUsersInGame = gameSetup.usernameToUserID.size;
        const maxUsers = gameSetup.usernames.size;

        const userIDs = [...gameSetup.userIDToUsername.sort().keys()];

        return (
            <div>
                Simulated network delay (ms): <input type={'text'} value={simulatedNetworkDelay} size={4} onChange={this.handleChangeSimulatedNetworkDelay} />
                <br />
                <input type={'button'} value={'Add a user'} disabled={numUsersInGame === maxUsers} onClick={this.handleAddAUser} />
                <h2>Host's view</h2>
                <GameSetupUI
                    gameMode={gameSetup.gameMode}
                    playerArrangementMode={gameSetup.playerArrangementMode}
                    usernames={gameSetup.usernames}
                    approvals={gameSetup.approvals}
                    hostUsername={gameSetup.hostUsername}
                    myUsername={gameSetup.hostUsername}
                    onChangeGameMode={this.handleChangeGameMode}
                    onChangePlayerArrangementMode={this.handleChangePlayerArrangementMode}
                    onSwapPositions={this.handleSwapPositions}
                    onKickUser={this.handleKickUser}
                    onApprove={() => {
                        setTimeout(() => {
                            console.log('approve', 1);

                            gameSetup.approve(1);
                            this.setState({ gameSetup });
                        }, this.state.simulatedNetworkDelay);
                    }}
                />
                {userIDs.map(userID => {
                    const username = gameSetup.userIDToUsername.get(userID, '');
                    return username !== gameSetup.hostUsername ? (
                        <div key={username}>
                            <h2>{username}'s view</h2>
                            <input
                                type={'button'}
                                value={'Leave game'}
                                onClick={() => {
                                    setTimeout(() => {
                                        console.log('removeUser', userID);

                                        gameSetup.removeUser(userID);
                                        this.setState({ gameSetup });
                                    }, this.state.simulatedNetworkDelay);
                                }}
                            />
                            <br />
                            <br />
                            <GameSetupUI
                                gameMode={gameSetup.gameMode}
                                playerArrangementMode={gameSetup.playerArrangementMode}
                                usernames={gameSetup.usernames}
                                approvals={gameSetup.approvals}
                                hostUsername={gameSetup.hostUsername}
                                myUsername={username}
                                onApprove={() => {
                                    setTimeout(() => {
                                        console.log('approve', userID);

                                        gameSetup.approve(userID);
                                        this.setState({ gameSetup });
                                    }, this.state.simulatedNetworkDelay);
                                }}
                            />
                        </div>
                    ) : (
                        undefined
                    );
                })}
                <h2>Watcher view</h2>
                <GameSetupUI
                    gameMode={gameSetup.gameMode}
                    playerArrangementMode={gameSetup.playerArrangementMode}
                    usernames={gameSetup.usernames}
                    approvals={gameSetup.approvals}
                    hostUsername={gameSetup.hostUsername}
                    myUsername={watcherUsername}
                />
            </div>
        );
    }

    handleChangeSimulatedNetworkDelay = (event: React.FormEvent<HTMLInputElement>) => {
        let simulatedNetworkDelay = parseInt(event.currentTarget.value, 10);
        if (Number.isNaN(simulatedNetworkDelay)) {
            simulatedNetworkDelay = 0;
        }
        this.setState({ simulatedNetworkDelay });
    };

    handleAddAUser = () => {
        const { gameSetup } = this.state;

        const userID = this.state.nextUserId;
        const username = `User ${this.state.nextUserId}`;

        console.log('addUser', userID, username);

        gameSetup.addUser(userID, username);
        this.setState({ gameSetup, nextUserId: userID + 1 });
    };

    handleChangeGameMode = (gameMode: GameMode) => {
        setTimeout(() => {
            const { gameSetup } = this.state;

            console.log('changeGameMode', gameMode);

            gameSetup.changeGameMode(gameMode);
            this.setState({ gameSetup });
        }, this.state.simulatedNetworkDelay);
    };

    handleChangePlayerArrangementMode = (playerArrangementMode: PlayerArrangementMode) => {
        setTimeout(() => {
            const { gameSetup } = this.state;

            console.log('changePlayerArrangementMode', playerArrangementMode);

            gameSetup.changePlayerArrangementMode(playerArrangementMode);
            this.setState({ gameSetup });
        }, this.state.simulatedNetworkDelay);
    };

    handleSwapPositions = (position1: number, position2: number) => {
        setTimeout(() => {
            const { gameSetup } = this.state;

            console.log('swapPositions', position1, position2);

            gameSetup.swapPositions(position1, position2);
            this.setState({ gameSetup });
        }, this.state.simulatedNetworkDelay);
    };

    handleKickUser = (position: number) => {
        setTimeout(() => {
            const { gameSetup } = this.state;

            console.log('kickUser', position);

            gameSetup.kickUser(position);
            this.setState({ gameSetup });
        }, this.state.simulatedNetworkDelay);
    };
}
