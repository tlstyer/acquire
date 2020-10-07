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

/** Represents a GameSetupData. */
export class GameSetupData implements IGameSetupData {

    /**
     * Constructs a new GameSetupData.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGameSetupData);

    /** GameSetupData gameMode. */
    public gameMode: GameMode;

    /** GameSetupData playerArrangementMode. */
    public playerArrangementMode: PlayerArrangementMode;

    /** GameSetupData positions. */
    public positions: GameSetupData.IPosition[];

    /**
     * Creates a new GameSetupData instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GameSetupData instance
     */
    public static create(properties?: IGameSetupData): GameSetupData;

    /**
     * Encodes the specified GameSetupData message. Does not implicitly {@link GameSetupData.verify|verify} messages.
     * @param message GameSetupData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGameSetupData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GameSetupData message, length delimited. Does not implicitly {@link GameSetupData.verify|verify} messages.
     * @param message GameSetupData message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGameSetupData, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GameSetupData message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GameSetupData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupData;

    /**
     * Decodes a GameSetupData message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GameSetupData
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupData;

    /**
     * Verifies a GameSetupData message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GameSetupData message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GameSetupData
     */
    public static fromObject(object: { [k: string]: any }): GameSetupData;

    /**
     * Creates a plain object from a GameSetupData message. Also converts values to other types if specified.
     * @param message GameSetupData
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GameSetupData, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GameSetupData to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace GameSetupData {

    /** Properties of a Position. */
    interface IPosition {

        /** Position userId */
        userId?: (number|null);

        /** Position isHost */
        isHost?: (boolean|null);

        /** Position approvesOfGameSetup */
        approvesOfGameSetup?: (boolean|null);
    }

    /** Represents a Position. */
    class Position implements IPosition {

        /**
         * Constructs a new Position.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupData.IPosition);

        /** Position userId. */
        public userId: number;

        /** Position isHost. */
        public isHost: boolean;

        /** Position approvesOfGameSetup. */
        public approvesOfGameSetup: boolean;

        /**
         * Creates a new Position instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Position instance
         */
        public static create(properties?: GameSetupData.IPosition): GameSetupData.Position;

        /**
         * Encodes the specified Position message. Does not implicitly {@link GameSetupData.Position.verify|verify} messages.
         * @param message Position message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupData.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Position message, length delimited. Does not implicitly {@link GameSetupData.Position.verify|verify} messages.
         * @param message Position message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupData.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Position message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupData.Position;

        /**
         * Decodes a Position message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Position
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupData.Position;

        /**
         * Verifies a Position message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Position message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Position
         */
        public static fromObject(object: { [k: string]: any }): GameSetupData.Position;

        /**
         * Creates a plain object from a Position message. Also converts values to other types if specified.
         * @param message Position
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupData.Position, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Position to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Represents a GameSetupAction. */
export class GameSetupAction implements IGameSetupAction {

    /**
     * Constructs a new GameSetupAction.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGameSetupAction);

    /** GameSetupAction joinGame. */
    public joinGame?: (GameSetupAction.IJoinGame|null);

    /** GameSetupAction unjoinGame. */
    public unjoinGame?: (GameSetupAction.IUnjoinGame|null);

    /** GameSetupAction approveOfGameSetup. */
    public approveOfGameSetup?: (GameSetupAction.IApproveOfGameSetup|null);

    /** GameSetupAction changeGameMode. */
    public changeGameMode?: (GameSetupAction.IChangeGameMode|null);

    /** GameSetupAction changePlayerArrangementMode. */
    public changePlayerArrangementMode?: (GameSetupAction.IChangePlayerArrangementMode|null);

    /** GameSetupAction swapPositions. */
    public swapPositions?: (GameSetupAction.ISwapPositions|null);

    /** GameSetupAction kickUser. */
    public kickUser?: (GameSetupAction.IKickUser|null);

    /**
     * Creates a new GameSetupAction instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GameSetupAction instance
     */
    public static create(properties?: IGameSetupAction): GameSetupAction;

    /**
     * Encodes the specified GameSetupAction message. Does not implicitly {@link GameSetupAction.verify|verify} messages.
     * @param message GameSetupAction message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGameSetupAction, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GameSetupAction message, length delimited. Does not implicitly {@link GameSetupAction.verify|verify} messages.
     * @param message GameSetupAction message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGameSetupAction, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GameSetupAction message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GameSetupAction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction;

    /**
     * Decodes a GameSetupAction message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GameSetupAction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction;

    /**
     * Verifies a GameSetupAction message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GameSetupAction message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GameSetupAction
     */
    public static fromObject(object: { [k: string]: any }): GameSetupAction;

    /**
     * Creates a plain object from a GameSetupAction message. Also converts values to other types if specified.
     * @param message GameSetupAction
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GameSetupAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GameSetupAction to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace GameSetupAction {

    /** Properties of a JoinGame. */
    interface IJoinGame {
    }

    /** Represents a JoinGame. */
    class JoinGame implements IJoinGame {

