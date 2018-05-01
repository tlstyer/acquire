import { mount } from 'enzyme';
import { List } from 'immutable';
import * as React from 'react';
import * as renderer from 'react-test-renderer';

import { configureEnzyme } from '../configureEnzyme';
import { getDummyGameForGetGameHistory } from '../exampleData';
import { GameHistory } from './GameHistory';

configureEnzyme();

describe('GameHistory', () => {
    const onMoveClicked = jest.fn();
    const game = getDummyGameForGetGameHistory();
    const jsx = (
        <GameHistory
            usernames={List(['Tim', 'Rita', 'Dad', 'Mom'])}
            moveDataHistory={game.moveDataHistory}
            selectedMove={1}
            width={600}
            height={300}
            onMoveClicked={onMoveClicked}
        />
    );

    it('renders correctly', () => {
        const component = renderer.create(jsx);
        const tree = component.toJSON();
        expect(tree).toMatchSnapshot();
    });

    it('works correctly', () => {
        const gameHistory = mount(jsx);

        gameHistory
            .find('.move')
            .at(3)
            .simulate('click');

        expect(onMoveClicked.mock.calls.length).toBe(1);
        expect(onMoveClicked.mock.calls[0]).toEqual([3]);
    });
});
