import * as React from 'react';

import { GameMode, PlayerArrangementMode } from '../../common/enums';
import { gameModeToNumPlayers, gameModeToTeamSize } from '../../common/helpers';
import { GameSetup } from './GameSetup';

export interface ExampleGameSetupMasterProps {}

interface ExampleGameSetupMasterState {
    gameMode: GameMode;
    playerArrangementMode: PlayerArrangementMode;
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
            usernames: ['Host', null, null, null],

            nextUserId: 2,
            simulatedNetworkDelay: 250,
        };
    }

    static getDerivedStateFromProps(nextProps: ExampleGameSetupMasterProps, prevState: ExampleGameSetupMasterState) {
        return null;
    }

    render() {
        const { gameMode, playerArrangementMode, usernames, simulatedNetworkDelay } = this.state;

        let numUsersInGame = 0;
        for (let i = 0; i < usernames.length; i++) {
            const username = usernames[i];
            if (username !== null) {
                numUsersInGame++;
            }
        }

        const maxUsers = usernames.length;

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
                    usernames={usernames}
                    hostUsername={'Host'}
                    onChangeGameMode={this.handleChangeGameMode}
                    onChangePlayerArrangementMode={this.handleChangePlayerArrangementMode}
                    onSwapPositions={this.handleSwapPositions}
                    onKickUser={this.handleKickUser}
                />
                <br />
                <GameSetup gameMode={gameMode} playerArrangementMode={playerArrangementMode} usernames={usernames} hostUsername={'Host'} />
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
        for (let i = 0; i < this.state.usernames.length; i++) {
            const username = this.state.usernames[i];
            if (username === null) {
                const usernames = [...this.state.usernames];
                usernames[i] = `User ${this.state.nextUserId}`;

                this.setState({ usernames, nextUserId: this.state.nextUserId + 1 });
                break;
            }
        }
    };

    handleRemoveUser = () => {
        let indexesThatCanBeRemoved: number[] = [];

        for (let i = 0; i < this.state.usernames.length; i++) {
            const username = this.state.usernames[i];
            if (username !== null && username !== 'Host') {
                indexesThatCanBeRemoved.push(i);
            }
        }

        const randomIndex = indexesThatCanBeRemoved[Math.floor(Math.random() * indexesThatCanBeRemoved.length)];

        const usernames = [...this.state.usernames];
        usernames[randomIndex] = null;

        this.setState({ usernames });
    };

    handleChangeGameMode = (gameMode: GameMode) => {
        setTimeout(() => {
            console.log('handleChangeGameMode', gameMode);

            const oldNumPlayers = gameModeToNumPlayers[this.state.gameMode];
            const newNumPlayers = gameModeToNumPlayers[gameMode];

            const newState: Partial<ExampleGameSetupMasterState> = { gameMode };

            if (newNumPlayers !== oldNumPlayers) {
                const usernames = [...this.state.usernames];

                if (newNumPlayers > oldNumPlayers) {
                    const numSpotsToAdd = newNumPlayers - oldNumPlayers;
                    for (let i = 0; i < numSpotsToAdd; i++) {
                        usernames.push(null);
                    }
                } else {
                    for (let oldIndex = oldNumPlayers - 1; oldIndex >= newNumPlayers; oldIndex--) {
                        if (usernames[oldIndex] !== null) {
                            for (let newIndex = newNumPlayers - 1; newIndex >= 0; newIndex--) {
                                if (usernames[newIndex] === null) {
                                    usernames[newIndex] = usernames[oldIndex];
                                    break;
                                }
                            }
                        }

                        usernames.pop();
                    }
                }

                newState.usernames = usernames;
            }

            const isTeamGame = gameModeToTeamSize[gameMode] > 1;
            if (!isTeamGame && this.state.playerArrangementMode === PlayerArrangementMode.SpecifyTeams) {
                newState.playerArrangementMode = PlayerArrangementMode.RandomOrder;
            }

            // @ts-ignore
            this.setState(newState);
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

            const usernames = [...this.state.usernames];
            usernames[position1] = this.state.usernames[position2];
            usernames[position2] = this.state.usernames[position1];

            this.setState({ usernames });
        }, this.state.simulatedNetworkDelay);
    };

    handleKickUser = (position: number) => {
        setTimeout(() => {
            console.log('handleKickUser', position);

            const usernames = [...this.state.usernames];
            usernames[position] = null;

            this.setState({ usernames });
        }, this.state.simulatedNetworkDelay);
    };
}