        /**
         * Constructs a new JoinGame.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.IJoinGame);

        /**
         * Creates a new JoinGame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns JoinGame instance
         */
        public static create(properties?: GameSetupAction.IJoinGame): GameSetupAction.JoinGame;

        /**
         * Encodes the specified JoinGame message. Does not implicitly {@link GameSetupAction.JoinGame.verify|verify} messages.
         * @param message JoinGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.IJoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified JoinGame message, length delimited. Does not implicitly {@link GameSetupAction.JoinGame.verify|verify} messages.
         * @param message JoinGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.IJoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a JoinGame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns JoinGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.JoinGame;

        /**
         * Decodes a JoinGame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns JoinGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.JoinGame;

        /**
         * Verifies a JoinGame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a JoinGame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns JoinGame
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.JoinGame;

        /**
         * Creates a plain object from a JoinGame message. Also converts values to other types if specified.
         * @param message JoinGame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.JoinGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this JoinGame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an UnjoinGame. */
    interface IUnjoinGame {
    }

    /** Represents an UnjoinGame. */
    class UnjoinGame implements IUnjoinGame {

        /**
         * Constructs a new UnjoinGame.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.IUnjoinGame);

        /**
         * Creates a new UnjoinGame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnjoinGame instance
         */
        public static create(properties?: GameSetupAction.IUnjoinGame): GameSetupAction.UnjoinGame;

        /**
         * Encodes the specified UnjoinGame message. Does not implicitly {@link GameSetupAction.UnjoinGame.verify|verify} messages.
         * @param message UnjoinGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.IUnjoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UnjoinGame message, length delimited. Does not implicitly {@link GameSetupAction.UnjoinGame.verify|verify} messages.
         * @param message UnjoinGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.IUnjoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UnjoinGame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UnjoinGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.UnjoinGame;

        /**
         * Decodes an UnjoinGame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UnjoinGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.UnjoinGame;

        /**
         * Verifies an UnjoinGame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UnjoinGame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UnjoinGame
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.UnjoinGame;

        /**
         * Creates a plain object from an UnjoinGame message. Also converts values to other types if specified.
         * @param message UnjoinGame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.UnjoinGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UnjoinGame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an ApproveOfGameSetup. */
    interface IApproveOfGameSetup {
    }

    /** Represents an ApproveOfGameSetup. */
    class ApproveOfGameSetup implements IApproveOfGameSetup {

        /**
         * Constructs a new ApproveOfGameSetup.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.IApproveOfGameSetup);

        /**
         * Creates a new ApproveOfGameSetup instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ApproveOfGameSetup instance
         */
        public static create(properties?: GameSetupAction.IApproveOfGameSetup): GameSetupAction.ApproveOfGameSetup;

        /**
         * Encodes the specified ApproveOfGameSetup message. Does not implicitly {@link GameSetupAction.ApproveOfGameSetup.verify|verify} messages.
         * @param message ApproveOfGameSetup message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.IApproveOfGameSetup, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ApproveOfGameSetup message, length delimited. Does not implicitly {@link GameSetupAction.ApproveOfGameSetup.verify|verify} messages.
         * @param message ApproveOfGameSetup message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.IApproveOfGameSetup, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ApproveOfGameSetup message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ApproveOfGameSetup
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.ApproveOfGameSetup;

        /**
         * Decodes an ApproveOfGameSetup message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ApproveOfGameSetup
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.ApproveOfGameSetup;

        /**
         * Verifies an ApproveOfGameSetup message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ApproveOfGameSetup message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ApproveOfGameSetup
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.ApproveOfGameSetup;

        /**
         * Creates a plain object from an ApproveOfGameSetup message. Also converts values to other types if specified.
         * @param message ApproveOfGameSetup
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.ApproveOfGameSetup, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ApproveOfGameSetup to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ChangeGameMode. */
    interface IChangeGameMode {

        /** ChangeGameMode gameMode */
        gameMode?: (GameMode|null);
    }

    /** Represents a ChangeGameMode. */
    class ChangeGameMode implements IChangeGameMode {

        /**
         * Constructs a new ChangeGameMode.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.IChangeGameMode);

        /** ChangeGameMode gameMode. */
        public gameMode: GameMode;

        /**
         * Creates a new ChangeGameMode instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ChangeGameMode instance
         */
        public static create(properties?: GameSetupAction.IChangeGameMode): GameSetupAction.ChangeGameMode;

        /**
         * Encodes the specified ChangeGameMode message. Does not implicitly {@link GameSetupAction.ChangeGameMode.verify|verify} messages.
         * @param message ChangeGameMode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.IChangeGameMode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ChangeGameMode message, length delimited. Does not implicitly {@link GameSetupAction.ChangeGameMode.verify|verify} messages.
         * @param message ChangeGameMode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.IChangeGameMode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ChangeGameMode message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ChangeGameMode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.ChangeGameMode;

        /**
         * Decodes a ChangeGameMode message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ChangeGameMode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.ChangeGameMode;

        /**
         * Verifies a ChangeGameMode message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ChangeGameMode message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ChangeGameMode
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.ChangeGameMode;

        /**
         * Creates a plain object from a ChangeGameMode message. Also converts values to other types if specified.
         * @param message ChangeGameMode
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.ChangeGameMode, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ChangeGameMode to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ChangePlayerArrangementMode. */
    interface IChangePlayerArrangementMode {

