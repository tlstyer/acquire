import * as React from 'react';

import { GameAction, GameBoardType } from '../../common/enums';
import { ActionBase } from '../../common/gameActions/base';
import { ActionDisposeOfShares } from '../../common/gameActions/disposeOfShares';
import { ActionGameOver } from '../../common/gameActions/gameOver';
import { ActionPlayTile } from '../../common/gameActions/playTile';
import { ActionPurchaseShares } from '../../common/gameActions/purchaseShares';
import { ActionSelectChainToDisposeOfNext } from '../../common/gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from '../../common/gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from '../../common/gameActions/selectNewChain';
import { ActionStartGame } from '../../common/gameActions/startGame';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelInitial, getHotelNameSpan, getUsernameSpan } from '../helpers';
import * as style from './GameState.css';

export interface GameStateProps {
    usernames: string[];
    nextGameAction: ActionBase;
    width: number;
    height: number;
}

export class GameState extends React.PureComponent<GameStateProps> {
    render() {
        const { usernames, nextGameAction, width, height } = this.props;

        return gameGameStateHandlerLookup[nextGameAction.gameAction](usernames, nextGameAction, width, height);
    }
}

// @ts-ignore
const gameGameStateHandlerLookup: { [key: number]: (usernames: string[], nextGameAction: ActionBase, width: number, height: number) => JSX.Element } = {
    [GameAction.StartGame]: (usernames: string[], nextGameAction: ActionStartGame, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to start the game.
        </div>
    ),
    [GameAction.PlayTile]: (usernames: string[], nextGameAction: ActionPlayTile, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to play a tile.
        </div>
    ),
    [GameAction.SelectNewChain]: (usernames: string[], nextGameAction: ActionSelectNewChain, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to select new chain ({getHotelInitialsList(nextGameAction.availableChains)}).
        </div>
    ),
    [GameAction.SelectMergerSurvivor]: (usernames: string[], nextGameAction: ActionSelectMergerSurvivor, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to select merger survivor ({getHotelInitialsList(nextGameAction.chainsBySize[0])}).
        </div>
    ),
    [GameAction.SelectChainToDisposeOfNext]: (usernames: string[], nextGameAction: ActionSelectChainToDisposeOfNext, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to select chain to dispose of next ({getHotelInitialsList(
                nextGameAction.defunctChains,
            )}).
        </div>
    ),
    [GameAction.DisposeOfShares]: (usernames: string[], nextGameAction: ActionDisposeOfShares, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to dispose of {getHotelNameSpan(nextGameAction.defunctChain)} shares.
        </div>
    ),
    [GameAction.PurchaseShares]: (usernames: string[], nextGameAction: ActionPurchaseShares, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Waiting for {getUsernameSpan(usernames[nextGameAction.playerID])} to purchase shares.
        </div>
    ),
    [GameAction.GameOver]: (usernames: string[], nextGameAction: ActionGameOver, width: number, height: number) => (
        <div className={style.root} style={{ width, height }}>
            Game over.
        </div>
    ),
};

function getHotelInitialsList(chains: GameBoardType[]) {
    const entries: (JSX.Element | string)[] = new Array(chains.length * 2 - 1);

    for (let i = 0; i < chains.length; i++) {
        const chain = chains[i];
        entries[i * 2] = (
            <span key={i} className={gameBoardTypeToCSSClassName[chain]}>
                {gameBoardTypeToHotelInitial[chain]}
            </span>
        );
    }

    if (chains.length === 2) {
        entries[1] = ' or ';
    } else {
        for (let i = 1; i < chains.length - 1; i++) {
            entries[i * 2 - 1] = ', ';
        }
        entries[(chains.length - 1) * 2 - 1] = ', or ';
    }

    return entries;
}
