import { createSignal, For } from 'solid-js';
import { PB_GameMode } from '../../common/pb';
import { allGameModes, gameModeToString } from '../helpers';

export function CreateGame(props: {
  initialGameMode: PB_GameMode;
  onSubmit: (gameMode: PB_GameMode) => void;
}) {
  const [selectedGameMode, setSelectedGameMode] = createSignal(props.initialGameMode);

  return (
    <div>
      Mode:{' '}
      <select
        value={selectedGameMode()}
        onInput={(e) => setSelectedGameMode(parseInt(e.currentTarget.value, 10))}
      >
        <For each={allGameModes}>
          {(gameMode) => <option value={gameMode}>{gameModeToString.get(gameMode)}</option>}
        </For>
      </select>{' '}
      <input type="button" value="Create Game" onClick={() => props.onSubmit(selectedGameMode())} />
    </div>
  );
}
