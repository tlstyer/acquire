import * as style from './clientManager.scss';

import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { defaultGameBoard } from '../common/defaults';
import { GameActionEnum, GameSetupChangeEnum, MessageToClientEnum, ScoreBoardIndexEnum } from '../common/enums';
import { Game } from '../common/game';
import { ActionDisposeOfShares } from '../common/gameActions/disposeOfShares';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { ActionPurchaseShares } from '../common/gameActions/purchaseShares';
import { ActionSelectChainToDisposeOfNext } from '../common/gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from '../common/gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from '../common/gameActions/selectNewChain';
import { GameSetup } from '../common/gameSetup';
import { CreateGame } from './components/CreateGame';
import { DisposeOfShares } from './components/DisposeOfShares';
import { GameBoard } from './components/GameBoard';
import { GameHistory } from './components/GameHistory';
import { GameListing } from './components/GameListing';
import { GameSetupUI } from './components/GameSetupUI';
import { GameStatus } from './components/GameStatus';
import { Header } from './components/Header';
import { LoginForm } from './components/LoginForm';
import { PurchaseShares } from './components/PurchaseShares';
import { ScoreBoard } from './components/ScoreBoard';
import { SelectChain, SelectChainTitle } from './components/SelectChain';
import { TileRack } from './components/TileRack';
import { GameBoardLabelMode, GameStatusEnum } from './enums';
import { ErrorCode, GameBoardType, GameMode, PB, PlayerArrangementMode } from '../common/pb';
import { encodeMessageToServer } from '../common/helpers';

export enum ClientManagerPage {
  Login,
  Connecting,
  Lobby,
  GameSetup,
  Game,
}

export class ClientManager {
  errorCode: ErrorCode | null = null;
  page = ClientManagerPage.Login;

  socket: WebSocket | null = null;

  myClient: Client | null = null;
  clientIDToClient = new Map<number, Client>();
  userIDToUser = new Map<number, User>();
  gameIDToGameData = new Map<number, GameData>();
  gameDisplayNumberToGameData = new Map<number, GameData>();

  username = '';
  password = '';

  renderPageFunctions: Map<ClientManagerPage, () => JSX.Element>;
  onMessageFunctions: Map<MessageToClientEnum, (...params: any[]) => void>;

  myRequiredGameAction: GameActionEnum | null = null;

  requestAnimationFrameID: number | null = null;

  constructor() {
    this.renderPageFunctions = new Map([
      [ClientManagerPage.Login, this.renderLoginPage],
      [ClientManagerPage.Connecting, this.renderConnectingPage],
      [ClientManagerPage.Lobby, this.renderLobbyPage],
      [ClientManagerPage.GameSetup, this.renderGameSetupPage],
      [ClientManagerPage.Game, this.renderGamePage],
    ]);

    const mf: [number, (...params: any[]) => void][] = [
      [MessageToClientEnum.FatalError, this.onMessageFatalError],
      [MessageToClientEnum.Greetings, this.onMessageGreetings],
      [MessageToClientEnum.ClientConnected, this.onMessageClientConnected],
      [MessageToClientEnum.ClientDisconnected, this.onMessageClientDisconnected],
      [MessageToClientEnum.GameCreated, this.onMessageGameCreated],
      [MessageToClientEnum.ClientEnteredGame, this.onMessageClientEnteredGame],
      [MessageToClientEnum.ClientExitedGame, this.onMessageClientExitedGame],
      [MessageToClientEnum.GameSetupChanged, this.onMessageGameSetupChanged],
      [MessageToClientEnum.GameStarted, this.onMessageGameStarted],
      [MessageToClientEnum.GameActionDone, this.onMessageGameActionDone],
    ];
    this.onMessageFunctions = new Map(mf);
  }

  manage() {
    this.render();

    window.addEventListener('resize', this.render, false);
  }

  render() {
    if (this.requestAnimationFrameID === null) {
      this.requestAnimationFrameID = requestAnimationFrame(() => {
        this.requestAnimationFrameID = null;
        ReactDOM.render(this.renderPageFunctions.get(this.page)!(), document.getElementById('root'));
      });
    }
  }

  renderLoginPage = () => {
    return (
      <>
        <h1>Acquire</h1>
        <h2>Login</h2>
        <LoginForm errorCode={this.errorCode !== null ? this.errorCode : undefined} username={this.username} onSubmit={this.onSubmitLoginForm} />
      </>
    );
  };

