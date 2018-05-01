import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { getExampleNextGameActionsArray } from '../exampleData';
import { GameState } from './GameState';

describe('GameState', () => {
    it('renders correctly', () => {
        const nextGameActionsArray = getExampleNextGameActionsArray();

        const component = renderer.create(
            <div>
                {nextGameActionsArray.map((nextGameAction, i) => (
                    <GameState key={i} usernames={nextGameAction.game.usernames} nextGameAction={nextGameAction} width={500} height={22} />
                ))}
            </div>,
        );
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
