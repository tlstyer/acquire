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

/** Represents a PB. */
export class PB implements IPB {

    /**
     * Constructs a new PB.
     * @param [properties] Properties to set
     */
    constructor(properties?: IPB);

    /**
     * Creates a new PB instance using the specified properties.
     * @param [properties] Properties to set
     * @returns PB instance
     */
    public static create(properties?: IPB): PB;

    /**
     * Encodes the specified PB message. Does not implicitly {@link PB.verify|verify} messages.
     * @param message PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IPB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified PB message, length delimited. Does not implicitly {@link PB.verify|verify} messages.
     * @param message PB message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IPB, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a PB message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB;

    /**
     * Decodes a PB message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB;

    /**
     * Verifies a PB message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a PB message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns PB
     */
    public static fromObject(object: { [k: string]: any }): PB;

    /**
     * Creates a plain object from a PB message. Also converts values to other types if specified.
     * @param message PB
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: PB, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this PB to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };
}

export namespace PB {

    /** Properties of a GameSetupData. */
    interface IGameSetupData {

        /** GameSetupData gameMode */
        gameMode?: (GameMode|null);

        /** GameSetupData playerArrangementMode */
        playerArrangementMode?: (PlayerArrangementMode|null);

        /** GameSetupData positions */
        positions?: (PB.GameSetupData.IPosition[]|null);
    }

    /** Represents a GameSetupData. */
    class GameSetupData implements IGameSetupData {

        /**
         * Constructs a new GameSetupData.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IGameSetupData);

        /** GameSetupData gameMode. */
        public gameMode: GameMode;

        /** GameSetupData playerArrangementMode. */
        public playerArrangementMode: PlayerArrangementMode;

        /** GameSetupData positions. */
        public positions: PB.GameSetupData.IPosition[];

        /**
         * Creates a new GameSetupData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameSetupData instance
         */
        public static create(properties?: PB.IGameSetupData): PB.GameSetupData;

        /**
         * Encodes the specified GameSetupData message. Does not implicitly {@link PB.GameSetupData.verify|verify} messages.
         * @param message GameSetupData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IGameSetupData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameSetupData message, length delimited. Does not implicitly {@link PB.GameSetupData.verify|verify} messages.
         * @param message GameSetupData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IGameSetupData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameSetupData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameSetupData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupData;

        /**
         * Decodes a GameSetupData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameSetupData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupData;

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
        public static fromObject(object: { [k: string]: any }): PB.GameSetupData;

        /**
         * Creates a plain object from a GameSetupData message. Also converts values to other types if specified.
         * @param message GameSetupData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.GameSetupData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameSetupData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace GameSetupData {

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
            constructor(properties?: PB.GameSetupData.IPosition);

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
            public static create(properties?: PB.GameSetupData.IPosition): PB.GameSetupData.Position;

            /**
             * Encodes the specified Position message. Does not implicitly {@link PB.GameSetupData.Position.verify|verify} messages.
             * @param message Position message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupData.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Position message, length delimited. Does not implicitly {@link PB.GameSetupData.Position.verify|verify} messages.
             * @param message Position message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupData.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Position message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupData.Position;

            /**
             * Decodes a Position message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupData.Position;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupData.Position;

            /**
             * Creates a plain object from a Position message. Also converts values to other types if specified.
             * @param message Position
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupData.Position, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Position to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a GameStateData. */
    interface IGameStateData {

        /** GameStateData gameAction */
        gameAction?: (PB.IGameAction|null);

        /** GameStateData timestamp */
        timestamp?: (number|null);

        /** GameStateData revealedTileRackTiles */
        revealedTileRackTiles?: (PB.GameStateData.IRevealedTileRackTile[]|null);

        /** GameStateData revealedTileBagTiles */
        revealedTileBagTiles?: (number[]|null);

        /** GameStateData playerIdWithPlayableTilePlusOne */
        playerIdWithPlayableTilePlusOne?: (number|null);
    }

    /** Represents a GameStateData. */
    class GameStateData implements IGameStateData {

        /**
         * Constructs a new GameStateData.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IGameStateData);

        /** GameStateData gameAction. */
        public gameAction?: (PB.IGameAction|null);

        /** GameStateData timestamp. */
        public timestamp: number;

        /** GameStateData revealedTileRackTiles. */
        public revealedTileRackTiles: PB.GameStateData.IRevealedTileRackTile[];

        /** GameStateData revealedTileBagTiles. */
        public revealedTileBagTiles: number[];

        /** GameStateData playerIdWithPlayableTilePlusOne. */
        public playerIdWithPlayableTilePlusOne: number;

        /**
         * Creates a new GameStateData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameStateData instance
         */
        public static create(properties?: PB.IGameStateData): PB.GameStateData;

        /**
         * Encodes the specified GameStateData message. Does not implicitly {@link PB.GameStateData.verify|verify} messages.
         * @param message GameStateData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IGameStateData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameStateData message, length delimited. Does not implicitly {@link PB.GameStateData.verify|verify} messages.
         * @param message GameStateData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IGameStateData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameStateData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameStateData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameStateData;

        /**
         * Decodes a GameStateData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameStateData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameStateData;

        /**
         * Verifies a GameStateData message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GameStateData message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GameStateData
         */
        public static fromObject(object: { [k: string]: any }): PB.GameStateData;