  onSubmitLoginForm = (username: string, password: string) => {
    this.errorCode = null;
    this.setPage(ClientManagerPage.Connecting);

    this.username = username;
    this.password = password;

    this.connect();

    this.render();
  };

  renderConnectingPage = () => {
    return (
      <>
        <h1>Acquire</h1>
        <p>Connecting...</p>
      </>
    );
  };

  renderHeader = () => {
    return <Header username={this.username} isConnected={this.isConnected()} />;
  };

  renderLobbyPage = () => {
    return (
      <>
        {this.renderHeader()}
        <CreateGame onSubmit={this.onSubmitCreateGame} />
        {[...this.gameIDToGameData.entries()].reverse().map(([gameID, gameData]) => {
          if (gameData.gameSetup !== null) {
            const gameSetup = gameData.gameSetup;
            return (
              <GameListing
                key={gameID}
                gameBoard={defaultGameBoard}
                usernames={gameSetup.usernames}
                gameDisplayNumber={gameData.displayNumber}
                gameMode={gameSetup.gameMode}
                gameStatus={GameStatusEnum.SettingUp}
                onEnterClicked={gameData.onEnterClicked}
              />
            );
          } else {
            const game = gameData.game!;
            return (
              <GameListing
                key={gameID}
                gameBoard={game.gameBoard}
                usernames={game.usernames}
                gameDisplayNumber={gameData.displayNumber}
                gameMode={game.gameMode}
                gameStatus={game.gameActionStack[0] instanceof ActionGameOver ? GameStatusEnum.Completed : GameStatusEnum.InProgress}
                onEnterClicked={gameData.onEnterClicked}
              />
            );
          }
        })}
      </>
    );
  };

