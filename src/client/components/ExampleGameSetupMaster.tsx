import * as React from 'react';

import { GameMode, PlayerArrangementMode } from '../../common/enums';
import { gameModeToNumPlayers } from '../../common/helpers';
import { GameSetup } from './GameSetup';

export interface ExampleGameSetupMasterProps {}

interface ExampleGameSetupMasterState {
    gameMode: GameMode;
    playerArrangementMode: PlayerArrangementMode;
    userIDs: (number | null)[];
    usernames: (string | null)[];

    nextUserId: number;
    simulatedNetworkDelay: number;
}

export class ExampleGameSetupMaster extends React.PureComponent<ExampleGameSetupMasterProps, ExampleGameSetupMasterState> {
    constructor(props: ExampleGameSetupMasterProps) {
        super(props);

        this.state = {
            gameMode: GameMode.Singles4,
            playerArrangementMode: PlayerArrangementMode.RandomOrder,
            userIDs: [1, null, null, null],
            usernames: ['Host', null, null, null],

            nextUserId: 2,
            simulatedNetworkDelay: 250,
        };
    }

    static getDerivedStateFromProps(nextProps: ExampleGameSetupMasterProps, prevState: ExampleGameSetupMasterState) {
        return null;
    }

    render() {
        const { gameMode, playerArrangementMode, userIDs, usernames, simulatedNetworkDelay } = this.state;

        let numUsersInGame = 0;
        for (let i = 0; i < userIDs.length; i++) {
            const userID = userIDs[i];
            if (userID !== null) {
                numUsersInGame++;
            }
        }

        const maxUsers = userIDs.length;

        return (
            <div>
                Simulated network delay (ms): <input type={'text'} value={simulatedNetworkDelay} size={5} onChange={this.handleChangeNetworkDelay} />
                <br />
                <input type={'button'} value={'Add user'} disabled={numUsersInGame === maxUsers} onClick={this.handleAddUser} />
                <br />
                <input type={'button'} value={'Remove user'} disabled={numUsersInGame === 1} onClick={this.handleRemoveUser} />
                <br />
                <br />
                <GameSetup
                    gameMode={gameMode}
                    playerArrangementMode={playerArrangementMode}
                    userIDs={userIDs}
                    usernames={usernames}
                    onChangeGameMode={this.handleChangeGameMode}
                    onChangePlayerArrangementMode={this.handleChangePlayerArrangementMode}
                    onSwapPositions={this.handleSwapPositions}
                />
                <br />
                <GameSetup gameMode={gameMode} playerArrangementMode={playerArrangementMode} userIDs={userIDs} usernames={usernames} />
            </div>
        );
    }

    handleChangeNetworkDelay = (event: React.FormEvent<HTMLInputElement>) => {
        let simulatedNetworkDelay = parseInt(event.currentTarget.value, 10);
        if (Number.isNaN(simulatedNetworkDelay)) {
            simulatedNetworkDelay = 0;
        }
        this.setState({ simulatedNetworkDelay });
    };

    handleAddUser = () => {
        for (let i = 0; i < this.state.userIDs.length; i++) {
            const userID = this.state.userIDs[i];
            if (userID === null) {
                const updatedUserIDs = [...this.state.userIDs];
                updatedUserIDs[i] = this.state.nextUserId;

                const updatedUsernames = [...this.state.usernames];
                updatedUsernames[i] = `User ${this.state.nextUserId}`;

                this.setState({
                    userIDs: updatedUserIDs,
                    usernames: updatedUsernames,
                    nextUserId: this.state.nextUserId + 1,
                });
                break;
            }
        }
    };

    handleRemoveUser = () => {
        let indexesThatCanBeRemoved: number[] = [];

        for (let i = 0; i < this.state.userIDs.length; i++) {
            const userID = this.state.userIDs[i];
            if (userID !== null && userID !== 1) {
                indexesThatCanBeRemoved.push(i);
            }
        }

        const randomIndex = indexesThatCanBeRemoved[Math.floor(Math.random() * indexesThatCanBeRemoved.length)];

        const updatedUserIDs = [...this.state.userIDs];
        updatedUserIDs[randomIndex] = null;

        const updatedUsernames = [...this.state.usernames];
        updatedUsernames[randomIndex] = null;

        this.setState({
            userIDs: updatedUserIDs,
            usernames: updatedUsernames,
        });
    };

    handleChangeGameMode = (gameMode: GameMode) => {
        setTimeout(() => {
            console.log('handleChangeGameMode', gameMode);

            const oldNumPlayers = gameModeToNumPlayers[this.state.gameMode];
            const newNumPlayers = gameModeToNumPlayers[gameMode];

            if (newNumPlayers !== oldNumPlayers) {
                const userIDs = [...this.state.userIDs];
                const usernames = [...this.state.usernames];

                if (newNumPlayers > oldNumPlayers) {
                    const numSpotsToAdd = newNumPlayers - oldNumPlayers;
                    for (let i = 0; i < numSpotsToAdd; i++) {
                        userIDs.push(null);
                        usernames.push(null);
                    }
                } else {
                    for (let oldIndex = oldNumPlayers - 1; oldIndex >= newNumPlayers; oldIndex--) {
                        if (userIDs[oldIndex] !== null) {
                            for (let newIndex = newNumPlayers - 1; newIndex >= 0; newIndex--) {
                                if (userIDs[newIndex] === null) {
                                    userIDs[newIndex] = userIDs[oldIndex];
                                    usernames[newIndex] = usernames[oldIndex];
                                    break;
                                }
                            }
                        }

                        userIDs.pop();
                        usernames.pop();
                    }
                }

                this.setState({ gameMode, userIDs, usernames });
            } else {
                this.setState({ gameMode });
            }
        }, this.state.simulatedNetworkDelay);
    };

    handleChangePlayerArrangementMode = (playerArrangementMode: PlayerArrangementMode) => {
        setTimeout(() => {
            console.log('handleChangePlayerArrangementMode', playerArrangementMode);

            this.setState({ playerArrangementMode });
        }, this.state.simulatedNetworkDelay);
    };

    handleSwapPositions = (position1: number, position2: number) => {
        setTimeout(() => {
            console.log('handleSwapPositions', position1, position2);

            const userIDs = [...this.state.userIDs];
            userIDs[position1] = this.state.userIDs[position2];
            userIDs[position2] = this.state.userIDs[position1];

            const usernames = [...this.state.usernames];
            usernames[position1] = this.state.usernames[position2];
            usernames[position2] = this.state.usernames[position1];

            this.setState({ userIDs, usernames });
        }, this.state.simulatedNetworkDelay);
    };
}