        /** ChangePlayerArrangementMode playerArrangementMode */
        playerArrangementMode?: (PlayerArrangementMode|null);
    }

    /** Represents a ChangePlayerArrangementMode. */
    class ChangePlayerArrangementMode implements IChangePlayerArrangementMode {

        /**
         * Constructs a new ChangePlayerArrangementMode.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.IChangePlayerArrangementMode);

        /** ChangePlayerArrangementMode playerArrangementMode. */
        public playerArrangementMode: PlayerArrangementMode;

        /**
         * Creates a new ChangePlayerArrangementMode instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ChangePlayerArrangementMode instance
         */
        public static create(properties?: GameSetupAction.IChangePlayerArrangementMode): GameSetupAction.ChangePlayerArrangementMode;

        /**
         * Encodes the specified ChangePlayerArrangementMode message. Does not implicitly {@link GameSetupAction.ChangePlayerArrangementMode.verify|verify} messages.
         * @param message ChangePlayerArrangementMode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.IChangePlayerArrangementMode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ChangePlayerArrangementMode message, length delimited. Does not implicitly {@link GameSetupAction.ChangePlayerArrangementMode.verify|verify} messages.
         * @param message ChangePlayerArrangementMode message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.IChangePlayerArrangementMode, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ChangePlayerArrangementMode message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ChangePlayerArrangementMode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.ChangePlayerArrangementMode;

        /**
         * Decodes a ChangePlayerArrangementMode message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ChangePlayerArrangementMode
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.ChangePlayerArrangementMode;

        /**
         * Verifies a ChangePlayerArrangementMode message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ChangePlayerArrangementMode message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ChangePlayerArrangementMode
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.ChangePlayerArrangementMode;

        /**
         * Creates a plain object from a ChangePlayerArrangementMode message. Also converts values to other types if specified.
         * @param message ChangePlayerArrangementMode
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.ChangePlayerArrangementMode, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ChangePlayerArrangementMode to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a SwapPositions. */
    interface ISwapPositions {

        /** SwapPositions position1 */
        position1?: (number|null);

        /** SwapPositions position2 */
        position2?: (number|null);
    }

    /** Represents a SwapPositions. */
    class SwapPositions implements ISwapPositions {

        /**
         * Constructs a new SwapPositions.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.ISwapPositions);

        /** SwapPositions position1. */
        public position1: number;

        /** SwapPositions position2. */
        public position2: number;

        /**
         * Creates a new SwapPositions instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SwapPositions instance
         */
        public static create(properties?: GameSetupAction.ISwapPositions): GameSetupAction.SwapPositions;

        /**
         * Encodes the specified SwapPositions message. Does not implicitly {@link GameSetupAction.SwapPositions.verify|verify} messages.
         * @param message SwapPositions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.ISwapPositions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SwapPositions message, length delimited. Does not implicitly {@link GameSetupAction.SwapPositions.verify|verify} messages.
         * @param message SwapPositions message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.ISwapPositions, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SwapPositions message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SwapPositions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.SwapPositions;

        /**
         * Decodes a SwapPositions message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SwapPositions
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.SwapPositions;

        /**
         * Verifies a SwapPositions message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SwapPositions message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SwapPositions
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.SwapPositions;

        /**
         * Creates a plain object from a SwapPositions message. Also converts values to other types if specified.
         * @param message SwapPositions
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.SwapPositions, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SwapPositions to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a KickUser. */
    interface IKickUser {

        /** KickUser userId */
        userId?: (number|null);
    }

    /** Represents a KickUser. */
    class KickUser implements IKickUser {

        /**
         * Constructs a new KickUser.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameSetupAction.IKickUser);

        /** KickUser userId. */
        public userId: number;

        /**
         * Creates a new KickUser instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KickUser instance
         */
        public static create(properties?: GameSetupAction.IKickUser): GameSetupAction.KickUser;

        /**
         * Encodes the specified KickUser message. Does not implicitly {@link GameSetupAction.KickUser.verify|verify} messages.
         * @param message KickUser message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameSetupAction.IKickUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KickUser message, length delimited. Does not implicitly {@link GameSetupAction.KickUser.verify|verify} messages.
         * @param message KickUser message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameSetupAction.IKickUser, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KickUser message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KickUser
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameSetupAction.KickUser;

        /**
         * Decodes a KickUser message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KickUser
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameSetupAction.KickUser;

        /**
         * Verifies a KickUser message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a KickUser message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns KickUser
         */
        public static fromObject(object: { [k: string]: any }): GameSetupAction.KickUser;