        /**
         * Creates a plain object from a GameStateData message. Also converts values to other types if specified.
         * @param message GameStateData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.GameStateData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameStateData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace GameStateData {

        /** Properties of a RevealedTileRackTile. */
        interface IRevealedTileRackTile {

            /** RevealedTileRackTile tile */
            tile?: (number|null);

            /** RevealedTileRackTile playerIdBelongsTo */
            playerIdBelongsTo?: (number|null);
        }

        /** Represents a RevealedTileRackTile. */
        class RevealedTileRackTile implements IRevealedTileRackTile {

            /**
             * Constructs a new RevealedTileRackTile.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameStateData.IRevealedTileRackTile);

            /** RevealedTileRackTile tile. */
            public tile: number;

            /** RevealedTileRackTile playerIdBelongsTo. */
            public playerIdBelongsTo: number;

            /**
             * Creates a new RevealedTileRackTile instance using the specified properties.
             * @param [properties] Properties to set
             * @returns RevealedTileRackTile instance
             */
            public static create(properties?: PB.GameStateData.IRevealedTileRackTile): PB.GameStateData.RevealedTileRackTile;

            /**
             * Encodes the specified RevealedTileRackTile message. Does not implicitly {@link PB.GameStateData.RevealedTileRackTile.verify|verify} messages.
             * @param message RevealedTileRackTile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameStateData.IRevealedTileRackTile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified RevealedTileRackTile message, length delimited. Does not implicitly {@link PB.GameStateData.RevealedTileRackTile.verify|verify} messages.
             * @param message RevealedTileRackTile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameStateData.IRevealedTileRackTile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a RevealedTileRackTile message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns RevealedTileRackTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameStateData.RevealedTileRackTile;

            /**
             * Decodes a RevealedTileRackTile message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns RevealedTileRackTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameStateData.RevealedTileRackTile;

            /**
             * Verifies a RevealedTileRackTile message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a RevealedTileRackTile message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns RevealedTileRackTile
             */
            public static fromObject(object: { [k: string]: any }): PB.GameStateData.RevealedTileRackTile;

            /**
             * Creates a plain object from a RevealedTileRackTile message. Also converts values to other types if specified.
             * @param message RevealedTileRackTile
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameStateData.RevealedTileRackTile, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this RevealedTileRackTile to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a GameData. */
    interface IGameData {

        /** GameData gameMode */
        gameMode?: (GameMode|null);

        /** GameData playerArrangementMode */
        playerArrangementMode?: (PlayerArrangementMode|null);

        /** GameData positions */
        positions?: (PB.GameData.IPosition[]|null);

        /** GameData gameStateDatas */
        gameStateDatas?: (PB.IGameStateData[]|null);
    }

    /** Represents a GameData. */
    class GameData implements IGameData {

        /**
         * Constructs a new GameData.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IGameData);

        /** GameData gameMode. */
        public gameMode: GameMode;

        /** GameData playerArrangementMode. */
        public playerArrangementMode: PlayerArrangementMode;

        /** GameData positions. */
        public positions: PB.GameData.IPosition[];

        /** GameData gameStateDatas. */
        public gameStateDatas: PB.IGameStateData[];

        /**
         * Creates a new GameData instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameData instance
         */
        public static create(properties?: PB.IGameData): PB.GameData;

        /**
         * Encodes the specified GameData message. Does not implicitly {@link PB.GameData.verify|verify} messages.
         * @param message GameData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IGameData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameData message, length delimited. Does not implicitly {@link PB.GameData.verify|verify} messages.
         * @param message GameData message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IGameData, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameData message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameData;

        /**
         * Decodes a GameData message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameData;

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
        public static fromObject(object: { [k: string]: any }): PB.GameData;

        /**
         * Creates a plain object from a GameData message. Also converts values to other types if specified.
         * @param message GameData
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.GameData, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameData to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace GameData {

        /** Properties of a Position. */
        interface IPosition {

            /** Position userId */
            userId?: (number|null);

            /** Position isHost */
            isHost?: (boolean|null);
        }

        /** Represents a Position. */
        class Position implements IPosition {

            /**
             * Constructs a new Position.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameData.IPosition);

            /** Position userId. */
            public userId: number;

            /** Position isHost. */
            public isHost: boolean;

            /**
             * Creates a new Position instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Position instance
             */
            public static create(properties?: PB.GameData.IPosition): PB.GameData.Position;

            /**
             * Encodes the specified Position message. Does not implicitly {@link PB.GameData.Position.verify|verify} messages.
             * @param message Position message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameData.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Position message, length delimited. Does not implicitly {@link PB.GameData.Position.verify|verify} messages.
             * @param message Position message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameData.IPosition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Position message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameData.Position;

            /**
             * Decodes a Position message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameData.Position;

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
            public static fromObject(object: { [k: string]: any }): PB.GameData.Position;

            /**
             * Creates a plain object from a Position message. Also converts values to other types if specified.
             * @param message Position
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameData.Position, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Position to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a GameSetupAction. */
    interface IGameSetupAction {

        /** GameSetupAction joinGame */
        joinGame?: (PB.GameSetupAction.IJoinGame|null);

