import { type PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToHotelName } from '../helpers';
import { gameBoardTypeToCSSClassName } from '../styleHelpers';

export function HotelName(props: { chain: PB_GameBoardType }) {
  return (
    <span class={gameBoardTypeToCSSClassName.get(props.chain)}>
      {gameBoardTypeToHotelName.get(props.chain)}
    </span>
  );
}