        /**
         * Creates a plain object from a KickUser message. Also converts values to other types if specified.
         * @param message KickUser
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameSetupAction.KickUser, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this KickUser to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Represents a GameAction. */
export class GameAction implements IGameAction {

    /**
     * Constructs a new GameAction.
     * @param [properties] Properties to set
     */
    constructor(properties?: IGameAction);

    /** GameAction startGame. */
    public startGame?: (GameAction.IStartGame|null);

    /** GameAction playTile. */
    public playTile?: (GameAction.IPlayTile|null);

    /** GameAction selectNewChain. */
    public selectNewChain?: (GameAction.ISelectNewChain|null);

    /** GameAction selectMergerSurvivor. */
    public selectMergerSurvivor?: (GameAction.ISelectMergerSurvivor|null);

    /** GameAction selectChainToDisposeOfNext. */
    public selectChainToDisposeOfNext?: (GameAction.ISelectChainToDisposeOfNext|null);

    /** GameAction disposeOfShares. */
    public disposeOfShares?: (GameAction.IDisposeOfShares|null);

    /** GameAction purchaseShares. */
    public purchaseShares?: (GameAction.IPurchaseShares|null);

    /** GameAction gameOver. */
    public gameOver?: (GameAction.IGameOver|null);

    /**
     * Creates a new GameAction instance using the specified properties.
     * @param [properties] Properties to set
     * @returns GameAction instance
     */
    public static create(properties?: IGameAction): GameAction;

    /**
     * Encodes the specified GameAction message. Does not implicitly {@link GameAction.verify|verify} messages.
     * @param message GameAction message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified GameAction message, length delimited. Does not implicitly {@link GameAction.verify|verify} messages.
     * @param message GameAction message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a GameAction message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns GameAction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction;

    /**
     * Decodes a GameAction message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns GameAction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction;

    /**
     * Verifies a GameAction message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a GameAction message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns GameAction
     */
    public static fromObject(object: { [k: string]: any }): GameAction;

    /**
     * Creates a plain object from a GameAction message. Also converts values to other types if specified.
     * @param message GameAction
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: GameAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this GameAction to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace GameAction {

    /** Properties of a StartGame. */
    interface IStartGame {
    }

    /** Represents a StartGame. */
    class StartGame implements IStartGame {

        /**
         * Constructs a new StartGame.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.IStartGame);

        /**
         * Creates a new StartGame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns StartGame instance
         */
        public static create(properties?: GameAction.IStartGame): GameAction.StartGame;

        /**
         * Encodes the specified StartGame message. Does not implicitly {@link GameAction.StartGame.verify|verify} messages.
         * @param message StartGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.IStartGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified StartGame message, length delimited. Does not implicitly {@link GameAction.StartGame.verify|verify} messages.
         * @param message StartGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.IStartGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a StartGame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns StartGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.StartGame;

        /**
         * Decodes a StartGame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns StartGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.StartGame;

        /**
         * Verifies a StartGame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a StartGame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns StartGame
         */
        public static fromObject(object: { [k: string]: any }): GameAction.StartGame;

        /**
         * Creates a plain object from a StartGame message. Also converts values to other types if specified.
         * @param message StartGame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.StartGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this StartGame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a PlayTile. */
    interface IPlayTile {

        /** PlayTile tile */
        tile?: (number|null);
    }

    /** Represents a PlayTile. */
    class PlayTile implements IPlayTile {

        /**
         * Constructs a new PlayTile.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.IPlayTile);

        /** PlayTile tile. */
        public tile: number;

        /**
         * Creates a new PlayTile instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PlayTile instance
         */
        public static create(properties?: GameAction.IPlayTile): GameAction.PlayTile;

        /**
         * Encodes the specified PlayTile message. Does not implicitly {@link GameAction.PlayTile.verify|verify} messages.
         * @param message PlayTile message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.IPlayTile, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PlayTile message, length delimited. Does not implicitly {@link GameAction.PlayTile.verify|verify} messages.
         * @param message PlayTile message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.IPlayTile, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PlayTile message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PlayTile
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.PlayTile;

        /**
         * Decodes a PlayTile message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PlayTile
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.PlayTile;

        /**
         * Verifies a PlayTile message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PlayTile message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PlayTile
         */
        public static fromObject(object: { [k: string]: any }): GameAction.PlayTile;

        /**
         * Creates a plain object from a PlayTile message. Also converts values to other types if specified.
         * @param message PlayTile
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.PlayTile, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PlayTile to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a SelectNewChain. */
    interface ISelectNewChain {

        /** SelectNewChain chain */
        chain?: (GameBoardType|null);
    }

    /** Represents a SelectNewChain. */
    class SelectNewChain implements ISelectNewChain {

        /**
         * Constructs a new SelectNewChain.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.ISelectNewChain);

        /** SelectNewChain chain. */
        public chain: GameBoardType;

        /**
         * Creates a new SelectNewChain instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SelectNewChain instance
         */
        public static create(properties?: GameAction.ISelectNewChain): GameAction.SelectNewChain;