  onSubmitCreateGame = (gameMode: GameMode) => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ createGame: { gameMode } }));
    }
  };

  renderGameSetupPage = () => {
    const gameSetup = this.myClient!.gameData!.gameSetup!;
    const myUserID = this.myClient!.user.id;
    const isHost = myUserID === gameSetup.hostUserID;
    const isJoined = gameSetup.userIDsSet.has(myUserID);

    return (
      <>
        {this.renderHeader()}

        <div>
          <input type={'button'} value={'Exit Game'} onClick={this.onExitGameClicked} />
        </div>

        {!isHost && (
          <div>
            {isJoined ? (
              <input type={'button'} value={'Stand Up'} onClick={this.onUnjoinGame} />
            ) : (
              <input type={'button'} value={'Sit Down'} onClick={this.onJoinGame} />
            )}
          </div>
        )}

        <GameSetupUI
          gameMode={gameSetup.gameMode}
          playerArrangementMode={gameSetup.playerArrangementMode}
          usernames={gameSetup.usernames}
          userIDs={gameSetup.userIDs}
          approvals={gameSetup.approvals}
          hostUserID={gameSetup.hostUserID}
          myUserID={this.myClient!.user.id}
          onChangeGameMode={isHost ? this.onChangeGameMode : undefined}
          onChangePlayerArrangementMode={isHost ? this.onChangePlayerArrangementMode : undefined}
          onSwapPositions={isHost ? this.onSwapPositions : undefined}
          onKickUser={isHost ? this.onKickUser : undefined}
          onApprove={this.onApproveOfGameSetup}
        />
      </>
    );
  };

  onExitGameClicked = () => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ exitGame: {} }));
    }
  };

  onJoinGame = () => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { joinGame: {} } }));
    }
  };

  onUnjoinGame = () => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { unjoinGame: {} } }));
    }
  };

  onApproveOfGameSetup = () => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { approveOfGameSetup: {} } }));
    }
  };

  onChangeGameMode = (gameMode: GameMode) => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { changeGameMode: { gameMode } } }));
    }
  };

  onChangePlayerArrangementMode = (playerArrangementMode: PlayerArrangementMode) => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { changePlayerArrangementMode: { playerArrangementMode } } }));
    }
  };

  onSwapPositions = (position1: number, position2: number) => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { swapPositions: { position1, position2 } } }));
    }
  };

  onKickUser = (userID: number) => {
    if (this.isConnected()) {
      this.socket!.send(encodeMessageToServer({ doGameSetupAction: { kickUser: { userId: userID } } }));
    }
  };

  renderGamePage = () => {
    const game = this.myClient!.gameData!.game!;
    const selectedMove = game.gameStateHistory.size - 1;

    const playerID = game.userIDs.indexOf(game.myUserID || -1);

    const gameState = game.gameStateHistory.get(selectedMove)!;
    const nextGameAction = gameState.nextGameAction;

    let turnPlayerID = gameState.turnPlayerID;
    let movePlayerID = nextGameAction.playerID;
    if (nextGameAction instanceof ActionGameOver) {
      turnPlayerID = -1;
      movePlayerID = -1;
    }

    const tileRack = gameState.tileRacks.get(playerID);
    const tileRackTypes = gameState.tileRackTypes.get(playerID);

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const gameBoardCellSizeBasedOnWindowWidth = windowWidth / 2 / 12;
    const gameBoardCellSizeBasedOnWindowHeight = (windowHeight - 129) / 9;
    const gameBoardCellSize = Math.floor(Math.min(gameBoardCellSizeBasedOnWindowWidth, gameBoardCellSizeBasedOnWindowHeight));
    const gameBoardWidth = gameBoardCellSize * 12 + 2;

    const scoreBoardCellWidth = Math.floor(Math.min(windowWidth - gameBoardWidth, gameBoardWidth) / 18);

    return (
      <div className={style.root}>
        {this.renderHeader()}

        <div className={style.main}>
          <div className={style.leftSide}>
            <GameBoard
              gameBoard={gameState.gameBoard}
              tileRack={gameState.tileRacks.get(playerID)}
              labelMode={GameBoardLabelMode.Nothing}
              cellSize={gameBoardCellSize}
              onCellClicked={this.onTileClicked}
            />
          </div>
          <div className={style.rightSide}>
            <ScoreBoard
              usernames={game.usernames}
              scoreBoard={gameState.scoreBoard}
              scoreBoardAvailable={gameState.scoreBoardAvailable}
              scoreBoardChainSize={gameState.scoreBoardChainSize}
              scoreBoardPrice={gameState.scoreBoardPrice}
              safeChains={gameState.safeChains}
              turnPlayerID={turnPlayerID}
              movePlayerID={movePlayerID}
              gameMode={game.gameMode}
              cellWidth={scoreBoardCellWidth}
            />
            {tileRack !== undefined && tileRackTypes !== undefined ? (
              <TileRack
                tiles={tileRack}
                types={tileRackTypes}
                buttonSize={gameBoardCellSize}
                keyboardShortcutsEnabled={!!this.myRequiredGameAction}
                onTileClicked={this.onTileClicked}
              />
            ) : undefined}
            {this.myRequiredGameAction &&
              (nextGameAction instanceof ActionSelectNewChain ? (
                <SelectChain
                  type={SelectChainTitle.SelectNewChain}
                  availableChains={nextGameAction.availableChains}
                  buttonSize={gameBoardCellSize}
                  keyboardShortcutsEnabled={true}
                  onChainSelected={this.onChainSelected}
                />
              ) : nextGameAction instanceof ActionSelectMergerSurvivor ? (
                <SelectChain
                  type={SelectChainTitle.SelectMergerSurvivor}
                  availableChains={nextGameAction.chainsBySize[0]}
                  buttonSize={gameBoardCellSize}
                  keyboardShortcutsEnabled={true}
                  onChainSelected={this.onChainSelected}
                />
              ) : nextGameAction instanceof ActionSelectChainToDisposeOfNext ? (
                <SelectChain
                  type={SelectChainTitle.SelectChainToDisposeOfNext}
                  availableChains={nextGameAction.defunctChains}
                  buttonSize={gameBoardCellSize}
                  keyboardShortcutsEnabled={true}
                  onChainSelected={this.onChainSelected}
                />
              ) : nextGameAction instanceof ActionDisposeOfShares ? (
                <DisposeOfShares
                  defunctChain={nextGameAction.defunctChain}
                  controllingChain={nextGameAction.controllingChain}
                  sharesOwnedInDefunctChain={nextGameAction.sharesOwnedInDefunctChain}
                  sharesAvailableInControllingChain={nextGameAction.sharesAvailableInControllingChain}
                  buttonSize={gameBoardCellSize}
                  keyboardShortcutsEnabled={true}
                  onSharesDisposed={this.onSharesDisposed}
                />
              ) : nextGameAction instanceof ActionPurchaseShares ? (
                <PurchaseShares
                  scoreBoardAvailable={game.scoreBoardAvailable}
                  scoreBoardPrice={game.scoreBoardPrice}
                  cash={game.scoreBoard.get(playerID)!.get(ScoreBoardIndexEnum.Cash)!}
                  buttonSize={gameBoardCellSize}
                  keyboardShortcutsEnabled={true}
                  onSharesPurchased={this.onSharesPurchased}
                />
              ) : undefined)}
            <GameHistory usernames={game.usernames} gameStateHistory={game.gameStateHistory} onMoveClicked={this.onMoveClicked} />
            <GameStatus usernames={game.usernames} nextGameAction={nextGameAction} />
          </div>
        </div>
      </div>
    );
  };

  onTileClicked = (tile: number) => {
    if (this.isConnected() && this.myRequiredGameAction === GameActionEnum.PlayTile) {
      const game = this.myClient!.gameData!.game!;
      const playerID = game.userIDs.indexOf(game.myUserID || -1);
      const tileRackIndex = game.tileRacks.get(playerID)!.indexOf(tile);
      const tileType = game.tileRackTypes.get(playerID)!.get(tileRackIndex)!;

      if (tileType !== GameBoardType.CANT_PLAY_EVER && tileType !== GameBoardType.CANT_PLAY_NOW) {
        this.socket!.send(encodeMessageToServer({ doGameAction: { gameStateHistorySize: game.gameStateHistory.size, gameAction: { playTile: { tile } } } }));
        this.myRequiredGameAction = null;
      }
    }
  };

  onChainSelected = (chain: GameBoardType) => {
    if (this.isConnected()) {
      this.socket!.send(
        encodeMessageToServer({
          doGameAction: {
            gameStateHistorySize: this.myClient!.gameData!.game!.gameStateHistory.size,
            gameAction: { [chainSelectionGameActionEnumToGameActionString.get(this.myRequiredGameAction!)!]: { chain } },
          },
        }),
      );
      this.myRequiredGameAction = null;
    }
  };

  onSharesDisposed = (traded: number, sold: number) => {
    if (this.isConnected()) {
      this.socket!.send(
        encodeMessageToServer({
          doGameAction: {
            gameStateHistorySize: this.myClient!.gameData!.game!.gameStateHistory.size,
            gameAction: { disposeOfShares: { tradeAmount: traded, sellAmount: sold } },
          },
        }),
      );
      this.myRequiredGameAction = null;
    }
  };

  onSharesPurchased = (chains: GameBoardType[], endGame: boolean) => {
    if (this.isConnected()) {
      this.socket!.send(
        encodeMessageToServer({
          doGameAction: {
            gameStateHistorySize: this.myClient!.gameData!.game!.gameStateHistory.size,
            gameAction: { purchaseShares: { chains, endGame } },
          },
        }),
      );
      this.myRequiredGameAction = null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onMoveClicked = (_index: number) => {
    // do nothing
  };

  connect = () => {
    this.socket = new WebSocket('ws://localhost:9999');

    this.socket.onopen = this.onSocketOpen;
    this.socket.onmessage = this.onSocketMessage;
    this.socket.onclose = this.onSocketClose;
  };

  onSocketOpen = () => {
    this.socket!.send(encodeMessageToServer({ login: { version: 0, username: this.username, password: this.password } }));
  };

  onSocketMessage = (e: MessageEvent) => {
    const messages = JSON.parse(e.data);

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const handler = this.onMessageFunctions.get(message[0])!;
      handler.apply(this, message.slice(1));
    }

    this.render();
  };

  onMessageFatalError(errorCode: ErrorCode) {
    this.errorCode = errorCode;
  }

  onMessageGreetings(myClientID: number, users: any[], games: any[]) {
    this.clientIDToClient.clear();
    this.userIDToUser.clear();
    this.gameIDToGameData.clear();
    this.gameDisplayNumberToGameData.clear();

    for (let i = 0; i < games.length; i++) {
      const gameParams = games[i];
      const gameID: number = gameParams[1];
      const gameDisplayNumber: number = gameParams[2];

      const gameData = new GameData(gameID, gameDisplayNumber, this);

      this.gameIDToGameData.set(gameID, gameData);
      this.gameDisplayNumberToGameData.set(gameDisplayNumber, gameData);
    }

    for (let i = 0; i < users.length; i++) {
      const [userID, username, clientDatas] = users[i];

      const user = new User(userID, username);
      this.userIDToUser.set(userID, user);

      if (clientDatas !== undefined) {
        for (let j = 0; j < clientDatas.length; j++) {
          const clientData = clientDatas[j];
          const clientID: number = clientData[0];
          const gameDisplayNumber: number | undefined = clientData[1];

          const client = new Client(clientID, user);
          user.clients.add(client);
          if (gameDisplayNumber !== undefined) {
            const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber)!;
            client.gameData = gameData;
            gameData.clients.add(client);
          }
          this.clientIDToClient.set(clientID, client);
        }
      }
    }

    this.myClient = this.clientIDToClient.get(myClientID)!;
    const myUserID = this.myClient!.user.id;

    for (let i = 0; i < games.length; i++) {
      const gameParams = games[i];
      const isGameSetup = gameParams[0] === 0;
      const gameID: number = gameParams[1];

      const gameData = this.gameIDToGameData.get(gameID)!;

      if (isGameSetup) {
        const gameSetupData: PB.GameSetupData = gameParams[3];

        gameData.gameSetup = GameSetup.fromGameSetupData(gameSetupData, this.getUsernameForUserID);

        const positions = gameSetupData.positions;
        for (let j = 0; j < positions.length; j++) {
          const userID = positions[j].userId;
          if (userID !== null && userID !== undefined && userID !== 0) {
            this.userIDToUser.get(userID)!.numGames++;
          }
        }
      } else {
        const gameDataPB: PB.GameData = gameParams[3];

        const userIDs: number[] = [];
        const usernames: string[] = [];
        let hostUserID = 0;

        const positions = gameDataPB.positions;
        for (let j = 0; j < positions.length; j++) {
          const position = positions[j];
          const userID = position.userId!;

          userIDs.push(userID);

          this.userIDToUser.get(userID)!.numGames++;
          usernames.push(this.getUsernameForUserID(userID));

          if (position.isHost) {
            hostUserID = userID;
          }
        }

        gameData.game = new Game(gameDataPB.gameMode, gameDataPB.playerArrangementMode, [], List(userIDs), List(usernames), hostUserID, myUserID);

        const gameStateDatas = gameDataPB.gameStateDatas;
        for (let j = 0; j < gameStateDatas.length; j++) {
          gameData.game.processGameStateData(gameStateDatas[j]);
        }
      }
    }

    this.setPage(
      this.myClient.gameData !== null ? (this.myClient.gameData.gameSetup ? ClientManagerPage.GameSetup : ClientManagerPage.Game) : ClientManagerPage.Lobby,
    );
  }

  onMessageClientConnected(clientID: number, userID: number, username?: string) {
    let user: User;
    if (username !== undefined) {
      user = new User(userID, username);
      this.userIDToUser.set(userID, user);
    } else {
      user = this.userIDToUser.get(userID)!;
    }

    const client = new Client(clientID, user);
    user.clients.add(client);
    this.clientIDToClient.set(clientID, client);
  }

  onMessageClientDisconnected(clientID: number) {
    const client = this.clientIDToClient.get(clientID)!;
    const user = client.user;

    this.clientIDToClient.delete(clientID);
    user.clients.delete(client);
    this.deleteUserIfItDoesNotHaveReferences(user);
  }

  onMessageGameCreated(gameID: number, gameDisplayNumber: number, gameMode: GameMode, hostClientID: number) {
    const hostClient = this.clientIDToClient.get(hostClientID)!;

    const gameData = new GameData(gameID, gameDisplayNumber, this);
    gameData.gameSetup = new GameSetup(gameMode, PlayerArrangementMode.RANDOM_ORDER, hostClient.user.id, this.getUsernameForUserID);

    hostClient.user.numGames++;

    this.gameIDToGameData.set(gameID, gameData);
    this.gameDisplayNumberToGameData.set(gameDisplayNumber, gameData);
  }

  onMessageClientEnteredGame(clientID: number, gameDisplayNumber: number) {
    const client = this.clientIDToClient.get(clientID)!;
    const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber)!;

    client.gameData = gameData;
    gameData.clients.add(client);

    if (client === this.myClient) {
      this.setPage(gameData.gameSetup ? ClientManagerPage.GameSetup : ClientManagerPage.Game);
    }
  }

  onMessageClientExitedGame(clientID: number) {
    const client = this.clientIDToClient.get(clientID)!;
    const gameData = client.gameData!;

    client.gameData = null;
    gameData.clients.delete(client);

    if (client === this.myClient) {
      this.setPage(ClientManagerPage.Lobby);
    }
  }

  onMessageGameSetupChanged(gameDisplayNumber: number, ...params: any[]) {
    const gameSetup = this.gameDisplayNumberToGameData.get(gameDisplayNumber)!.gameSetup!;

    gameSetup.processChange(params);

    switch (params[0]) {
      case GameSetupChangeEnum.UserAdded:
        this.userIDToUser.get(params[1])!.numGames++;
        break;
      case GameSetupChangeEnum.UserRemoved:
      case GameSetupChangeEnum.UserKicked: {
        const user = this.userIDToUser.get(params[1])!;
        user.numGames--;
        this.deleteUserIfItDoesNotHaveReferences(user);
        break;
      }
    }
  }

  onMessageGameStarted(gameDisplayNumber: number, userIDs: number[]) {
    const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber)!;
    const gameSetup = gameData.gameSetup!;

    const game = new Game(
      gameSetup.gameMode,
      gameSetup.playerArrangementMode,
      [],
      List(userIDs),
      List(userIDs.map(this.getUsernameForUserID)),
      gameSetup.hostUserID,
      this.myClient!.user.id,
    );

    gameData.gameSetup = null;
    gameData.game = game;

    if (this.myClient!.gameData === gameData) {
      this.setPage(ClientManagerPage.Game);
    }
  }

  onMessageGameActionDone(gameDisplayNumber: number, gameStateData: PB.GameStateData) {
    const gameData = this.gameDisplayNumberToGameData.get(gameDisplayNumber)!;
    const game = gameData.game!;

    game.processGameStateData(gameStateData);

    if (this.myClient!.gameData === gameData) {
      this.updateMyRequiredGameAction();
    }
  }

  onSocketClose = () => {
    this.socket = null;

    if (this.errorCode !== null) {
      this.setPage(ClientManagerPage.Login);
    } else if (this.page === ClientManagerPage.Connecting) {
      this.errorCode = ErrorCode.COULD_NOT_CONNECT;
      this.setPage(ClientManagerPage.Login);
    }

    this.render();
  };

  setPage(page: ClientManagerPage) {
    this.page = page;

    if (page === ClientManagerPage.Game) {
      this.updateMyRequiredGameAction();
    } else {
      this.myRequiredGameAction = null;
    }
  }

  updateMyRequiredGameAction() {
    const game = this.myClient!.gameData!.game!;
    const playerID = game.userIDs.indexOf(this.myClient!.user.id);
    const currentAction = game.gameActionStack[game.gameActionStack.length - 1];

    this.myRequiredGameAction = playerID === currentAction.playerID ? currentAction.gameAction : null;
  }

  isConnected() {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  getUsernameForUserID = (userID: number) => {
    return this.userIDToUser.get(userID)!.name;
  };

  deleteUserIfItDoesNotHaveReferences(user: User) {
    if (user.clients.size === 0 && user.numGames === 0) {
      this.userIDToUser.delete(user.id);
    }
  }
}

export class Client {
  gameData: GameData | null = null;

  constructor(public id: number, public user: User) {}
}

export class User {
  clients = new Set<Client>();

  numGames = 0;

  constructor(public id: number, public name: string) {}
}

export class GameData {
  gameSetup: GameSetup | null = null;
  game: Game | null = null;

  clients = new Set<Client>();

  constructor(public id: number, public displayNumber: number, public clientManager: ClientManager) {}

  onEnterClicked = () => {
    if (this.clientManager.isConnected()) {
      this.clientManager.socket!.send(encodeMessageToServer({ enterGame: { gameDisplayNumber: this.displayNumber } }));
    }
  };
}

const chainSelectionGameActionEnumToGameActionString = new Map([
  [GameActionEnum.SelectNewChain, 'selectNewChain'],
  [GameActionEnum.SelectMergerSurvivor, 'selectMergerSurvivor'],
  [GameActionEnum.SelectChainToDisposeOfNext, 'selectChainToDisposeOfNext'],
]);
