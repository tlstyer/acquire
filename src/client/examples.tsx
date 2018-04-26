import './global.css';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { defaultMoveDataHistory } from '../common/defaults';
import { GameBoardType, GameHistoryMessage, GameMode } from '../common/enums';
import { Game } from '../common/game';
import { ActionBase } from '../common/gameActions/base';
import { ActionDisposeOfShares } from '../common/gameActions/disposeOfShares';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { ActionPlayTile } from '../common/gameActions/playTile';
import { ActionPurchaseShares } from '../common/gameActions/purchaseShares';
import { ActionSelectChainToDisposeOfNext } from '../common/gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from '../common/gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from '../common/gameActions/selectNewChain';
import { ActionStartGame } from '../common/gameActions/startGame';
import { getNewTileBag } from '../common/helpers';
import { runGameTestFile } from '../common/runGameTestFile';
import { DisposeOfShares, DisposeOfSharesProps } from './components/DisposeOfShares';
import { ExampleGameSetupMaster } from './components/ExampleGameSetupMaster';
import { GameBoard, GameBoardProps } from './components/GameBoard';
import { GameHistory, GameHistoryProps } from './components/GameHistory';
import { GameState } from './components/GameState';
import { LoginForm, LoginFormProps } from './components/LoginForm';
import { MiniGameBoard, MiniGameBoardProps } from './components/MiniGameBoard';
import { PurchaseShares, PurchaseSharesProps } from './components/PurchaseShares';
import { ScoreBoard, ScoreBoardProps } from './components/ScoreBoard';
import { SelectChain, SelectChainProps, SelectChainTitle } from './components/SelectChain';
import { TileRack, TileRackProps } from './components/TileRack';
import { GameBoardLabelMode } from './enums';
import { chains, gameBoardTypeToHotelInitial, getTileString } from './helpers';

class AllDemoProps {
    loginFormProps1: LoginFormProps = {
        onSubmit: onSubmitLoginForm,
    };

    loginFormProps2: LoginFormProps = {
        error: 'error passed as a prop',
        username: 'tlstyer',
        onSubmit: onSubmitLoginForm,
    };

