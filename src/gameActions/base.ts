import { Game } from '../game';
import { GameAction } from '../enums';

export abstract class ActionBase {
    constructor(public game: Game, public playerID: number, public gameAction: GameAction) {}

    abstract prepare(): ActionBase[] | null;

    abstract execute(parameters: any[]): ActionBase[] | null;
}
