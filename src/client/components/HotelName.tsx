import { PB_GameBoardType } from '../../common/pb';
import { gameBoardTypeToCSSClassName, gameBoardTypeToHotelName } from '../helpers';

export function HotelName(props: { chain: PB_GameBoardType }) {
  return (
    <span class={gameBoardTypeToCSSClassName.get(props.chain)}>
      {gameBoardTypeToHotelName.get(props.chain)}
    </span>
  );
}