    gameBoardProps1: GameBoardProps = {
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

    gameBoardProps2: GameBoardProps = { ...this.gameBoardProps1, labelMode: GameBoardLabelMode.HotelInitials };

    gameBoardProps3: GameBoardProps = { ...this.gameBoardProps1, labelMode: GameBoardLabelMode.Nothing };

    scoreBoardProps1: ScoreBoardProps = {
        usernames: ['winning player', 'losing player'],
        scoreBoard: List<List<number>>([List([6, 1, 13, 10, 4, 4, 6, 207, 785]), List([1, 0, 11, 0, 3, 1, 1, 256, 533])]),
        scoreBoardAvailable: List<number>([18, 24, 1, 15, 18, 20, 18]),
        scoreBoardChainSize: List<number>([3, 0, 39, 5, 2, 4, 13]),
        scoreBoardPrice: List<number>([3, 0, 10, 6, 3, 6, 9]),
        turnPlayerID: 1,
        movePlayerID: 0,
        gameMode: GameMode.Singles2,
        cellWidth: 30,
    };

    scoreBoardProps2: ScoreBoardProps = {
        usernames: ['tlstyer', 'REALLY LONG NAME', 'Somebody Else', 'hi!'],
        scoreBoard: List<List<number>>([
            List([4, 0, 0, 0, 0, 0, 0, 74, 82]),
            List([0, 4, 0, 0, 0, 0, 0, 74, 82]),
            List([0, 0, 0, 0, 0, 4, 0, 88, 104]),
            List([1, 1, 0, 0, 0, 1, 1, 92, 228]),
        ]),
        scoreBoardAvailable: List<number>([20, 20, 25, 25, 25, 20, 24]),
        scoreBoardChainSize: List<number>([2, 2, 0, 0, 0, 2, 9]),
        scoreBoardPrice: List<number>([2, 2, 0, 0, 0, 4, 8]),
        turnPlayerID: 0,
        movePlayerID: 0,
        gameMode: GameMode.Singles4,
        cellWidth: 30,
    };

    scoreBoardProps3: ScoreBoardProps = {
        usernames: ['player 1', 'player 2', 'player 3', 'player 4'],
        scoreBoard: List<List<number>>([
            List([0, 0, 5, 9, 0, 13, 0, 0, 427]),
            List([8, 1, 0, 13, 0, 12, 0, 63, 474]),
            List([7, 1, 11, 0, 0, 0, 0, 107, 212]),
            List([1, 3, 9, 3, 0, 0, 0, 213, 310]),
        ]),
        scoreBoardAvailable: List<number>([9, 20, 0, 0, 25, 0, 25]),
        scoreBoardChainSize: List<number>([0, 0, 4, 27, 0, 42, 0]),
        scoreBoardPrice: List<number>([0, 0, 5, 9, 0, 12, 0]),
        turnPlayerID: -1,
        movePlayerID: -1,
        gameMode: GameMode.Teams2vs2,
        cellWidth: 30,
    };

    scoreBoardProps4: ScoreBoardProps = {
        usernames: ['player 1', 'player 2', 'player 3', 'player 4', 'player 5', 'player 6'],
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
        turnPlayerID: -1,
        movePlayerID: -1,
        gameMode: GameMode.Teams2vs2vs2,
        cellWidth: 30,
    };

    scoreBoardProps5 = {
        ...this.scoreBoardProps4,
        gameMode: GameMode.Teams3vs3,
    };

    tileRackProps1: TileRackProps = {
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
        onTileClicked: onTileClicked,
    };

    tileRackProps2: TileRackProps = {
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
        onTileClicked: onTileClicked,
    };

    tileRackProps3: TileRackProps = {
        tiles: List([null, 86, null, 38, null, 74]),
        types: List([null, GameBoardType.CantPlayEver, null, GameBoardType.WillFormNewChain, null, GameBoardType.CantPlayNow]),
        buttonSize: 40,
        onTileClicked: onTileClicked,
    };

    selectChainProps1: SelectChainProps = {
        type: SelectChainTitle.SelectNewChain,
        availableChains: [0, 1, 2, 3, 4, 5, 6],
        buttonSize: 40,
        onChainSelected,
    };

    selectChainProps2: SelectChainProps = {
        type: SelectChainTitle.SelectMergerSurvivor,
        availableChains: [0, 3, 5],
        buttonSize: 40,
        onChainSelected,
    };

    selectChainProps3: SelectChainProps = {
        type: SelectChainTitle.SelectChainToDisposeOfNext,
        availableChains: [2, 4],
        buttonSize: 40,
        onChainSelected,
    };

    disposeOfSharesProps1: DisposeOfSharesProps = {
        defunctChain: GameBoardType.American,
        controllingChain: GameBoardType.Festival,
        sharesOwnedInDefunctChain: 10,
        sharesAvailableInControllingChain: 22,
        onSharesDisposed,
    };

    disposeOfSharesProps2: DisposeOfSharesProps = {
        defunctChain: GameBoardType.Imperial,
        controllingChain: GameBoardType.Tower,
        sharesOwnedInDefunctChain: 5,
        sharesAvailableInControllingChain: 3,
        onSharesDisposed,
    };

    disposeOfSharesProps3: DisposeOfSharesProps = {
        defunctChain: GameBoardType.Continental,
        controllingChain: GameBoardType.Worldwide,
        sharesOwnedInDefunctChain: 1,
        sharesAvailableInControllingChain: 3,
        onSharesDisposed,
    };

    disposeOfSharesProps4: DisposeOfSharesProps = {
        defunctChain: GameBoardType.Luxor,
        controllingChain: GameBoardType.Imperial,
        sharesOwnedInDefunctChain: 25,
        sharesAvailableInControllingChain: 10,
        onSharesDisposed,
    };

    purchaseSharesProps1: PurchaseSharesProps = {
        scoreBoardAvailable: List<number>([3, 3, 3, 3, 3, 3, 3]),
        scoreBoardPrice: List<number>([2, 3, 4, 5, 6, 7, 8]),
        cash: 15,
        buttonSize: 40,
        onSharesPurchased,
    };

    purchaseSharesProps2: PurchaseSharesProps = {
        scoreBoardAvailable: List<number>([0, 1, 2, 3, 0, 1, 2]),
        scoreBoardPrice: List<number>([0, 3, 4, 5, 0, 6, 5]),
        cash: 15,
        buttonSize: 40,
        onSharesPurchased,
    };

    purchaseSharesProps3: PurchaseSharesProps = {
        scoreBoardAvailable: List<number>([1, 0, 0, 1, 1, 0, 0]),
        scoreBoardPrice: List<number>([2, 0, 0, 5, 6, 0, 0]),
        cash: 5,
        buttonSize: 40,
        onSharesPurchased,
    };

    gameHistoryProps1: GameHistoryProps;
    gameHistoryProps2: GameHistoryProps;
    gameHistoryProps3: GameHistoryProps;

    gameStateUsernames: string[] = ['Tim', 'Rita', 'Dad', 'Mom', 'REALLY, REALLY, REALLY LONG NAME'];
    nextGameActionsArray: ActionBase[];

    miniGameBoardProps1: MiniGameBoardProps = {
        gameBoard: this.gameBoardProps1.gameBoard,
        cellSize: 5,
    };

    miniGameBoardProps2: MiniGameBoardProps = {
        gameBoard: this.gameBoardProps1.gameBoard,
        cellSize: 10,
    };

    miniGameBoardProps3: MiniGameBoardProps = {
        gameBoard: this.gameBoardProps1.gameBoard,
        cellSize: 15,
    };

    constructor() {
        const game1 = AllDemoProps.getDummyGameForGetGameHistory();
        this.gameHistoryProps1 = {
            usernames: ['Tim', 'Rita', 'Dad', 'Mom'],
            moveDataHistory: game1.moveDataHistory,
            width: 600,
            height: 300,
            onMoveClicked,
        };

        const { game: game2 } = runGameTestFile(require('raw-loader!../common/gameTestFiles/other/all tiles played').split('\n'));
        this.gameHistoryProps2 = {
            usernames: ['A User', 'Somebody Else'],
            moveDataHistory: game2 !== null ? game2.moveDataHistory : defaultMoveDataHistory,
            width: 600,
            height: 300,
            onMoveClicked,
        };

        const { game: game3 } = runGameTestFile(require('raw-loader!../common/gameTestFiles/other/no tiles played for entire round').split('\n'));
        this.gameHistoryProps3 = {
            usernames: ['player 1', 'player 2'],
            moveDataHistory: game3 !== null ? game3.moveDataHistory : defaultMoveDataHistory,
            width: 600,
            height: 300,
            onMoveClicked,
        };

        if (game2 !== null) {
            this.miniGameBoardProps2.gameBoard = game2.gameBoard;
        }

        if (game3 !== null) {
            this.miniGameBoardProps3.gameBoard = game3.gameBoard;
        }

        this.nextGameActionsArray = [
            new ActionStartGame(game1, 4),
            new ActionStartGame(game1, 0),
            new ActionPlayTile(game1, 1),
            new ActionSelectNewChain(game1, 2, chains, 107),
            new ActionSelectMergerSurvivor(game1, 3, [GameBoardType.Luxor, GameBoardType.Festival, GameBoardType.Continental], 107),
            new ActionSelectChainToDisposeOfNext(game1, 0, [GameBoardType.Tower, GameBoardType.American], GameBoardType.Continental),
            new ActionDisposeOfShares(game1, 1, GameBoardType.Imperial, GameBoardType.Luxor),
            new ActionPurchaseShares(game1, 2),
            new ActionGameOver(game1, 3),
        ];
    }

    static getDummyGameForGetGameHistory() {
        const game = new Game(getNewTileBag(), [2, 3, 5, 8], 8, 3);
        game.doGameAction(8, 0, [], null);
        game.moveDataHistory = defaultMoveDataHistory;

        let moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.TurnBegan, 0, []);
        moveData.timestamp = new Date().getTime();
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.DrewPositionTile, 1, [21]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.StartedGame, 2, []);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.DrewTile, 3, [100]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.HasNoPlayableTile, 0, []);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.PlayedTile, 1, [40]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.FormedChain, 2, [0]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.MergedChains, 3, [[1, 2]]);
        moveData.addGameHistoryMessage(GameHistoryMessage.MergedChains, 0, [[3, 4, 5]]);
        moveData.addGameHistoryMessage(GameHistoryMessage.MergedChains, 1, [[0, 1, 2, 6]]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.SelectedMergerSurvivor, 2, [3]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.SelectedChainToDisposeOfNext, 3, [4]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.ReceivedBonus, 0, [5, 25]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.DisposedOfShares, 1, [6, 2, 3]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.CouldNotAffordAnyShares, 2, []);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 3, [[]]);
        moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 0, [[[0, 3]]]);
        moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 1, [[[1, 2], [2, 1]]]);
        moveData.addGameHistoryMessage(GameHistoryMessage.PurchasedShares, 2, [[[3, 1], [4, 1], [5, 1]]]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.DrewLastTile, 3, []);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.ReplacedDeadTile, 0, [30]);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.EndedGame, 1, []);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.NoTilesPlayedForEntireRound, null, []);
        game.endCurrentMove();

        moveData = game.getCurrentMoveData();
        moveData.addGameHistoryMessage(GameHistoryMessage.AllTilesPlayed, null, []);
        game.endCurrentMove();

        return game;
    }
}

