import { defaultTileRack, defaultTileRackTypes } from '../defaults';
import { GameAction, GameBoardType, GameHistoryMessage } from '../enums';
import { UserInputError } from '../error';
import { Game, GameHistoryMessageData } from '../game';
import { getNeighboringTiles } from '../helpers';
import { ActionBase } from './base';
import { ActionSelectMergerSurvivor } from './selectMergerSurvivor';
import { ActionSelectNewChain } from './selectNewChain';

export class ActionPlayTile extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.PlayTile);
    }

    prepare() {
        const moveData = this.game.getCurrentMoveData();

        moveData.addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.TurnBegan, this.playerID, []));

        let hasAPlayableTile = false;
        let tileRackTypes = this.game.tileRackTypes.get(this.playerID, defaultTileRackTypes);
        for (let i = 0; i < 6; i++) {
            let tileType = tileRackTypes.get(i, 0);
            if (tileType !== null && tileType !== GameBoardType.CantPlayNow && tileType !== GameBoardType.CantPlayEver) {
                hasAPlayableTile = true;
                break;
            }
        }

        if (hasAPlayableTile) {
            this.game.numTurnsWithoutPlayedTiles = 0;
            return null;
        } else {
            this.game.numTurnsWithoutPlayedTiles++;
            moveData.addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.HasNoPlayableTile, this.playerID, []));
            return [];
        }
    }

    execute(parameters: any[]) {
        if (parameters.length !== 1) {
            throw new UserInputError('did not get exactly 1 parameter');
        }
        const tile: number = parameters[0];
        if (!Number.isInteger(tile)) {
            throw new UserInputError('parameter is not an integer');
        }
        const tileRackIndex = this.game.tileRacks.get(this.playerID, defaultTileRack).indexOf(tile);
        if (tileRackIndex === -1) {
            throw new UserInputError('player does not have given tile');
        }
        const tileType = this.game.tileRackTypes.get(this.playerID, defaultTileRackTypes).get(tileRackIndex, GameBoardType.Luxor);

        let response: ActionBase[] = [];
        if (tileType !== null && tileType <= GameBoardType.Imperial) {
            this.game.fillCells(tile, tileType);
            this.game.setChainSize(tileType, this.game.gameBoardTypeCounts[tileType]);
        } else if (tileType === GameBoardType.WillPutLonelyTileDown || tileType === GameBoardType.HaveNeighboringTileToo) {
            this.game.getCurrentMoveData().addNewGloballyKnownTile(tile, this.playerID);
            this.game.setGameBoardPosition(tile, GameBoardType.NothingYet);
        } else if (tileType === GameBoardType.WillFormNewChain) {
            let availableChains: GameBoardType[] = [];
            let scoreBoardChainSize = this.game.scoreBoardChainSize;
            for (let type = 0; type < scoreBoardChainSize.size; type++) {
                if (scoreBoardChainSize.get(type, 0) === 0) {
                    availableChains.push(type);
                }
            }
            response = [new ActionSelectNewChain(this.game, this.playerID, availableChains, tile)];
        } else if (tileType === GameBoardType.WillMergeChains) {
            response = [new ActionSelectMergerSurvivor(this.game, this.playerID, this.getMergedChains(tile), tile)];
        } else {
            throw new UserInputError('cannot play given tile');
        }

        this.game.removeTile(this.playerID, tileRackIndex);

        this.game.getCurrentMoveData().addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.PlayedTile, this.playerID, [tile]));

        return response;
    }

    protected getMergedChains(tile: number) {
        let chains: GameBoardType[] = [];
        const neighboringTiles = getNeighboringTiles(tile);
        for (let i = 0; i < neighboringTiles.length; i++) {
            const type = this.game.gameBoard.get(neighboringTiles[i], 0);
            if (type <= GameBoardType.Imperial && chains.indexOf(type) === -1) {
                chains.push(type);
            }
        }

        chains.sort((a, b) => (a < b ? -1 : 1));

        return chains;
    }
}
