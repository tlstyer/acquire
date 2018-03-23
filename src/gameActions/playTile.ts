import { ActionBase } from './base';
import { GameAction } from '../enums';
import { Game } from '../game';

export class ActionPlayTile extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, GameAction.PlayTile);
    }

    prepare() {
        return null;
    }

    execute(parameters: any[]) {
        return [];
    }
}
