import { List } from 'immutable';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { defaultGameBoard } from '../common/defaults';
import { GameActionEnum, ScoreBoardIndexEnum } from '../common/enums';
import { Game } from '../common/game';
import { ActionDisposeOfShares } from '../common/gameActions/disposeOfShares';
import { ActionGameOver } from '../common/gameActions/gameOver';
import { ActionPurchaseShares } from '../common/gameActions/purchaseShares';
import { ActionSelectChainToDisposeOfNext } from '../common/gameActions/selectChainToDisposeOfNext';
import { ActionSelectMergerSurvivor } from '../common/gameActions/selectMergerSurvivor';
import { ActionSelectNewChain } from '../common/gameActions/selectNewChain';
import { GameSetup } from '../common/gameSetup';
import {
  PB_ErrorCode,
  PB_GameBoardType,
  PB_GameMode,
  PB_GameStatus,
  PB_MessagesToClient,
  PB_MessageToClient_ClientConnected,
  PB_MessageToClient_ClientDisconnected,
  PB_MessageToClient_ClientEnteredGame,
  PB_MessageToClient_ClientExitedGame,
  PB_MessageToClient_FatalError,
  PB_MessageToClient_GameActionDone,
  PB_MessageToClient_GameCreated,
  PB_MessageToClient_GameSetupChanged,
  PB_MessageToClient_GameStarted,
  PB_MessageToClient_Greetings,
  PB_MessageToServer,
  PB_PlayerArrangementMode,
} from '../common/pb';
import * as style from './clientManager.scss';
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
import { GameBoardLabelMode } from './enums';

export enum ClientManagerPage {
  Login,
  Connecting,
  Lobby,
  GameSetup,
  Game,
}

