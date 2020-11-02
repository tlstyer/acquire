import { List } from 'immutable';
import 'normalize.css';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { defaultGameBoard, defaultGameStateHistory } from '../common/defaults';
import { Game } from '../common/game';
import { PB_ErrorCode, PB_GameBoardType, PB_GameMode } from '../common/pb';
import { CreateGame, CreateGameProps } from './components/CreateGame';
import { DisposeOfShares, DisposeOfSharesProps } from './components/DisposeOfShares';
import { ExampleGameSetupMaster } from './components/ExampleGameSetupMaster';
import { GameBoard, GameBoardProps } from './components/GameBoard';
import { GameHistory, GameHistoryProps } from './components/GameHistory';
import { GameListing, GameListingProps } from './components/GameListing';
import { GameStatus, GameStatusProps } from './components/GameStatus';
import { Header, HeaderProps } from './components/Header';
import { LoginForm, LoginFormProps } from './components/LoginForm';
import { PurchaseShares, PurchaseSharesProps } from './components/PurchaseShares';
import { ScoreBoard, ScoreBoardProps } from './components/ScoreBoard';
import { SelectChain, SelectChainProps, SelectChainTitle } from './components/SelectChain';
import { TileRack, TileRackProps } from './components/TileRack';
import { TileRackReadOnly, TileRackReadOnlyProps } from './components/TileRackReadOnly';
import { GameBoardLabelMode, GameStatusEnum } from './enums';
import { getDummyGameForGetGameHistory, getExampleNextGameActionsArray } from './exampleData';
import * as style from './examples.scss';
import './global.scss';
import {
  disposeOfSharesKeyboardShortcutsDescription,
  gameBoardTypeToHotelInitial,
  getTileString,
  purchaseSharesKeyboardShortcutsDescription,
  selectChainKeyboardShortcutsDescription,
  tileRackKeyboardShortcutsDescription,
} from './helpers';

class AllDemoProps {
  loginFormProps: LoginFormProps[];
  headerProps: HeaderProps[];
  createGameProps: CreateGameProps[];
  gameListingProps: GameListingProps[];
  gameBoardProps: GameBoardProps[];
  scoreBoardProps: ScoreBoardProps[];
  tileRackProps: TileRackProps[];
  tileRackReadOnlyProps: TileRackReadOnlyProps[];
  selectChainProps: SelectChainProps[];
  disposeOfSharesProps: DisposeOfSharesProps[];
  purchaseSharesProps: PurchaseSharesProps[];
  gameHistoryProps: GameHistoryProps[];
  gameStatusProps: GameStatusProps[];

  possibleKeyboardShortcutsEnabledProps: { keyboardShortcutsEnabled: boolean }[];

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const gameJson1 = require('raw-loader!../common/gameTestFiles/other/no tiles played for entire round').default.split('\nGame JSON:\n')[1];
    const game1 = Game.fromJSON(JSON.parse(gameJson1));

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const gameJson2 = require('raw-loader!../common/gameTestFiles/other/all tiles played').default.split('\nGame JSON:\n')[1];
    const game2 = Game.fromJSON(JSON.parse(gameJson2));

    this.loginFormProps = [{ onSubmit: onSubmitLoginForm }, { errorCode: PB_ErrorCode.COULD_NOT_CONNECT, username: 'tlstyer', onSubmit: onSubmitLoginForm }];

    this.headerProps = [
      { username: 'tlstyer', isConnected: true },
      { username: 'Another User', isConnected: false },
    ];

    this.createGameProps = [
      { onSubmit: onSubmitCreateGame },
      { gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2, onSubmit: onSubmitCreateGame },
      { gameMode: PB_GameMode.SINGLES_1, onSubmit: onSubmitCreateGame },
    ];

