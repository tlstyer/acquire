import * as React from 'react';
import * as renderer from 'react-test-renderer';
import { getExampleNextGameActionsArray } from '../exampleData';
import { GameState } from './GameState';

test('renders correctly', () => {
  const nextGameActionsArray = getExampleNextGameActionsArray();

  const component = renderer.create(
    <div>
      {nextGameActionsArray.map((nextGameAction, i) => (
        <GameState key={i} usernames={nextGameAction.game.usernames} nextGameAction={nextGameAction} />
      ))}
    </div>,
  );
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
