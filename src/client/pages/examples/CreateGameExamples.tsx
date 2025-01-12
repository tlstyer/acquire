import { PB_GameMode } from '../../../common/pb';
import { CreateGame } from '../../components/CreateGame';
import { gameModeToString } from '../../helpers';

export function CreateGameExamples() {
  function onSubmitCreateGame(gameMode: PB_GameMode) {
    console.log(`onSubmitCreateGame: ${gameMode} (${gameModeToString.get(gameMode)})`);
  }

  return (
    <>
      <p>
        <CreateGame initialGameMode={PB_GameMode.SINGLES_4} onSubmit={onSubmitCreateGame} />
      </p>
      <p>
        <CreateGame initialGameMode={PB_GameMode.TEAMS_2_VS_2_VS_2} onSubmit={onSubmitCreateGame} />
      </p>
      <p>
        <CreateGame initialGameMode={PB_GameMode.SINGLES_1} onSubmit={onSubmitCreateGame} />
      </p>
    </>
  );
}