        /**
         * Encodes the specified SelectNewChain message. Does not implicitly {@link GameAction.SelectNewChain.verify|verify} messages.
         * @param message SelectNewChain message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.ISelectNewChain, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SelectNewChain message, length delimited. Does not implicitly {@link GameAction.SelectNewChain.verify|verify} messages.
         * @param message SelectNewChain message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.ISelectNewChain, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SelectNewChain message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SelectNewChain
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.SelectNewChain;

        /**
         * Decodes a SelectNewChain message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SelectNewChain
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.SelectNewChain;

        /**
         * Verifies a SelectNewChain message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SelectNewChain message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SelectNewChain
         */
        public static fromObject(object: { [k: string]: any }): GameAction.SelectNewChain;

        /**
         * Creates a plain object from a SelectNewChain message. Also converts values to other types if specified.
         * @param message SelectNewChain
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.SelectNewChain, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SelectNewChain to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a SelectMergerSurvivor. */
    interface ISelectMergerSurvivor {

        /** SelectMergerSurvivor chain */
        chain?: (GameBoardType|null);
    }

    /** Represents a SelectMergerSurvivor. */
    class SelectMergerSurvivor implements ISelectMergerSurvivor {

        /**
         * Constructs a new SelectMergerSurvivor.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.ISelectMergerSurvivor);

        /** SelectMergerSurvivor chain. */
        public chain: GameBoardType;

        /**
         * Creates a new SelectMergerSurvivor instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SelectMergerSurvivor instance
         */
        public static create(properties?: GameAction.ISelectMergerSurvivor): GameAction.SelectMergerSurvivor;

        /**
         * Encodes the specified SelectMergerSurvivor message. Does not implicitly {@link GameAction.SelectMergerSurvivor.verify|verify} messages.
         * @param message SelectMergerSurvivor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.ISelectMergerSurvivor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SelectMergerSurvivor message, length delimited. Does not implicitly {@link GameAction.SelectMergerSurvivor.verify|verify} messages.
         * @param message SelectMergerSurvivor message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.ISelectMergerSurvivor, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SelectMergerSurvivor message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SelectMergerSurvivor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.SelectMergerSurvivor;

        /**
         * Decodes a SelectMergerSurvivor message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SelectMergerSurvivor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.SelectMergerSurvivor;

        /**
         * Verifies a SelectMergerSurvivor message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SelectMergerSurvivor message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SelectMergerSurvivor
         */
        public static fromObject(object: { [k: string]: any }): GameAction.SelectMergerSurvivor;

        /**
         * Creates a plain object from a SelectMergerSurvivor message. Also converts values to other types if specified.
         * @param message SelectMergerSurvivor
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.SelectMergerSurvivor, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SelectMergerSurvivor to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a SelectChainToDisposeOfNext. */
    interface ISelectChainToDisposeOfNext {

        /** SelectChainToDisposeOfNext chain */
        chain?: (GameBoardType|null);
    }

    /** Represents a SelectChainToDisposeOfNext. */
    class SelectChainToDisposeOfNext implements ISelectChainToDisposeOfNext {

        /**
         * Constructs a new SelectChainToDisposeOfNext.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.ISelectChainToDisposeOfNext);

        /** SelectChainToDisposeOfNext chain. */
        public chain: GameBoardType;

        /**
         * Creates a new SelectChainToDisposeOfNext instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SelectChainToDisposeOfNext instance
         */
        public static create(properties?: GameAction.ISelectChainToDisposeOfNext): GameAction.SelectChainToDisposeOfNext;

        /**
         * Encodes the specified SelectChainToDisposeOfNext message. Does not implicitly {@link GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
         * @param message SelectChainToDisposeOfNext message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.ISelectChainToDisposeOfNext, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SelectChainToDisposeOfNext message, length delimited. Does not implicitly {@link GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
         * @param message SelectChainToDisposeOfNext message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.ISelectChainToDisposeOfNext, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SelectChainToDisposeOfNext
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.SelectChainToDisposeOfNext;

        /**
         * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SelectChainToDisposeOfNext
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.SelectChainToDisposeOfNext;

        /**
         * Verifies a SelectChainToDisposeOfNext message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SelectChainToDisposeOfNext message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SelectChainToDisposeOfNext
         */
        public static fromObject(object: { [k: string]: any }): GameAction.SelectChainToDisposeOfNext;

        /**
         * Creates a plain object from a SelectChainToDisposeOfNext message. Also converts values to other types if specified.
         * @param message SelectChainToDisposeOfNext
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.SelectChainToDisposeOfNext, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SelectChainToDisposeOfNext to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a DisposeOfShares. */
    interface IDisposeOfShares {

        /** DisposeOfShares tradeAmount */
        tradeAmount?: (number|null);

        /** DisposeOfShares sellAmount */
        sellAmount?: (number|null);
    }

    /** Represents a DisposeOfShares. */
    class DisposeOfShares implements IDisposeOfShares {

        /**
         * Constructs a new DisposeOfShares.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.IDisposeOfShares);

        /** DisposeOfShares tradeAmount. */
        public tradeAmount: number;

