import { For } from 'solid-js';
import { PB_GameMode } from '../../../common/pb';
import { CreateGame } from '../../components/CreateGame';
import { gameModeToString } from '../../helpers';

export function CreateGameExamples() {
  const allProps = [
    { initialGameMode: PB_GameMode.SINGLES_4, onSubmit: onSubmitCreateGame },
    { initialGameMode: PB_GameMode.TEAMS_2_VS_2_VS_2, onSubmit: onSubmitCreateGame },
    { initialGameMode: PB_GameMode.SINGLES_1, onSubmit: onSubmitCreateGame },
  ];

  function onSubmitCreateGame(gameMode: PB_GameMode) {
    console.log(`onSubmitCreateGame: ${gameMode} (${gameModeToString.get(gameMode)})`);
  }

  return (
    <For each={allProps}>
      {(props) => (
        <p>
          <CreateGame initialGameMode={props.initialGameMode} onSubmit={props.onSubmit} />
        </p>
      )}
    </For>
  );
}
