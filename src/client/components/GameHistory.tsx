import { List } from 'immutable';
import * as React from 'react';

import { GameBoardType, GameHistoryMessage } from '../../common/enums';
import { GameHistoryMessageData, MoveData } from '../../common/game';
import { getHotelNameSpan, getTileString, getUsernameSpan } from '../helpers';
import * as style from './GameHistory.css';

export interface GameHistoryProps {
    usernames: List<string>;
    moveDataHistory: List<MoveData>;
    selectedMove?: number;
    width: number;
    height: number;
    onMoveClicked: (index: number) => void;
}

export class GameHistory extends React.PureComponent<GameHistoryProps> {
    parentRef: React.RefObject<HTMLDivElement>;
    selectedMoveRef: React.RefObject<HTMLDivElement>;

    constructor(props: GameHistoryProps) {
        super(props);

        this.parentRef = React.createRef();
        this.selectedMoveRef = React.createRef();
    }

    componentDidMount() {
        setTimeout(this.autoScroll, 0);
    }

    componentDidUpdate() {
        setTimeout(this.autoScroll, 0);
    }

    autoScroll = () => {
        const parent = this.parentRef.current;
        const selectedMove = this.selectedMoveRef.current;

        if (parent !== null && selectedMove !== null) {
            const parentScrollTop = parent.scrollTop;
            const parentScrollBottom = parentScrollTop + parent.clientHeight;

            const selectedMoveRelativeOffsetTop = selectedMove.offsetTop - parent.offsetTop;
            const selectedMoveRelativeOffsetBottom = selectedMoveRelativeOffsetTop + selectedMove.clientHeight;

            if (selectedMoveRelativeOffsetTop < parentScrollTop || selectedMove.clientHeight > parent.clientHeight) {
                parent.scrollTop = selectedMoveRelativeOffsetTop;
            } else if (selectedMoveRelativeOffsetBottom > parentScrollBottom) {
                parent.scrollTop = selectedMoveRelativeOffsetBottom - parent.clientHeight;
            }
        }
    };

    render() {
        const { usernames, moveDataHistory, selectedMove, width, height, onMoveClicked } = this.props;

        return (
            <div className={style.root} style={{ width, height }} ref={this.parentRef}>
                {moveDataHistory.map((moveData, i) => {
                    let optionalProps: { [key: string]: any } = {};
                    if (i === selectedMove) {
                        optionalProps.ref = this.selectedMoveRef;
                    }

                    return (
                        <div key={i} {...optionalProps}>
                            <MoveHistory
                                usernames={usernames}
                                moveData={moveData}
                                moveIndex={i}
                                isSelected={i === selectedMove}
                                onMoveClicked={onMoveClicked}
                            />
                        </div>
                    );
                })}
            </div>
        );
    }
}

interface MoveHistoryProps {
    usernames: List<string>;
    moveData: MoveData;
    moveIndex: number;
    isSelected: boolean;
    onMoveClicked: (index: number) => void;
}

class MoveHistory extends React.PureComponent<MoveHistoryProps> {
    render() {
        const { usernames, moveData, moveIndex, isSelected, onMoveClicked } = this.props;

        let optionalProps: { [key: string]: any } = {};
        if (moveData.timestamp !== null) {
            const date = new Date(moveData.timestamp);
            optionalProps.title = date.toString();
        }

        return (
            <div className={style.move + (isSelected ? ' ' + style.selected : '')} {...optionalProps} onClick={() => onMoveClicked(moveIndex)}>
                {moveData.gameHistoryMessages.map((ghmd, index) => {
                    const username: string = ghmd.playerID === null ? '' : usernames.get(ghmd.playerID, '');
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
            {getUsernameSpan(username)} formed {getHotelNameSpan(ghmd.parameters[0])}.
        </div>
    ),
    [GameHistoryMessage.MergedChains]: (ghmd, username, key) => {
        const chains: number[] = ghmd.parameters[0];
        if (chains.length === 2) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} merged {getHotelNameSpan(chains[0])} and {getHotelNameSpan(chains[1])}.
                </div>
            );
        } else if (chains.length === 3) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} merged {getHotelNameSpan(chains[0])}, {getHotelNameSpan(chains[1])}, and {getHotelNameSpan(chains[2])}.
                </div>
            );
        } else {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} merged {getHotelNameSpan(chains[0])}, {getHotelNameSpan(chains[1])}, {getHotelNameSpan(chains[2])}, and{' '}
                    {getHotelNameSpan(chains[3])}.
                </div>
            );
        }
    },
    [GameHistoryMessage.SelectedMergerSurvivor]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} selected {getHotelNameSpan(ghmd.parameters[0])} as merger survivor.
        </div>
    ),
    [GameHistoryMessage.SelectedChainToDisposeOfNext]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} selected {getHotelNameSpan(ghmd.parameters[0])} as chain to dispose of next.
        </div>
    ),
    [GameHistoryMessage.ReceivedBonus]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} received a ${ghmd.parameters[1] * 100} {getHotelNameSpan(ghmd.parameters[0])} bonus.
        </div>
    ),
    [GameHistoryMessage.DisposedOfShares]: (ghmd, username, key) => (
        <div key={key}>
            {getUsernameSpan(username)} traded {ghmd.parameters[1]} and sold {ghmd.parameters[2]} {getHotelNameSpan(ghmd.parameters[0])} shares.
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
                    {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getHotelNameSpan(chainsAndCounts[0][0])}.
                </div>
            );
        } else if (chainsAndCounts.length === 2) {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getHotelNameSpan(chainsAndCounts[0][0])} and {chainsAndCounts[1][1]}{' '}
                    {getHotelNameSpan(chainsAndCounts[1][0])}.
                </div>
            );
        } else {
            return (
                <div key={key}>
                    {getUsernameSpan(username)} purchased {chainsAndCounts[0][1]} {getHotelNameSpan(chainsAndCounts[0][0])}, {chainsAndCounts[1][1]}{' '}
                    {getHotelNameSpan(chainsAndCounts[1][0])}, and {chainsAndCounts[2][1]} {getHotelNameSpan(chainsAndCounts[2][0])}.
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