        /** GameSetupAction unjoinGame */
        unjoinGame?: (PB.GameSetupAction.IUnjoinGame|null);

        /** GameSetupAction approveOfGameSetup */
        approveOfGameSetup?: (PB.GameSetupAction.IApproveOfGameSetup|null);

        /** GameSetupAction changeGameMode */
        changeGameMode?: (PB.GameSetupAction.IChangeGameMode|null);

        /** GameSetupAction changePlayerArrangementMode */
        changePlayerArrangementMode?: (PB.GameSetupAction.IChangePlayerArrangementMode|null);

        /** GameSetupAction swapPositions */
        swapPositions?: (PB.GameSetupAction.ISwapPositions|null);

        /** GameSetupAction kickUser */
        kickUser?: (PB.GameSetupAction.IKickUser|null);
    }

    /** Represents a GameSetupAction. */
    class GameSetupAction implements IGameSetupAction {

        /**
         * Constructs a new GameSetupAction.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IGameSetupAction);

        /** GameSetupAction joinGame. */
        public joinGame?: (PB.GameSetupAction.IJoinGame|null);

        /** GameSetupAction unjoinGame. */
        public unjoinGame?: (PB.GameSetupAction.IUnjoinGame|null);

        /** GameSetupAction approveOfGameSetup. */
        public approveOfGameSetup?: (PB.GameSetupAction.IApproveOfGameSetup|null);

        /** GameSetupAction changeGameMode. */
        public changeGameMode?: (PB.GameSetupAction.IChangeGameMode|null);

        /** GameSetupAction changePlayerArrangementMode. */
        public changePlayerArrangementMode?: (PB.GameSetupAction.IChangePlayerArrangementMode|null);

        /** GameSetupAction swapPositions. */
        public swapPositions?: (PB.GameSetupAction.ISwapPositions|null);

        /** GameSetupAction kickUser. */
        public kickUser?: (PB.GameSetupAction.IKickUser|null);

        /**
         * Creates a new GameSetupAction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameSetupAction instance
         */
        public static create(properties?: PB.IGameSetupAction): PB.GameSetupAction;

        /**
         * Encodes the specified GameSetupAction message. Does not implicitly {@link PB.GameSetupAction.verify|verify} messages.
         * @param message GameSetupAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IGameSetupAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameSetupAction message, length delimited. Does not implicitly {@link PB.GameSetupAction.verify|verify} messages.
         * @param message GameSetupAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IGameSetupAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameSetupAction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameSetupAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction;

        /**
         * Decodes a GameSetupAction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameSetupAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction;

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
        public static fromObject(object: { [k: string]: any }): PB.GameSetupAction;

        /**
         * Creates a plain object from a GameSetupAction message. Also converts values to other types if specified.
         * @param message GameSetupAction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.GameSetupAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameSetupAction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace GameSetupAction {

        /** Properties of a JoinGame. */
        interface IJoinGame {
        }

        /** Represents a JoinGame. */
        class JoinGame implements IJoinGame {

            /**
             * Constructs a new JoinGame.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupAction.IJoinGame);

            /**
             * Creates a new JoinGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns JoinGame instance
             */
            public static create(properties?: PB.GameSetupAction.IJoinGame): PB.GameSetupAction.JoinGame;

            /**
             * Encodes the specified JoinGame message. Does not implicitly {@link PB.GameSetupAction.JoinGame.verify|verify} messages.
             * @param message JoinGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.IJoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified JoinGame message, length delimited. Does not implicitly {@link PB.GameSetupAction.JoinGame.verify|verify} messages.
             * @param message JoinGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.IJoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a JoinGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns JoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.JoinGame;

            /**
             * Decodes a JoinGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns JoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.JoinGame;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.JoinGame;

            /**
             * Creates a plain object from a JoinGame message. Also converts values to other types if specified.
             * @param message JoinGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.JoinGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameSetupAction.IUnjoinGame);

            /**
             * Creates a new UnjoinGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UnjoinGame instance
             */
            public static create(properties?: PB.GameSetupAction.IUnjoinGame): PB.GameSetupAction.UnjoinGame;

            /**
             * Encodes the specified UnjoinGame message. Does not implicitly {@link PB.GameSetupAction.UnjoinGame.verify|verify} messages.
             * @param message UnjoinGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.IUnjoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UnjoinGame message, length delimited. Does not implicitly {@link PB.GameSetupAction.UnjoinGame.verify|verify} messages.
             * @param message UnjoinGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.IUnjoinGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an UnjoinGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UnjoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.UnjoinGame;

            /**
             * Decodes an UnjoinGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UnjoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.UnjoinGame;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.UnjoinGame;

            /**
             * Creates a plain object from an UnjoinGame message. Also converts values to other types if specified.
             * @param message UnjoinGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.UnjoinGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameSetupAction.IApproveOfGameSetup);

            /**
             * Creates a new ApproveOfGameSetup instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ApproveOfGameSetup instance
             */
            public static create(properties?: PB.GameSetupAction.IApproveOfGameSetup): PB.GameSetupAction.ApproveOfGameSetup;

