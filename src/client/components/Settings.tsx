import { type Client } from '../client';
import { GameBoardLabelMode } from '../helpers';
import styles from './Login.module.css';

export function Settings(props: { client: Client }) {
  return (
    <div class={styles.root}>
      <div>
        <label>
          Color Scheme:{' '}
          <select
            value={props.client.signals.colorScheme()}
            onInput={(e) => props.client.setColorScheme(e.currentTarget.value)}
          >
            <option value="netacquire">NetAcquire</option>
            <option value="white">White</option>
          </select>
        </label>
      </div>
      <div>
        <label>
          Game Board Label Mode:{' '}
          <select
            value={props.client.signals.gameBoardLabelMode()}
            onInput={(e) => props.client.setGameBoardLabelMode(parseInt(e.currentTarget.value, 10))}
          >
            <option value={GameBoardLabelMode.Nothing}>Nothing</option>
            <option value={GameBoardLabelMode.Coordinates}>Coordinates</option>
            <option value={GameBoardLabelMode.HotelInitials}>Hotel Initials</option>
          </select>
        </label>
      </div>
    </div>
  );
}
