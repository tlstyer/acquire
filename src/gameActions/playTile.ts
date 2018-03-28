import { ActionBase } from './base';
import { defaultTileRack, defaultTileRackTypes } from '../defaults';
import { GameAction, GameBoardType, GameHistoryMessage } from '../enums';
import { UserInputError } from '../error';
import { Game, GameHistoryMessageData } from '../game';
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
        const tileType = this.game.tileRackTypes.getIn([this.playerID, tileRackIndex], 0);

        let response: ActionBase[] = [];
        switch (tileType) {
            case GameBoardType.WillPutLonelyTileDown:
            case GameBoardType.HaveNeighboringTileToo:
                this.game.getCurrentMoveData().addNewGloballyKnownTile(tile, this.playerID);
                this.game.setGameBoardPosition(tile, GameBoardType.NothingYet);
                break;
            case GameBoardType.WillFormNewChain:
                let availableChains: GameBoardType[] = [];
                let scoreBoardChainSize = this.game.scoreBoardChainSize;
                for (let type = 0; type < scoreBoardChainSize.size; type++) {
                    if (scoreBoardChainSize.get(type, 0) === 0) {
                        availableChains.push(type);
                    }
                }
                response = [new ActionSelectNewChain(this.game, this.playerID, availableChains, tile)];
                break;
            default:
                throw new UserInputError('unhandled tile type');
        }

        this.game.removeTile(this.playerID, tileRackIndex);

        this.game.getCurrentMoveData().addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.PlayedTile, this.playerID, [tile]));

        return response;
    }
}