            /**
             * Encodes the specified ApproveOfGameSetup message. Does not implicitly {@link PB.GameSetupAction.ApproveOfGameSetup.verify|verify} messages.
             * @param message ApproveOfGameSetup message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.IApproveOfGameSetup, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ApproveOfGameSetup message, length delimited. Does not implicitly {@link PB.GameSetupAction.ApproveOfGameSetup.verify|verify} messages.
             * @param message ApproveOfGameSetup message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.IApproveOfGameSetup, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ApproveOfGameSetup message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ApproveOfGameSetup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.ApproveOfGameSetup;

            /**
             * Decodes an ApproveOfGameSetup message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ApproveOfGameSetup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.ApproveOfGameSetup;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.ApproveOfGameSetup;

            /**
             * Creates a plain object from an ApproveOfGameSetup message. Also converts values to other types if specified.
             * @param message ApproveOfGameSetup
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.ApproveOfGameSetup, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameSetupAction.IChangeGameMode);

            /** ChangeGameMode gameMode. */
            public gameMode: GameMode;

            /**
             * Creates a new ChangeGameMode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ChangeGameMode instance
             */
            public static create(properties?: PB.GameSetupAction.IChangeGameMode): PB.GameSetupAction.ChangeGameMode;

            /**
             * Encodes the specified ChangeGameMode message. Does not implicitly {@link PB.GameSetupAction.ChangeGameMode.verify|verify} messages.
             * @param message ChangeGameMode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.IChangeGameMode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ChangeGameMode message, length delimited. Does not implicitly {@link PB.GameSetupAction.ChangeGameMode.verify|verify} messages.
             * @param message ChangeGameMode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.IChangeGameMode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ChangeGameMode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ChangeGameMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.ChangeGameMode;

            /**
             * Decodes a ChangeGameMode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ChangeGameMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.ChangeGameMode;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.ChangeGameMode;

            /**
             * Creates a plain object from a ChangeGameMode message. Also converts values to other types if specified.
             * @param message ChangeGameMode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.ChangeGameMode, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameSetupAction.IChangePlayerArrangementMode);

            /** ChangePlayerArrangementMode playerArrangementMode. */
            public playerArrangementMode: PlayerArrangementMode;

            /**
             * Creates a new ChangePlayerArrangementMode instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ChangePlayerArrangementMode instance
             */
            public static create(properties?: PB.GameSetupAction.IChangePlayerArrangementMode): PB.GameSetupAction.ChangePlayerArrangementMode;

            /**
             * Encodes the specified ChangePlayerArrangementMode message. Does not implicitly {@link PB.GameSetupAction.ChangePlayerArrangementMode.verify|verify} messages.
             * @param message ChangePlayerArrangementMode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.IChangePlayerArrangementMode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ChangePlayerArrangementMode message, length delimited. Does not implicitly {@link PB.GameSetupAction.ChangePlayerArrangementMode.verify|verify} messages.
             * @param message ChangePlayerArrangementMode message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.IChangePlayerArrangementMode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ChangePlayerArrangementMode message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ChangePlayerArrangementMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.ChangePlayerArrangementMode;

            /**
             * Decodes a ChangePlayerArrangementMode message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ChangePlayerArrangementMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.ChangePlayerArrangementMode;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.ChangePlayerArrangementMode;

            /**
             * Creates a plain object from a ChangePlayerArrangementMode message. Also converts values to other types if specified.
             * @param message ChangePlayerArrangementMode
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.ChangePlayerArrangementMode, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameSetupAction.ISwapPositions);

            /** SwapPositions position1. */
            public position1: number;

            /** SwapPositions position2. */
            public position2: number;

            /**
             * Creates a new SwapPositions instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SwapPositions instance
             */
            public static create(properties?: PB.GameSetupAction.ISwapPositions): PB.GameSetupAction.SwapPositions;

            /**
             * Encodes the specified SwapPositions message. Does not implicitly {@link PB.GameSetupAction.SwapPositions.verify|verify} messages.
             * @param message SwapPositions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.ISwapPositions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SwapPositions message, length delimited. Does not implicitly {@link PB.GameSetupAction.SwapPositions.verify|verify} messages.
             * @param message SwapPositions message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.ISwapPositions, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SwapPositions message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SwapPositions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.SwapPositions;

            /**
             * Decodes a SwapPositions message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SwapPositions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.SwapPositions;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.SwapPositions;

            /**
             * Creates a plain object from a SwapPositions message. Also converts values to other types if specified.
             * @param message SwapPositions
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.SwapPositions, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameSetupAction.IKickUser);

            /** KickUser userId. */
            public userId: number;

            /**
             * Creates a new KickUser instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KickUser instance
             */
            public static create(properties?: PB.GameSetupAction.IKickUser): PB.GameSetupAction.KickUser;

            /**
             * Encodes the specified KickUser message. Does not implicitly {@link PB.GameSetupAction.KickUser.verify|verify} messages.
             * @param message KickUser message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupAction.IKickUser, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KickUser message, length delimited. Does not implicitly {@link PB.GameSetupAction.KickUser.verify|verify} messages.
             * @param message KickUser message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupAction.IKickUser, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KickUser message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KickUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupAction.KickUser;

            /**
             * Decodes a KickUser message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KickUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupAction.KickUser;

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
            public static fromObject(object: { [k: string]: any }): PB.GameSetupAction.KickUser;

            /**
             * Creates a plain object from a KickUser message. Also converts values to other types if specified.
             * @param message KickUser
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupAction.KickUser, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KickUser to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a GameAction. */
    interface IGameAction {

