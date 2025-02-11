import { type PB_GameBoardType } from '../../common/pb.js';
import { gameBoardTypeToHotelName } from '../helpers.js';
import { gameBoardTypeToCSSClassName } from '../styleHelpers.js';

export function HotelName(props: { chain: PB_GameBoardType }) {
  return (
    <span class={gameBoardTypeToCSSClassName.get(props.chain)}>
      {gameBoardTypeToHotelName.get(props.chain)}
    </span>
  );
}