        /** DisposeOfShares sellAmount. */
        public sellAmount: number;

        /**
         * Creates a new DisposeOfShares instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DisposeOfShares instance
         */
        public static create(properties?: GameAction.IDisposeOfShares): GameAction.DisposeOfShares;

        /**
         * Encodes the specified DisposeOfShares message. Does not implicitly {@link GameAction.DisposeOfShares.verify|verify} messages.
         * @param message DisposeOfShares message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.IDisposeOfShares, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DisposeOfShares message, length delimited. Does not implicitly {@link GameAction.DisposeOfShares.verify|verify} messages.
         * @param message DisposeOfShares message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.IDisposeOfShares, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DisposeOfShares message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DisposeOfShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.DisposeOfShares;

        /**
         * Decodes a DisposeOfShares message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DisposeOfShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.DisposeOfShares;

        /**
         * Verifies a DisposeOfShares message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DisposeOfShares message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DisposeOfShares
         */
        public static fromObject(object: { [k: string]: any }): GameAction.DisposeOfShares;

        /**
         * Creates a plain object from a DisposeOfShares message. Also converts values to other types if specified.
         * @param message DisposeOfShares
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.DisposeOfShares, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DisposeOfShares to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a PurchaseShares. */
    interface IPurchaseShares {

        /** PurchaseShares chains */
        chains?: (GameBoardType[]|null);

        /** PurchaseShares endGame */
        endGame?: (boolean|null);
    }

    /** Represents a PurchaseShares. */
    class PurchaseShares implements IPurchaseShares {

        /**
         * Constructs a new PurchaseShares.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.IPurchaseShares);

        /** PurchaseShares chains. */
        public chains: GameBoardType[];

        /** PurchaseShares endGame. */
        public endGame: boolean;

        /**
         * Creates a new PurchaseShares instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PurchaseShares instance
         */
        public static create(properties?: GameAction.IPurchaseShares): GameAction.PurchaseShares;

        /**
         * Encodes the specified PurchaseShares message. Does not implicitly {@link GameAction.PurchaseShares.verify|verify} messages.
         * @param message PurchaseShares message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.IPurchaseShares, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PurchaseShares message, length delimited. Does not implicitly {@link GameAction.PurchaseShares.verify|verify} messages.
         * @param message PurchaseShares message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.IPurchaseShares, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PurchaseShares message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PurchaseShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.PurchaseShares;

        /**
         * Decodes a PurchaseShares message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PurchaseShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.PurchaseShares;

        /**
         * Verifies a PurchaseShares message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PurchaseShares message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PurchaseShares
         */
        public static fromObject(object: { [k: string]: any }): GameAction.PurchaseShares;

        /**
         * Creates a plain object from a PurchaseShares message. Also converts values to other types if specified.
         * @param message PurchaseShares
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.PurchaseShares, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PurchaseShares to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GameOver. */
    interface IGameOver {
    }

    /** Represents a GameOver. */
    class GameOver implements IGameOver {

        /**
         * Constructs a new GameOver.
         * @param [properties] Properties to set
         */
        constructor(properties?: GameAction.IGameOver);

        /**
         * Creates a new GameOver instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameOver instance
         */
        public static create(properties?: GameAction.IGameOver): GameAction.GameOver;

        /**
         * Encodes the specified GameOver message. Does not implicitly {@link GameAction.GameOver.verify|verify} messages.
         * @param message GameOver message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: GameAction.IGameOver, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameOver message, length delimited. Does not implicitly {@link GameAction.GameOver.verify|verify} messages.
         * @param message GameOver message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: GameAction.IGameOver, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameOver message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameOver
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): GameAction.GameOver;

        /**
         * Decodes a GameOver message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameOver
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): GameAction.GameOver;

        /**
         * Verifies a GameOver message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GameOver message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GameOver
         */
        public static fromObject(object: { [k: string]: any }): GameAction.GameOver;

        /**
         * Creates a plain object from a GameOver message. Also converts values to other types if specified.
         * @param message GameOver
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: GameAction.GameOver, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameOver to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Represents a MessageToServer. */
export class MessageToServer implements IMessageToServer {

    /**
     * Constructs a new MessageToServer.
     * @param [properties] Properties to set
     */
    constructor(properties?: IMessageToServer);

    /** MessageToServer login. */
    public login?: (MessageToServer.ILogin|null);

    /** MessageToServer createGame. */
    public createGame?: (MessageToServer.ICreateGame|null);

    /** MessageToServer enterGame. */
    public enterGame?: (MessageToServer.IEnterGame|null);

    /** MessageToServer exitGame. */
    public exitGame?: (MessageToServer.IExitGame|null);

    /** MessageToServer doGameSetupAction. */
    public doGameSetupAction?: (IGameSetupAction|null);

    /** MessageToServer doGameAction. */
    public doGameAction?: (MessageToServer.IDoGameAction|null);

