/* tslint:disable:no-console */

import './global.css';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { defaultGameBoard, defaultMoveDataHistory } from '../common/defaults';
import { GameBoardType, GameMode } from '../common/enums';
import { Game } from '../common/game';
import { DisposeOfShares, DisposeOfSharesProps } from './components/DisposeOfShares';
import { ExampleGameSetupMaster } from './components/ExampleGameSetupMaster';
import { GameBoard, GameBoardProps } from './components/GameBoard';
import { GameHistory, GameHistoryProps } from './components/GameHistory';
import { GameListing, GameListingProps } from './components/GameListing';
import { GameState, GameStateProps } from './components/GameState';
import { LoginForm, LoginFormProps } from './components/LoginForm';
import { PurchaseShares, PurchaseSharesProps } from './components/PurchaseShares';
import { ScoreBoard, ScoreBoardProps } from './components/ScoreBoard';
import { SelectChain, SelectChainProps, SelectChainTitle } from './components/SelectChain';
import { TileRack, TileRackProps } from './components/TileRack';
import { TileRackReadOnly, TileRackReadOnlyProps } from './components/TileRackReadOnly';
import { GameBoardLabelMode, GameStatus } from './enums';
import { getDummyGameForGetGameHistory, getExampleNextGameActionsArray } from './exampleData';
import * as style from './examples.css';
import {
    allChains,
    disposeOfSharesKeyboardShortcutsDescription,
    gameBoardTypeToHotelInitial,
    getTileString,
    purchaseSharesKeyboardShortcutsDescription,
    selectChainKeyboardShortcutsDescription,
    tileRackKeyboardShortcutsDescription,
} from './helpers';

class AllDemoProps {
    loginFormProps: LoginFormProps[];
    gameListingProps: GameListingProps[];
    gameBoardProps: GameBoardProps[];
    scoreBoardProps: ScoreBoardProps[];
    tileRackProps: TileRackProps[];
    tileRackReadOnlyProps: TileRackReadOnlyProps[];
    selectChainProps: SelectChainProps[];
    disposeOfSharesProps: DisposeOfSharesProps[];
    purchaseSharesProps: PurchaseSharesProps[];
    gameHistoryProps: GameHistoryProps[];
    gameStateProps: GameStateProps[];

    possibleKeyboardShortcutsEnabledProps: { keyboardShortcutsEnabled: boolean }[];

