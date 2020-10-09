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

    /** Properties of a GameSetupChange. */
    interface IGameSetupChange {

        /** GameSetupChange userAdded */
        userAdded?: (PB.GameSetupChange.IUserAdded|null);

        /** GameSetupChange userRemoved */
        userRemoved?: (PB.GameSetupChange.IUserRemoved|null);

        /** GameSetupChange userApprovedOfGameSetup */
        userApprovedOfGameSetup?: (PB.GameSetupChange.IUserApprovedOfGameSetup|null);

        /** GameSetupChange gameModeChanged */
        gameModeChanged?: (PB.GameSetupChange.IGameModeChanged|null);

        /** GameSetupChange playerArrangementModeChanged */
        playerArrangementModeChanged?: (PB.GameSetupChange.IPlayerArrangementModeChanged|null);

        /** GameSetupChange positionsSwapped */
        positionsSwapped?: (PB.GameSetupChange.IPositionsSwapped|null);

        /** GameSetupChange userKicked */
        userKicked?: (PB.GameSetupChange.IUserKicked|null);
    }

    /** Represents a GameSetupChange. */
    class GameSetupChange implements IGameSetupChange {

        /**
         * Constructs a new GameSetupChange.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IGameSetupChange);

        /** GameSetupChange userAdded. */
        public userAdded?: (PB.GameSetupChange.IUserAdded|null);

        /** GameSetupChange userRemoved. */
        public userRemoved?: (PB.GameSetupChange.IUserRemoved|null);

        /** GameSetupChange userApprovedOfGameSetup. */
        public userApprovedOfGameSetup?: (PB.GameSetupChange.IUserApprovedOfGameSetup|null);

        /** GameSetupChange gameModeChanged. */
        public gameModeChanged?: (PB.GameSetupChange.IGameModeChanged|null);

        /** GameSetupChange playerArrangementModeChanged. */
        public playerArrangementModeChanged?: (PB.GameSetupChange.IPlayerArrangementModeChanged|null);

        /** GameSetupChange positionsSwapped. */
        public positionsSwapped?: (PB.GameSetupChange.IPositionsSwapped|null);

        /** GameSetupChange userKicked. */
        public userKicked?: (PB.GameSetupChange.IUserKicked|null);

        /**
         * Creates a new GameSetupChange instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GameSetupChange instance
         */
        public static create(properties?: PB.IGameSetupChange): PB.GameSetupChange;

        /**
         * Encodes the specified GameSetupChange message. Does not implicitly {@link PB.GameSetupChange.verify|verify} messages.
         * @param message GameSetupChange message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IGameSetupChange, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GameSetupChange message, length delimited. Does not implicitly {@link PB.GameSetupChange.verify|verify} messages.
         * @param message GameSetupChange message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IGameSetupChange, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GameSetupChange message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GameSetupChange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange;

        /**
         * Decodes a GameSetupChange message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GameSetupChange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange;

        /**
         * Verifies a GameSetupChange message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GameSetupChange message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GameSetupChange
         */
        public static fromObject(object: { [k: string]: any }): PB.GameSetupChange;

        /**
         * Creates a plain object from a GameSetupChange message. Also converts values to other types if specified.
         * @param message GameSetupChange
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.GameSetupChange, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GameSetupChange to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace GameSetupChange {

        /** Properties of a UserAdded. */
        interface IUserAdded {

            /** UserAdded userId */
            userId?: (number|null);
        }

        /** Represents a UserAdded. */
        class UserAdded implements IUserAdded {

            /**
             * Constructs a new UserAdded.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IUserAdded);

            /** UserAdded userId. */
            public userId: number;

            /**
             * Creates a new UserAdded instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UserAdded instance
             */
            public static create(properties?: PB.GameSetupChange.IUserAdded): PB.GameSetupChange.UserAdded;

            /**
             * Encodes the specified UserAdded message. Does not implicitly {@link PB.GameSetupChange.UserAdded.verify|verify} messages.
             * @param message UserAdded message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IUserAdded, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UserAdded message, length delimited. Does not implicitly {@link PB.GameSetupChange.UserAdded.verify|verify} messages.
             * @param message UserAdded message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IUserAdded, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UserAdded message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UserAdded
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.UserAdded;

            /**
             * Decodes a UserAdded message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UserAdded
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.UserAdded;

            /**
             * Verifies a UserAdded message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a UserAdded message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UserAdded
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.UserAdded;

            /**
             * Creates a plain object from a UserAdded message. Also converts values to other types if specified.
             * @param message UserAdded
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.UserAdded, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UserAdded to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a UserRemoved. */
        interface IUserRemoved {

            /** UserRemoved userId */
            userId?: (number|null);
        }

        /** Represents a UserRemoved. */
        class UserRemoved implements IUserRemoved {

            /**
             * Constructs a new UserRemoved.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IUserRemoved);

            /** UserRemoved userId. */
            public userId: number;

            /**
             * Creates a new UserRemoved instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UserRemoved instance
             */
            public static create(properties?: PB.GameSetupChange.IUserRemoved): PB.GameSetupChange.UserRemoved;

            /**
             * Encodes the specified UserRemoved message. Does not implicitly {@link PB.GameSetupChange.UserRemoved.verify|verify} messages.
             * @param message UserRemoved message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IUserRemoved, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UserRemoved message, length delimited. Does not implicitly {@link PB.GameSetupChange.UserRemoved.verify|verify} messages.
             * @param message UserRemoved message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IUserRemoved, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UserRemoved message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UserRemoved
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.UserRemoved;

            /**
             * Decodes a UserRemoved message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UserRemoved
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.UserRemoved;

            /**
             * Verifies a UserRemoved message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a UserRemoved message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UserRemoved
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.UserRemoved;

            /**
             * Creates a plain object from a UserRemoved message. Also converts values to other types if specified.
             * @param message UserRemoved
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.UserRemoved, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UserRemoved to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a UserApprovedOfGameSetup. */
        interface IUserApprovedOfGameSetup {

            /** UserApprovedOfGameSetup userId */
            userId?: (number|null);
        }

        /** Represents a UserApprovedOfGameSetup. */
        class UserApprovedOfGameSetup implements IUserApprovedOfGameSetup {

            /**
             * Constructs a new UserApprovedOfGameSetup.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IUserApprovedOfGameSetup);

            /** UserApprovedOfGameSetup userId. */
            public userId: number;

            /**
             * Creates a new UserApprovedOfGameSetup instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UserApprovedOfGameSetup instance
             */
            public static create(properties?: PB.GameSetupChange.IUserApprovedOfGameSetup): PB.GameSetupChange.UserApprovedOfGameSetup;

            /**
             * Encodes the specified UserApprovedOfGameSetup message. Does not implicitly {@link PB.GameSetupChange.UserApprovedOfGameSetup.verify|verify} messages.
             * @param message UserApprovedOfGameSetup message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IUserApprovedOfGameSetup, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UserApprovedOfGameSetup message, length delimited. Does not implicitly {@link PB.GameSetupChange.UserApprovedOfGameSetup.verify|verify} messages.
             * @param message UserApprovedOfGameSetup message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IUserApprovedOfGameSetup, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UserApprovedOfGameSetup message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UserApprovedOfGameSetup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.UserApprovedOfGameSetup;

            /**
             * Decodes a UserApprovedOfGameSetup message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UserApprovedOfGameSetup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.UserApprovedOfGameSetup;

            /**
             * Verifies a UserApprovedOfGameSetup message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a UserApprovedOfGameSetup message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UserApprovedOfGameSetup
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.UserApprovedOfGameSetup;

            /**
             * Creates a plain object from a UserApprovedOfGameSetup message. Also converts values to other types if specified.
             * @param message UserApprovedOfGameSetup
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.UserApprovedOfGameSetup, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UserApprovedOfGameSetup to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a GameModeChanged. */
        interface IGameModeChanged {

            /** GameModeChanged gameMode */
            gameMode?: (GameMode|null);
        }

        /** Represents a GameModeChanged. */
        class GameModeChanged implements IGameModeChanged {

            /**
             * Constructs a new GameModeChanged.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IGameModeChanged);

            /** GameModeChanged gameMode. */
            public gameMode: GameMode;

            /**
             * Creates a new GameModeChanged instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameModeChanged instance
             */
            public static create(properties?: PB.GameSetupChange.IGameModeChanged): PB.GameSetupChange.GameModeChanged;

            /**
             * Encodes the specified GameModeChanged message. Does not implicitly {@link PB.GameSetupChange.GameModeChanged.verify|verify} messages.
             * @param message GameModeChanged message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IGameModeChanged, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameModeChanged message, length delimited. Does not implicitly {@link PB.GameSetupChange.GameModeChanged.verify|verify} messages.
             * @param message GameModeChanged message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IGameModeChanged, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameModeChanged message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameModeChanged
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.GameModeChanged;

            /**
             * Decodes a GameModeChanged message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameModeChanged
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.GameModeChanged;

            /**
             * Verifies a GameModeChanged message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GameModeChanged message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GameModeChanged
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.GameModeChanged;

            /**
             * Creates a plain object from a GameModeChanged message. Also converts values to other types if specified.
             * @param message GameModeChanged
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.GameModeChanged, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameModeChanged to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a PlayerArrangementModeChanged. */
        interface IPlayerArrangementModeChanged {

            /** PlayerArrangementModeChanged playerArrangementMode */
            playerArrangementMode?: (PlayerArrangementMode|null);
        }

        /** Represents a PlayerArrangementModeChanged. */
        class PlayerArrangementModeChanged implements IPlayerArrangementModeChanged {

            /**
             * Constructs a new PlayerArrangementModeChanged.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IPlayerArrangementModeChanged);

            /** PlayerArrangementModeChanged playerArrangementMode. */
            public playerArrangementMode: PlayerArrangementMode;

            /**
             * Creates a new PlayerArrangementModeChanged instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PlayerArrangementModeChanged instance
             */
            public static create(properties?: PB.GameSetupChange.IPlayerArrangementModeChanged): PB.GameSetupChange.PlayerArrangementModeChanged;

            /**
             * Encodes the specified PlayerArrangementModeChanged message. Does not implicitly {@link PB.GameSetupChange.PlayerArrangementModeChanged.verify|verify} messages.
             * @param message PlayerArrangementModeChanged message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IPlayerArrangementModeChanged, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PlayerArrangementModeChanged message, length delimited. Does not implicitly {@link PB.GameSetupChange.PlayerArrangementModeChanged.verify|verify} messages.
             * @param message PlayerArrangementModeChanged message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IPlayerArrangementModeChanged, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PlayerArrangementModeChanged message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PlayerArrangementModeChanged
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.PlayerArrangementModeChanged;

            /**
             * Decodes a PlayerArrangementModeChanged message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PlayerArrangementModeChanged
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.PlayerArrangementModeChanged;

            /**
             * Verifies a PlayerArrangementModeChanged message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PlayerArrangementModeChanged message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PlayerArrangementModeChanged
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.PlayerArrangementModeChanged;

            /**
             * Creates a plain object from a PlayerArrangementModeChanged message. Also converts values to other types if specified.
             * @param message PlayerArrangementModeChanged
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.PlayerArrangementModeChanged, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PlayerArrangementModeChanged to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a PositionsSwapped. */
        interface IPositionsSwapped {

            /** PositionsSwapped position1 */
            position1?: (number|null);

            /** PositionsSwapped position2 */
            position2?: (number|null);
        }

        /** Represents a PositionsSwapped. */
        class PositionsSwapped implements IPositionsSwapped {

            /**
             * Constructs a new PositionsSwapped.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IPositionsSwapped);

            /** PositionsSwapped position1. */
            public position1: number;

            /** PositionsSwapped position2. */
            public position2: number;

            /**
             * Creates a new PositionsSwapped instance using the specified properties.
             * @param [properties] Properties to set
             * @returns PositionsSwapped instance
             */
            public static create(properties?: PB.GameSetupChange.IPositionsSwapped): PB.GameSetupChange.PositionsSwapped;

            /**
             * Encodes the specified PositionsSwapped message. Does not implicitly {@link PB.GameSetupChange.PositionsSwapped.verify|verify} messages.
             * @param message PositionsSwapped message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IPositionsSwapped, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified PositionsSwapped message, length delimited. Does not implicitly {@link PB.GameSetupChange.PositionsSwapped.verify|verify} messages.
             * @param message PositionsSwapped message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IPositionsSwapped, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a PositionsSwapped message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns PositionsSwapped
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.PositionsSwapped;

            /**
             * Decodes a PositionsSwapped message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns PositionsSwapped
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.PositionsSwapped;

            /**
             * Verifies a PositionsSwapped message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a PositionsSwapped message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns PositionsSwapped
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.PositionsSwapped;

            /**
             * Creates a plain object from a PositionsSwapped message. Also converts values to other types if specified.
             * @param message PositionsSwapped
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.PositionsSwapped, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this PositionsSwapped to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a UserKicked. */
        interface IUserKicked {

            /** UserKicked userId */
            userId?: (number|null);
        }

        /** Represents a UserKicked. */
        class UserKicked implements IUserKicked {

            /**
             * Constructs a new UserKicked.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.GameSetupChange.IUserKicked);

            /** UserKicked userId. */
            public userId: number;

            /**
             * Creates a new UserKicked instance using the specified properties.
             * @param [properties] Properties to set
             * @returns UserKicked instance
             */
            public static create(properties?: PB.GameSetupChange.IUserKicked): PB.GameSetupChange.UserKicked;

            /**
             * Encodes the specified UserKicked message. Does not implicitly {@link PB.GameSetupChange.UserKicked.verify|verify} messages.
             * @param message UserKicked message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.GameSetupChange.IUserKicked, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified UserKicked message, length delimited. Does not implicitly {@link PB.GameSetupChange.UserKicked.verify|verify} messages.
             * @param message UserKicked message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.GameSetupChange.IUserKicked, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a UserKicked message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns UserKicked
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.GameSetupChange.UserKicked;

            /**
             * Decodes a UserKicked message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns UserKicked
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.GameSetupChange.UserKicked;

            /**
             * Verifies a UserKicked message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a UserKicked message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns UserKicked
             */
            public static fromObject(object: { [k: string]: any }): PB.GameSetupChange.UserKicked;

            /**
             * Creates a plain object from a UserKicked message. Also converts values to other types if specified.
             * @param message UserKicked
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.GameSetupChange.UserKicked, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this UserKicked to JSON.
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

    /** Properties of a MessageToClient. */
    interface IMessageToClient {

        /** MessageToClient fatalError */
        fatalError?: (PB.MessageToClient.IFatalError|null);

        /** MessageToClient greetings */
        greetings?: (PB.MessageToClient.IGreetings|null);

        /** MessageToClient clientConnected */
        clientConnected?: (PB.MessageToClient.IClientConnected|null);

        /** MessageToClient clientDisconnected */
        clientDisconnected?: (PB.MessageToClient.IClientDisconnected|null);

        /** MessageToClient gameCreated */
        gameCreated?: (PB.MessageToClient.IGameCreated|null);

        /** MessageToClient clientEnteredGame */
        clientEnteredGame?: (PB.MessageToClient.IClientEnteredGame|null);

        /** MessageToClient clientExitedGame */
        clientExitedGame?: (PB.MessageToClient.IClientExitedGame|null);

        /** MessageToClient gameSetupChanged */
        gameSetupChanged?: (PB.MessageToClient.IGameSetupChanged|null);

        /** MessageToClient gameStarted */
        gameStarted?: (PB.MessageToClient.IGameStarted|null);

        /** MessageToClient gameActionDone */
        gameActionDone?: (PB.MessageToClient.IGameActionDone|null);
    }

    /** Represents a MessageToClient. */
    class MessageToClient implements IMessageToClient {

        /**
         * Constructs a new MessageToClient.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IMessageToClient);

        /** MessageToClient fatalError. */
        public fatalError?: (PB.MessageToClient.IFatalError|null);

        /** MessageToClient greetings. */
        public greetings?: (PB.MessageToClient.IGreetings|null);

        /** MessageToClient clientConnected. */
        public clientConnected?: (PB.MessageToClient.IClientConnected|null);

        /** MessageToClient clientDisconnected. */
        public clientDisconnected?: (PB.MessageToClient.IClientDisconnected|null);

        /** MessageToClient gameCreated. */
        public gameCreated?: (PB.MessageToClient.IGameCreated|null);

        /** MessageToClient clientEnteredGame. */
        public clientEnteredGame?: (PB.MessageToClient.IClientEnteredGame|null);

        /** MessageToClient clientExitedGame. */
        public clientExitedGame?: (PB.MessageToClient.IClientExitedGame|null);

        /** MessageToClient gameSetupChanged. */
        public gameSetupChanged?: (PB.MessageToClient.IGameSetupChanged|null);

        /** MessageToClient gameStarted. */
        public gameStarted?: (PB.MessageToClient.IGameStarted|null);

        /** MessageToClient gameActionDone. */
        public gameActionDone?: (PB.MessageToClient.IGameActionDone|null);

        /**
         * Creates a new MessageToClient instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessageToClient instance
         */
        public static create(properties?: PB.IMessageToClient): PB.MessageToClient;

        /**
         * Encodes the specified MessageToClient message. Does not implicitly {@link PB.MessageToClient.verify|verify} messages.
         * @param message MessageToClient message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IMessageToClient, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessageToClient message, length delimited. Does not implicitly {@link PB.MessageToClient.verify|verify} messages.
         * @param message MessageToClient message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IMessageToClient, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessageToClient message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessageToClient
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient;

        /**
         * Decodes a MessageToClient message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessageToClient
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient;

        /**
         * Verifies a MessageToClient message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessageToClient message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessageToClient
         */
        public static fromObject(object: { [k: string]: any }): PB.MessageToClient;

        /**
         * Creates a plain object from a MessageToClient message. Also converts values to other types if specified.
         * @param message MessageToClient
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.MessageToClient, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessageToClient to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace MessageToClient {

        /** Properties of a FatalError. */
        interface IFatalError {

            /** FatalError errorCode */
            errorCode?: (ErrorCode|null);
        }

        /** Represents a FatalError. */
        class FatalError implements IFatalError {

            /**
             * Constructs a new FatalError.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IFatalError);

            /** FatalError errorCode. */
            public errorCode: ErrorCode;

            /**
             * Creates a new FatalError instance using the specified properties.
             * @param [properties] Properties to set
             * @returns FatalError instance
             */
            public static create(properties?: PB.MessageToClient.IFatalError): PB.MessageToClient.FatalError;

            /**
             * Encodes the specified FatalError message. Does not implicitly {@link PB.MessageToClient.FatalError.verify|verify} messages.
             * @param message FatalError message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IFatalError, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified FatalError message, length delimited. Does not implicitly {@link PB.MessageToClient.FatalError.verify|verify} messages.
             * @param message FatalError message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IFatalError, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a FatalError message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns FatalError
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.FatalError;

            /**
             * Decodes a FatalError message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns FatalError
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.FatalError;

            /**
             * Verifies a FatalError message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a FatalError message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns FatalError
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.FatalError;

            /**
             * Creates a plain object from a FatalError message. Also converts values to other types if specified.
             * @param message FatalError
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.FatalError, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this FatalError to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a Greetings. */
        interface IGreetings {

            /** Greetings clientId */
            clientId?: (number|null);

            /** Greetings users */
            users?: (PB.MessageToClient.Greetings.IUser[]|null);

            /** Greetings games */
            games?: (PB.MessageToClient.Greetings.IGame[]|null);
        }

        /** Represents a Greetings. */
        class Greetings implements IGreetings {

            /**
             * Constructs a new Greetings.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IGreetings);

            /** Greetings clientId. */
            public clientId: number;

            /** Greetings users. */
            public users: PB.MessageToClient.Greetings.IUser[];

            /** Greetings games. */
            public games: PB.MessageToClient.Greetings.IGame[];

            /**
             * Creates a new Greetings instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Greetings instance
             */
            public static create(properties?: PB.MessageToClient.IGreetings): PB.MessageToClient.Greetings;

            /**
             * Encodes the specified Greetings message. Does not implicitly {@link PB.MessageToClient.Greetings.verify|verify} messages.
             * @param message Greetings message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IGreetings, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Greetings message, length delimited. Does not implicitly {@link PB.MessageToClient.Greetings.verify|verify} messages.
             * @param message Greetings message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IGreetings, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Greetings message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Greetings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.Greetings;

            /**
             * Decodes a Greetings message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Greetings
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.Greetings;

            /**
             * Verifies a Greetings message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Greetings message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Greetings
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.Greetings;

            /**
             * Creates a plain object from a Greetings message. Also converts values to other types if specified.
             * @param message Greetings
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.Greetings, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Greetings to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        namespace Greetings {

            /** Properties of a User. */
            interface IUser {

                /** User userId */
                userId?: (number|null);

                /** User username */
                username?: (string|null);

                /** User clients */
                clients?: (PB.MessageToClient.Greetings.User.IClient[]|null);
            }

            /** Represents a User. */
            class User implements IUser {

                /**
                 * Constructs a new User.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: PB.MessageToClient.Greetings.IUser);

                /** User userId. */
                public userId: number;

                /** User username. */
                public username: string;

                /** User clients. */
                public clients: PB.MessageToClient.Greetings.User.IClient[];

                /**
                 * Creates a new User instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns User instance
                 */
                public static create(properties?: PB.MessageToClient.Greetings.IUser): PB.MessageToClient.Greetings.User;

                /**
                 * Encodes the specified User message. Does not implicitly {@link PB.MessageToClient.Greetings.User.verify|verify} messages.
                 * @param message User message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: PB.MessageToClient.Greetings.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified User message, length delimited. Does not implicitly {@link PB.MessageToClient.Greetings.User.verify|verify} messages.
                 * @param message User message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: PB.MessageToClient.Greetings.IUser, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a User message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns User
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.Greetings.User;

                /**
                 * Decodes a User message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns User
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.Greetings.User;

                /**
                 * Verifies a User message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a User message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns User
                 */
                public static fromObject(object: { [k: string]: any }): PB.MessageToClient.Greetings.User;

                /**
                 * Creates a plain object from a User message. Also converts values to other types if specified.
                 * @param message User
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: PB.MessageToClient.Greetings.User, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this User to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }

            namespace User {

                /** Properties of a Client. */
                interface IClient {

                    /** Client clientId */
                    clientId?: (number|null);

                    /** Client gameDisplayNumber */
                    gameDisplayNumber?: (number|null);
                }

                /** Represents a Client. */
                class Client implements IClient {

                    /**
                     * Constructs a new Client.
                     * @param [properties] Properties to set
                     */
                    constructor(properties?: PB.MessageToClient.Greetings.User.IClient);

                    /** Client clientId. */
                    public clientId: number;

                    /** Client gameDisplayNumber. */
                    public gameDisplayNumber: number;

                    /**
                     * Creates a new Client instance using the specified properties.
                     * @param [properties] Properties to set
                     * @returns Client instance
                     */
                    public static create(properties?: PB.MessageToClient.Greetings.User.IClient): PB.MessageToClient.Greetings.User.Client;

                    /**
                     * Encodes the specified Client message. Does not implicitly {@link PB.MessageToClient.Greetings.User.Client.verify|verify} messages.
                     * @param message Client message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encode(message: PB.MessageToClient.Greetings.User.IClient, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Encodes the specified Client message, length delimited. Does not implicitly {@link PB.MessageToClient.Greetings.User.Client.verify|verify} messages.
                     * @param message Client message or plain object to encode
                     * @param [writer] Writer to encode to
                     * @returns Writer
                     */
                    public static encodeDelimited(message: PB.MessageToClient.Greetings.User.IClient, writer?: $protobuf.Writer): $protobuf.Writer;

                    /**
                     * Decodes a Client message from the specified reader or buffer.
                     * @param reader Reader or buffer to decode from
                     * @param [length] Message length if known beforehand
                     * @returns Client
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.Greetings.User.Client;

                    /**
                     * Decodes a Client message from the specified reader or buffer, length delimited.
                     * @param reader Reader or buffer to decode from
                     * @returns Client
                     * @throws {Error} If the payload is not a reader or valid buffer
                     * @throws {$protobuf.util.ProtocolError} If required fields are missing
                     */
                    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.Greetings.User.Client;

                    /**
                     * Verifies a Client message.
                     * @param message Plain object to verify
                     * @returns `null` if valid, otherwise the reason why it is not
                     */
                    public static verify(message: { [k: string]: any }): (string|null);

                    /**
                     * Creates a Client message from a plain object. Also converts values to their respective internal types.
                     * @param object Plain object
                     * @returns Client
                     */
                    public static fromObject(object: { [k: string]: any }): PB.MessageToClient.Greetings.User.Client;

                    /**
                     * Creates a plain object from a Client message. Also converts values to other types if specified.
                     * @param message Client
                     * @param [options] Conversion options
                     * @returns Plain object
                     */
                    public static toObject(message: PB.MessageToClient.Greetings.User.Client, options?: $protobuf.IConversionOptions): { [k: string]: any };

                    /**
                     * Converts this Client to JSON.
                     * @returns JSON object
                     */
                    public toJSON(): { [k: string]: any };
                }
            }

            /** Properties of a Game. */
            interface IGame {

                /** Game gameId */
                gameId?: (number|null);

                /** Game gameDisplayNumber */
                gameDisplayNumber?: (number|null);

                /** Game gameSetupData */
                gameSetupData?: (PB.IGameSetupData|null);

                /** Game gameData */
                gameData?: (PB.IGameData|null);
            }

            /** Represents a Game. */
            class Game implements IGame {

                /**
                 * Constructs a new Game.
                 * @param [properties] Properties to set
                 */
                constructor(properties?: PB.MessageToClient.Greetings.IGame);

                /** Game gameId. */
                public gameId: number;

                /** Game gameDisplayNumber. */
                public gameDisplayNumber: number;

                /** Game gameSetupData. */
                public gameSetupData?: (PB.IGameSetupData|null);

                /** Game gameData. */
                public gameData?: (PB.IGameData|null);

                /**
                 * Creates a new Game instance using the specified properties.
                 * @param [properties] Properties to set
                 * @returns Game instance
                 */
                public static create(properties?: PB.MessageToClient.Greetings.IGame): PB.MessageToClient.Greetings.Game;

                /**
                 * Encodes the specified Game message. Does not implicitly {@link PB.MessageToClient.Greetings.Game.verify|verify} messages.
                 * @param message Game message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encode(message: PB.MessageToClient.Greetings.IGame, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Encodes the specified Game message, length delimited. Does not implicitly {@link PB.MessageToClient.Greetings.Game.verify|verify} messages.
                 * @param message Game message or plain object to encode
                 * @param [writer] Writer to encode to
                 * @returns Writer
                 */
                public static encodeDelimited(message: PB.MessageToClient.Greetings.IGame, writer?: $protobuf.Writer): $protobuf.Writer;

                /**
                 * Decodes a Game message from the specified reader or buffer.
                 * @param reader Reader or buffer to decode from
                 * @param [length] Message length if known beforehand
                 * @returns Game
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.Greetings.Game;

                /**
                 * Decodes a Game message from the specified reader or buffer, length delimited.
                 * @param reader Reader or buffer to decode from
                 * @returns Game
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.Greetings.Game;

                /**
                 * Verifies a Game message.
                 * @param message Plain object to verify
                 * @returns `null` if valid, otherwise the reason why it is not
                 */
                public static verify(message: { [k: string]: any }): (string|null);

                /**
                 * Creates a Game message from a plain object. Also converts values to their respective internal types.
                 * @param object Plain object
                 * @returns Game
                 */
                public static fromObject(object: { [k: string]: any }): PB.MessageToClient.Greetings.Game;

                /**
                 * Creates a plain object from a Game message. Also converts values to other types if specified.
                 * @param message Game
                 * @param [options] Conversion options
                 * @returns Plain object
                 */
                public static toObject(message: PB.MessageToClient.Greetings.Game, options?: $protobuf.IConversionOptions): { [k: string]: any };

                /**
                 * Converts this Game to JSON.
                 * @returns JSON object
                 */
                public toJSON(): { [k: string]: any };
            }
        }

        /** Properties of a ClientConnected. */
        interface IClientConnected {

            /** ClientConnected clientId */
            clientId?: (number|null);

            /** ClientConnected userId */
            userId?: (number|null);

            /** ClientConnected username */
            username?: (string|null);
        }

        /** Represents a ClientConnected. */
        class ClientConnected implements IClientConnected {

            /**
             * Constructs a new ClientConnected.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IClientConnected);

            /** ClientConnected clientId. */
            public clientId: number;

            /** ClientConnected userId. */
            public userId: number;

            /** ClientConnected username. */
            public username: string;

            /**
             * Creates a new ClientConnected instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ClientConnected instance
             */
            public static create(properties?: PB.MessageToClient.IClientConnected): PB.MessageToClient.ClientConnected;

            /**
             * Encodes the specified ClientConnected message. Does not implicitly {@link PB.MessageToClient.ClientConnected.verify|verify} messages.
             * @param message ClientConnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IClientConnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ClientConnected message, length delimited. Does not implicitly {@link PB.MessageToClient.ClientConnected.verify|verify} messages.
             * @param message ClientConnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IClientConnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ClientConnected message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ClientConnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.ClientConnected;

            /**
             * Decodes a ClientConnected message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ClientConnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.ClientConnected;

            /**
             * Verifies a ClientConnected message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ClientConnected message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ClientConnected
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.ClientConnected;

            /**
             * Creates a plain object from a ClientConnected message. Also converts values to other types if specified.
             * @param message ClientConnected
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.ClientConnected, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ClientConnected to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ClientDisconnected. */
        interface IClientDisconnected {

            /** ClientDisconnected clientId */
            clientId?: (number|null);
        }

        /** Represents a ClientDisconnected. */
        class ClientDisconnected implements IClientDisconnected {

            /**
             * Constructs a new ClientDisconnected.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IClientDisconnected);

            /** ClientDisconnected clientId. */
            public clientId: number;

            /**
             * Creates a new ClientDisconnected instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ClientDisconnected instance
             */
            public static create(properties?: PB.MessageToClient.IClientDisconnected): PB.MessageToClient.ClientDisconnected;

            /**
             * Encodes the specified ClientDisconnected message. Does not implicitly {@link PB.MessageToClient.ClientDisconnected.verify|verify} messages.
             * @param message ClientDisconnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IClientDisconnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ClientDisconnected message, length delimited. Does not implicitly {@link PB.MessageToClient.ClientDisconnected.verify|verify} messages.
             * @param message ClientDisconnected message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IClientDisconnected, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ClientDisconnected message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ClientDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.ClientDisconnected;

            /**
             * Decodes a ClientDisconnected message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ClientDisconnected
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.ClientDisconnected;

            /**
             * Verifies a ClientDisconnected message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ClientDisconnected message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ClientDisconnected
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.ClientDisconnected;

            /**
             * Creates a plain object from a ClientDisconnected message. Also converts values to other types if specified.
             * @param message ClientDisconnected
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.ClientDisconnected, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ClientDisconnected to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a GameCreated. */
        interface IGameCreated {

            /** GameCreated gameId */
            gameId?: (number|null);

            /** GameCreated gameDisplayNumber */
            gameDisplayNumber?: (number|null);

            /** GameCreated gameMode */
            gameMode?: (GameMode|null);

            /** GameCreated hostClientId */
            hostClientId?: (number|null);
        }

        /** Represents a GameCreated. */
        class GameCreated implements IGameCreated {

            /**
             * Constructs a new GameCreated.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IGameCreated);

            /** GameCreated gameId. */
            public gameId: number;

            /** GameCreated gameDisplayNumber. */
            public gameDisplayNumber: number;

            /** GameCreated gameMode. */
            public gameMode: GameMode;

            /** GameCreated hostClientId. */
            public hostClientId: number;

            /**
             * Creates a new GameCreated instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameCreated instance
             */
            public static create(properties?: PB.MessageToClient.IGameCreated): PB.MessageToClient.GameCreated;

            /**
             * Encodes the specified GameCreated message. Does not implicitly {@link PB.MessageToClient.GameCreated.verify|verify} messages.
             * @param message GameCreated message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IGameCreated, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameCreated message, length delimited. Does not implicitly {@link PB.MessageToClient.GameCreated.verify|verify} messages.
             * @param message GameCreated message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IGameCreated, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameCreated message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameCreated
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.GameCreated;

            /**
             * Decodes a GameCreated message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameCreated
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.GameCreated;

            /**
             * Verifies a GameCreated message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GameCreated message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GameCreated
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.GameCreated;

            /**
             * Creates a plain object from a GameCreated message. Also converts values to other types if specified.
             * @param message GameCreated
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.GameCreated, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameCreated to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ClientEnteredGame. */
        interface IClientEnteredGame {

            /** ClientEnteredGame clientId */
            clientId?: (number|null);

            /** ClientEnteredGame gameDisplayNumber */
            gameDisplayNumber?: (number|null);
        }

        /** Represents a ClientEnteredGame. */
        class ClientEnteredGame implements IClientEnteredGame {

            /**
             * Constructs a new ClientEnteredGame.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IClientEnteredGame);

            /** ClientEnteredGame clientId. */
            public clientId: number;

            /** ClientEnteredGame gameDisplayNumber. */
            public gameDisplayNumber: number;

            /**
             * Creates a new ClientEnteredGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ClientEnteredGame instance
             */
            public static create(properties?: PB.MessageToClient.IClientEnteredGame): PB.MessageToClient.ClientEnteredGame;

            /**
             * Encodes the specified ClientEnteredGame message. Does not implicitly {@link PB.MessageToClient.ClientEnteredGame.verify|verify} messages.
             * @param message ClientEnteredGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IClientEnteredGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ClientEnteredGame message, length delimited. Does not implicitly {@link PB.MessageToClient.ClientEnteredGame.verify|verify} messages.
             * @param message ClientEnteredGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IClientEnteredGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ClientEnteredGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ClientEnteredGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.ClientEnteredGame;

            /**
             * Decodes a ClientEnteredGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ClientEnteredGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.ClientEnteredGame;

            /**
             * Verifies a ClientEnteredGame message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ClientEnteredGame message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ClientEnteredGame
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.ClientEnteredGame;

            /**
             * Creates a plain object from a ClientEnteredGame message. Also converts values to other types if specified.
             * @param message ClientEnteredGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.ClientEnteredGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ClientEnteredGame to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ClientExitedGame. */
        interface IClientExitedGame {

            /** ClientExitedGame clientId */
            clientId?: (number|null);
        }

        /** Represents a ClientExitedGame. */
        class ClientExitedGame implements IClientExitedGame {

            /**
             * Constructs a new ClientExitedGame.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IClientExitedGame);

            /** ClientExitedGame clientId. */
            public clientId: number;

            /**
             * Creates a new ClientExitedGame instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ClientExitedGame instance
             */
            public static create(properties?: PB.MessageToClient.IClientExitedGame): PB.MessageToClient.ClientExitedGame;

            /**
             * Encodes the specified ClientExitedGame message. Does not implicitly {@link PB.MessageToClient.ClientExitedGame.verify|verify} messages.
             * @param message ClientExitedGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IClientExitedGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ClientExitedGame message, length delimited. Does not implicitly {@link PB.MessageToClient.ClientExitedGame.verify|verify} messages.
             * @param message ClientExitedGame message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IClientExitedGame, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ClientExitedGame message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ClientExitedGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.ClientExitedGame;

            /**
             * Decodes a ClientExitedGame message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ClientExitedGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.ClientExitedGame;

            /**
             * Verifies a ClientExitedGame message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ClientExitedGame message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ClientExitedGame
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.ClientExitedGame;

            /**
             * Creates a plain object from a ClientExitedGame message. Also converts values to other types if specified.
             * @param message ClientExitedGame
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.ClientExitedGame, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ClientExitedGame to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a GameSetupChanged. */
        interface IGameSetupChanged {

            /** GameSetupChanged gameDisplayNumber */
            gameDisplayNumber?: (number|null);

            /** GameSetupChanged gameSetupChange */
            gameSetupChange?: (PB.IGameSetupChange|null);
        }

        /** Represents a GameSetupChanged. */
        class GameSetupChanged implements IGameSetupChanged {

            /**
             * Constructs a new GameSetupChanged.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IGameSetupChanged);

            /** GameSetupChanged gameDisplayNumber. */
            public gameDisplayNumber: number;

            /** GameSetupChanged gameSetupChange. */
            public gameSetupChange?: (PB.IGameSetupChange|null);

            /**
             * Creates a new GameSetupChanged instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameSetupChanged instance
             */
            public static create(properties?: PB.MessageToClient.IGameSetupChanged): PB.MessageToClient.GameSetupChanged;

            /**
             * Encodes the specified GameSetupChanged message. Does not implicitly {@link PB.MessageToClient.GameSetupChanged.verify|verify} messages.
             * @param message GameSetupChanged message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IGameSetupChanged, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameSetupChanged message, length delimited. Does not implicitly {@link PB.MessageToClient.GameSetupChanged.verify|verify} messages.
             * @param message GameSetupChanged message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IGameSetupChanged, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameSetupChanged message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameSetupChanged
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.GameSetupChanged;

            /**
             * Decodes a GameSetupChanged message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameSetupChanged
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.GameSetupChanged;

            /**
             * Verifies a GameSetupChanged message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GameSetupChanged message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GameSetupChanged
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.GameSetupChanged;

            /**
             * Creates a plain object from a GameSetupChanged message. Also converts values to other types if specified.
             * @param message GameSetupChanged
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.GameSetupChanged, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameSetupChanged to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a GameStarted. */
        interface IGameStarted {

            /** GameStarted gameDisplayNumber */
            gameDisplayNumber?: (number|null);

            /** GameStarted userIds */
            userIds?: (number[]|null);
        }

        /** Represents a GameStarted. */
        class GameStarted implements IGameStarted {

            /**
             * Constructs a new GameStarted.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IGameStarted);

            /** GameStarted gameDisplayNumber. */
            public gameDisplayNumber: number;

            /** GameStarted userIds. */
            public userIds: number[];

            /**
             * Creates a new GameStarted instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameStarted instance
             */
            public static create(properties?: PB.MessageToClient.IGameStarted): PB.MessageToClient.GameStarted;

            /**
             * Encodes the specified GameStarted message. Does not implicitly {@link PB.MessageToClient.GameStarted.verify|verify} messages.
             * @param message GameStarted message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IGameStarted, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameStarted message, length delimited. Does not implicitly {@link PB.MessageToClient.GameStarted.verify|verify} messages.
             * @param message GameStarted message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IGameStarted, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameStarted message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameStarted
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.GameStarted;

            /**
             * Decodes a GameStarted message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameStarted
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.GameStarted;

            /**
             * Verifies a GameStarted message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GameStarted message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GameStarted
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.GameStarted;

            /**
             * Creates a plain object from a GameStarted message. Also converts values to other types if specified.
             * @param message GameStarted
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.GameStarted, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameStarted to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a GameActionDone. */
        interface IGameActionDone {

            /** GameActionDone gameDisplayNumber */
            gameDisplayNumber?: (number|null);

            /** GameActionDone gameStateData */
            gameStateData?: (PB.IGameStateData|null);
        }

        /** Represents a GameActionDone. */
        class GameActionDone implements IGameActionDone {

            /**
             * Constructs a new GameActionDone.
             * @param [properties] Properties to set
             */
            constructor(properties?: PB.MessageToClient.IGameActionDone);

            /** GameActionDone gameDisplayNumber. */
            public gameDisplayNumber: number;

            /** GameActionDone gameStateData. */
            public gameStateData?: (PB.IGameStateData|null);

            /**
             * Creates a new GameActionDone instance using the specified properties.
             * @param [properties] Properties to set
             * @returns GameActionDone instance
             */
            public static create(properties?: PB.MessageToClient.IGameActionDone): PB.MessageToClient.GameActionDone;

            /**
             * Encodes the specified GameActionDone message. Does not implicitly {@link PB.MessageToClient.GameActionDone.verify|verify} messages.
             * @param message GameActionDone message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: PB.MessageToClient.IGameActionDone, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified GameActionDone message, length delimited. Does not implicitly {@link PB.MessageToClient.GameActionDone.verify|verify} messages.
             * @param message GameActionDone message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: PB.MessageToClient.IGameActionDone, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a GameActionDone message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns GameActionDone
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessageToClient.GameActionDone;

            /**
             * Decodes a GameActionDone message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns GameActionDone
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessageToClient.GameActionDone;

            /**
             * Verifies a GameActionDone message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a GameActionDone message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns GameActionDone
             */
            public static fromObject(object: { [k: string]: any }): PB.MessageToClient.GameActionDone;

            /**
             * Creates a plain object from a GameActionDone message. Also converts values to other types if specified.
             * @param message GameActionDone
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: PB.MessageToClient.GameActionDone, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this GameActionDone to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a MessagesToClient. */
    interface IMessagesToClient {

        /** MessagesToClient messagesToClient */
        messagesToClient?: (PB.IMessageToClient[]|null);
    }

    /** Represents a MessagesToClient. */
    class MessagesToClient implements IMessagesToClient {

        /**
         * Constructs a new MessagesToClient.
         * @param [properties] Properties to set
         */
        constructor(properties?: PB.IMessagesToClient);

        /** MessagesToClient messagesToClient. */
        public messagesToClient: PB.IMessageToClient[];

        /**
         * Creates a new MessagesToClient instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MessagesToClient instance
         */
        public static create(properties?: PB.IMessagesToClient): PB.MessagesToClient;

        /**
         * Encodes the specified MessagesToClient message. Does not implicitly {@link PB.MessagesToClient.verify|verify} messages.
         * @param message MessagesToClient message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: PB.IMessagesToClient, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MessagesToClient message, length delimited. Does not implicitly {@link PB.MessagesToClient.verify|verify} messages.
         * @param message MessagesToClient message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: PB.IMessagesToClient, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MessagesToClient message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MessagesToClient
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): PB.MessagesToClient;

        /**
         * Decodes a MessagesToClient message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MessagesToClient
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): PB.MessagesToClient;

        /**
         * Verifies a MessagesToClient message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MessagesToClient message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MessagesToClient
         */
        public static fromObject(object: { [k: string]: any }): PB.MessagesToClient;

        /**
         * Creates a plain object from a MessagesToClient message. Also converts values to other types if specified.
         * @param message MessagesToClient
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: PB.MessagesToClient, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MessagesToClient to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