export class ClientManager {
  errorCode: PB_ErrorCode | null = null;
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
  }

  manage() {
    this.render();

    window.addEventListener('resize', this.render.bind(this));
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
                gameStatus={PB_GameStatus.SETTING_UP}
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
                gameStatus={game.gameActionStack[0] instanceof ActionGameOver ? PB_GameStatus.COMPLETED : PB_GameStatus.IN_PROGRESS}
                onEnterClicked={gameData.onEnterClicked}
              />
            );
          }
        })}
      </>
    );
  };

  onSubmitCreateGame = (gameMode: PB_GameMode) => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ createGame: { gameMode } }));
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
      this.sendMessage(PB_MessageToServer.create({ exitGame: {} }));
    }
  };

  onJoinGame = () => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { joinGame: {} } }));
    }
  };

  onUnjoinGame = () => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { unjoinGame: {} } }));
    }
  };

  onApproveOfGameSetup = () => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { approveOfGameSetup: {} } }));
    }
  };

  onChangeGameMode = (gameMode: PB_GameMode) => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { changeGameMode: { gameMode } } }));
    }
  };

  onChangePlayerArrangementMode = (playerArrangementMode: PB_PlayerArrangementMode) => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { changePlayerArrangementMode: { playerArrangementMode } } }));
    }
  };

  onSwapPositions = (position1: number, position2: number) => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { swapPositions: { position1, position2 } } }));
    }
  };

  onKickUser = (userID: number) => {
    if (this.isConnected()) {
      this.sendMessage(PB_MessageToServer.create({ doGameSetupAction: { kickUser: { userId: userID } } }));
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

      if (tileType !== PB_GameBoardType.CANT_PLAY_EVER && tileType !== PB_GameBoardType.CANT_PLAY_NOW) {
        this.sendMessage(PB_MessageToServer.create({ doGameAction: { gameStateHistorySize: game.gameStateHistory.size, gameAction: { playTile: { tile } } } }));
        this.myRequiredGameAction = null;
      }
    }
  };

  onChainSelected = (chain: PB_GameBoardType) => {
    if (this.isConnected()) {
      this.sendMessage(
        PB_MessageToServer.create({
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
      this.sendMessage(
        PB_MessageToServer.create({
          doGameAction: {
            gameStateHistorySize: this.myClient!.gameData!.game!.gameStateHistory.size,
            gameAction: { disposeOfShares: { tradeAmount: traded, sellAmount: sold } },
          },
        }),
      );
      this.myRequiredGameAction = null;
    }
  };

  onSharesPurchased = (chains: PB_GameBoardType[], endGame: boolean) => {
    if (this.isConnected()) {
      this.sendMessage(
        PB_MessageToServer.create({
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
    this.socket.binaryType = 'arraybuffer';

    this.socket.onopen = this.onSocketOpen;
    this.socket.onmessage = this.onSocketMessage;
    this.socket.onclose = this.onSocketClose;
  };

  onSocketOpen = () => {
    this.sendMessage(PB_MessageToServer.create({ login: { version: 0, username: this.username, password: this.password } }));
  };

  onSocketMessage = (e: MessageEvent) => {
    const messages = PB_MessagesToClient.fromBinary(new Uint8Array(e.data)).messagesToClient;

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      if (message.fatalError) {
        this.onMessageFatalError(message.fatalError);
      } else if (message.greetings) {
        this.onMessageGreetings(message.greetings);
      } else if (message.clientConnected) {
        this.onMessageClientConnected(message.clientConnected);
      } else if (message.clientDisconnected) {
        this.onMessageClientDisconnected(message.clientDisconnected);
      } else if (message.gameCreated) {
        this.onMessageGameCreated(message.gameCreated);
      } else if (message.clientEnteredGame) {
        this.onMessageClientEnteredGame(message.clientEnteredGame);
      } else if (message.clientExitedGame) {
        this.onMessageClientExitedGame(message.clientExitedGame);
      } else if (message.gameSetupChanged) {
        this.onMessageGameSetupChanged(message.gameSetupChanged);
      } else if (message.gameStarted) {
        this.onMessageGameStarted(message.gameStarted);
      } else if (message.gameActionDone) {
        this.onMessageGameActionDone(message.gameActionDone);
      }
    }

    this.render();
  };

  onMessageFatalError(message: PB_MessageToClient_FatalError) {
    this.errorCode = message.errorCode;
  }

  onMessageGreetings(message: PB_MessageToClient_Greetings) {
    this.clientIDToClient.clear();
    this.userIDToUser.clear();
    this.gameIDToGameData.clear();
    this.gameDisplayNumberToGameData.clear();

    const games = message.games;
    for (let i = 0; i < games.length; i++) {
      const gamePB = games[i];

      const gameData = new GameData(gamePB.gameId, gamePB.gameDisplayNumber, this);

      this.gameIDToGameData.set(gamePB.gameId, gameData);
      this.gameDisplayNumberToGameData.set(gamePB.gameDisplayNumber, gameData);
    }

    const users = message.users;
    for (let i = 0; i < users.length; i++) {
      const userPB = users[i];

      const user = new User(userPB.userId, userPB.username);
      this.userIDToUser.set(userPB.userId, user);

      const clients = userPB.clients;
      for (let j = 0; j < clients.length; j++) {
        const clientPB = clients[j];

        const client = new Client(clientPB.clientId, user);
        user.clients.add(client);
        if (clientPB.gameDisplayNumber !== 0) {
          const gameData = this.gameDisplayNumberToGameData.get(clientPB.gameDisplayNumber)!;
          client.gameData = gameData;
          gameData.clients.add(client);
        }
        this.clientIDToClient.set(clientPB.clientId, client);
      }
    }

    this.myClient = this.clientIDToClient.get(message.clientId)!;
    const myUserID = this.myClient!.user.id;

    for (let i = 0; i < games.length; i++) {
      const gamePB = games[i];

      const gameData = this.gameIDToGameData.get(gamePB.gameId)!;

      if (gamePB.gameStates.length === 0) {
        gameData.gameSetup = GameSetup.fromGameData(gamePB, this.getUsernameForUserID);

        const positions = gamePB.positions;
        for (let j = 0; j < positions.length; j++) {
          const userID = positions[j].userId;
          if (userID !== 0) {
            this.userIDToUser.get(userID)!.numGames++;
          }
        }
      } else {
        const userIDs: number[] = [];
        const usernames: string[] = [];
        let hostUserID = 0;

        const positions = gamePB.positions;
        for (let j = 0; j < positions.length; j++) {
          const position = positions[j];

          userIDs.push(position.userId);

          this.userIDToUser.get(position.userId)!.numGames++;
          usernames.push(this.getUsernameForUserID(position.userId));

          if (position.isHost) {
            hostUserID = position.userId;
          }
        }

        gameData.game = new Game(gamePB.gameMode, gamePB.playerArrangementMode, [], List(userIDs), List(usernames), hostUserID, myUserID);

        const gameStates = gamePB.gameStates;
        for (let j = 0; j < gameStates.length; j++) {
          gameData.game.processGameState(gameStates[j]);
        }
      }
    }

    this.setPage(
      this.myClient.gameData !== null ? (this.myClient.gameData.gameSetup ? ClientManagerPage.GameSetup : ClientManagerPage.Game) : ClientManagerPage.Lobby,
    );
  }

  onMessageClientConnected(message: PB_MessageToClient_ClientConnected) {
    let user: User;
    if (message.username !== '') {
      user = new User(message.userId, message.username);
      this.userIDToUser.set(message.userId, user);
    } else {
      user = this.userIDToUser.get(message.userId)!;
    }

    const client = new Client(message.clientId, user);
    user.clients.add(client);
    this.clientIDToClient.set(message.clientId, client);
  }

  onMessageClientDisconnected(message: PB_MessageToClient_ClientDisconnected) {
    const client = this.clientIDToClient.get(message.clientId)!;
    const user = client.user;

    this.clientIDToClient.delete(message.clientId);
    user.clients.delete(client);
    this.deleteUserIfItDoesNotHaveReferences(user);
  }

  onMessageGameCreated(message: PB_MessageToClient_GameCreated) {
    const hostClient = this.clientIDToClient.get(message.hostClientId)!;

    const gameData = new GameData(message.gameId, message.gameDisplayNumber, this);
    gameData.gameSetup = new GameSetup(message.gameMode, PB_PlayerArrangementMode.RANDOM_ORDER, hostClient.user.id, this.getUsernameForUserID);

    hostClient.user.numGames++;

    this.gameIDToGameData.set(message.gameId, gameData);
    this.gameDisplayNumberToGameData.set(message.gameDisplayNumber, gameData);
  }

  onMessageClientEnteredGame(message: PB_MessageToClient_ClientEnteredGame) {
    const client = this.clientIDToClient.get(message.clientId)!;
    const gameData = this.gameDisplayNumberToGameData.get(message.gameDisplayNumber)!;

    client.gameData = gameData;
    gameData.clients.add(client);

    if (client === this.myClient) {
      this.setPage(gameData.gameSetup ? ClientManagerPage.GameSetup : ClientManagerPage.Game);
    }
  }

  onMessageClientExitedGame(message: PB_MessageToClient_ClientExitedGame) {
    const client = this.clientIDToClient.get(message.clientId)!;
    const gameData = client.gameData!;

    client.gameData = null;
    gameData.clients.delete(client);

    if (client === this.myClient) {
      this.setPage(ClientManagerPage.Lobby);
    }
  }

  onMessageGameSetupChanged(message: PB_MessageToClient_GameSetupChanged) {
    const gameSetup = this.gameDisplayNumberToGameData.get(message.gameDisplayNumber)!.gameSetup!;

    const gameSetupChange = message.gameSetupChange!;

    gameSetup.processChange(gameSetupChange);

    if (gameSetupChange.userAdded) {
      this.userIDToUser.get(gameSetupChange.userAdded.userId!)!.numGames++;
    } else if (gameSetupChange.userRemoved || gameSetupChange.userKicked) {
      const userID = gameSetupChange.userRemoved ? gameSetupChange.userRemoved.userId! : gameSetupChange.userKicked!.userId!;
      const user = this.userIDToUser.get(userID)!;
      user.numGames--;
      this.deleteUserIfItDoesNotHaveReferences(user);
    }
  }

  onMessageGameStarted(message: PB_MessageToClient_GameStarted) {
    const gameData = this.gameDisplayNumberToGameData.get(message.gameDisplayNumber)!;
    const gameSetup = gameData.gameSetup!;

    const game = new Game(
      gameSetup.gameMode,
      gameSetup.playerArrangementMode,
      [],
      List(message.userIds),
      List(message.userIds.map(this.getUsernameForUserID)),
      gameSetup.hostUserID,
      this.myClient!.user.id,
    );

    gameData.gameSetup = null;
    gameData.game = game;

    if (this.myClient!.gameData === gameData) {
      this.setPage(ClientManagerPage.Game);
    }
  }

  onMessageGameActionDone(message: PB_MessageToClient_GameActionDone) {
    const gameData = this.gameDisplayNumberToGameData.get(message.gameDisplayNumber)!;
    const game = gameData.game!;

    game.processGameState(message.gameState!);

    if (this.myClient!.gameData === gameData) {
      this.updateMyRequiredGameAction();
    }
  }

  onSocketClose = () => {
    this.socket = null;

    if (this.errorCode !== null) {
      this.setPage(ClientManagerPage.Login);
    } else if (this.page === ClientManagerPage.Connecting) {
      this.errorCode = PB_ErrorCode.COULD_NOT_CONNECT;
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

  sendMessage(message: PB_MessageToServer) {
    this.socket?.send(PB_MessageToServer.toBinary(message));
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
      this.clientManager.sendMessage(PB_MessageToServer.create({ enterGame: { gameDisplayNumber: this.displayNumber } }));
    }
  };
}

const chainSelectionGameActionEnumToGameActionString = new Map([
  [GameActionEnum.SelectNewChain, 'selectNewChain'],
  [GameActionEnum.SelectMergerSurvivor, 'selectMergerSurvivor'],
  [GameActionEnum.SelectChainToDisposeOfNext, 'selectChainToDisposeOfNext'],
]);