    constructor() {
        const gameJson1 = require('raw-loader!../common/gameTestFiles/other/no tiles played for entire round').split('\nGame JSON:\n')[1];
        const game1 = Game.fromJSON(JSON.parse(gameJson1));

        const gameJson2 = require('raw-loader!../common/gameTestFiles/other/all tiles played').split('\nGame JSON:\n')[1];
        const game2 = Game.fromJSON(JSON.parse(gameJson2));

        this.loginFormProps = [{ onSubmit: onSubmitLoginForm }, { error: 'error passed as a prop', username: 'tlstyer', onSubmit: onSubmitLoginForm }];

        this.gameListingProps = [
            {
                gameBoard: defaultGameBoard,
                gameMode: GameMode.Singles4,
                usernames: List(['Host', null, 'User 2', null]),
                gameStatus: GameStatus.SettingUp,
                onJoinClicked,
                onWatchClicked,
            },
            {
                gameBoard: game1 !== null ? game1.gameBoard : defaultGameBoard,
                gameMode: GameMode.Teams2vs2vs2,
                usernames: List(['Tim', 'Rita', 'Dad', 'Mom', 'REALLY, REALLY LONG NAME', 'pgyqj,;']),
                gameStatus: GameStatus.InProgress,
                onRejoinClicked,
            },
            {
                gameBoard: game2 !== null ? game2.gameBoard : defaultGameBoard,
                gameMode: GameMode.Teams2vs2,
                usernames: List(['player 1', 'player 2', 'player 3', 'player 4']),
                gameStatus: GameStatus.Completed,
                onWatchClicked,
            },
            {
                gameBoard: defaultGameBoard,
                gameMode: GameMode.Singles4,
                usernames: List(['Show', 'All', 'Buttons', 'Example']),
                gameStatus: GameStatus.SettingUp,
                onJoinClicked,
                onRejoinClicked,
                onWatchClicked,
            },
        ];

        const gbp: GameBoardProps = {
            gameBoard: List([
                ...[0, 7, 7, 7, 7, 7, 7, 7, 7],
                ...[0, 7, 7, 7, 7, 7, 7, 7, 7],
                ...[7, 8, 7, 7, 7, 7, 8, 7, 7],
                ...[1, 7, 8, 7, 7, 7, 7, 7, 7],
                ...[1, 7, 7, 7, 7, 7, 7, 7, 7],
                ...[7, 7, 7, 7, 5, 7, 7, 8, 7],
                ...[2, 7, 7, 7, 5, 5, 5, 7, 7],
                ...[2, 7, 8, 7, 5, 5, 7, 7, 7],
                ...[7, 7, 7, 7, 5, 9, 6, 6, 6],
                ...[3, 7, 7, 7, 5, 7, 6, 6, 6],
                ...[3, 7, 7, 7, 5, 9, 6, 6, 6],
                ...[7, 4, 4, 7, 5, 5, 9, 6, 6],
            ]),
            tileRack: List([8, 86, null, 40, 99, 12]),
            labelMode: GameBoardLabelMode.Coordinates,
            cellSize: 40,
            onCellClicked: onTileClicked,
        };
        this.gameBoardProps = [
            gbp,
            { gameBoard: gbp.gameBoard, labelMode: GameBoardLabelMode.HotelInitials, cellSize: gbp.cellSize },
            { gameBoard: gbp.gameBoard, tileRack: gbp.tileRack, labelMode: GameBoardLabelMode.Nothing, cellSize: gbp.cellSize },
        ];

        this.scoreBoardProps = [
            {
                usernames: List(['winning player', 'losing player']),
                scoreBoard: List<List<number>>([List([6, 1, 13, 10, 4, 4, 6, 207, 785]), List([1, 0, 11, 0, 3, 1, 1, 256, 533])]),
                scoreBoardAvailable: List<number>([18, 24, 1, 15, 18, 20, 18]),
                scoreBoardChainSize: List<number>([3, 0, 39, 5, 2, 4, 13]),
                scoreBoardPrice: List<number>([3, 0, 10, 6, 3, 6, 9]),
                safeChains: List<boolean>([false, false, true, false, false, false, true]),
                turnPlayerID: 1,
                movePlayerID: 0,
                gameMode: GameMode.Singles2,
                cellWidth: 30,
            },
            {
                usernames: List(['tlstyer', 'REALLY LONG NAME', 'Somebody Else', 'hi!']),
                scoreBoard: List<List<number>>([
                    List([4, 0, 0, 0, 0, 0, 0, 74, 82]),
                    List([0, 4, 0, 0, 0, 0, 0, 74, 82]),
                    List([0, 0, 0, 0, 0, 4, 0, 88, 104]),
                    List([1, 1, 0, 0, 0, 1, 1, 92, 228]),
                ]),
                scoreBoardAvailable: List<number>([20, 20, 25, 25, 25, 20, 24]),
                scoreBoardChainSize: List<number>([2, 2, 0, 0, 0, 2, 9]),
                scoreBoardPrice: List<number>([2, 2, 0, 0, 0, 4, 8]),
                safeChains: List<boolean>([false, false, false, false, false, false, false]),
                turnPlayerID: 0,
                movePlayerID: 0,
                gameMode: GameMode.Singles4,
                cellWidth: 30,
            },
            {
                usernames: List(['player 1', 'player 2', 'player 3', 'player 4']),
                scoreBoard: List<List<number>>([
                    List([0, 0, 5, 9, 0, 13, 0, 0, 427]),
                    List([8, 1, 0, 13, 0, 12, 0, 63, 474]),
                    List([7, 1, 11, 0, 0, 0, 0, 107, 212]),
                    List([1, 3, 9, 3, 0, 0, 0, 213, 310]),
                ]),
                scoreBoardAvailable: List<number>([9, 20, 0, 0, 25, 0, 25]),
                scoreBoardChainSize: List<number>([0, 0, 4, 27, 0, 42, 0]),
                scoreBoardPrice: List<number>([0, 0, 5, 9, 0, 12, 0]),
                safeChains: List<boolean>([false, false, false, true, false, true, false]),
                turnPlayerID: -1,
                movePlayerID: -1,
                gameMode: GameMode.Teams2vs2,
                cellWidth: 30,
            },
            {
                usernames: List(['player 1', 'player 2', 'player 3', 'player 4', 'player 5', 'player 6']),
                scoreBoard: List<List<number>>([
                    List([1, 0, 0, 9, 2, 3, 0, 188, 386]),
                    List([0, 3, 7, 0, 0, 0, 0, 35, 121]),
                    List([0, 0, 7, 2, 0, 1, 0, 22, 135]),
                    List([0, 0, 0, 8, 0, 9, 0, 87, 375]),
                    List([0, 0, 8, 6, 0, 7, 0, 84, 408]),
                    List([0, 0, 3, 0, 0, 5, 0, 120, 192]),
                ]),
                scoreBoardAvailable: List<number>([24, 22, 0, 0, 23, 0, 25]),
                scoreBoardChainSize: List<number>([0, 0, 22, 30, 0, 15, 0]),
                scoreBoardPrice: List<number>([0, 0, 9, 9, 0, 9, 0]),
                safeChains: List<boolean>([false, false, true, true, false, true, false]),
                turnPlayerID: -1,
                movePlayerID: -1,
                gameMode: GameMode.Teams2vs2vs2,
                cellWidth: 30,
            },
        ];
        this.scoreBoardProps.push({
            ...this.scoreBoardProps[3],
            gameMode: GameMode.Teams3vs3,
        });

        this.tileRackProps = [
            {
                tiles: List([1, 28, 55, 82, 92, 40]),
                types: List([
                    GameBoardType.Luxor,
                    GameBoardType.Tower,
                    GameBoardType.American,
                    GameBoardType.Festival,
                    GameBoardType.Worldwide,
                    GameBoardType.Continental,
                ]),
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onTileClicked,
            },
            {
                tiles: List([71, null, 99, 12, 8, 17]),
                types: List([
                    GameBoardType.Imperial,
                    null,
                    GameBoardType.WillMergeChains,
                    GameBoardType.WillPutLonelyTileDown,
                    GameBoardType.HaveNeighboringTileToo,
                    GameBoardType.HaveNeighboringTileToo,
                ]),
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onTileClicked,
            },
            {
                tiles: List([null, 86, null, 38, null, 74]),
                types: List([null, GameBoardType.CantPlayEver, null, GameBoardType.WillFormNewChain, null, GameBoardType.CantPlayNow]),
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onTileClicked,
            },
        ];

        this.tileRackReadOnlyProps = this.tileRackProps.map(({ tiles, types, buttonSize }) => ({ tiles, types, buttonSize }));

        this.selectChainProps = [
            {
                type: SelectChainTitle.SelectNewChain,
                availableChains: [0, 1, 2, 3, 4, 5, 6],
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onChainSelected,
            },
            {
                type: SelectChainTitle.SelectMergerSurvivor,
                availableChains: [0, 3, 5],
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onChainSelected,
            },
            {
                type: SelectChainTitle.SelectChainToDisposeOfNext,
                availableChains: [2, 4],
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onChainSelected,
            },
        ];

        this.disposeOfSharesProps = [
            {
                defunctChain: GameBoardType.American,
                controllingChain: GameBoardType.Festival,
                sharesOwnedInDefunctChain: 10,
                sharesAvailableInControllingChain: 22,
                keyboardShortcutsEnabled: false,
                onSharesDisposed,
            },
            {
                defunctChain: GameBoardType.Imperial,
                controllingChain: GameBoardType.Tower,
                sharesOwnedInDefunctChain: 7,
                sharesAvailableInControllingChain: 2,
                keyboardShortcutsEnabled: false,
                onSharesDisposed,
            },
            {
                defunctChain: GameBoardType.Continental,
                controllingChain: GameBoardType.Worldwide,
                sharesOwnedInDefunctChain: 1,
                sharesAvailableInControllingChain: 3,
                keyboardShortcutsEnabled: false,
                onSharesDisposed,
            },
            {
                defunctChain: GameBoardType.Luxor,
                controllingChain: GameBoardType.Imperial,
                sharesOwnedInDefunctChain: 25,
                sharesAvailableInControllingChain: 10,
                keyboardShortcutsEnabled: false,
                onSharesDisposed,
            },
        ];

        this.purchaseSharesProps = [
            {
                scoreBoardAvailable: List<number>([3, 3, 3, 3, 3, 3, 3]),
                scoreBoardPrice: List<number>([2, 3, 4, 5, 6, 7, 8]),
                cash: 15,
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onSharesPurchased,
            },
            {
                scoreBoardAvailable: List<number>([0, 1, 2, 3, 0, 1, 2]),
                scoreBoardPrice: List<number>([0, 3, 4, 5, 0, 6, 5]),
                cash: 15,
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onSharesPurchased,
            },
            {
                scoreBoardAvailable: List<number>([1, 0, 0, 1, 1, 0, 0]),
                scoreBoardPrice: List<number>([2, 0, 0, 5, 6, 0, 0]),
                cash: 5,
                buttonSize: 40,
                keyboardShortcutsEnabled: false,
                onSharesPurchased,
            },
        ];

        const dummyGameForGetGameHistory = getDummyGameForGetGameHistory();
        this.gameHistoryProps = [
            {
                usernames: dummyGameForGetGameHistory.usernames,
                moveDataHistory: dummyGameForGetGameHistory.moveDataHistory,
                onMoveClicked,
            },
            {
                usernames: game1 !== null ? game1.usernames : List(),
                moveDataHistory: game1 !== null ? game1.moveDataHistory : defaultMoveDataHistory,
                onMoveClicked,
            },
            {
                usernames: game2 !== null ? game2.usernames : List(),
                moveDataHistory: game2 !== null ? game2.moveDataHistory : defaultMoveDataHistory,
                onMoveClicked,
            },
        ];

        const nextGameActionsArray = getExampleNextGameActionsArray();
        this.gameStateProps = nextGameActionsArray.map(nextGameAction => ({
            usernames: nextGameAction.game.usernames,
            nextGameAction,
            width: 500,
            height: 22,
        }));

        this.possibleKeyboardShortcutsEnabledProps = [
            ...this.tileRackProps,
            ...this.selectChainProps,
            ...this.disposeOfSharesProps,
            ...this.purchaseSharesProps,
        ];
    }
}