function render(props: AllDemoProps) {
    ReactDOM.render(
        <div>
            <h1>LoginForm</h1>
            <LoginForm {...props.loginFormProps1} />
            <br />
            <LoginForm {...props.loginFormProps2} />

            <h1>GameSetup with simulated server</h1>
            <ExampleGameSetupMaster />

            <h1>GameBoard</h1>
            <h2>labelMode=Coordinates</h2>
            <GameBoard {...props.gameBoardProps1} />
            <h2>labelMode=HotelInitials</h2>
            <GameBoard {...props.gameBoardProps2} />
            <h2>labelMode=Nothing</h2>
            <GameBoard {...props.gameBoardProps3} />

            <h1>ScoreBoard</h1>
            <ScoreBoard {...props.scoreBoardProps1} />
            <br />
            <ScoreBoard {...props.scoreBoardProps2} />
            <br />
            <ScoreBoard {...props.scoreBoardProps3} />
            <br />
            <ScoreBoard {...props.scoreBoardProps4} />
            <br />
            <ScoreBoard {...props.scoreBoardProps5} />

            <h1>TileRack</h1>
            <TileRack {...props.tileRackProps1} />
            <br />
            <TileRack {...props.tileRackProps2} />
            <br />
            <TileRack {...props.tileRackProps3} />

            <h1>SelectChain</h1>
            <SelectChain {...props.selectChainProps1} />
            <br />
            <SelectChain {...props.selectChainProps2} />
            <br />
            <SelectChain {...props.selectChainProps3} />

            <h1>DisposeOfShares</h1>
            <h2>
                defunct owned: {props.disposeOfSharesProps1.sharesOwnedInDefunctChain}, controlling available:{' '}
                {props.disposeOfSharesProps1.sharesAvailableInControllingChain}
            </h2>
            <DisposeOfShares {...props.disposeOfSharesProps1} />
            <h2>
                defunct owned: {props.disposeOfSharesProps2.sharesOwnedInDefunctChain}, controlling available:{' '}
                {props.disposeOfSharesProps2.sharesAvailableInControllingChain}
            </h2>
            <DisposeOfShares {...props.disposeOfSharesProps2} />
            <h2>
                defunct owned: {props.disposeOfSharesProps3.sharesOwnedInDefunctChain}, controlling available:{' '}
                {props.disposeOfSharesProps3.sharesAvailableInControllingChain}
            </h2>
            <DisposeOfShares {...props.disposeOfSharesProps3} />
            <h2>
                defunct owned: {props.disposeOfSharesProps4.sharesOwnedInDefunctChain}, controlling available:{' '}
                {props.disposeOfSharesProps4.sharesAvailableInControllingChain}
            </h2>
            <DisposeOfShares {...props.disposeOfSharesProps4} />

            <h1>PurchaseShares</h1>
            <h2>{getPurchaseSharesDescription(props.purchaseSharesProps1)}</h2>
            <PurchaseShares {...props.purchaseSharesProps1} />
            <br />
            <h2>{getPurchaseSharesDescription(props.purchaseSharesProps2)}</h2>
            <PurchaseShares {...props.purchaseSharesProps2} />
            <br />
            <h2>{getPurchaseSharesDescription(props.purchaseSharesProps3)}</h2>
            <PurchaseShares {...props.purchaseSharesProps3} />

            <h1>GameHistory</h1>
            <GameHistory {...props.gameHistoryProps1} />
            <br />
            <GameHistory {...props.gameHistoryProps2} />
            <br />
            <GameHistory {...props.gameHistoryProps3} />

            <h1>GameState</h1>
            {props.nextGameActionsArray.map((nextGameAction, i) => (
                <GameState key={i} usernames={props.gameStateUsernames} nextGameAction={nextGameAction} width={500} height={22} />
            ))}

            <h1>MiniGameBoard</h1>
            <MiniGameBoard {...props.miniGameBoardProps1} />
            <br />
            <MiniGameBoard {...props.miniGameBoardProps2} />
            <br />
            <MiniGameBoard {...props.miniGameBoardProps3} />
        </div>,
        document.getElementById('root'),
    );
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

function onTileClicked(tile: number) {
    console.log('onTileClicked:', getTileString(tile));
}

function onMoveClicked(index: number) {
    console.log('onMoveClicked:', index);
    props.gameHistoryProps1.selectedMove = index;
    props.gameHistoryProps2.selectedMove = index;
    props.gameHistoryProps3.selectedMove = index;
    render(props);
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

const props = new AllDemoProps();
render(props);
