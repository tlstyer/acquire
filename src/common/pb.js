/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

/**
 * ErrorCode enum.
 * @exports ErrorCode
 * @enum {number}
 * @property {number} NOT_USING_LATEST_VERSION=0 NOT_USING_LATEST_VERSION value
 * @property {number} INTERNAL_SERVER_ERROR=1 INTERNAL_SERVER_ERROR value
 * @property {number} INVALID_MESSAGE_FORMAT=2 INVALID_MESSAGE_FORMAT value
 * @property {number} INVALID_USERNAME=3 INVALID_USERNAME value
 * @property {number} MISSING_PASSWORD=4 MISSING_PASSWORD value
 * @property {number} PROVIDED_PASSWORD=5 PROVIDED_PASSWORD value
 * @property {number} INCORRECT_PASSWORD=6 INCORRECT_PASSWORD value
 * @property {number} INVALID_MESSAGE=7 INVALID_MESSAGE value
 * @property {number} COULD_NOT_CONNECT=8 COULD_NOT_CONNECT value
 */
$root.ErrorCode = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "NOT_USING_LATEST_VERSION"] = 0;
    values[valuesById[1] = "INTERNAL_SERVER_ERROR"] = 1;
    values[valuesById[2] = "INVALID_MESSAGE_FORMAT"] = 2;
    values[valuesById[3] = "INVALID_USERNAME"] = 3;
    values[valuesById[4] = "MISSING_PASSWORD"] = 4;
    values[valuesById[5] = "PROVIDED_PASSWORD"] = 5;
    values[valuesById[6] = "INCORRECT_PASSWORD"] = 6;
    values[valuesById[7] = "INVALID_MESSAGE"] = 7;
    values[valuesById[8] = "COULD_NOT_CONNECT"] = 8;
    return values;
})();

/**
 * GameBoardType enum.
 * @exports GameBoardType
 * @enum {number}
 * @property {number} LUXOR=0 LUXOR value
 * @property {number} TOWER=1 TOWER value
 * @property {number} AMERICAN=2 AMERICAN value
 * @property {number} FESTIVAL=3 FESTIVAL value
 * @property {number} WORLDWIDE=4 WORLDWIDE value
 * @property {number} CONTINENTAL=5 CONTINENTAL value
 * @property {number} IMPERIAL=6 IMPERIAL value
 * @property {number} NOTHING=7 NOTHING value
 * @property {number} NOTHING_YET=8 NOTHING_YET value
 * @property {number} CANT_PLAY_EVER=9 CANT_PLAY_EVER value
 * @property {number} I_HAVE_THIS=10 I_HAVE_THIS value
 * @property {number} WILL_PUT_LONELY_TILE_DOWN=11 WILL_PUT_LONELY_TILE_DOWN value
 * @property {number} HAVE_NEIGHBORING_TILE_TOO=12 HAVE_NEIGHBORING_TILE_TOO value
 * @property {number} WILL_FORM_NEW_CHAIN=13 WILL_FORM_NEW_CHAIN value
 * @property {number} WILL_MERGE_CHAINS=14 WILL_MERGE_CHAINS value
 * @property {number} CANT_PLAY_NOW=15 CANT_PLAY_NOW value
 * @property {number} MAX=16 MAX value
 */
$root.GameBoardType = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "LUXOR"] = 0;
    values[valuesById[1] = "TOWER"] = 1;
    values[valuesById[2] = "AMERICAN"] = 2;
    values[valuesById[3] = "FESTIVAL"] = 3;
    values[valuesById[4] = "WORLDWIDE"] = 4;
    values[valuesById[5] = "CONTINENTAL"] = 5;
    values[valuesById[6] = "IMPERIAL"] = 6;
    values[valuesById[7] = "NOTHING"] = 7;
    values[valuesById[8] = "NOTHING_YET"] = 8;
    values[valuesById[9] = "CANT_PLAY_EVER"] = 9;
    values[valuesById[10] = "I_HAVE_THIS"] = 10;
    values[valuesById[11] = "WILL_PUT_LONELY_TILE_DOWN"] = 11;
    values[valuesById[12] = "HAVE_NEIGHBORING_TILE_TOO"] = 12;
    values[valuesById[13] = "WILL_FORM_NEW_CHAIN"] = 13;
    values[valuesById[14] = "WILL_MERGE_CHAINS"] = 14;
    values[valuesById[15] = "CANT_PLAY_NOW"] = 15;
    values[valuesById[16] = "MAX"] = 16;
    return values;
})();

/**
 * GameMode enum.
 * @exports GameMode
 * @enum {number}
 * @property {number} SINGLES_1=1 SINGLES_1 value
 * @property {number} SINGLES_2=2 SINGLES_2 value
 * @property {number} SINGLES_3=3 SINGLES_3 value
 * @property {number} SINGLES_4=4 SINGLES_4 value
 * @property {number} SINGLES_5=5 SINGLES_5 value
 * @property {number} SINGLES_6=6 SINGLES_6 value
 * @property {number} TEAMS_2_VS_2=7 TEAMS_2_VS_2 value
 * @property {number} TEAMS_2_VS_2_VS_2=8 TEAMS_2_VS_2_VS_2 value
 * @property {number} TEAMS_3_VS_3=9 TEAMS_3_VS_3 value
 */
$root.GameMode = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[1] = "SINGLES_1"] = 1;
    values[valuesById[2] = "SINGLES_2"] = 2;
    values[valuesById[3] = "SINGLES_3"] = 3;
    values[valuesById[4] = "SINGLES_4"] = 4;
    values[valuesById[5] = "SINGLES_5"] = 5;
    values[valuesById[6] = "SINGLES_6"] = 6;
    values[valuesById[7] = "TEAMS_2_VS_2"] = 7;
    values[valuesById[8] = "TEAMS_2_VS_2_VS_2"] = 8;
    values[valuesById[9] = "TEAMS_3_VS_3"] = 9;
    return values;
})();

/**
 * PlayerArrangementMode enum.
 * @exports PlayerArrangementMode
 * @enum {number}
 * @property {number} VERSION_1=0 VERSION_1 value
 * @property {number} RANDOM_ORDER=1 RANDOM_ORDER value
 * @property {number} EXACT_ORDER=2 EXACT_ORDER value
 * @property {number} SPECIFY_TEAMS=3 SPECIFY_TEAMS value
 */