    /**
     * Creates a new MessageToServer instance using the specified properties.
     * @param [properties] Properties to set
     * @returns MessageToServer instance
     */
    public static create(properties?: IMessageToServer): MessageToServer;

    /**
     * Encodes the specified MessageToServer message. Does not implicitly {@link MessageToServer.verify|verify} messages.
     * @param message MessageToServer message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IMessageToServer, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified MessageToServer message, length delimited. Does not implicitly {@link MessageToServer.verify|verify} messages.
     * @param message MessageToServer message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IMessageToServer, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a MessageToServer message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns MessageToServer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer;

    /**
     * Decodes a MessageToServer message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns MessageToServer
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer;

    /**
     * Verifies a MessageToServer message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a MessageToServer message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns MessageToServer
     */
    public static fromObject(object: { [k: string]: any }): MessageToServer;

    /**
     * Creates a plain object from a MessageToServer message. Also converts values to other types if specified.
     * @param message MessageToServer
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: MessageToServer, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this MessageToServer to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace MessageToServer {

    /** Properties of a Login. */
    interface ILogin {

        /** Login version */
        version?: (number|null);

        /** Login username */
        username?: (string|null);

        /** Login password */
        password?: (string|null);

        /** Login gameDatas */
        gameDatas?: (MessageToServer.Login.IGameData[]|null);
    }

    /** Represents a Login. */
    class Login implements ILogin {

        /**
         * Constructs a new Login.
         * @param [properties] Properties to set
         */
        constructor(properties?: MessageToServer.ILogin);

        /** Login version. */
        public version: number;

        /** Login username. */
        public username: string;

        /** Login password. */
        public password: string;

        /** Login gameDatas. */
        public gameDatas: MessageToServer.Login.IGameData[];

        /**
         * Creates a new Login instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Login instance
         */
        public static create(properties?: MessageToServer.ILogin): MessageToServer.Login;

        /**
         * Encodes the specified Login message. Does not implicitly {@link MessageToServer.Login.verify|verify} messages.
         * @param message Login message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: MessageToServer.ILogin, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Login message, length delimited. Does not implicitly {@link MessageToServer.Login.verify|verify} messages.
         * @param message Login message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: MessageToServer.ILogin, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Login message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Login
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer.Login;

        /**
         * Decodes a Login message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Login
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer.Login;

        /**
         * Verifies a Login message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Login message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Login
         */
        public static fromObject(object: { [k: string]: any }): MessageToServer.Login;

        /**
         * Creates a plain object from a Login message. Also converts values to other types if specified.
         * @param message Login
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: MessageToServer.Login, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Login to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Login {

        /** Properties of a GameData. */
        interface IGameData {

            /** GameData gameId */
            gameId?: (number|null);

            /** GameData gameStateHistorySize */
            gameStateHistorySize?: (number|null);
        }

        /** Represents a GameData. */
        class GameData implements IGameData {

            /**
             * Constructs a new GameData.
             * @param [properties] Properties to set
             */
            constructor(properties?: MessageToServer.Login.IGameData);

            /** GameData gameId. */
            public gameId: number;

            /** GameData gameStateHistorySize. */
            public gameStateHistorySize: number;

            /**
             * Creates a new GameData instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameData instance
             */
            public static create(properties?: MessageToServer.Login.IGameData): MessageToServer.Login.GameData;

            /**
             * Encodes the specified GameData message. Does not implicitly {@link MessageToServer.Login.GameData.verify|verify} messages.
             * @param message GameData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: MessageToServer.Login.IGameData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameData message, length delimited. Does not implicitly {@link MessageToServer.Login.GameData.verify|verify} messages.
             * @param message GameData message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: MessageToServer.Login.IGameData, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameData message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer.Login.GameData;

            /**
             * Decodes a GameData message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameData
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer.Login.GameData;

            /**
             * Verifies a GameData message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GameData message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GameData
             */
            public static fromObject(object: { [k: string]: any }): MessageToServer.Login.GameData;

            /**
             * Creates a plain object from a GameData message. Also converts values to other types if specified.
             * @param message GameData
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: MessageToServer.Login.GameData, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameData to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a CreateGame. */
    interface ICreateGame {

        /** CreateGame gameMode */
        gameMode?: (GameMode|null);
    }

    /** Represents a CreateGame. */
    class CreateGame implements ICreateGame {

        /**
         * Constructs a new CreateGame.
         * @param [properties] Properties to set
         */
        constructor(properties?: MessageToServer.ICreateGame);

        /** CreateGame gameMode. */
        public gameMode: GameMode;

        /**
         * Creates a new CreateGame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CreateGame instance
         */
        public static create(properties?: MessageToServer.ICreateGame): MessageToServer.CreateGame;

        /**
         * Encodes the specified CreateGame message. Does not implicitly {@link MessageToServer.CreateGame.verify|verify} messages.
         * @param message CreateGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: MessageToServer.ICreateGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CreateGame message, length delimited. Does not implicitly {@link MessageToServer.CreateGame.verify|verify} messages.
         * @param message CreateGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: MessageToServer.ICreateGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CreateGame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CreateGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer.CreateGame;

        /**
         * Decodes a CreateGame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CreateGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer.CreateGame;

        /**
         * Verifies a CreateGame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CreateGame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CreateGame
         */
        public static fromObject(object: { [k: string]: any }): MessageToServer.CreateGame;

