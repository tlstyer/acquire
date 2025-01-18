import { createEffect, createSelector, createSignal, For, onMount } from 'solid-js';
import { GameState } from '../../common/gameState';
import { ProcessMyKeyboardEventRef } from '../myKeyboardEvents';
import styles from './GameHistory.module.css';
import { GameHistoryMessageUI } from './GameHistoryMessageUI';

export function GameHistory(props: {
  ref: (ref: ProcessMyKeyboardEventRef) => void;
  usernames: string[];
  gameStateHistory: GameState[];
  onMoveSelected: (index: number) => void;
}) {
  const lastMoveIndex = () => props.gameStateHistory.length - 1;
  const [selectedMoveIndex, setSelectedMoveIndex] = createSignal(-1);
  let lastSelectedMoveIndex = -1;

  const isMoveSelected = createSelector(selectedMoveIndex);

  let movesElement: HTMLDivElement | undefined;
  const moveElements: (HTMLDivElement | undefined)[] = []; // TODO: maybe should reset this when props.gameStateHistory becomes shorter than before

  createEffect(() => {
    if (selectedMoveIndex() !== lastSelectedMoveIndex) {
      const selectedMoveElement = moveElements[selectedMoveIndex()];

      if (movesElement && selectedMoveElement) {
        // scroll so that selected move element is in view

        const parentScrollTop = movesElement.scrollTop;
        const parentScrollBottom = parentScrollTop + movesElement.clientHeight;

        const selectedMoveRelativeOffsetTop =
          selectedMoveElement.offsetTop - movesElement.offsetTop;
        const selectedMoveRelativeOffsetBottom =
          selectedMoveRelativeOffsetTop + selectedMoveElement.clientHeight;

        if (
          selectedMoveRelativeOffsetTop < parentScrollTop ||
          selectedMoveElement.clientHeight > movesElement.clientHeight
        ) {
          movesElement.scrollTop = selectedMoveRelativeOffsetTop;
        } else if (selectedMoveRelativeOffsetBottom > parentScrollBottom) {
          movesElement.scrollTop = selectedMoveRelativeOffsetBottom - movesElement.clientHeight;
        }
      }

      lastSelectedMoveIndex = selectedMoveIndex();
    }
  });

  // eslint-disable-next-line solid/reactivity
  onMoveSelected(lastMoveIndex());

  function onMoveSelected(moveIndex: number) {
    setSelectedMoveIndex(moveIndex);
    props.onMoveSelected(moveIndex);
  }

  let fastBackwardButton!: HTMLButtonElement;
  let stepBackwardButton!: HTMLButtonElement;
  let stepForwardButton!: HTMLButtonElement;
  let fastForwardButton!: HTMLButtonElement;
  onMount(() => {
    props.ref({
      processMyKeyboardEvent: (myKeyboardEvent) => {
        if (myKeyboardEvent.modifiers === 0) {
          if (myKeyboardEvent.code === 'ArrowUp' || myKeyboardEvent.code === 'Home') {
            fastBackwardButton.focus();
            fastBackwardButton.click();
          } else if (myKeyboardEvent.code === 'ArrowLeft') {
            stepBackwardButton.focus();
            stepBackwardButton.click();
          } else if (myKeyboardEvent.code === 'ArrowRight') {
            stepForwardButton.focus();
            stepForwardButton.click();
          } else if (myKeyboardEvent.code === 'ArrowDown' || myKeyboardEvent.code === 'End') {
            fastForwardButton.focus();
            fastForwardButton.click();
          }
        }
      },
    });
  });

  return (
    <div class={styles.root}>
      <div>
        <button
          ref={fastBackwardButton}
          onClick={() => onMoveSelected(0)}
          disabled={selectedMoveIndex() === 0}
        >
          {/* adapted from https://www.svgrepo.com/svg/391832/fast-backward */}
          <svg viewBox="0 0 120 120">
            <path d="M0,120V0h20v55L70,5v50l50-50v110L70,65v50L20,65v55H0z" />
          </svg>
        </button>{' '}
        <button
          ref={stepBackwardButton}
          onClick={() => onMoveSelected(Math.max(selectedMoveIndex() - 1, 0))}
          disabled={selectedMoveIndex() === 0}
        >
          {/* adapted from https://www.svgrepo.com/svg/391700/step-backward */}
          <svg viewBox="0 0 120 120">
            <path d="M25,120V0h20v55L95,5v110L45,65v55H25z" />
          </svg>
        </button>{' '}
        <button
          ref={stepForwardButton}
          onClick={() => onMoveSelected(Math.min(selectedMoveIndex() + 1, lastMoveIndex()))}
          disabled={selectedMoveIndex() === lastMoveIndex()}
        >
          {/* adapted from https://www.svgrepo.com/svg/391701/step-forward */}
          <svg viewBox="0 0 120 120">
            <path d="M95,0v120H75V65l-50,50V5l50,50V0H95z" />
          </svg>
        </button>{' '}
        <button
          ref={fastForwardButton}
          onClick={() => onMoveSelected(lastMoveIndex())}
          disabled={selectedMoveIndex() === lastMoveIndex()}
        >
          {/* adapted from https://www.svgrepo.com/svg/391834/fast-forward */}
          <svg viewBox="0 0 120 120">
            <path d="M120,0v120h-20V65l-50,50V65L0,115V5l50,50V5l50,50V0H120z" />
          </svg>
        </button>
      </div>
      <div class={styles.moves} ref={movesElement}>
        <For each={props.gameStateHistory}>
          {(gameState, moveIndex) => (
            <div
              classList={{
                [styles.move]: true,
                [styles.selected]: isMoveSelected(moveIndex()),
              }}
              title={
                gameState.timestamp !== null
                  ? new Date(gameState.timestamp).toLocaleString()
                  : undefined
              }
              onClick={() => onMoveSelected(moveIndex())}
              ref={moveElements[moveIndex()]}
            >
              <For each={gameState.gameHistoryMessages}>
                {(gameHistoryMessage) => (
                  <GameHistoryMessageUI
                    usernames={props.usernames}
                    gameHistoryMessage={gameHistoryMessage}
                  />
                )}
              </For>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