        /** GameAction startGame */
        startGame?: (PB.GameAction.IStartGame|null);

        /** GameAction playTile */
        playTile?: (PB.GameAction.IPlayTile|null);

        /** GameAction selectNewChain */
        selectNewChain?: (PB.GameAction.ISelectNewChain|null);

        /** GameAction selectMergerSurvivor */
        selectMergerSurvivor?: (PB.GameAction.ISelectMergerSurvivor|null);

        /** GameAction selectChainToDisposeOfNext */
        selectChainToDisposeOfNext?: (PB.GameAction.ISelectChainToDisposeOfNext|null);

        /** GameAction disposeOfShares */
        disposeOfShares?: (PB.GameAction.IDisposeOfShares|null);

        /** GameAction purchaseShares */
        purchaseShares?: (PB.GameAction.IPurchaseShares|null);

        /** GameAction gameOver */
        gameOver?: (PB.GameAction.IGameOver|null);
    }

    /** Represents a GameAction. */
    class GameAction implements IGameAction {

        /**
         * Constructs a new GameAction.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IGameAction);

        /** GameAction startGame. */
        public startGame?: (PB.GameAction.IStartGame|null);

        /** GameAction playTile. */
        public playTile?: (PB.GameAction.IPlayTile|null);

        /** GameAction selectNewChain. */
        public selectNewChain?: (PB.GameAction.ISelectNewChain|null);

        /** GameAction selectMergerSurvivor. */
        public selectMergerSurvivor?: (PB.GameAction.ISelectMergerSurvivor|null);

        /** GameAction selectChainToDisposeOfNext. */
        public selectChainToDisposeOfNext?: (PB.GameAction.ISelectChainToDisposeOfNext|null);

        /** GameAction disposeOfShares. */
        public disposeOfShares?: (PB.GameAction.IDisposeOfShares|null);

        /** GameAction purchaseShares. */
        public purchaseShares?: (PB.GameAction.IPurchaseShares|null);

        /** GameAction gameOver. */
        public gameOver?: (PB.GameAction.IGameOver|null);

        /**
         * Creates a new GameAction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameAction instance
         */
        public static create(properties?: PB.IGameAction): PB.GameAction;

        /**
         * Encodes the specified GameAction message. Does not implicitly {@link PB.GameAction.verify|verify} messages.
         * @param message GameAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameAction message, length delimited. Does not implicitly {@link PB.GameAction.verify|verify} messages.
         * @param message GameAction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameAction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction;

        /**
         * Decodes a GameAction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction;

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
        public static fromObject(object: { [k: string]: any }): PB.GameAction;

        /**
         * Creates a plain object from a GameAction message. Also converts values to other types if specified.
         * @param message GameAction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.GameAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameAction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace GameAction {

        /** Properties of a StartGame. */
        interface IStartGame {
        }

        /** Represents a StartGame. */
        class StartGame implements IStartGame {

            /**
             * Constructs a new StartGame.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameAction.IStartGame);

            /**
             * Creates a new StartGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns StartGame instance
             */
            public static create(properties?: PB.GameAction.IStartGame): PB.GameAction.StartGame;

            /**
             * Encodes the specified StartGame message. Does not implicitly {@link PB.GameAction.StartGame.verify|verify} messages.
             * @param message StartGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.IStartGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified StartGame message, length delimited. Does not implicitly {@link PB.GameAction.StartGame.verify|verify} messages.
             * @param message StartGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.IStartGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a StartGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns StartGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.StartGame;

            /**
             * Decodes a StartGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns StartGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.StartGame;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.StartGame;

            /**
             * Creates a plain object from a StartGame message. Also converts values to other types if specified.
             * @param message StartGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.StartGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.IPlayTile);

            /** PlayTile tile. */
            public tile: number;

            /**
             * Creates a new PlayTile instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PlayTile instance
             */
            public static create(properties?: PB.GameAction.IPlayTile): PB.GameAction.PlayTile;

            /**
             * Encodes the specified PlayTile message. Does not implicitly {@link PB.GameAction.PlayTile.verify|verify} messages.
             * @param message PlayTile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.IPlayTile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PlayTile message, length delimited. Does not implicitly {@link PB.GameAction.PlayTile.verify|verify} messages.
             * @param message PlayTile message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.IPlayTile, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PlayTile message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PlayTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.PlayTile;

            /**
             * Decodes a PlayTile message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PlayTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.PlayTile;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.PlayTile;

            /**
             * Creates a plain object from a PlayTile message. Also converts values to other types if specified.
             * @param message PlayTile
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.PlayTile, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.ISelectNewChain);

            /** SelectNewChain chain. */
            public chain: GameBoardType;

            /**
             * Creates a new SelectNewChain instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SelectNewChain instance
             */
            public static create(properties?: PB.GameAction.ISelectNewChain): PB.GameAction.SelectNewChain;