$root.PlayerArrangementMode = (function() {
    var valuesById = {}, values = Object.create(valuesById);
    values[valuesById[0] = "VERSION_1"] = 0;
    values[valuesById[1] = "RANDOM_ORDER"] = 1;
    values[valuesById[2] = "EXACT_ORDER"] = 2;
    values[valuesById[3] = "SPECIFY_TEAMS"] = 3;
    return values;
})();

$root.GameAction = (function() {

    /**
     * Properties of a GameAction.
     * @exports IGameAction
     * @interface IGameAction
     * @property {GameAction.IStartGame|null} [startGame] GameAction startGame
     * @property {GameAction.IPlayTile|null} [playTile] GameAction playTile
     * @property {GameAction.ISelectNewChain|null} [selectNewChain] GameAction selectNewChain
     * @property {GameAction.ISelectMergerSurvivor|null} [selectMergerSurvivor] GameAction selectMergerSurvivor
     * @property {GameAction.ISelectChainToDisposeOfNext|null} [selectChainToDisposeOfNext] GameAction selectChainToDisposeOfNext
     * @property {GameAction.IDisposeOfShares|null} [disposeOfShares] GameAction disposeOfShares
     * @property {GameAction.IPurchaseShares|null} [purchaseShares] GameAction purchaseShares
     * @property {GameAction.IGameOver|null} [gameOver] GameAction gameOver
     */

    /**
     * Constructs a new GameAction.
     * @exports GameAction
     * @classdesc Represents a GameAction.
     * @implements IGameAction
     * @constructor
     * @param {IGameAction=} [properties] Properties to set
     */
    function GameAction(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * GameAction startGame.
     * @member {GameAction.IStartGame|null|undefined} startGame
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.startGame = null;

    /**
     * GameAction playTile.
     * @member {GameAction.IPlayTile|null|undefined} playTile
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.playTile = null;

    /**
     * GameAction selectNewChain.
     * @member {GameAction.ISelectNewChain|null|undefined} selectNewChain
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.selectNewChain = null;

    /**
     * GameAction selectMergerSurvivor.
     * @member {GameAction.ISelectMergerSurvivor|null|undefined} selectMergerSurvivor
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.selectMergerSurvivor = null;

    /**
     * GameAction selectChainToDisposeOfNext.
     * @member {GameAction.ISelectChainToDisposeOfNext|null|undefined} selectChainToDisposeOfNext
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.selectChainToDisposeOfNext = null;

    /**
     * GameAction disposeOfShares.
     * @member {GameAction.IDisposeOfShares|null|undefined} disposeOfShares
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.disposeOfShares = null;

    /**
     * GameAction purchaseShares.
     * @member {GameAction.IPurchaseShares|null|undefined} purchaseShares
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.purchaseShares = null;

    /**
     * GameAction gameOver.
     * @member {GameAction.IGameOver|null|undefined} gameOver
     * @memberof GameAction
     * @instance
     */
    GameAction.prototype.gameOver = null;

    /**
     * Creates a new GameAction instance using the specified properties.
     * @function create
     * @memberof GameAction
     * @static
     * @param {IGameAction=} [properties] Properties to set
     * @returns {GameAction} GameAction instance
     */
    GameAction.create = function create(properties) {
        return new GameAction(properties);
    };

    /**
     * Encodes the specified GameAction message. Does not implicitly {@link GameAction.verify|verify} messages.
     * @function encode
     * @memberof GameAction
     * @static
     * @param {IGameAction} message GameAction message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GameAction.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.startGame != null && Object.hasOwnProperty.call(message, "startGame"))
            $root.GameAction.StartGame.encode(message.startGame, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
        if (message.playTile != null && Object.hasOwnProperty.call(message, "playTile"))
            $root.GameAction.PlayTile.encode(message.playTile, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
        if (message.selectNewChain != null && Object.hasOwnProperty.call(message, "selectNewChain"))
            $root.GameAction.SelectNewChain.encode(message.selectNewChain, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
        if (message.selectMergerSurvivor != null && Object.hasOwnProperty.call(message, "selectMergerSurvivor"))
            $root.GameAction.SelectMergerSurvivor.encode(message.selectMergerSurvivor, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
        if (message.selectChainToDisposeOfNext != null && Object.hasOwnProperty.call(message, "selectChainToDisposeOfNext"))
            $root.GameAction.SelectChainToDisposeOfNext.encode(message.selectChainToDisposeOfNext, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
        if (message.disposeOfShares != null && Object.hasOwnProperty.call(message, "disposeOfShares"))
            $root.GameAction.DisposeOfShares.encode(message.disposeOfShares, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
        if (message.purchaseShares != null && Object.hasOwnProperty.call(message, "purchaseShares"))
            $root.GameAction.PurchaseShares.encode(message.purchaseShares, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
        if (message.gameOver != null && Object.hasOwnProperty.call(message, "gameOver"))
            $root.GameAction.GameOver.encode(message.gameOver, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
        return writer;
    };

    /**
     * Encodes the specified GameAction message, length delimited. Does not implicitly {@link GameAction.verify|verify} messages.
     * @function encodeDelimited
     * @memberof GameAction
     * @static
     * @param {IGameAction} message GameAction message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    GameAction.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a GameAction message from the specified reader or buffer.
     * @function decode
     * @memberof GameAction
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {GameAction} GameAction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GameAction.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.startGame = $root.GameAction.StartGame.decode(reader, reader.uint32());
                break;
            case 2:
                message.playTile = $root.GameAction.PlayTile.decode(reader, reader.uint32());
                break;
            case 3:
                message.selectNewChain = $root.GameAction.SelectNewChain.decode(reader, reader.uint32());
                break;
            case 4:
                message.selectMergerSurvivor = $root.GameAction.SelectMergerSurvivor.decode(reader, reader.uint32());
                break;
            case 5:
                message.selectChainToDisposeOfNext = $root.GameAction.SelectChainToDisposeOfNext.decode(reader, reader.uint32());
                break;
            case 6:
                message.disposeOfShares = $root.GameAction.DisposeOfShares.decode(reader, reader.uint32());
                break;
            case 7:
                message.purchaseShares = $root.GameAction.PurchaseShares.decode(reader, reader.uint32());
                break;
            case 8:
                message.gameOver = $root.GameAction.GameOver.decode(reader, reader.uint32());
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a GameAction message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof GameAction
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {GameAction} GameAction
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    GameAction.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a GameAction message.
     * @function verify
     * @memberof GameAction
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    GameAction.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.startGame != null && message.hasOwnProperty("startGame")) {
            var error = $root.GameAction.StartGame.verify(message.startGame);
            if (error)
                return "startGame." + error;
        }
        if (message.playTile != null && message.hasOwnProperty("playTile")) {
            var error = $root.GameAction.PlayTile.verify(message.playTile);
            if (error)
                return "playTile." + error;
        }
        if (message.selectNewChain != null && message.hasOwnProperty("selectNewChain")) {
            var error = $root.GameAction.SelectNewChain.verify(message.selectNewChain);
            if (error)
                return "selectNewChain." + error;
        }
        if (message.selectMergerSurvivor != null && message.hasOwnProperty("selectMergerSurvivor")) {
            var error = $root.GameAction.SelectMergerSurvivor.verify(message.selectMergerSurvivor);
            if (error)
                return "selectMergerSurvivor." + error;
        }
        if (message.selectChainToDisposeOfNext != null && message.hasOwnProperty("selectChainToDisposeOfNext")) {
            var error = $root.GameAction.SelectChainToDisposeOfNext.verify(message.selectChainToDisposeOfNext);
            if (error)
                return "selectChainToDisposeOfNext." + error;
        }
        if (message.disposeOfShares != null && message.hasOwnProperty("disposeOfShares")) {
            var error = $root.GameAction.DisposeOfShares.verify(message.disposeOfShares);
            if (error)
                return "disposeOfShares." + error;
        }
        if (message.purchaseShares != null && message.hasOwnProperty("purchaseShares")) {
            var error = $root.GameAction.PurchaseShares.verify(message.purchaseShares);
            if (error)
                return "purchaseShares." + error;
        }
        if (message.gameOver != null && message.hasOwnProperty("gameOver")) {
            var error = $root.GameAction.GameOver.verify(message.gameOver);
            if (error)
                return "gameOver." + error;
        }
        return null;
    };

    /**
     * Creates a GameAction message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof GameAction
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {GameAction} GameAction
     */
    GameAction.fromObject = function fromObject(object) {
        if (object instanceof $root.GameAction)
            return object;
        var message = new $root.GameAction();
        if (object.startGame != null) {
            if (typeof object.startGame !== "object")
                throw TypeError(".GameAction.startGame: object expected");
            message.startGame = $root.GameAction.StartGame.fromObject(object.startGame);
        }
        if (object.playTile != null) {
            if (typeof object.playTile !== "object")
                throw TypeError(".GameAction.playTile: object expected");
            message.playTile = $root.GameAction.PlayTile.fromObject(object.playTile);
        }
        if (object.selectNewChain != null) {
            if (typeof object.selectNewChain !== "object")
                throw TypeError(".GameAction.selectNewChain: object expected");
            message.selectNewChain = $root.GameAction.SelectNewChain.fromObject(object.selectNewChain);
        }
        if (object.selectMergerSurvivor != null) {
            if (typeof object.selectMergerSurvivor !== "object")
                throw TypeError(".GameAction.selectMergerSurvivor: object expected");
            message.selectMergerSurvivor = $root.GameAction.SelectMergerSurvivor.fromObject(object.selectMergerSurvivor);
        }
        if (object.selectChainToDisposeOfNext != null) {
            if (typeof object.selectChainToDisposeOfNext !== "object")
                throw TypeError(".GameAction.selectChainToDisposeOfNext: object expected");
            message.selectChainToDisposeOfNext = $root.GameAction.SelectChainToDisposeOfNext.fromObject(object.selectChainToDisposeOfNext);
        }
        if (object.disposeOfShares != null) {
            if (typeof object.disposeOfShares !== "object")
                throw TypeError(".GameAction.disposeOfShares: object expected");
            message.disposeOfShares = $root.GameAction.DisposeOfShares.fromObject(object.disposeOfShares);
        }
        if (object.purchaseShares != null) {
            if (typeof object.purchaseShares !== "object")
                throw TypeError(".GameAction.purchaseShares: object expected");
            message.purchaseShares = $root.GameAction.PurchaseShares.fromObject(object.purchaseShares);
        }
        if (object.gameOver != null) {
            if (typeof object.gameOver !== "object")
                throw TypeError(".GameAction.gameOver: object expected");
            message.gameOver = $root.GameAction.GameOver.fromObject(object.gameOver);
        }
        return message;
    };

    /**
     * Creates a plain object from a GameAction message. Also converts values to other types if specified.
     * @function toObject
     * @memberof GameAction
     * @static
     * @param {GameAction} message GameAction
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    GameAction.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.startGame = null;
            object.playTile = null;
            object.selectNewChain = null;
            object.selectMergerSurvivor = null;
            object.selectChainToDisposeOfNext = null;
            object.disposeOfShares = null;
            object.purchaseShares = null;
            object.gameOver = null;
        }
        if (message.startGame != null && message.hasOwnProperty("startGame"))
            object.startGame = $root.GameAction.StartGame.toObject(message.startGame, options);
        if (message.playTile != null && message.hasOwnProperty("playTile"))
            object.playTile = $root.GameAction.PlayTile.toObject(message.playTile, options);
        if (message.selectNewChain != null && message.hasOwnProperty("selectNewChain"))
            object.selectNewChain = $root.GameAction.SelectNewChain.toObject(message.selectNewChain, options);
        if (message.selectMergerSurvivor != null && message.hasOwnProperty("selectMergerSurvivor"))
            object.selectMergerSurvivor = $root.GameAction.SelectMergerSurvivor.toObject(message.selectMergerSurvivor, options);
        if (message.selectChainToDisposeOfNext != null && message.hasOwnProperty("selectChainToDisposeOfNext"))
            object.selectChainToDisposeOfNext = $root.GameAction.SelectChainToDisposeOfNext.toObject(message.selectChainToDisposeOfNext, options);
        if (message.disposeOfShares != null && message.hasOwnProperty("disposeOfShares"))
            object.disposeOfShares = $root.GameAction.DisposeOfShares.toObject(message.disposeOfShares, options);
        if (message.purchaseShares != null && message.hasOwnProperty("purchaseShares"))
            object.purchaseShares = $root.GameAction.PurchaseShares.toObject(message.purchaseShares, options);
        if (message.gameOver != null && message.hasOwnProperty("gameOver"))
            object.gameOver = $root.GameAction.GameOver.toObject(message.gameOver, options);
        return object;
    };

    /**
     * Converts this GameAction to JSON.
     * @function toJSON
     * @memberof GameAction
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    GameAction.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    GameAction.StartGame = (function() {

        /**
         * Properties of a StartGame.
         * @memberof GameAction
         * @interface IStartGame
         */

        /**
         * Constructs a new StartGame.
         * @memberof GameAction
         * @classdesc Represents a StartGame.
         * @implements IStartGame
         * @constructor
         * @param {GameAction.IStartGame=} [properties] Properties to set
         */
        function StartGame(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new StartGame instance using the specified properties.
         * @function create
         * @memberof GameAction.StartGame
         * @static
         * @param {GameAction.IStartGame=} [properties] Properties to set
         * @returns {GameAction.StartGame} StartGame instance
         */
        StartGame.create = function create(properties) {
            return new StartGame(properties);
        };

        /**
         * Encodes the specified StartGame message. Does not implicitly {@link GameAction.StartGame.verify|verify} messages.
         * @function encode
         * @memberof GameAction.StartGame
         * @static
         * @param {GameAction.IStartGame} message StartGame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StartGame.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified StartGame message, length delimited. Does not implicitly {@link GameAction.StartGame.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.StartGame
         * @static
         * @param {GameAction.IStartGame} message StartGame message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        StartGame.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a StartGame message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.StartGame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.StartGame} StartGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StartGame.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.StartGame();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a StartGame message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.StartGame
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.StartGame} StartGame
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        StartGame.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a StartGame message.
         * @function verify
         * @memberof GameAction.StartGame
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        StartGame.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a StartGame message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.StartGame
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.StartGame} StartGame
         */
        StartGame.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.StartGame)
                return object;
            return new $root.GameAction.StartGame();
        };

        /**
         * Creates a plain object from a StartGame message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.StartGame
         * @static
         * @param {GameAction.StartGame} message StartGame
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        StartGame.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this StartGame to JSON.
         * @function toJSON
         * @memberof GameAction.StartGame
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        StartGame.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return StartGame;
    })();

    GameAction.PlayTile = (function() {

        /**
         * Properties of a PlayTile.
         * @memberof GameAction
         * @interface IPlayTile
         * @property {number|null} [tile] PlayTile tile
         */

        /**
         * Constructs a new PlayTile.
         * @memberof GameAction
         * @classdesc Represents a PlayTile.
         * @implements IPlayTile
         * @constructor
         * @param {GameAction.IPlayTile=} [properties] Properties to set
         */
        function PlayTile(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayTile tile.
         * @member {number} tile
         * @memberof GameAction.PlayTile
         * @instance
         */
        PlayTile.prototype.tile = 0;

        /**
         * Creates a new PlayTile instance using the specified properties.
         * @function create
         * @memberof GameAction.PlayTile
         * @static
         * @param {GameAction.IPlayTile=} [properties] Properties to set
         * @returns {GameAction.PlayTile} PlayTile instance
         */
        PlayTile.create = function create(properties) {
            return new PlayTile(properties);
        };

        /**
         * Encodes the specified PlayTile message. Does not implicitly {@link GameAction.PlayTile.verify|verify} messages.
         * @function encode
         * @memberof GameAction.PlayTile
         * @static
         * @param {GameAction.IPlayTile} message PlayTile message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayTile.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tile != null && Object.hasOwnProperty.call(message, "tile"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.tile);
            return writer;
        };

        /**
         * Encodes the specified PlayTile message, length delimited. Does not implicitly {@link GameAction.PlayTile.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.PlayTile
         * @static
         * @param {GameAction.IPlayTile} message PlayTile message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayTile.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayTile message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.PlayTile
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.PlayTile} PlayTile
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayTile.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.PlayTile();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.tile = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayTile message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.PlayTile
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.PlayTile} PlayTile
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayTile.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayTile message.
         * @function verify
         * @memberof GameAction.PlayTile
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayTile.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tile != null && message.hasOwnProperty("tile"))
                if (!$util.isInteger(message.tile))
                    return "tile: integer expected";
            return null;
        };

        /**
         * Creates a PlayTile message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.PlayTile
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.PlayTile} PlayTile
         */
        PlayTile.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.PlayTile)
                return object;
            var message = new $root.GameAction.PlayTile();
            if (object.tile != null)
                message.tile = object.tile | 0;
            return message;
        };

        /**
         * Creates a plain object from a PlayTile message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.PlayTile
         * @static
         * @param {GameAction.PlayTile} message PlayTile
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayTile.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.tile = 0;
            if (message.tile != null && message.hasOwnProperty("tile"))
                object.tile = message.tile;
            return object;
        };

        /**
         * Converts this PlayTile to JSON.
         * @function toJSON
         * @memberof GameAction.PlayTile
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayTile.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PlayTile;
    })();

    GameAction.SelectNewChain = (function() {

        /**
         * Properties of a SelectNewChain.
         * @memberof GameAction
         * @interface ISelectNewChain
         * @property {GameBoardType|null} [chain] SelectNewChain chain
         */

        /**
         * Constructs a new SelectNewChain.
         * @memberof GameAction
         * @classdesc Represents a SelectNewChain.
         * @implements ISelectNewChain
         * @constructor
         * @param {GameAction.ISelectNewChain=} [properties] Properties to set
         */
        function SelectNewChain(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SelectNewChain chain.
         * @member {GameBoardType} chain
         * @memberof GameAction.SelectNewChain
         * @instance
         */
        SelectNewChain.prototype.chain = 0;

        /**
         * Creates a new SelectNewChain instance using the specified properties.
         * @function create
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {GameAction.ISelectNewChain=} [properties] Properties to set
         * @returns {GameAction.SelectNewChain} SelectNewChain instance
         */
        SelectNewChain.create = function create(properties) {
            return new SelectNewChain(properties);
        };

        /**
         * Encodes the specified SelectNewChain message. Does not implicitly {@link GameAction.SelectNewChain.verify|verify} messages.
         * @function encode
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {GameAction.ISelectNewChain} message SelectNewChain message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SelectNewChain.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.chain);
            return writer;
        };

        /**
         * Encodes the specified SelectNewChain message, length delimited. Does not implicitly {@link GameAction.SelectNewChain.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {GameAction.ISelectNewChain} message SelectNewChain message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SelectNewChain.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SelectNewChain message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.SelectNewChain} SelectNewChain
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SelectNewChain.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.SelectNewChain();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chain = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SelectNewChain message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.SelectNewChain} SelectNewChain
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SelectNewChain.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SelectNewChain message.
         * @function verify
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SelectNewChain.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                switch (message.chain) {
                default:
                    return "chain: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                    break;
                }
            return null;
        };

        /**
         * Creates a SelectNewChain message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.SelectNewChain} SelectNewChain
         */
        SelectNewChain.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.SelectNewChain)
                return object;
            var message = new $root.GameAction.SelectNewChain();
            switch (object.chain) {
            case "LUXOR":
            case 0:
                message.chain = 0;
                break;
            case "TOWER":
            case 1:
                message.chain = 1;
                break;
            case "AMERICAN":
            case 2:
                message.chain = 2;
                break;
            case "FESTIVAL":
            case 3:
                message.chain = 3;
                break;
            case "WORLDWIDE":
            case 4:
                message.chain = 4;
                break;
            case "CONTINENTAL":
            case 5:
                message.chain = 5;
                break;
            case "IMPERIAL":
            case 6:
                message.chain = 6;
                break;
            case "NOTHING":
            case 7:
                message.chain = 7;
                break;
            case "NOTHING_YET":
            case 8:
                message.chain = 8;
                break;
            case "CANT_PLAY_EVER":
            case 9:
                message.chain = 9;
                break;
            case "I_HAVE_THIS":
            case 10:
                message.chain = 10;
                break;
            case "WILL_PUT_LONELY_TILE_DOWN":
            case 11:
                message.chain = 11;
                break;
            case "HAVE_NEIGHBORING_TILE_TOO":
            case 12:
                message.chain = 12;
                break;
            case "WILL_FORM_NEW_CHAIN":
            case 13:
                message.chain = 13;
                break;
            case "WILL_MERGE_CHAINS":
            case 14:
                message.chain = 14;
                break;
            case "CANT_PLAY_NOW":
            case 15:
                message.chain = 15;
                break;
            case "MAX":
            case 16:
                message.chain = 16;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a SelectNewChain message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.SelectNewChain
         * @static
         * @param {GameAction.SelectNewChain} message SelectNewChain
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SelectNewChain.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.chain = options.enums === String ? "LUXOR" : 0;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = options.enums === String ? $root.GameBoardType[message.chain] : message.chain;
            return object;
        };

        /**
         * Converts this SelectNewChain to JSON.
         * @function toJSON
         * @memberof GameAction.SelectNewChain
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SelectNewChain.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SelectNewChain;
    })();

    GameAction.SelectMergerSurvivor = (function() {

        /**
         * Properties of a SelectMergerSurvivor.
         * @memberof GameAction
         * @interface ISelectMergerSurvivor
         * @property {GameBoardType|null} [chain] SelectMergerSurvivor chain
         */

        /**
         * Constructs a new SelectMergerSurvivor.
         * @memberof GameAction
         * @classdesc Represents a SelectMergerSurvivor.
         * @implements ISelectMergerSurvivor
         * @constructor
         * @param {GameAction.ISelectMergerSurvivor=} [properties] Properties to set
         */
        function SelectMergerSurvivor(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SelectMergerSurvivor chain.
         * @member {GameBoardType} chain
         * @memberof GameAction.SelectMergerSurvivor
         * @instance
         */
        SelectMergerSurvivor.prototype.chain = 0;

        /**
         * Creates a new SelectMergerSurvivor instance using the specified properties.
         * @function create
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {GameAction.ISelectMergerSurvivor=} [properties] Properties to set
         * @returns {GameAction.SelectMergerSurvivor} SelectMergerSurvivor instance
         */
        SelectMergerSurvivor.create = function create(properties) {
            return new SelectMergerSurvivor(properties);
        };

        /**
         * Encodes the specified SelectMergerSurvivor message. Does not implicitly {@link GameAction.SelectMergerSurvivor.verify|verify} messages.
         * @function encode
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {GameAction.ISelectMergerSurvivor} message SelectMergerSurvivor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SelectMergerSurvivor.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.chain);
            return writer;
        };

        /**
         * Encodes the specified SelectMergerSurvivor message, length delimited. Does not implicitly {@link GameAction.SelectMergerSurvivor.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {GameAction.ISelectMergerSurvivor} message SelectMergerSurvivor message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SelectMergerSurvivor.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SelectMergerSurvivor message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.SelectMergerSurvivor} SelectMergerSurvivor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SelectMergerSurvivor.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.SelectMergerSurvivor();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chain = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SelectMergerSurvivor message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.SelectMergerSurvivor} SelectMergerSurvivor
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SelectMergerSurvivor.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SelectMergerSurvivor message.
         * @function verify
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SelectMergerSurvivor.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                switch (message.chain) {
                default:
                    return "chain: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                    break;
                }
            return null;
        };

        /**
         * Creates a SelectMergerSurvivor message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.SelectMergerSurvivor} SelectMergerSurvivor
         */
        SelectMergerSurvivor.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.SelectMergerSurvivor)
                return object;
            var message = new $root.GameAction.SelectMergerSurvivor();
            switch (object.chain) {
            case "LUXOR":
            case 0:
                message.chain = 0;
                break;
            case "TOWER":
            case 1:
                message.chain = 1;
                break;
            case "AMERICAN":
            case 2:
                message.chain = 2;
                break;
            case "FESTIVAL":
            case 3:
                message.chain = 3;
                break;
            case "WORLDWIDE":
            case 4:
                message.chain = 4;
                break;
            case "CONTINENTAL":
            case 5:
                message.chain = 5;
                break;
            case "IMPERIAL":
            case 6:
                message.chain = 6;
                break;
            case "NOTHING":
            case 7:
                message.chain = 7;
                break;
            case "NOTHING_YET":
            case 8:
                message.chain = 8;
                break;
            case "CANT_PLAY_EVER":
            case 9:
                message.chain = 9;
                break;
            case "I_HAVE_THIS":
            case 10:
                message.chain = 10;
                break;
            case "WILL_PUT_LONELY_TILE_DOWN":
            case 11:
                message.chain = 11;
                break;
            case "HAVE_NEIGHBORING_TILE_TOO":
            case 12:
                message.chain = 12;
                break;
            case "WILL_FORM_NEW_CHAIN":
            case 13:
                message.chain = 13;
                break;
            case "WILL_MERGE_CHAINS":
            case 14:
                message.chain = 14;
                break;
            case "CANT_PLAY_NOW":
            case 15:
                message.chain = 15;
                break;
            case "MAX":
            case 16:
                message.chain = 16;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a SelectMergerSurvivor message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.SelectMergerSurvivor
         * @static
         * @param {GameAction.SelectMergerSurvivor} message SelectMergerSurvivor
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SelectMergerSurvivor.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.chain = options.enums === String ? "LUXOR" : 0;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = options.enums === String ? $root.GameBoardType[message.chain] : message.chain;
            return object;
        };

        /**
         * Converts this SelectMergerSurvivor to JSON.
         * @function toJSON
         * @memberof GameAction.SelectMergerSurvivor
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SelectMergerSurvivor.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SelectMergerSurvivor;
    })();

    GameAction.SelectChainToDisposeOfNext = (function() {

        /**
         * Properties of a SelectChainToDisposeOfNext.
         * @memberof GameAction
         * @interface ISelectChainToDisposeOfNext
         * @property {GameBoardType|null} [chain] SelectChainToDisposeOfNext chain
         */

        /**
         * Constructs a new SelectChainToDisposeOfNext.
         * @memberof GameAction
         * @classdesc Represents a SelectChainToDisposeOfNext.
         * @implements ISelectChainToDisposeOfNext
         * @constructor
         * @param {GameAction.ISelectChainToDisposeOfNext=} [properties] Properties to set
         */
        function SelectChainToDisposeOfNext(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * SelectChainToDisposeOfNext chain.
         * @member {GameBoardType} chain
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @instance
         */
        SelectChainToDisposeOfNext.prototype.chain = 0;

        /**
         * Creates a new SelectChainToDisposeOfNext instance using the specified properties.
         * @function create
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {GameAction.ISelectChainToDisposeOfNext=} [properties] Properties to set
         * @returns {GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext instance
         */
        SelectChainToDisposeOfNext.create = function create(properties) {
            return new SelectChainToDisposeOfNext(properties);
        };

        /**
         * Encodes the specified SelectChainToDisposeOfNext message. Does not implicitly {@link GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
         * @function encode
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {GameAction.ISelectChainToDisposeOfNext} message SelectChainToDisposeOfNext message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SelectChainToDisposeOfNext.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chain != null && Object.hasOwnProperty.call(message, "chain"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.chain);
            return writer;
        };

        /**
         * Encodes the specified SelectChainToDisposeOfNext message, length delimited. Does not implicitly {@link GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {GameAction.ISelectChainToDisposeOfNext} message SelectChainToDisposeOfNext message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        SelectChainToDisposeOfNext.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SelectChainToDisposeOfNext.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.SelectChainToDisposeOfNext();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.chain = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        SelectChainToDisposeOfNext.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a SelectChainToDisposeOfNext message.
         * @function verify
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        SelectChainToDisposeOfNext.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chain != null && message.hasOwnProperty("chain"))
                switch (message.chain) {
                default:
                    return "chain: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                case 10:
                case 11:
                case 12:
                case 13:
                case 14:
                case 15:
                case 16:
                    break;
                }
            return null;
        };

        /**
         * Creates a SelectChainToDisposeOfNext message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext
         */
        SelectChainToDisposeOfNext.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.SelectChainToDisposeOfNext)
                return object;
            var message = new $root.GameAction.SelectChainToDisposeOfNext();
            switch (object.chain) {
            case "LUXOR":
            case 0:
                message.chain = 0;
                break;
            case "TOWER":
            case 1:
                message.chain = 1;
                break;
            case "AMERICAN":
            case 2:
                message.chain = 2;
                break;
            case "FESTIVAL":
            case 3:
                message.chain = 3;
                break;
            case "WORLDWIDE":
            case 4:
                message.chain = 4;
                break;
            case "CONTINENTAL":
            case 5:
                message.chain = 5;
                break;
            case "IMPERIAL":
            case 6:
                message.chain = 6;
                break;
            case "NOTHING":
            case 7:
                message.chain = 7;
                break;
            case "NOTHING_YET":
            case 8:
                message.chain = 8;
                break;
            case "CANT_PLAY_EVER":
            case 9:
                message.chain = 9;
                break;
            case "I_HAVE_THIS":
            case 10:
                message.chain = 10;
                break;
            case "WILL_PUT_LONELY_TILE_DOWN":
            case 11:
                message.chain = 11;
                break;
            case "HAVE_NEIGHBORING_TILE_TOO":
            case 12:
                message.chain = 12;
                break;
            case "WILL_FORM_NEW_CHAIN":
            case 13:
                message.chain = 13;
                break;
            case "WILL_MERGE_CHAINS":
            case 14:
                message.chain = 14;
                break;
            case "CANT_PLAY_NOW":
            case 15:
                message.chain = 15;
                break;
            case "MAX":
            case 16:
                message.chain = 16;
                break;
            }
            return message;
        };

        /**
         * Creates a plain object from a SelectChainToDisposeOfNext message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @static
         * @param {GameAction.SelectChainToDisposeOfNext} message SelectChainToDisposeOfNext
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        SelectChainToDisposeOfNext.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults)
                object.chain = options.enums === String ? "LUXOR" : 0;
            if (message.chain != null && message.hasOwnProperty("chain"))
                object.chain = options.enums === String ? $root.GameBoardType[message.chain] : message.chain;
            return object;
        };

        /**
         * Converts this SelectChainToDisposeOfNext to JSON.
         * @function toJSON
         * @memberof GameAction.SelectChainToDisposeOfNext
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        SelectChainToDisposeOfNext.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return SelectChainToDisposeOfNext;
    })();

    GameAction.DisposeOfShares = (function() {

        /**
         * Properties of a DisposeOfShares.
         * @memberof GameAction
         * @interface IDisposeOfShares
         * @property {number|null} [tradeAmount] DisposeOfShares tradeAmount
         * @property {number|null} [sellAmount] DisposeOfShares sellAmount
         */

        /**
         * Constructs a new DisposeOfShares.
         * @memberof GameAction
         * @classdesc Represents a DisposeOfShares.
         * @implements IDisposeOfShares
         * @constructor
         * @param {GameAction.IDisposeOfShares=} [properties] Properties to set
         */
        function DisposeOfShares(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * DisposeOfShares tradeAmount.
         * @member {number} tradeAmount
         * @memberof GameAction.DisposeOfShares
         * @instance
         */
        DisposeOfShares.prototype.tradeAmount = 0;

        /**
         * DisposeOfShares sellAmount.
         * @member {number} sellAmount
         * @memberof GameAction.DisposeOfShares
         * @instance
         */
        DisposeOfShares.prototype.sellAmount = 0;

        /**
         * Creates a new DisposeOfShares instance using the specified properties.
         * @function create
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {GameAction.IDisposeOfShares=} [properties] Properties to set
         * @returns {GameAction.DisposeOfShares} DisposeOfShares instance
         */
        DisposeOfShares.create = function create(properties) {
            return new DisposeOfShares(properties);
        };

        /**
         * Encodes the specified DisposeOfShares message. Does not implicitly {@link GameAction.DisposeOfShares.verify|verify} messages.
         * @function encode
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {GameAction.IDisposeOfShares} message DisposeOfShares message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DisposeOfShares.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tradeAmount != null && Object.hasOwnProperty.call(message, "tradeAmount"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.tradeAmount);
            if (message.sellAmount != null && Object.hasOwnProperty.call(message, "sellAmount"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.sellAmount);
            return writer;
        };

        /**
         * Encodes the specified DisposeOfShares message, length delimited. Does not implicitly {@link GameAction.DisposeOfShares.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {GameAction.IDisposeOfShares} message DisposeOfShares message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        DisposeOfShares.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a DisposeOfShares message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.DisposeOfShares} DisposeOfShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DisposeOfShares.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.DisposeOfShares();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.tradeAmount = reader.int32();
                    break;
                case 2:
                    message.sellAmount = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a DisposeOfShares message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.DisposeOfShares} DisposeOfShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        DisposeOfShares.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a DisposeOfShares message.
         * @function verify
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        DisposeOfShares.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tradeAmount != null && message.hasOwnProperty("tradeAmount"))
                if (!$util.isInteger(message.tradeAmount))
                    return "tradeAmount: integer expected";
            if (message.sellAmount != null && message.hasOwnProperty("sellAmount"))
                if (!$util.isInteger(message.sellAmount))
                    return "sellAmount: integer expected";
            return null;
        };

        /**
         * Creates a DisposeOfShares message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.DisposeOfShares} DisposeOfShares
         */
        DisposeOfShares.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.DisposeOfShares)
                return object;
            var message = new $root.GameAction.DisposeOfShares();
            if (object.tradeAmount != null)
                message.tradeAmount = object.tradeAmount | 0;
            if (object.sellAmount != null)
                message.sellAmount = object.sellAmount | 0;
            return message;
        };

        /**
         * Creates a plain object from a DisposeOfShares message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.DisposeOfShares
         * @static
         * @param {GameAction.DisposeOfShares} message DisposeOfShares
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        DisposeOfShares.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.tradeAmount = 0;
                object.sellAmount = 0;
            }
            if (message.tradeAmount != null && message.hasOwnProperty("tradeAmount"))
                object.tradeAmount = message.tradeAmount;
            if (message.sellAmount != null && message.hasOwnProperty("sellAmount"))
                object.sellAmount = message.sellAmount;
            return object;
        };

        /**
         * Converts this DisposeOfShares to JSON.
         * @function toJSON
         * @memberof GameAction.DisposeOfShares
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        DisposeOfShares.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return DisposeOfShares;
    })();

    GameAction.PurchaseShares = (function() {

        /**
         * Properties of a PurchaseShares.
         * @memberof GameAction
         * @interface IPurchaseShares
         * @property {Array.<GameBoardType>|null} [chains] PurchaseShares chains
         * @property {boolean|null} [endGame] PurchaseShares endGame
         */

        /**
         * Constructs a new PurchaseShares.
         * @memberof GameAction
         * @classdesc Represents a PurchaseShares.
         * @implements IPurchaseShares
         * @constructor
         * @param {GameAction.IPurchaseShares=} [properties] Properties to set
         */
        function PurchaseShares(properties) {
            this.chains = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PurchaseShares chains.
         * @member {Array.<GameBoardType>} chains
         * @memberof GameAction.PurchaseShares
         * @instance
         */
        PurchaseShares.prototype.chains = $util.emptyArray;

        /**
         * PurchaseShares endGame.
         * @member {boolean} endGame
         * @memberof GameAction.PurchaseShares
         * @instance
         */
        PurchaseShares.prototype.endGame = false;

        /**
         * Creates a new PurchaseShares instance using the specified properties.
         * @function create
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {GameAction.IPurchaseShares=} [properties] Properties to set
         * @returns {GameAction.PurchaseShares} PurchaseShares instance
         */
        PurchaseShares.create = function create(properties) {
            return new PurchaseShares(properties);
        };

        /**
         * Encodes the specified PurchaseShares message. Does not implicitly {@link GameAction.PurchaseShares.verify|verify} messages.
         * @function encode
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {GameAction.IPurchaseShares} message PurchaseShares message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PurchaseShares.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.chains != null && message.chains.length) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork();
                for (var i = 0; i < message.chains.length; ++i)
                    writer.int32(message.chains[i]);
                writer.ldelim();
            }
            if (message.endGame != null && Object.hasOwnProperty.call(message, "endGame"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.endGame);
            return writer;
        };

        /**
         * Encodes the specified PurchaseShares message, length delimited. Does not implicitly {@link GameAction.PurchaseShares.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {GameAction.IPurchaseShares} message PurchaseShares message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PurchaseShares.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PurchaseShares message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.PurchaseShares} PurchaseShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PurchaseShares.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.PurchaseShares();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    if (!(message.chains && message.chains.length))
                        message.chains = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.chains.push(reader.int32());
                    } else
                        message.chains.push(reader.int32());
                    break;
                case 2:
                    message.endGame = reader.bool();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PurchaseShares message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.PurchaseShares} PurchaseShares
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PurchaseShares.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PurchaseShares message.
         * @function verify
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PurchaseShares.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.chains != null && message.hasOwnProperty("chains")) {
                if (!Array.isArray(message.chains))
                    return "chains: array expected";
                for (var i = 0; i < message.chains.length; ++i)
                    switch (message.chains[i]) {
                    default:
                        return "chains: enum value[] expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                    case 12:
                    case 13:
                    case 14:
                    case 15:
                    case 16:
                        break;
                    }
            }
            if (message.endGame != null && message.hasOwnProperty("endGame"))
                if (typeof message.endGame !== "boolean")
                    return "endGame: boolean expected";
            return null;
        };

        /**
         * Creates a PurchaseShares message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.PurchaseShares} PurchaseShares
         */
        PurchaseShares.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.PurchaseShares)
                return object;
            var message = new $root.GameAction.PurchaseShares();
            if (object.chains) {
                if (!Array.isArray(object.chains))
                    throw TypeError(".GameAction.PurchaseShares.chains: array expected");
                message.chains = [];
                for (var i = 0; i < object.chains.length; ++i)
                    switch (object.chains[i]) {
                    default:
                    case "LUXOR":
                    case 0:
                        message.chains[i] = 0;
                        break;
                    case "TOWER":
                    case 1:
                        message.chains[i] = 1;
                        break;
                    case "AMERICAN":
                    case 2:
                        message.chains[i] = 2;
                        break;
                    case "FESTIVAL":
                    case 3:
                        message.chains[i] = 3;
                        break;
                    case "WORLDWIDE":
                    case 4:
                        message.chains[i] = 4;
                        break;
                    case "CONTINENTAL":
                    case 5:
                        message.chains[i] = 5;
                        break;
                    case "IMPERIAL":
                    case 6:
                        message.chains[i] = 6;
                        break;
                    case "NOTHING":
                    case 7:
                        message.chains[i] = 7;
                        break;
                    case "NOTHING_YET":
                    case 8:
                        message.chains[i] = 8;
                        break;
                    case "CANT_PLAY_EVER":
                    case 9:
                        message.chains[i] = 9;
                        break;
                    case "I_HAVE_THIS":
                    case 10:
                        message.chains[i] = 10;
                        break;
                    case "WILL_PUT_LONELY_TILE_DOWN":
                    case 11:
                        message.chains[i] = 11;
                        break;
                    case "HAVE_NEIGHBORING_TILE_TOO":
                    case 12:
                        message.chains[i] = 12;
                        break;
                    case "WILL_FORM_NEW_CHAIN":
                    case 13:
                        message.chains[i] = 13;
                        break;
                    case "WILL_MERGE_CHAINS":
                    case 14:
                        message.chains[i] = 14;
                        break;
                    case "CANT_PLAY_NOW":
                    case 15:
                        message.chains[i] = 15;
                        break;
                    case "MAX":
                    case 16:
                        message.chains[i] = 16;
                        break;
                    }
            }
            if (object.endGame != null)
                message.endGame = Boolean(object.endGame);
            return message;
        };

        /**
         * Creates a plain object from a PurchaseShares message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.PurchaseShares
         * @static
         * @param {GameAction.PurchaseShares} message PurchaseShares
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PurchaseShares.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.chains = [];
            if (options.defaults)
                object.endGame = false;
            if (message.chains && message.chains.length) {
                object.chains = [];
                for (var j = 0; j < message.chains.length; ++j)
                    object.chains[j] = options.enums === String ? $root.GameBoardType[message.chains[j]] : message.chains[j];
            }
            if (message.endGame != null && message.hasOwnProperty("endGame"))
                object.endGame = message.endGame;
            return object;
        };

        /**
         * Converts this PurchaseShares to JSON.
         * @function toJSON
         * @memberof GameAction.PurchaseShares
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PurchaseShares.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return PurchaseShares;
    })();

    GameAction.GameOver = (function() {

        /**
         * Properties of a GameOver.
         * @memberof GameAction
         * @interface IGameOver
         */

        /**
         * Constructs a new GameOver.
         * @memberof GameAction
         * @classdesc Represents a GameOver.
         * @implements IGameOver
         * @constructor
         * @param {GameAction.IGameOver=} [properties] Properties to set
         */
        function GameOver(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Creates a new GameOver instance using the specified properties.
         * @function create
         * @memberof GameAction.GameOver
         * @static
         * @param {GameAction.IGameOver=} [properties] Properties to set
         * @returns {GameAction.GameOver} GameOver instance
         */
        GameOver.create = function create(properties) {
            return new GameOver(properties);
        };

        /**
         * Encodes the specified GameOver message. Does not implicitly {@link GameAction.GameOver.verify|verify} messages.
         * @function encode
         * @memberof GameAction.GameOver
         * @static
         * @param {GameAction.IGameOver} message GameOver message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameOver.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            return writer;
        };

        /**
         * Encodes the specified GameOver message, length delimited. Does not implicitly {@link GameAction.GameOver.verify|verify} messages.
         * @function encodeDelimited
         * @memberof GameAction.GameOver
         * @static
         * @param {GameAction.IGameOver} message GameOver message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameOver.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameOver message from the specified reader or buffer.
         * @function decode
         * @memberof GameAction.GameOver
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {GameAction.GameOver} GameOver
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameOver.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.GameAction.GameOver();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameOver message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof GameAction.GameOver
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {GameAction.GameOver} GameOver
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameOver.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameOver message.
         * @function verify
         * @memberof GameAction.GameOver
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameOver.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            return null;
        };

        /**
         * Creates a GameOver message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof GameAction.GameOver
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {GameAction.GameOver} GameOver
         */
        GameOver.fromObject = function fromObject(object) {
            if (object instanceof $root.GameAction.GameOver)
                return object;
            return new $root.GameAction.GameOver();
        };

        /**
         * Creates a plain object from a GameOver message. Also converts values to other types if specified.
         * @function toObject
         * @memberof GameAction.GameOver
         * @static
         * @param {GameAction.GameOver} message GameOver
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameOver.toObject = function toObject() {
            return {};
        };

        /**
         * Converts this GameOver to JSON.
         * @function toJSON
         * @memberof GameAction.GameOver
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameOver.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return GameOver;
    })();

    return GameAction;
})();

module.exports = $root;