function render(props: AllDemoProps) {
    ReactDOM.render(
        <div className={style.root}>
            <h1>LoginForm</h1>
            {renderComponentForEachProps(LoginForm, props.loginFormProps)}

            <h1>GameListing</h1>
            {renderComponentForEachProps(GameListing, props.gameListingProps)}

            <h1>GameSetupUI</h1>
            <ExampleGameSetupMaster />

            <h1>GameBoard</h1>
            {renderComponentForEachProps(GameBoard, props.gameBoardProps)}

            <h1>ScoreBoard</h1>
            {renderComponentForEachProps(ScoreBoard, props.scoreBoardProps)}

            <h1>TileRack</h1>
            <p>Keyboard shortcuts: {tileRackKeyboardShortcutsDescription}</p>
            {renderComponentForEachProps(TileRack, props.tileRackProps)}

            <h1>TileRackReadOnly</h1>
            {renderComponentForEachProps(TileRackReadOnly, props.tileRackReadOnlyProps)}

            <h1>SelectChain</h1>
            <p>Keyboard shortcuts: {selectChainKeyboardShortcutsDescription}</p>
            {renderComponentForEachProps(SelectChain, props.selectChainProps)}

            <h1>DisposeOfShares</h1>
            <p>Keyboard shortcuts: {disposeOfSharesKeyboardShortcutsDescription}</p>
            {renderComponentForEachProps(DisposeOfShares, props.disposeOfSharesProps, getDisposeOfSharesDescription)}

            <h1>PurchaseShares</h1>
            <p>Keyboard shortcuts: {purchaseSharesKeyboardShortcutsDescription}</p>
            {renderComponentForEachProps(PurchaseShares, props.purchaseSharesProps, getPurchaseSharesDescription)}

            <h1>GameHistory</h1>
            <div className={style.gameHistoryWrapper}>{renderComponentForEachProps(GameHistory, props.gameHistoryProps)}</div>

            <h1>GameState</h1>
            {renderComponentForEachProps(GameState, props.gameStateProps)}
        </div>,
        document.getElementById('root'),
    );
}