            /**
             * Encodes the specified SelectNewChain message. Does not implicitly {@link PB.GameAction.SelectNewChain.verify|verify} messages.
             * @param message SelectNewChain message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.ISelectNewChain, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SelectNewChain message, length delimited. Does not implicitly {@link PB.GameAction.SelectNewChain.verify|verify} messages.
             * @param message SelectNewChain message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.ISelectNewChain, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SelectNewChain message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SelectNewChain
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.SelectNewChain;

            /**
             * Decodes a SelectNewChain message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SelectNewChain
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.SelectNewChain;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.SelectNewChain;

            /**
             * Creates a plain object from a SelectNewChain message. Also converts values to other types if specified.
             * @param message SelectNewChain
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.SelectNewChain, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.ISelectMergerSurvivor);

            /** SelectMergerSurvivor chain. */
            public chain: GameBoardType;

            /**
             * Creates a new SelectMergerSurvivor instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SelectMergerSurvivor instance
             */
            public static create(properties?: PB.GameAction.ISelectMergerSurvivor): PB.GameAction.SelectMergerSurvivor;

            /**
             * Encodes the specified SelectMergerSurvivor message. Does not implicitly {@link PB.GameAction.SelectMergerSurvivor.verify|verify} messages.
             * @param message SelectMergerSurvivor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.ISelectMergerSurvivor, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SelectMergerSurvivor message, length delimited. Does not implicitly {@link PB.GameAction.SelectMergerSurvivor.verify|verify} messages.
             * @param message SelectMergerSurvivor message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.ISelectMergerSurvivor, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SelectMergerSurvivor message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SelectMergerSurvivor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.SelectMergerSurvivor;

            /**
             * Decodes a SelectMergerSurvivor message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SelectMergerSurvivor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.SelectMergerSurvivor;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.SelectMergerSurvivor;

            /**
             * Creates a plain object from a SelectMergerSurvivor message. Also converts values to other types if specified.
             * @param message SelectMergerSurvivor
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.SelectMergerSurvivor, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.ISelectChainToDisposeOfNext);

            /** SelectChainToDisposeOfNext chain. */
            public chain: GameBoardType;

            /**
             * Creates a new SelectChainToDisposeOfNext instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SelectChainToDisposeOfNext instance
             */
            public static create(properties?: PB.GameAction.ISelectChainToDisposeOfNext): PB.GameAction.SelectChainToDisposeOfNext;

            /**
             * Encodes the specified SelectChainToDisposeOfNext message. Does not implicitly {@link PB.GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
             * @param message SelectChainToDisposeOfNext message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.ISelectChainToDisposeOfNext, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SelectChainToDisposeOfNext message, length delimited. Does not implicitly {@link PB.GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
             * @param message SelectChainToDisposeOfNext message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.ISelectChainToDisposeOfNext, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SelectChainToDisposeOfNext
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.SelectChainToDisposeOfNext;

            /**
             * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SelectChainToDisposeOfNext
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.SelectChainToDisposeOfNext;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.SelectChainToDisposeOfNext;

            /**
             * Creates a plain object from a SelectChainToDisposeOfNext message. Also converts values to other types if specified.
             * @param message SelectChainToDisposeOfNext
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.SelectChainToDisposeOfNext, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.IDisposeOfShares);

            /** DisposeOfShares tradeAmount. */
            public tradeAmount: number;

            /** DisposeOfShares sellAmount. */
            public sellAmount: number;

            /**
             * Creates a new DisposeOfShares instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DisposeOfShares instance
             */
            public static create(properties?: PB.GameAction.IDisposeOfShares): PB.GameAction.DisposeOfShares;

            /**
             * Encodes the specified DisposeOfShares message. Does not implicitly {@link PB.GameAction.DisposeOfShares.verify|verify} messages.
             * @param message DisposeOfShares message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.IDisposeOfShares, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DisposeOfShares message, length delimited. Does not implicitly {@link PB.GameAction.DisposeOfShares.verify|verify} messages.
             * @param message DisposeOfShares message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.IDisposeOfShares, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DisposeOfShares message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DisposeOfShares
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.DisposeOfShares;

            /**
             * Decodes a DisposeOfShares message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DisposeOfShares
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.DisposeOfShares;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.DisposeOfShares;

            /**
             * Creates a plain object from a DisposeOfShares message. Also converts values to other types if specified.
             * @param message DisposeOfShares
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.DisposeOfShares, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.IPurchaseShares);

            /** PurchaseShares chains. */
            public chains: GameBoardType[];

            /** PurchaseShares endGame. */
            public endGame: boolean;

            /**
             * Creates a new PurchaseShares instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PurchaseShares instance
             */
            public static create(properties?: PB.GameAction.IPurchaseShares): PB.GameAction.PurchaseShares;

            /**
             * Encodes the specified PurchaseShares message. Does not implicitly {@link PB.GameAction.PurchaseShares.verify|verify} messages.
             * @param message PurchaseShares message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.IPurchaseShares, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PurchaseShares message, length delimited. Does not implicitly {@link PB.GameAction.PurchaseShares.verify|verify} messages.
             * @param message PurchaseShares message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.IPurchaseShares, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PurchaseShares message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PurchaseShares
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.PurchaseShares;

            /**
             * Decodes a PurchaseShares message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PurchaseShares
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.PurchaseShares;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.PurchaseShares;

            /**
             * Creates a plain object from a PurchaseShares message. Also converts values to other types if specified.
             * @param message PurchaseShares
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.PurchaseShares, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.GameAction.IGameOver);

            /**
             * Creates a new GameOver instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameOver instance
             */
            public static create(properties?: PB.GameAction.IGameOver): PB.GameAction.GameOver;

