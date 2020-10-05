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