function renderComponentForEachProps(Component: any, propsArray: any[], descriptionFunc?: any) {
    const lastIndex = propsArray.length - 1;

    return propsArray.map((props, i) => (
        <React.Fragment key={i}>
            {descriptionFunc ? <h2>{descriptionFunc(props)}</h2> : undefined}
            {props.keyboardShortcutsEnabled === true ? (
                <>
                    <input type={'button'} value={'Keyboard Shortcuts Enabled'} disabled={true} />
                    <br />
                    <br />
                </>
            ) : props.keyboardShortcutsEnabled === false ? (
                <>
                    <input type={'button'} value={'Enable Keyboard Shortcuts'} onClick={() => enableKeyboardShortcuts(props)} />
                    <br />
                    <br />
                </>
            ) : (
                undefined
            )}
            <Component {...props} />
            {!descriptionFunc && i !== lastIndex ? <br /> : undefined}
        </React.Fragment>
    ));
}

function enableKeyboardShortcuts(props: { keyboardShortcutsEnabled: boolean }) {
    for (let i = 0; i < allDemoProps.possibleKeyboardShortcutsEnabledProps.length; i++) {
        allDemoProps.possibleKeyboardShortcutsEnabledProps[i].keyboardShortcutsEnabled = false;
    }

    props.keyboardShortcutsEnabled = true;

    render(allDemoProps);
}

