import {
  PB_GameBoardType,
  PB_GameMode,
  PB_MessageToClient_LoginLogout_ResponseCode,
} from '../common/pb.js';

export const allChains = [
  PB_GameBoardType.LUXOR,
  PB_GameBoardType.TOWER,
  PB_GameBoardType.AMERICAN,
  PB_GameBoardType.FESTIVAL,
  PB_GameBoardType.WORLDWIDE,
  PB_GameBoardType.CONTINENTAL,
  PB_GameBoardType.IMPERIAL,
];

export const gameBoardTypeToHotelInitial = new Map([
  [PB_GameBoardType.LUXOR, 'L'],
  [PB_GameBoardType.TOWER, 'T'],
  [PB_GameBoardType.AMERICAN, 'A'],
  [PB_GameBoardType.FESTIVAL, 'F'],
  [PB_GameBoardType.WORLDWIDE, 'W'],
  [PB_GameBoardType.CONTINENTAL, 'C'],
  [PB_GameBoardType.IMPERIAL, 'I'],
]);

export const gameBoardTypeToHotelName = new Map([
  [PB_GameBoardType.LUXOR, 'Luxor'],
  [PB_GameBoardType.TOWER, 'Tower'],
  [PB_GameBoardType.AMERICAN, 'American'],
  [PB_GameBoardType.FESTIVAL, 'Festival'],
  [PB_GameBoardType.WORLDWIDE, 'Worldwide'],
  [PB_GameBoardType.CONTINENTAL, 'Continental'],
  [PB_GameBoardType.IMPERIAL, 'Imperial'],
]);

export enum GameBoardLabelMode {
  Nothing,
  Coordinates,
  HotelInitials,
}

export const allGameModes = [
  PB_GameMode.SINGLES_1,
  PB_GameMode.SINGLES_2,
  PB_GameMode.SINGLES_3,
  PB_GameMode.SINGLES_4,
  PB_GameMode.SINGLES_5,
  PB_GameMode.SINGLES_6,
  PB_GameMode.TEAMS_2_VS_2,
  PB_GameMode.TEAMS_2_VS_2_VS_2,
  PB_GameMode.TEAMS_3_VS_3,
];

export const gameModeToString = new Map([
  [PB_GameMode.SINGLES_1, 'Singles 1'],
  [PB_GameMode.SINGLES_2, 'Singles 2'],
  [PB_GameMode.SINGLES_3, 'Singles 3'],
  [PB_GameMode.SINGLES_4, 'Singles 4'],
  [PB_GameMode.SINGLES_5, 'Singles 5'],
  [PB_GameMode.SINGLES_6, 'Singles 6'],
  [PB_GameMode.TEAMS_2_VS_2, 'Teams 2 vs 2'],
  [PB_GameMode.TEAMS_2_VS_2_VS_2, 'Teams 2 vs 2 vs 2'],
  [PB_GameMode.TEAMS_3_VS_3, 'Teams 3 vs 3'],
]);

export enum GameStatus {
  SETTING_UP,
  IN_PROGRESS,
  COMPLETED,
}

export const gameStatusToString = new Map([
  [GameStatus.SETTING_UP, 'Setting Up'],
  [GameStatus.IN_PROGRESS, 'In Progress'],
  [GameStatus.COMPLETED, 'Completed'],
]);

export const keyboardEventCodeToGameBoardType = new Map([
  // Luxor
  ['KeyL', PB_GameBoardType.LUXOR],
  ['Digit1', PB_GameBoardType.LUXOR],
  ['Numpad1', PB_GameBoardType.LUXOR],
  // Tower
  ['KeyT', PB_GameBoardType.TOWER],
  ['Digit2', PB_GameBoardType.TOWER],
  ['Numpad2', PB_GameBoardType.TOWER],
  // American
  ['KeyA', PB_GameBoardType.AMERICAN],
  ['Digit3', PB_GameBoardType.AMERICAN],
  ['Numpad3', PB_GameBoardType.AMERICAN],
  // Festival
  ['KeyF', PB_GameBoardType.FESTIVAL],
  ['Digit4', PB_GameBoardType.FESTIVAL],
  ['Numpad4', PB_GameBoardType.FESTIVAL],
  // Worldwide
  ['KeyW', PB_GameBoardType.WORLDWIDE],
  ['Digit5', PB_GameBoardType.WORLDWIDE],
  ['Numpad5', PB_GameBoardType.WORLDWIDE],
  // Continental
  ['KeyC', PB_GameBoardType.CONTINENTAL],
  ['Digit6', PB_GameBoardType.CONTINENTAL],
  ['Numpad6', PB_GameBoardType.CONTINENTAL],
  // Imperial
  ['KeyI', PB_GameBoardType.IMPERIAL],
  ['Digit7', PB_GameBoardType.IMPERIAL],
  ['Numpad7', PB_GameBoardType.IMPERIAL],
]);

export const loginLogoutResponseCodeToString = new Map<
  PB_MessageToClient_LoginLogout_ResponseCode,
  string
>([
  [PB_MessageToClient_LoginLogout_ResponseCode.SUCCESS, 'Success!'],
  [
    PB_MessageToClient_LoginLogout_ResponseCode.GENERIC_ERROR,
    'An error occurred during the processing of your request.',
  ],
  [PB_MessageToClient_LoginLogout_ResponseCode.USER_NOT_FOUND, 'User not found.'],
  [PB_MessageToClient_LoginLogout_ResponseCode.INCORRECT_PASSWORD, 'Password is incorrect.'],
  [PB_MessageToClient_LoginLogout_ResponseCode.INVALID_TOKEN, 'Invalid token.'],
  [
    PB_MessageToClient_LoginLogout_ResponseCode.INVALID_USERNAME,
    'Invalid username. Username must have between 1 and 32 ASCII characters.',
  ],
  [
    PB_MessageToClient_LoginLogout_ResponseCode.INVALID_PASSWORD,
    'Invalid password. Password must have at least 8 characters.',
  ],
  [PB_MessageToClient_LoginLogout_ResponseCode.USER_EXISTS, 'User already exists.'],
]);

export enum DialogType {
  Login,
  CreateUser,
  Logout,
  Settings,
}