    this.gameListingProps = [
      {
        gameBoard: defaultGameBoard,
        usernames: List(['Host', null, 'User 2', null]),
        gameDisplayNumber: 1,
        gameMode: PB_GameMode.SINGLES_4,
        gameStatus: GameStatusEnum.SettingUp,
        onEnterClicked,
      },
      {
        gameBoard: game1 !== null ? game1.gameBoard : defaultGameBoard,
        usernames: List(['Tim', 'Rita', 'Dad', 'Mom', 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME', 'pgyqj,;']),
        gameDisplayNumber: 2,
        gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2,
        gameStatus: GameStatusEnum.InProgress,
        onEnterClicked,
      },
      {
        gameBoard: game2 !== null ? game2.gameBoard : defaultGameBoard,
        usernames: List(['player 1', 'player 2', 'player 3', 'player 4']),
        gameDisplayNumber: 3,
        gameMode: PB_GameMode.TEAMS_2_VS_2,
        gameStatus: GameStatusEnum.Completed,
        onEnterClicked,
      },
    ];

    const gbp: GameBoardProps = {
      gameBoard: List([
        List([0, 0, 7, 1, 1, 7, 2, 2, 7, 3, 3, 7]),
        List([7, 7, 8, 7, 7, 7, 7, 7, 7, 7, 7, 4]),
        List([7, 7, 7, 8, 7, 7, 7, 8, 7, 7, 7, 4]),
        List([7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7]),
        List([7, 7, 7, 7, 7, 5, 5, 5, 5, 5, 5, 5]),
        List([7, 7, 7, 7, 7, 7, 5, 5, 9, 7, 9, 5]),
        List([7, 7, 8, 7, 7, 7, 5, 7, 6, 6, 6, 9]),
        List([7, 7, 7, 7, 7, 8, 7, 7, 6, 6, 6, 6]),
        List([7, 7, 7, 7, 7, 7, 7, 7, 6, 6, 6, 6]),
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
        scoreBoard: List([List([6, 1, 13, 10, 4, 4, 6, 207, 785]), List([1, 0, 11, 0, 3, 1, 1, 256, 533])]),
        scoreBoardAvailable: List([18, 24, 1, 15, 18, 20, 18]),
        scoreBoardChainSize: List([3, 0, 39, 5, 2, 4, 13]),
        scoreBoardPrice: List([3, 0, 10, 6, 3, 6, 9]),
        safeChains: List([false, false, true, false, false, false, true]),
        turnPlayerID: 1,
        movePlayerID: 0,
        gameMode: PB_GameMode.SINGLES_2,
        cellWidth: 30,
      },
      {
        usernames: List(['tlstyer', 'REALLY, REALLY, REALLY, REALLY, REALLY LONG NAME', 'Somebody Else', 'hi!']),
        scoreBoard: List([
          List([4, 0, 0, 0, 0, 0, 0, 74, 82]),
          List([0, 4, 0, 0, 0, 0, 0, 74, 82]),
          List([0, 0, 0, 0, 0, 4, 0, 88, 104]),
          List([1, 1, 0, 0, 0, 1, 1, 92, 228]),
        ]),
        scoreBoardAvailable: List([20, 20, 25, 25, 25, 20, 24]),
        scoreBoardChainSize: List([2, 2, 0, 0, 0, 2, 9]),
        scoreBoardPrice: List([2, 2, 0, 0, 0, 4, 8]),
        safeChains: List([false, false, false, false, false, false, false]),
        turnPlayerID: 0,
        movePlayerID: 0,
        gameMode: PB_GameMode.SINGLES_4,
        cellWidth: 30,
      },
      {
        usernames: List(['player 1', 'player 2', 'player 3', 'player 4']),
        scoreBoard: List([
          List([0, 0, 5, 9, 0, 13, 0, 0, 427]),
          List([8, 1, 0, 13, 0, 12, 0, 63, 474]),
          List([7, 1, 11, 0, 0, 0, 0, 107, 212]),
          List([1, 3, 9, 3, 0, 0, 0, 213, 310]),
        ]),
        scoreBoardAvailable: List([9, 20, 0, 0, 25, 0, 25]),
        scoreBoardChainSize: List([0, 0, 4, 27, 0, 42, 0]),
        scoreBoardPrice: List([0, 0, 5, 9, 0, 12, 0]),
        safeChains: List([false, false, false, true, false, true, false]),
        turnPlayerID: -1,
        movePlayerID: -1,
        gameMode: PB_GameMode.TEAMS_2_VS_2,
        cellWidth: 30,
      },
      {
        usernames: List(['player 1', 'player 2', 'player 3', 'player 4', 'player 5', 'player 6']),
        scoreBoard: List([
          List([1, 0, 0, 9, 2, 3, 0, 188, 386]),
          List([0, 3, 7, 0, 0, 0, 0, 35, 121]),
          List([0, 0, 7, 2, 0, 1, 0, 22, 135]),
          List([0, 0, 0, 8, 0, 9, 0, 87, 375]),
          List([0, 0, 8, 6, 0, 7, 0, 84, 408]),
          List([0, 0, 3, 0, 0, 5, 0, 120, 192]),
        ]),
        scoreBoardAvailable: List([24, 22, 0, 0, 23, 0, 25]),
        scoreBoardChainSize: List([0, 0, 22, 30, 0, 15, 0]),
        scoreBoardPrice: List([0, 0, 9, 9, 0, 9, 0]),
        safeChains: List([false, false, true, true, false, true, false]),
        turnPlayerID: -1,
        movePlayerID: -1,
        gameMode: PB_GameMode.TEAMS_2_VS_2_VS_2,
        cellWidth: 30,
      },
    ];
    this.scoreBoardProps.push({
      ...this.scoreBoardProps[3],
      gameMode: PB_GameMode.TEAMS_3_VS_3,
    });

    this.tileRackProps = [
      {
        tiles: List([1, 28, 55, 82, 92, 40]),
        types: List([
          PB_GameBoardType.LUXOR,
          PB_GameBoardType.TOWER,
          PB_GameBoardType.AMERICAN,
          PB_GameBoardType.FESTIVAL,
          PB_GameBoardType.WORLDWIDE,
          PB_GameBoardType.CONTINENTAL,
        ]),
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onTileClicked,
      },
      {
        tiles: List([71, null, 99, 12, 8, 17]),
        types: List([
          PB_GameBoardType.IMPERIAL,
          null,
          PB_GameBoardType.WILL_MERGE_CHAINS,
          PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN,
          PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO,
          PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO,
        ]),
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onTileClicked,
      },
      {
        tiles: List([null, 86, null, 38, null, 74]),
        types: List([null, PB_GameBoardType.CANT_PLAY_EVER, null, PB_GameBoardType.WILL_FORM_NEW_CHAIN, null, PB_GameBoardType.CANT_PLAY_NOW]),
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
        defunctChain: PB_GameBoardType.AMERICAN,
        controllingChain: PB_GameBoardType.FESTIVAL,
        sharesOwnedInDefunctChain: 10,
        sharesAvailableInControllingChain: 22,
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onSharesDisposed,
      },
      {
        defunctChain: PB_GameBoardType.IMPERIAL,
        controllingChain: PB_GameBoardType.TOWER,
        sharesOwnedInDefunctChain: 7,
        sharesAvailableInControllingChain: 2,
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onSharesDisposed,
      },
      {
        defunctChain: PB_GameBoardType.CONTINENTAL,
        controllingChain: PB_GameBoardType.WORLDWIDE,
        sharesOwnedInDefunctChain: 1,
        sharesAvailableInControllingChain: 3,
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onSharesDisposed,
      },
      {
        defunctChain: PB_GameBoardType.LUXOR,
        controllingChain: PB_GameBoardType.IMPERIAL,
        sharesOwnedInDefunctChain: 25,
        sharesAvailableInControllingChain: 10,
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onSharesDisposed,
      },
    ];

    this.purchaseSharesProps = [
      {
        scoreBoardAvailable: List([3, 3, 3, 3, 3, 3, 3]),
        scoreBoardPrice: List([2, 3, 4, 5, 6, 7, 8]),
        cash: 15,
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onSharesPurchased,
      },
      {
        scoreBoardAvailable: List([0, 1, 2, 3, 0, 1, 2]),
        scoreBoardPrice: List([0, 3, 4, 5, 0, 6, 5]),
        cash: 15,
        buttonSize: 40,
        keyboardShortcutsEnabled: false,
        onSharesPurchased,
      },
      {
        scoreBoardAvailable: List([1, 23, 6, 1, 1, 4, 1]),
        scoreBoardPrice: List([2, 0, 0, 5, 6, 0, 0]),
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
        gameStateHistory: dummyGameForGetGameHistory.gameStateHistory,
        onMoveClicked,
      },
      {
        usernames: game1 !== null ? game1.usernames : List(),
        gameStateHistory: game1 !== null ? game1.gameStateHistory : defaultGameStateHistory,
        onMoveClicked,
      },
      {
        usernames: game2 !== null ? game2.usernames : List(),
        gameStateHistory: game2 !== null ? game2.gameStateHistory : defaultGameStateHistory,
        onMoveClicked,
      },
    ];

    const nextGameActionsArray = getExampleNextGameActionsArray();
    this.gameStatusProps = nextGameActionsArray.map((nextGameAction) => ({
      usernames: nextGameAction.game.usernames,
      nextGameAction,
      width: 500,
      height: 22,
    }));

    this.possibleKeyboardShortcutsEnabledProps = [...this.tileRackProps, ...this.selectChainProps, ...this.disposeOfSharesProps, ...this.purchaseSharesProps];
  }
}

function render(props: AllDemoProps) {
  ReactDOM.render(
    <div className={style.root}>
      <h1>LoginForm</h1>
      {renderComponentForEachProps(LoginForm, props.loginFormProps)}

      <h1>Header</h1>
      {renderComponentForEachProps(Header, props.headerProps)}

      <h1>CreateGame</h1>
      {renderComponentForEachProps(CreateGame, props.createGameProps)}

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

      <h1>GameStatus</h1>
      {renderComponentForEachProps(GameStatus, props.gameStatusProps)}
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
      ) : undefined}
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
    const numAvailable = props.scoreBoardAvailable.get(chain)!;
    if (numAvailable !== 0) {
      parts.push(`${numAvailable}${gameBoardTypeToHotelInitial.get(chain)}@$${props.scoreBoardPrice.get(chain)! * 100}`);
    }
  }

  return parts.join(', ');
}

function onSubmitLoginForm(username: string, password: string) {
  console.log('onSubmitLoginForm:', username, ',', password);
}

function onSubmitCreateGame(gameMode: PB_GameMode) {
  console.log('onSubmitCreateGame:', gameMode);
}

function onEnterClicked() {
  console.log('onEnterClicked');
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

function onChainSelected(chain: PB_GameBoardType) {
  console.log('onChainSelected:', gameBoardTypeToHotelInitial.get(chain));
}

function onSharesDisposed(traded: number, sold: number) {
  console.log('onSharesDisposed', traded, sold);
}

function onSharesPurchased(chains: PB_GameBoardType[], endGame: boolean) {
  console.log('onSharesPurchased', chains, endGame);
}

window.addEventListener('keydown', (event) => {
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

    const lastMove = allDemoProps.gameHistoryProps[2].gameStateHistory.size - 1;
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
