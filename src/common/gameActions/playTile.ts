import { GameActionEnum, GameHistoryMessageEnum } from '../enums';
import { UserInputError } from '../error';
import type { Game } from '../game';
import { neighboringTilesLookup } from '../helpers';
import { PB_GameAction, PB_GameBoardType } from '../pb';
import { ActionBase } from './base';
import { ActionSelectMergerSurvivor } from './selectMergerSurvivor';
import { ActionSelectNewChain } from './selectNewChain';

export class ActionPlayTile extends ActionBase {
  constructor(game: Game, playerID: number) {
    super(game, playerID, GameActionEnum.PlayTile);
  }

  prepare() {
    const gameState = this.game.getCurrentGameState();

    this.game.turnPlayerID = this.playerID;

    gameState.addGameHistoryMessage(GameHistoryMessageEnum.TurnBegan, this.playerID, []);

    let hasAPlayableTile = false;
    if (this.playerID === this.game.playerIDWithPlayableTile) {
      hasAPlayableTile = true;
    } else {
      const tileRackTypes = this.game.tileRackTypes[this.playerID];
      for (let i = 0; i < 6; i++) {
        const tileType = tileRackTypes[i];
        if (tileType !== null && tileType !== PB_GameBoardType.CANT_PLAY_NOW && tileType !== PB_GameBoardType.CANT_PLAY_EVER) {
          hasAPlayableTile = true;
          break;
        }
      }
    }

    if (hasAPlayableTile) {
      this.game.numTurnsWithoutPlayedTiles = 0;
      return null;
    } else {
      this.game.numTurnsWithoutPlayedTiles++;
      gameState.addGameHistoryMessage(GameHistoryMessageEnum.HasNoPlayableTile, this.playerID, []);
      return [];
    }
  }

  execute(gameAction: PB_GameAction) {
    if (!gameAction.playTile) {
      throw new UserInputError('playTile game action not provided');
    }
    const tile = gameAction.playTile.tile;
    if (tile < 0 || tile >= 108) {
      throw new UserInputError('tile is not a valid tile');
    }
    const tileRackIndex = this.game.tileRacks[this.playerID].indexOf(tile);
    if (tileRackIndex === -1) {
      throw new UserInputError('player does not have given tile');
    }
    const tileType = this.game.tileRackTypes[this.playerID][tileRackIndex];

    let response: ActionBase[] = [];
    if (tileType !== null && tileType <= PB_GameBoardType.IMPERIAL) {
      this.game.fillCells(tile, tileType);
      this.game.setChainSize(tileType, this.game.gameBoardTypeCounts[tileType]);
    } else if (tileType === PB_GameBoardType.WILL_PUT_LONELY_TILE_DOWN || tileType === PB_GameBoardType.HAVE_NEIGHBORING_TILE_TOO) {
      this.game.setGameBoardPosition(tile, PB_GameBoardType.NOTHING_YET);
    } else if (tileType === PB_GameBoardType.WILL_FORM_NEW_CHAIN) {
      const availableChains: PB_GameBoardType[] = [];
      const scoreBoardChainSize = this.game.scoreBoardChainSize;
      for (let type = 0; type < scoreBoardChainSize.length; type++) {
        if (scoreBoardChainSize[type] === 0) {
          availableChains.push(type);
        }
      }
      response = [new ActionSelectNewChain(this.game, this.playerID, availableChains, tile)];
    } else if (tileType === PB_GameBoardType.WILL_MERGE_CHAINS) {
      response = [new ActionSelectMergerSurvivor(this.game, this.playerID, this.getMergedChains(tile), tile)];
    } else {
      throw new UserInputError('cannot play given tile');
    }

    this.game.removeTile(this.playerID, tileRackIndex);

    this.game.getCurrentGameState().addGameHistoryMessage(GameHistoryMessageEnum.PlayedTile, this.playerID, [tile]);

    return response;
  }

  protected getMergedChains(tile: number) {
    const chains: PB_GameBoardType[] = [];
    const neighboringTiles = neighboringTilesLookup[tile];
    for (let i = 0; i < neighboringTiles.length; i++) {
      const neighboringTile = neighboringTiles[i];

      const y = neighboringTile % 9;
      const x = (neighboringTile - y) / 9;
      const type = this.game.gameBoard[y][x];

      if (type <= PB_GameBoardType.IMPERIAL && chains.indexOf(type) === -1) {
        chains.push(type);
      }
    }

    chains.sort((a, b) => a - b);

    return chains;
  }
}
