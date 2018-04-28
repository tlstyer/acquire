import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { getExampleNextGameActionsArray, getUsernamesForExampleNextGameActionsArray } from '../exampleData';
import { GameState } from './GameState';

describe('GameState', () => {
    it('renders correctly', () => {
        const gameStateUsernames = getUsernamesForExampleNextGameActionsArray();
        const nextGameActionsArray = getExampleNextGameActionsArray();

        const component = renderer.create(
            <div>
                {nextGameActionsArray.map((nextGameAction, i) => (
                    <GameState key={i} usernames={gameStateUsernames} nextGameAction={nextGameAction} width={500} height={22} />
                ))}
            </div>,
        );
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });
});
