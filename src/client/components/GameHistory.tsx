import * as React from 'react';

import { GameBoardType, GameHistoryMessage } from '../../enums';
import { GameHistoryMessageData, MoveData } from '../../game';
import { getCssStyleForGameBoardType, getHotelName, getTileString } from '../helpers';
import * as style from './GameHistory.css';

export interface GameHistoryProps {
    usernames: string[];
    moveDataHistory: MoveData[];
}

export class GameHistory extends React.PureComponent<GameHistoryProps> {
    constructor(props: GameHistoryProps) {
        super(props);
    }

    render() {
        const { usernames, moveDataHistory } = this.props;

        return (
            <div className={style.root} style={{ width: 600, height: 300 }}>
                {moveDataHistory.map((moveData, i) => <MoveHistory key={i} usernames={usernames} moveData={moveData} />)}
            </div>
        );
    }
}

interface MoveHistoryProps {
    usernames: string[];
    moveData: MoveData;
}

class MoveHistory extends React.PureComponent<MoveHistoryProps> {
    constructor(props: MoveHistoryProps) {
        super(props);
    }

    render() {
        const { usernames, moveData } = this.props;

        return (
            <div>
                {moveData.gameHistoryMessages.map((ghmd, index) => {
                    const username: string = ghmd.playerID === null ? '' : usernames[ghmd.playerID];
                    return gameHistoryMessageHandlerLookup[ghmd.gameHistoryMessage](ghmd, username, index);
                })}
            </div>
        );
    }
}

const gameHistoryMessageHandlerLookup: { [key: number]: (ghmd: GameHistoryMessageData, username: string, key: number) => JSX.Element } = {
    [GameHistoryMessage.TurnBegan]: (ghmd, username, key) => (
        <div key={key}>
            <fieldset className={style.turnBegan}>
                <legend>{getUsernameSpan(username)}</legend>
            </fieldset>
        </div>
    ),
    [GameHistoryMessage.DrewPositionTile]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} drew position tile {getTileString(ghmd.parameters[0])}.
        </div>
    ),
    [GameHistoryMessage.StartedGame]: (ghmd, username, key) => <div key={key}>{getUsernameSpan(username)} started the game.</div>,
    [GameHistoryMessage.DrewTile]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} drew tile {getTileString(ghmd.parameters[0])}.
        </div>
    ),
    [GameHistoryMessage.HasNoPlayableTile]: (ghmd, username, key) => <div key={key}>{getUsernameSpan(username)} has no playable tile.</div>,
    [GameHistoryMessage.PlayedTile]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} played tile {getTileString(ghmd.parameters[0])}.
        </div>
    ),
    [GameHistoryMessage.FormedChain]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} formed {getChainSpan(ghmd.parameters[0])}.
        </div>
    ),
    [GameHistoryMessage.MergedChains]: (ghmd, username, key) => {
        const chains: number[] = ghmd.parameters[0];
        if (chains.length === 2) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} merged {getChainSpan(chains[0])} and {getChainSpan(chains[1])}.
                </div>
            );
        } else if (chains.length === 3) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} merged {getChainSpan(chains[0])}, {getChainSpan(chains[1])}, and {getChainSpan(chains[2])}.
                </div>
            );
        } else {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} merged {getChainSpan(chains[0])}, {getChainSpan(chains[1])}, {getChainSpan(chains[2])}, and{' '}
                    {getChainSpan(chains[3])}.
                </div>
            );
        }
    },
    [GameHistoryMessage.SelectedMergerSurvivor]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} selected {getChainSpan(ghmd.parameters[0])} as merger survivor.
        </div>
    ),
    [GameHistoryMessage.SelectedChainToDisposeOfNext]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} selected {getChainSpan(ghmd.parameters[0])} as chain to dispose of next.
        </div>
    ),
    [GameHistoryMessage.ReceivedBonus]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} received a ${ghmd.parameters[1] * 100} {getChainSpan(ghmd.parameters[0])} bonus.
        </div>
    ),
    [GameHistoryMessage.DisposedOfShares]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} traded {ghmd.parameters[1]} and sold {ghmd.parameters[2]} {getChainSpan(ghmd.parameters[0])} shares.
        </div>
    ),
    [GameHistoryMessage.CouldNotAffordAnyShares]: (ghmd, username, key) => <div key={key}>{getUsernameSpan(username)} could not afford any shares.</div>,
    [GameHistoryMessage.PurchasedShares]: (ghmd, username, key) => {
        const chainsAndCounts: [GameBoardType, number][] = ghmd.parameters[0];
        if (chainsAndCounts.length === 0) {
            return <div key={key}>{getUsernameSpan(username)} purchased nothing.</div>;
        } else if (chainsAndCounts.length === 1) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getChainSpan(chainsAndCounts[0][0])}.
                </div>
            );
        } else if (chainsAndCounts.length === 2) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getChainSpan(chainsAndCounts[0][0])} and {chainsAndCounts[1][1]}{' '}
                    {getChainSpan(chainsAndCounts[1][0])}.
                </div>
            );
        } else {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getChainSpan(chainsAndCounts[0][0])}, {chainsAndCounts[1][1]}{' '}
                    {getChainSpan(chainsAndCounts[1][0])}, and {chainsAndCounts[2][1]} {getChainSpan(chainsAndCounts[2][0])}.
                </div>
            );
        }
    },
    [GameHistoryMessage.DrewLastTile]: (ghmd, username, key) => <div key={key}>{getUsernameSpan(username)} drew the last tile from the tile bag.</div>,
    [GameHistoryMessage.ReplacedDeadTile]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} replaced dead tile {getTileString(ghmd.parameters[0])}.
        </div>
    ),
    [GameHistoryMessage.EndedGame]: (ghmd, username, key) => <div key={key}>{getUsernameSpan(username)} ended the game.</div>,
    [GameHistoryMessage.NoTilesPlayedForEntireRound]: (ghmd, username, key) => <div key={key}>No tiles played for an entire round. Game end forced.</div>,
    [GameHistoryMessage.AllTilesPlayed]: (ghmd, username, key) => <div key={key}>All tiles have been played. Game end forced.</div>,
};

function getUsernameSpan(username: string) {
    return <span className={style.username}>{username}</span>;
}

function getChainSpan(chain: GameBoardType) {
    return <span className={getCssStyleForGameBoardType(chain)}>{getHotelName(chain)}</span>;
}
