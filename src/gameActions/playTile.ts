import { ActionBase } from './base';
import { GameAction, GameHistoryMessage } from '../enums';
import { Game, GameHistoryMessageData } from '../game';

export class ActionPlayTile extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.PlayTile);
    }

    prepare() {
        const moveData = this.game.getCurrentMoveData();

        moveData.addGameHistoryMessage(new GameHistoryMessageData(GameHistoryMessage.TurnBegan, this.playerID, []));

        return null;
    }

    execute(parameters: any[]) {
        return [];
    }
}