function getDisposeOfSharesDescription(props: DisposeOfSharesProps) {
    return `defunct owned: ${props.sharesOwnedInDefunctChain}, controlling available: ${props.sharesAvailableInControllingChain}`;
}

function getPurchaseSharesDescription(props: PurchaseSharesProps) {
    const parts: string[] = [];

    for (let chain = 0; chain < 7; chain++) {
        const numAvailable = props.scoreBoardAvailable.get(chain, 0);
        if (numAvailable !== 0) {
            parts.push(`${numAvailable}${gameBoardTypeToHotelInitial[chain]}@$${props.scoreBoardPrice.get(chain, 0) * 100}`);
        }
    }

    return parts.join(', ');
}

function onSubmitLoginForm(username: string, password: string) {
    console.log('onSubmitLoginForm:', username, ',', password);
}

function onJoinClicked() {
    console.log('onJoinClicked');
}

function onRejoinClicked() {
    console.log('onRejoinClicked');
}

function onWatchClicked() {
    console.log('onWatchClicked');
}

function onTileClicked(tile: number) {
    console.log('onTileClicked:', getTileString(tile));
}

function onMoveClicked(index: number) {
    console.log('onMoveClicked:', index);

    allDemoProps.gameHistoryProps[0].selectedMove = index;
    allDemoProps.gameHistoryProps[1].selectedMove = index;
    allDemoProps.gameHistoryProps[2].selectedMove = index;

    render(allDemoProps);
}

function onChainSelected(chain: GameBoardType) {
    console.log('onChainSelected:', gameBoardTypeToHotelInitial[chain]);
}

function onSharesDisposed(traded: number, sold: number) {
    console.log('onSharesDisposed', traded, sold);
}

function onSharesPurchased(chains: GameBoardType[], endGame: boolean) {
    console.log('onSharesPurchased', chains, endGame);
}

window.addEventListener('keydown', event => {
    const keyName = event.key;

    if (keyName === 'ArrowLeft' || keyName === 'ArrowRight') {
        const previouslySelectedMove = allDemoProps.gameHistoryProps[2].selectedMove;

        let selectedMove = previouslySelectedMove || 0;
        if (keyName === 'ArrowLeft') {
            selectedMove--;
        } else {
            selectedMove++;
        }

        if (selectedMove < 0) {
            selectedMove = 0;
        }

        const lastMove = allDemoProps.gameHistoryProps[2].moveDataHistory.size - 1;
        if (selectedMove > lastMove) {
            selectedMove = lastMove;
        }

        if (selectedMove !== previouslySelectedMove) {
            allDemoProps.gameHistoryProps[0].selectedMove = selectedMove;
            allDemoProps.gameHistoryProps[1].selectedMove = selectedMove;
            allDemoProps.gameHistoryProps[2].selectedMove = selectedMove;

            render(allDemoProps);
        }
    }
});

const allDemoProps = new AllDemoProps();

render(allDemoProps);