            /**
             * Encodes the specified GameOver message. Does not implicitly {@link PB.GameAction.GameOver.verify|verify} messages.
             * @param message GameOver message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameAction.IGameOver, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameOver message, length delimited. Does not implicitly {@link PB.GameAction.GameOver.verify|verify} messages.
             * @param message GameOver message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameAction.IGameOver, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameOver message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameOver
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameAction.GameOver;

            /**
             * Decodes a GameOver message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameOver
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameAction.GameOver;

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
            public static fromObject(object: { [k: string]: any }): PB.GameAction.GameOver;

            /**
             * Creates a plain object from a GameOver message. Also converts values to other types if specified.
             * @param message GameOver
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameAction.GameOver, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameOver to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a MessageToServer. */
    interface IMessageToServer {

        /** MessageToServer login */
        login?: (PB.MessageToServer.ILogin|null);

        /** MessageToServer createGame */
        createGame?: (PB.MessageToServer.ICreateGame|null);

        /** MessageToServer enterGame */
        enterGame?: (PB.MessageToServer.IEnterGame|null);

        /** MessageToServer exitGame */
        exitGame?: (PB.MessageToServer.IExitGame|null);

        /** MessageToServer doGameSetupAction */
        doGameSetupAction?: (PB.IGameSetupAction|null);

        /** MessageToServer doGameAction */
        doGameAction?: (PB.MessageToServer.IDoGameAction|null);
    }

    /** Represents a MessageToServer. */
    class MessageToServer implements IMessageToServer {

        /**
         * Constructs a new MessageToServer.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IMessageToServer);

        /** MessageToServer login. */
        public login?: (PB.MessageToServer.ILogin|null);

        /** MessageToServer createGame. */
        public createGame?: (PB.MessageToServer.ICreateGame|null);

        /** MessageToServer enterGame. */
        public enterGame?: (PB.MessageToServer.IEnterGame|null);

        /** MessageToServer exitGame. */
        public exitGame?: (PB.MessageToServer.IExitGame|null);

        /** MessageToServer doGameSetupAction. */
        public doGameSetupAction?: (PB.IGameSetupAction|null);

        /** MessageToServer doGameAction. */
        public doGameAction?: (PB.MessageToServer.IDoGameAction|null);

        /**
         * Creates a new MessageToServer instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageToServer instance
         */
        public static create(properties?: PB.IMessageToServer): PB.MessageToServer;

        /**
         * Encodes the specified MessageToServer message. Does not implicitly {@link PB.MessageToServer.verify|verify} messages.
         * @param message MessageToServer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IMessageToServer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageToServer message, length delimited. Does not implicitly {@link PB.MessageToServer.verify|verify} messages.
         * @param message MessageToServer message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IMessageToServer, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageToServer message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageToServer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer;

        /**
         * Decodes a MessageToServer message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageToServer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer;

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
        public static fromObject(object: { [k: string]: any }): PB.MessageToServer;

        /**
         * Creates a plain object from a MessageToServer message. Also converts values to other types if specified.
         * @param message MessageToServer
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.MessageToServer, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageToServer to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace MessageToServer {

        /** Properties of a Login. */
        interface ILogin {

            /** Login version */
            version?: (number|null);

            /** Login username */
            username?: (string|null);

            /** Login password */
            password?: (string|null);

            /** Login gameDatas */
            gameDatas?: (PB.MessageToServer.Login.IGameData[]|null);
        }

        /** Represents a Login. */
        class Login implements ILogin {

            /**
             * Constructs a new Login.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToServer.ILogin);

            /** Login version. */
            public version: number;

            /** Login username. */
            public username: string;

            /** Login password. */
            public password: string;

            /** Login gameDatas. */
            public gameDatas: PB.MessageToServer.Login.IGameData[];

            /**
             * Creates a new Login instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Login instance
             */
            public static create(properties?: PB.MessageToServer.ILogin): PB.MessageToServer.Login;

            /**
             * Encodes the specified Login message. Does not implicitly {@link PB.MessageToServer.Login.verify|verify} messages.
             * @param message Login message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToServer.ILogin, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Login message, length delimited. Does not implicitly {@link PB.MessageToServer.Login.verify|verify} messages.
             * @param message Login message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToServer.ILogin, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Login message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Login
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer.Login;

            /**
             * Decodes a Login message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Login
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer.Login;

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
            public static fromObject(object: { [k: string]: any }): PB.MessageToServer.Login;

            /**
             * Creates a plain object from a Login message. Also converts values to other types if specified.
             * @param message Login
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToServer.Login, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
                constructor(properties?: PB.MessageToServer.Login.IGameData);

                /** GameData gameId. */
                public gameId: number;

                /** GameData gameStateHistorySize. */
                public gameStateHistorySize: number;

                /**
                 * Creates a new GameData instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns GameData instance
                 */
                public static create(properties?: PB.MessageToServer.Login.IGameData): PB.MessageToServer.Login.GameData;

