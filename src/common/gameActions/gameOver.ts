import { GameAction } from '../enums';
import { UserInputError } from '../error';
import { Game } from '../game';
import { ActionBase } from './base';

const hackSoTestsWorkWithTypeScript2Dot9Dot1 = GameAction.GameOver;

export class ActionGameOver extends ActionBase {
    constructor(game: Game, playerID: number) {
        super(game, playerID, hackSoTestsWorkWithTypeScript2Dot9Dot1);
    }

    prepare() {
        return null;
    }

    execute(parameters: any[]): ActionBase[] {
        throw new UserInputError('cannot make any more moves');
    }
}
