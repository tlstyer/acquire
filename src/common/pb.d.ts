import * as $protobuf from "protobufjs";
/** ErrorCode enum. */
export enum ErrorCode {
    NOT_USING_LATEST_VERSION = 0,
    INTERNAL_SERVER_ERROR = 1,
    INVALID_MESSAGE_FORMAT = 2,
    INVALID_USERNAME = 3,
    MISSING_PASSWORD = 4,
    PROVIDED_PASSWORD = 5,
    INCORRECT_PASSWORD = 6,
    INVALID_MESSAGE = 7,
    COULD_NOT_CONNECT = 8
}

/** GameBoardType enum. */
export enum GameBoardType {
    LUXOR = 0,
    TOWER = 1,
    AMERICAN = 2,
    FESTIVAL = 3,
    WORLDWIDE = 4,
    CONTINENTAL = 5,
    IMPERIAL = 6,
    NOTHING = 7,
    NOTHING_YET = 8,
    CANT_PLAY_EVER = 9,
    I_HAVE_THIS = 10,
    WILL_PUT_LONELY_TILE_DOWN = 11,
    HAVE_NEIGHBORING_TILE_TOO = 12,
    WILL_FORM_NEW_CHAIN = 13,
    WILL_MERGE_CHAINS = 14,
    CANT_PLAY_NOW = 15,
    MAX = 16
}

/** GameMode enum. */
export enum GameMode {
    SINGLES_1 = 1,
    SINGLES_2 = 2,
    SINGLES_3 = 3,
    SINGLES_4 = 4,
    SINGLES_5 = 5,
    SINGLES_6 = 6,
    TEAMS_2_VS_2 = 7,
    TEAMS_2_VS_2_VS_2 = 8,
    TEAMS_3_VS_3 = 9
}

/** PlayerArrangementMode enum. */
export enum PlayerArrangementMode {
    VERSION_1 = 0,
    RANDOM_ORDER = 1,
    EXACT_ORDER = 2,
    SPECIFY_TEAMS = 3
}