        /**
         * Creates a plain object from a CreateGame message. Also converts values to other types if specified.
         * @param message CreateGame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: MessageToServer.CreateGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CreateGame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an EnterGame. */
    interface IEnterGame {

        /** EnterGame gameDisplayNumber */
        gameDisplayNumber?: (number|null);
    }

    /** Represents an EnterGame. */
    class EnterGame implements IEnterGame {

        /**
         * Constructs a new EnterGame.
         * @param [properties] Properties to set
         */
        constructor(properties?: MessageToServer.IEnterGame);

        /** EnterGame gameDisplayNumber. */
        public gameDisplayNumber: number;

        /**
         * Creates a new EnterGame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns EnterGame instance
         */
        public static create(properties?: MessageToServer.IEnterGame): MessageToServer.EnterGame;

        /**
         * Encodes the specified EnterGame message. Does not implicitly {@link MessageToServer.EnterGame.verify|verify} messages.
         * @param message EnterGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: MessageToServer.IEnterGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified EnterGame message, length delimited. Does not implicitly {@link MessageToServer.EnterGame.verify|verify} messages.
         * @param message EnterGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: MessageToServer.IEnterGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an EnterGame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns EnterGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer.EnterGame;

        /**
         * Decodes an EnterGame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns EnterGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer.EnterGame;

        /**
         * Verifies an EnterGame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an EnterGame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns EnterGame
         */
        public static fromObject(object: { [k: string]: any }): MessageToServer.EnterGame;

        /**
         * Creates a plain object from an EnterGame message. Also converts values to other types if specified.
         * @param message EnterGame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: MessageToServer.EnterGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this EnterGame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an ExitGame. */
    interface IExitGame {
    }

    /** Represents an ExitGame. */
    class ExitGame implements IExitGame {

        /**
         * Constructs a new ExitGame.
         * @param [properties] Properties to set
         */
        constructor(properties?: MessageToServer.IExitGame);

        /**
         * Creates a new ExitGame instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ExitGame instance
         */
        public static create(properties?: MessageToServer.IExitGame): MessageToServer.ExitGame;

        /**
         * Encodes the specified ExitGame message. Does not implicitly {@link MessageToServer.ExitGame.verify|verify} messages.
         * @param message ExitGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: MessageToServer.IExitGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ExitGame message, length delimited. Does not implicitly {@link MessageToServer.ExitGame.verify|verify} messages.
         * @param message ExitGame message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: MessageToServer.IExitGame, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ExitGame message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ExitGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer.ExitGame;

        /**
         * Decodes an ExitGame message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ExitGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer.ExitGame;

        /**
         * Verifies an ExitGame message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ExitGame message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ExitGame
         */
        public static fromObject(object: { [k: string]: any }): MessageToServer.ExitGame;

        /**
         * Creates a plain object from an ExitGame message. Also converts values to other types if specified.
         * @param message ExitGame
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: MessageToServer.ExitGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ExitGame to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a DoGameAction. */
    interface IDoGameAction {

        /** DoGameAction gameStateHistorySize */
        gameStateHistorySize?: (number|null);

        /** DoGameAction gameAction */
        gameAction?: (IGameAction|null);
    }

    /** Represents a DoGameAction. */
    class DoGameAction implements IDoGameAction {

        /**
         * Constructs a new DoGameAction.
         * @param [properties] Properties to set
         */
        constructor(properties?: MessageToServer.IDoGameAction);

        /** DoGameAction gameStateHistorySize. */
        public gameStateHistorySize: number;

        /** DoGameAction gameAction. */
        public gameAction?: (IGameAction|null);

        /**
         * Creates a new DoGameAction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns DoGameAction instance
         */
        public static create(properties?: MessageToServer.IDoGameAction): MessageToServer.DoGameAction;

        /**
         * Encodes the specified DoGameAction message. Does not implicitly {@link MessageToServer.DoGameAction.verify|verify} messages.
         * @param message DoGameAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: MessageToServer.IDoGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified DoGameAction message, length delimited. Does not implicitly {@link MessageToServer.DoGameAction.verify|verify} messages.
         * @param message DoGameAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: MessageToServer.IDoGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a DoGameAction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns DoGameAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): MessageToServer.DoGameAction;

        /**
         * Decodes a DoGameAction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns DoGameAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): MessageToServer.DoGameAction;

        /**
         * Verifies a DoGameAction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a DoGameAction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns DoGameAction
         */
        public static fromObject(object: { [k: string]: any }): MessageToServer.DoGameAction;

        /**
         * Creates a plain object from a DoGameAction message. Also converts values to other types if specified.
         * @param message DoGameAction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: MessageToServer.DoGameAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this DoGameAction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