                /**
                 * Encodes the specified GameData message. Does not implicitly {@link PB.MessageToServer.Login.GameData.verify|verify} messages.
                 * @param message GameData message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: PB.MessageToServer.Login.IGameData, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified GameData message, length delimited. Does not implicitly {@link PB.MessageToServer.Login.GameData.verify|verify} messages.
                 * @param message GameData message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: PB.MessageToServer.Login.IGameData, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a GameData message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns GameData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer.Login.GameData;

                /**
                 * Decodes a GameData message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns GameData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer.Login.GameData;

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
                public static fromObject(object: { [k: string]: any }): PB.MessageToServer.Login.GameData;

                /**
                 * Creates a plain object from a GameData message. Also converts values to other types if specified.
                 * @param message GameData
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: PB.MessageToServer.Login.GameData, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.MessageToServer.ICreateGame);

            /** CreateGame gameMode. */
            public gameMode: GameMode;

            /**
             * Creates a new CreateGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns CreateGame instance
             */
            public static create(properties?: PB.MessageToServer.ICreateGame): PB.MessageToServer.CreateGame;

            /**
             * Encodes the specified CreateGame message. Does not implicitly {@link PB.MessageToServer.CreateGame.verify|verify} messages.
             * @param message CreateGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToServer.ICreateGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified CreateGame message, length delimited. Does not implicitly {@link PB.MessageToServer.CreateGame.verify|verify} messages.
             * @param message CreateGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToServer.ICreateGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a CreateGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns CreateGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer.CreateGame;

            /**
             * Decodes a CreateGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns CreateGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer.CreateGame;

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
            public static fromObject(object: { [k: string]: any }): PB.MessageToServer.CreateGame;

            /**
             * Creates a plain object from a CreateGame message. Also converts values to other types if specified.
             * @param message CreateGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToServer.CreateGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.MessageToServer.IEnterGame);

            /** EnterGame gameDisplayNumber. */
            public gameDisplayNumber: number;

            /**
             * Creates a new EnterGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns EnterGame instance
             */
            public static create(properties?: PB.MessageToServer.IEnterGame): PB.MessageToServer.EnterGame;

            /**
             * Encodes the specified EnterGame message. Does not implicitly {@link PB.MessageToServer.EnterGame.verify|verify} messages.
             * @param message EnterGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToServer.IEnterGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified EnterGame message, length delimited. Does not implicitly {@link PB.MessageToServer.EnterGame.verify|verify} messages.
             * @param message EnterGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToServer.IEnterGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an EnterGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns EnterGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer.EnterGame;

            /**
             * Decodes an EnterGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns EnterGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer.EnterGame;

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
            public static fromObject(object: { [k: string]: any }): PB.MessageToServer.EnterGame;

            /**
             * Creates a plain object from an EnterGame message. Also converts values to other types if specified.
             * @param message EnterGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToServer.EnterGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            constructor(properties?: PB.MessageToServer.IExitGame);

            /**
             * Creates a new ExitGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ExitGame instance
             */
            public static create(properties?: PB.MessageToServer.IExitGame): PB.MessageToServer.ExitGame;

            /**
             * Encodes the specified ExitGame message. Does not implicitly {@link PB.MessageToServer.ExitGame.verify|verify} messages.
             * @param message ExitGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToServer.IExitGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ExitGame message, length delimited. Does not implicitly {@link PB.MessageToServer.ExitGame.verify|verify} messages.
             * @param message ExitGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToServer.IExitGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes an ExitGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ExitGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer.ExitGame;

            /**
             * Decodes an ExitGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ExitGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer.ExitGame;

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
            public static fromObject(object: { [k: string]: any }): PB.MessageToServer.ExitGame;

            /**
             * Creates a plain object from an ExitGame message. Also converts values to other types if specified.
             * @param message ExitGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToServer.ExitGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

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
            gameAction?: (PB.IGameAction|null);
        }

        /** Represents a DoGameAction. */
        class DoGameAction implements IDoGameAction {

            /**
             * Constructs a new DoGameAction.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToServer.IDoGameAction);

            /** DoGameAction gameStateHistorySize. */
            public gameStateHistorySize: number;

            /** DoGameAction gameAction. */
            public gameAction?: (PB.IGameAction|null);

            /**
             * Creates a new DoGameAction instance using the specified properties.
             * @param [properties] Properties to set
             * @returns DoGameAction instance
             */
            public static create(properties?: PB.MessageToServer.IDoGameAction): PB.MessageToServer.DoGameAction;

            /**
             * Encodes the specified DoGameAction message. Does not implicitly {@link PB.MessageToServer.DoGameAction.verify|verify} messages.
             * @param message DoGameAction message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToServer.IDoGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified DoGameAction message, length delimited. Does not implicitly {@link PB.MessageToServer.DoGameAction.verify|verify} messages.
             * @param message DoGameAction message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToServer.IDoGameAction, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a DoGameAction message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns DoGameAction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToServer.DoGameAction;

            /**
             * Decodes a DoGameAction message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns DoGameAction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToServer.DoGameAction;

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
            public static fromObject(object: { [k: string]: any }): PB.MessageToServer.DoGameAction;

            /**
             * Creates a plain object from a DoGameAction message. Also converts values to other types if specified.
             * @param message DoGameAction
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToServer.DoGameAction, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this DoGameAction to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
