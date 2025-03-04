import { type PB_GameBoardType } from '../../common/pb.js';
import { gameBoardTypeToHotelName } from '../helpers.js';
import { gameBoardTypeToCSSClassName } from '../styleHelpers.js';
import styles from './HotelName.module.css';

export function HotelName(props: { chain: PB_GameBoardType }) {
  return (
    <span
      classList={{
        [styles.root]: true,
        [gameBoardTypeToCSSClassName.get(props.chain)!]: true,
      }}
    >
      {gameBoardTypeToHotelName.get(props.chain)}
    </span>
  );
}
