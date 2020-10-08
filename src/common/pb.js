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

$root.PB = (function() {

    /**
     * Properties of a PB.
     * @exports IPB
     * @interface IPB
     */

    /**
     * Constructs a new PB.
     * @exports PB
     * @classdesc Represents a PB.
     * @implements IPB
     * @constructor
     * @param {IPB=} [properties] Properties to set
     */
    function PB(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Creates a new PB instance using the specified properties.
     * @function create
     * @memberof PB
     * @static
     * @param {IPB=} [properties] Properties to set
     * @returns {PB} PB instance
     */
    PB.create = function create(properties) {
        return new PB(properties);
    };

    /**
     * Encodes the specified PB message. Does not implicitly {@link PB.verify|verify} messages.
     * @function encode
     * @memberof PB
     * @static
     * @param {IPB} message PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PB.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        return writer;
    };

    /**
     * Encodes the specified PB message, length delimited. Does not implicitly {@link PB.verify|verify} messages.
     * @function encodeDelimited
     * @memberof PB
     * @static
     * @param {IPB} message PB message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    PB.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a PB message from the specified reader or buffer.
     * @function decode
     * @memberof PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {PB} PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PB.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB();
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
     * Decodes a PB message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof PB
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {PB} PB
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    PB.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a PB message.
     * @function verify
     * @memberof PB
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    PB.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        return null;
    };

    /**
     * Creates a PB message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof PB
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {PB} PB
     */
    PB.fromObject = function fromObject(object) {
        if (object instanceof $root.PB)
            return object;
        return new $root.PB();
    };

    /**
     * Creates a plain object from a PB message. Also converts values to other types if specified.
     * @function toObject
     * @memberof PB
     * @static
     * @param {PB} message PB
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    PB.toObject = function toObject() {
        return {};
    };

    /**
     * Converts this PB to JSON.
     * @function toJSON
     * @memberof PB
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    PB.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    PB.GameSetupData = (function() {

        /**
         * Properties of a GameSetupData.
         * @memberof PB
         * @interface IGameSetupData
         * @property {GameMode|null} [gameMode] GameSetupData gameMode
         * @property {PlayerArrangementMode|null} [playerArrangementMode] GameSetupData playerArrangementMode
         * @property {Array.<PB.GameSetupData.IPosition>|null} [positions] GameSetupData positions
         */

        /**
         * Constructs a new GameSetupData.
         * @memberof PB
         * @classdesc Represents a GameSetupData.
         * @implements IGameSetupData
         * @constructor
         * @param {PB.IGameSetupData=} [properties] Properties to set
         */
        function GameSetupData(properties) {
            this.positions = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameSetupData gameMode.
         * @member {GameMode} gameMode
         * @memberof PB.GameSetupData
         * @instance
         */
        GameSetupData.prototype.gameMode = 1;

        /**
         * GameSetupData playerArrangementMode.
         * @member {PlayerArrangementMode} playerArrangementMode
         * @memberof PB.GameSetupData
         * @instance
         */
        GameSetupData.prototype.playerArrangementMode = 0;

        /**
         * GameSetupData positions.
         * @member {Array.<PB.GameSetupData.IPosition>} positions
         * @memberof PB.GameSetupData
         * @instance
         */
        GameSetupData.prototype.positions = $util.emptyArray;

        /**
         * Creates a new GameSetupData instance using the specified properties.
         * @function create
         * @memberof PB.GameSetupData
         * @static
         * @param {PB.IGameSetupData=} [properties] Properties to set
         * @returns {PB.GameSetupData} GameSetupData instance
         */
        GameSetupData.create = function create(properties) {
            return new GameSetupData(properties);
        };

        /**
         * Encodes the specified GameSetupData message. Does not implicitly {@link PB.GameSetupData.verify|verify} messages.
         * @function encode
         * @memberof PB.GameSetupData
         * @static
         * @param {PB.IGameSetupData} message GameSetupData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSetupData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.gameMode != null && Object.hasOwnProperty.call(message, "gameMode"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameMode);
            if (message.playerArrangementMode != null && Object.hasOwnProperty.call(message, "playerArrangementMode"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.playerArrangementMode);
            if (message.positions != null && message.positions.length)
                for (var i = 0; i < message.positions.length; ++i)
                    $root.PB.GameSetupData.Position.encode(message.positions[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified GameSetupData message, length delimited. Does not implicitly {@link PB.GameSetupData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PB.GameSetupData
         * @static
         * @param {PB.IGameSetupData} message GameSetupData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSetupData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameSetupData message from the specified reader or buffer.
         * @function decode
         * @memberof PB.GameSetupData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PB.GameSetupData} GameSetupData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSetupData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.gameMode = reader.int32();
                    break;
                case 2:
                    message.playerArrangementMode = reader.int32();
                    break;
                case 3:
                    if (!(message.positions && message.positions.length))
                        message.positions = [];
                    message.positions.push($root.PB.GameSetupData.Position.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameSetupData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PB.GameSetupData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PB.GameSetupData} GameSetupData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSetupData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameSetupData message.
         * @function verify
         * @memberof PB.GameSetupData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameSetupData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                switch (message.gameMode) {
                default:
                    return "gameMode: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    break;
                }
            if (message.playerArrangementMode != null && message.hasOwnProperty("playerArrangementMode"))
                switch (message.playerArrangementMode) {
                default:
                    return "playerArrangementMode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.positions != null && message.hasOwnProperty("positions")) {
                if (!Array.isArray(message.positions))
                    return "positions: array expected";
                for (var i = 0; i < message.positions.length; ++i) {
                    var error = $root.PB.GameSetupData.Position.verify(message.positions[i]);
                    if (error)
                        return "positions." + error;
                }
            }
            return null;
        };

        /**
         * Creates a GameSetupData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PB.GameSetupData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PB.GameSetupData} GameSetupData
         */
        GameSetupData.fromObject = function fromObject(object) {
            if (object instanceof $root.PB.GameSetupData)
                return object;
            var message = new $root.PB.GameSetupData();
            switch (object.gameMode) {
            case "SINGLES_1":
            case 1:
                message.gameMode = 1;
                break;
            case "SINGLES_2":
            case 2:
                message.gameMode = 2;
                break;
            case "SINGLES_3":
            case 3:
                message.gameMode = 3;
                break;
            case "SINGLES_4":
            case 4:
                message.gameMode = 4;
                break;
            case "SINGLES_5":
            case 5:
                message.gameMode = 5;
                break;
            case "SINGLES_6":
            case 6:
                message.gameMode = 6;
                break;
            case "TEAMS_2_VS_2":
            case 7:
                message.gameMode = 7;
                break;
            case "TEAMS_2_VS_2_VS_2":
            case 8:
                message.gameMode = 8;
                break;
            case "TEAMS_3_VS_3":
            case 9:
                message.gameMode = 9;
                break;
            }
            switch (object.playerArrangementMode) {
            case "VERSION_1":
            case 0:
                message.playerArrangementMode = 0;
                break;
            case "RANDOM_ORDER":
            case 1:
                message.playerArrangementMode = 1;
                break;
            case "EXACT_ORDER":
            case 2:
                message.playerArrangementMode = 2;
                break;
            case "SPECIFY_TEAMS":
            case 3:
                message.playerArrangementMode = 3;
                break;
            }
            if (object.positions) {
                if (!Array.isArray(object.positions))
                    throw TypeError(".PB.GameSetupData.positions: array expected");
                message.positions = [];
                for (var i = 0; i < object.positions.length; ++i) {
                    if (typeof object.positions[i] !== "object")
                        throw TypeError(".PB.GameSetupData.positions: object expected");
                    message.positions[i] = $root.PB.GameSetupData.Position.fromObject(object.positions[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a GameSetupData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PB.GameSetupData
         * @static
         * @param {PB.GameSetupData} message GameSetupData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameSetupData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.positions = [];
            if (options.defaults) {
                object.gameMode = options.enums === String ? "SINGLES_1" : 1;
                object.playerArrangementMode = options.enums === String ? "VERSION_1" : 0;
            }
            if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                object.gameMode = options.enums === String ? $root.GameMode[message.gameMode] : message.gameMode;
            if (message.playerArrangementMode != null && message.hasOwnProperty("playerArrangementMode"))
                object.playerArrangementMode = options.enums === String ? $root.PlayerArrangementMode[message.playerArrangementMode] : message.playerArrangementMode;
            if (message.positions && message.positions.length) {
                object.positions = [];
                for (var j = 0; j < message.positions.length; ++j)
                    object.positions[j] = $root.PB.GameSetupData.Position.toObject(message.positions[j], options);
            }
            return object;
        };

        /**
         * Converts this GameSetupData to JSON.
         * @function toJSON
         * @memberof PB.GameSetupData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameSetupData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        GameSetupData.Position = (function() {

            /**
             * Properties of a Position.
             * @memberof PB.GameSetupData
             * @interface IPosition
             * @property {number|null} [userId] Position userId
             * @property {boolean|null} [isHost] Position isHost
             * @property {boolean|null} [approvesOfGameSetup] Position approvesOfGameSetup
             */

            /**
             * Constructs a new Position.
             * @memberof PB.GameSetupData
             * @classdesc Represents a Position.
             * @implements IPosition
             * @constructor
             * @param {PB.GameSetupData.IPosition=} [properties] Properties to set
             */
            function Position(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Position userId.
             * @member {number} userId
             * @memberof PB.GameSetupData.Position
             * @instance
             */
            Position.prototype.userId = 0;

            /**
             * Position isHost.
             * @member {boolean} isHost
             * @memberof PB.GameSetupData.Position
             * @instance
             */
            Position.prototype.isHost = false;

            /**
             * Position approvesOfGameSetup.
             * @member {boolean} approvesOfGameSetup
             * @memberof PB.GameSetupData.Position
             * @instance
             */
            Position.prototype.approvesOfGameSetup = false;

            /**
             * Creates a new Position instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {PB.GameSetupData.IPosition=} [properties] Properties to set
             * @returns {PB.GameSetupData.Position} Position instance
             */
            Position.create = function create(properties) {
                return new Position(properties);
            };

            /**
             * Encodes the specified Position message. Does not implicitly {@link PB.GameSetupData.Position.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {PB.GameSetupData.IPosition} message Position message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Position.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.userId);
                if (message.isHost != null && Object.hasOwnProperty.call(message, "isHost"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isHost);
                if (message.approvesOfGameSetup != null && Object.hasOwnProperty.call(message, "approvesOfGameSetup"))
                    writer.uint32(/* id 3, wireType 0 =*/24).bool(message.approvesOfGameSetup);
                return writer;
            };

            /**
             * Encodes the specified Position message, length delimited. Does not implicitly {@link PB.GameSetupData.Position.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {PB.GameSetupData.IPosition} message Position message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Position.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Position message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupData.Position} Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Position.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupData.Position();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.userId = reader.int32();
                        break;
                    case 2:
                        message.isHost = reader.bool();
                        break;
                    case 3:
                        message.approvesOfGameSetup = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Position message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupData.Position} Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Position.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Position message.
             * @function verify
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Position.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.userId != null && message.hasOwnProperty("userId"))
                    if (!$util.isInteger(message.userId))
                        return "userId: integer expected";
                if (message.isHost != null && message.hasOwnProperty("isHost"))
                    if (typeof message.isHost !== "boolean")
                        return "isHost: boolean expected";
                if (message.approvesOfGameSetup != null && message.hasOwnProperty("approvesOfGameSetup"))
                    if (typeof message.approvesOfGameSetup !== "boolean")
                        return "approvesOfGameSetup: boolean expected";
                return null;
            };

            /**
             * Creates a Position message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupData.Position} Position
             */
            Position.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupData.Position)
                    return object;
                var message = new $root.PB.GameSetupData.Position();
                if (object.userId != null)
                    message.userId = object.userId | 0;
                if (object.isHost != null)
                    message.isHost = Boolean(object.isHost);
                if (object.approvesOfGameSetup != null)
                    message.approvesOfGameSetup = Boolean(object.approvesOfGameSetup);
                return message;
            };

            /**
             * Creates a plain object from a Position message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupData.Position
             * @static
             * @param {PB.GameSetupData.Position} message Position
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Position.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.userId = 0;
                    object.isHost = false;
                    object.approvesOfGameSetup = false;
                }
                if (message.userId != null && message.hasOwnProperty("userId"))
                    object.userId = message.userId;
                if (message.isHost != null && message.hasOwnProperty("isHost"))
                    object.isHost = message.isHost;
                if (message.approvesOfGameSetup != null && message.hasOwnProperty("approvesOfGameSetup"))
                    object.approvesOfGameSetup = message.approvesOfGameSetup;
                return object;
            };

            /**
             * Converts this Position to JSON.
             * @function toJSON
             * @memberof PB.GameSetupData.Position
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Position.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Position;
        })();

        return GameSetupData;
    })();

    PB.GameStateData = (function() {

        /**
         * Properties of a GameStateData.
         * @memberof PB
         * @interface IGameStateData
         * @property {PB.IGameAction|null} [gameAction] GameStateData gameAction
         * @property {number|null} [timestamp] GameStateData timestamp
         * @property {Array.<PB.GameStateData.IRevealedTileRackTile>|null} [revealedTileRackTiles] GameStateData revealedTileRackTiles
         * @property {Array.<number>|null} [revealedTileBagTiles] GameStateData revealedTileBagTiles
         * @property {number|null} [playerIdWithPlayableTilePlusOne] GameStateData playerIdWithPlayableTilePlusOne
         */

        /**
         * Constructs a new GameStateData.
         * @memberof PB
         * @classdesc Represents a GameStateData.
         * @implements IGameStateData
         * @constructor
         * @param {PB.IGameStateData=} [properties] Properties to set
         */
        function GameStateData(properties) {
            this.revealedTileRackTiles = [];
            this.revealedTileBagTiles = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameStateData gameAction.
         * @member {PB.IGameAction|null|undefined} gameAction
         * @memberof PB.GameStateData
         * @instance
         */
        GameStateData.prototype.gameAction = null;

        /**
         * GameStateData timestamp.
         * @member {number} timestamp
         * @memberof PB.GameStateData
         * @instance
         */
        GameStateData.prototype.timestamp = 0;

        /**
         * GameStateData revealedTileRackTiles.
         * @member {Array.<PB.GameStateData.IRevealedTileRackTile>} revealedTileRackTiles
         * @memberof PB.GameStateData
         * @instance
         */
        GameStateData.prototype.revealedTileRackTiles = $util.emptyArray;

        /**
         * GameStateData revealedTileBagTiles.
         * @member {Array.<number>} revealedTileBagTiles
         * @memberof PB.GameStateData
         * @instance
         */
        GameStateData.prototype.revealedTileBagTiles = $util.emptyArray;

        /**
         * GameStateData playerIdWithPlayableTilePlusOne.
         * @member {number} playerIdWithPlayableTilePlusOne
         * @memberof PB.GameStateData
         * @instance
         */
        GameStateData.prototype.playerIdWithPlayableTilePlusOne = 0;

        /**
         * Creates a new GameStateData instance using the specified properties.
         * @function create
         * @memberof PB.GameStateData
         * @static
         * @param {PB.IGameStateData=} [properties] Properties to set
         * @returns {PB.GameStateData} GameStateData instance
         */
        GameStateData.create = function create(properties) {
            return new GameStateData(properties);
        };

        /**
         * Encodes the specified GameStateData message. Does not implicitly {@link PB.GameStateData.verify|verify} messages.
         * @function encode
         * @memberof PB.GameStateData
         * @static
         * @param {PB.IGameStateData} message GameStateData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameStateData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.gameAction != null && Object.hasOwnProperty.call(message, "gameAction"))
                $root.PB.GameAction.encode(message.gameAction, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.timestamp != null && Object.hasOwnProperty.call(message, "timestamp"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.timestamp);
            if (message.revealedTileRackTiles != null && message.revealedTileRackTiles.length)
                for (var i = 0; i < message.revealedTileRackTiles.length; ++i)
                    $root.PB.GameStateData.RevealedTileRackTile.encode(message.revealedTileRackTiles[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.revealedTileBagTiles != null && message.revealedTileBagTiles.length) {
                writer.uint32(/* id 4, wireType 2 =*/34).fork();
                for (var i = 0; i < message.revealedTileBagTiles.length; ++i)
                    writer.int32(message.revealedTileBagTiles[i]);
                writer.ldelim();
            }
            if (message.playerIdWithPlayableTilePlusOne != null && Object.hasOwnProperty.call(message, "playerIdWithPlayableTilePlusOne"))
                writer.uint32(/* id 5, wireType 0 =*/40).int32(message.playerIdWithPlayableTilePlusOne);
            return writer;
        };

        /**
         * Encodes the specified GameStateData message, length delimited. Does not implicitly {@link PB.GameStateData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PB.GameStateData
         * @static
         * @param {PB.IGameStateData} message GameStateData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameStateData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameStateData message from the specified reader or buffer.
         * @function decode
         * @memberof PB.GameStateData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PB.GameStateData} GameStateData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameStateData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameStateData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.gameAction = $root.PB.GameAction.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.timestamp = reader.int32();
                    break;
                case 3:
                    if (!(message.revealedTileRackTiles && message.revealedTileRackTiles.length))
                        message.revealedTileRackTiles = [];
                    message.revealedTileRackTiles.push($root.PB.GameStateData.RevealedTileRackTile.decode(reader, reader.uint32()));
                    break;
                case 4:
                    if (!(message.revealedTileBagTiles && message.revealedTileBagTiles.length))
                        message.revealedTileBagTiles = [];
                    if ((tag & 7) === 2) {
                        var end2 = reader.uint32() + reader.pos;
                        while (reader.pos < end2)
                            message.revealedTileBagTiles.push(reader.int32());
                    } else
                        message.revealedTileBagTiles.push(reader.int32());
                    break;
                case 5:
                    message.playerIdWithPlayableTilePlusOne = reader.int32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameStateData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PB.GameStateData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PB.GameStateData} GameStateData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameStateData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameStateData message.
         * @function verify
         * @memberof PB.GameStateData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameStateData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.gameAction != null && message.hasOwnProperty("gameAction")) {
                var error = $root.PB.GameAction.verify(message.gameAction);
                if (error)
                    return "gameAction." + error;
            }
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                if (!$util.isInteger(message.timestamp))
                    return "timestamp: integer expected";
            if (message.revealedTileRackTiles != null && message.hasOwnProperty("revealedTileRackTiles")) {
                if (!Array.isArray(message.revealedTileRackTiles))
                    return "revealedTileRackTiles: array expected";
                for (var i = 0; i < message.revealedTileRackTiles.length; ++i) {
                    var error = $root.PB.GameStateData.RevealedTileRackTile.verify(message.revealedTileRackTiles[i]);
                    if (error)
                        return "revealedTileRackTiles." + error;
                }
            }
            if (message.revealedTileBagTiles != null && message.hasOwnProperty("revealedTileBagTiles")) {
                if (!Array.isArray(message.revealedTileBagTiles))
                    return "revealedTileBagTiles: array expected";
                for (var i = 0; i < message.revealedTileBagTiles.length; ++i)
                    if (!$util.isInteger(message.revealedTileBagTiles[i]))
                        return "revealedTileBagTiles: integer[] expected";
            }
            if (message.playerIdWithPlayableTilePlusOne != null && message.hasOwnProperty("playerIdWithPlayableTilePlusOne"))
                if (!$util.isInteger(message.playerIdWithPlayableTilePlusOne))
                    return "playerIdWithPlayableTilePlusOne: integer expected";
            return null;
        };

        /**
         * Creates a GameStateData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PB.GameStateData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PB.GameStateData} GameStateData
         */
        GameStateData.fromObject = function fromObject(object) {
            if (object instanceof $root.PB.GameStateData)
                return object;
            var message = new $root.PB.GameStateData();
            if (object.gameAction != null) {
                if (typeof object.gameAction !== "object")
                    throw TypeError(".PB.GameStateData.gameAction: object expected");
                message.gameAction = $root.PB.GameAction.fromObject(object.gameAction);
            }
            if (object.timestamp != null)
                message.timestamp = object.timestamp | 0;
            if (object.revealedTileRackTiles) {
                if (!Array.isArray(object.revealedTileRackTiles))
                    throw TypeError(".PB.GameStateData.revealedTileRackTiles: array expected");
                message.revealedTileRackTiles = [];
                for (var i = 0; i < object.revealedTileRackTiles.length; ++i) {
                    if (typeof object.revealedTileRackTiles[i] !== "object")
                        throw TypeError(".PB.GameStateData.revealedTileRackTiles: object expected");
                    message.revealedTileRackTiles[i] = $root.PB.GameStateData.RevealedTileRackTile.fromObject(object.revealedTileRackTiles[i]);
                }
            }
            if (object.revealedTileBagTiles) {
                if (!Array.isArray(object.revealedTileBagTiles))
                    throw TypeError(".PB.GameStateData.revealedTileBagTiles: array expected");
                message.revealedTileBagTiles = [];
                for (var i = 0; i < object.revealedTileBagTiles.length; ++i)
                    message.revealedTileBagTiles[i] = object.revealedTileBagTiles[i] | 0;
            }
            if (object.playerIdWithPlayableTilePlusOne != null)
                message.playerIdWithPlayableTilePlusOne = object.playerIdWithPlayableTilePlusOne | 0;
            return message;
        };

        /**
         * Creates a plain object from a GameStateData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PB.GameStateData
         * @static
         * @param {PB.GameStateData} message GameStateData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameStateData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.revealedTileRackTiles = [];
                object.revealedTileBagTiles = [];
            }
            if (options.defaults) {
                object.gameAction = null;
                object.timestamp = 0;
                object.playerIdWithPlayableTilePlusOne = 0;
            }
            if (message.gameAction != null && message.hasOwnProperty("gameAction"))
                object.gameAction = $root.PB.GameAction.toObject(message.gameAction, options);
            if (message.timestamp != null && message.hasOwnProperty("timestamp"))
                object.timestamp = message.timestamp;
            if (message.revealedTileRackTiles && message.revealedTileRackTiles.length) {
                object.revealedTileRackTiles = [];
                for (var j = 0; j < message.revealedTileRackTiles.length; ++j)
                    object.revealedTileRackTiles[j] = $root.PB.GameStateData.RevealedTileRackTile.toObject(message.revealedTileRackTiles[j], options);
            }
            if (message.revealedTileBagTiles && message.revealedTileBagTiles.length) {
                object.revealedTileBagTiles = [];
                for (var j = 0; j < message.revealedTileBagTiles.length; ++j)
                    object.revealedTileBagTiles[j] = message.revealedTileBagTiles[j];
            }
            if (message.playerIdWithPlayableTilePlusOne != null && message.hasOwnProperty("playerIdWithPlayableTilePlusOne"))
                object.playerIdWithPlayableTilePlusOne = message.playerIdWithPlayableTilePlusOne;
            return object;
        };

        /**
         * Converts this GameStateData to JSON.
         * @function toJSON
         * @memberof PB.GameStateData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameStateData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        GameStateData.RevealedTileRackTile = (function() {

            /**
             * Properties of a RevealedTileRackTile.
             * @memberof PB.GameStateData
             * @interface IRevealedTileRackTile
             * @property {number|null} [tile] RevealedTileRackTile tile
             * @property {number|null} [playerIdBelongsTo] RevealedTileRackTile playerIdBelongsTo
             */

            /**
             * Constructs a new RevealedTileRackTile.
             * @memberof PB.GameStateData
             * @classdesc Represents a RevealedTileRackTile.
             * @implements IRevealedTileRackTile
             * @constructor
             * @param {PB.GameStateData.IRevealedTileRackTile=} [properties] Properties to set
             */
            function RevealedTileRackTile(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * RevealedTileRackTile tile.
             * @member {number} tile
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @instance
             */
            RevealedTileRackTile.prototype.tile = 0;

            /**
             * RevealedTileRackTile playerIdBelongsTo.
             * @member {number} playerIdBelongsTo
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @instance
             */
            RevealedTileRackTile.prototype.playerIdBelongsTo = 0;

            /**
             * Creates a new RevealedTileRackTile instance using the specified properties.
             * @function create
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {PB.GameStateData.IRevealedTileRackTile=} [properties] Properties to set
             * @returns {PB.GameStateData.RevealedTileRackTile} RevealedTileRackTile instance
             */
            RevealedTileRackTile.create = function create(properties) {
                return new RevealedTileRackTile(properties);
            };

            /**
             * Encodes the specified RevealedTileRackTile message. Does not implicitly {@link PB.GameStateData.RevealedTileRackTile.verify|verify} messages.
             * @function encode
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {PB.GameStateData.IRevealedTileRackTile} message RevealedTileRackTile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RevealedTileRackTile.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.tile != null && Object.hasOwnProperty.call(message, "tile"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.tile);
                if (message.playerIdBelongsTo != null && Object.hasOwnProperty.call(message, "playerIdBelongsTo"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.playerIdBelongsTo);
                return writer;
            };

            /**
             * Encodes the specified RevealedTileRackTile message, length delimited. Does not implicitly {@link PB.GameStateData.RevealedTileRackTile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {PB.GameStateData.IRevealedTileRackTile} message RevealedTileRackTile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            RevealedTileRackTile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a RevealedTileRackTile message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameStateData.RevealedTileRackTile} RevealedTileRackTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RevealedTileRackTile.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameStateData.RevealedTileRackTile();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.tile = reader.int32();
                        break;
                    case 2:
                        message.playerIdBelongsTo = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a RevealedTileRackTile message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameStateData.RevealedTileRackTile} RevealedTileRackTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            RevealedTileRackTile.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a RevealedTileRackTile message.
             * @function verify
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            RevealedTileRackTile.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.tile != null && message.hasOwnProperty("tile"))
                    if (!$util.isInteger(message.tile))
                        return "tile: integer expected";
                if (message.playerIdBelongsTo != null && message.hasOwnProperty("playerIdBelongsTo"))
                    if (!$util.isInteger(message.playerIdBelongsTo))
                        return "playerIdBelongsTo: integer expected";
                return null;
            };

            /**
             * Creates a RevealedTileRackTile message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameStateData.RevealedTileRackTile} RevealedTileRackTile
             */
            RevealedTileRackTile.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameStateData.RevealedTileRackTile)
                    return object;
                var message = new $root.PB.GameStateData.RevealedTileRackTile();
                if (object.tile != null)
                    message.tile = object.tile | 0;
                if (object.playerIdBelongsTo != null)
                    message.playerIdBelongsTo = object.playerIdBelongsTo | 0;
                return message;
            };

            /**
             * Creates a plain object from a RevealedTileRackTile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @static
             * @param {PB.GameStateData.RevealedTileRackTile} message RevealedTileRackTile
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            RevealedTileRackTile.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.tile = 0;
                    object.playerIdBelongsTo = 0;
                }
                if (message.tile != null && message.hasOwnProperty("tile"))
                    object.tile = message.tile;
                if (message.playerIdBelongsTo != null && message.hasOwnProperty("playerIdBelongsTo"))
                    object.playerIdBelongsTo = message.playerIdBelongsTo;
                return object;
            };

            /**
             * Converts this RevealedTileRackTile to JSON.
             * @function toJSON
             * @memberof PB.GameStateData.RevealedTileRackTile
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            RevealedTileRackTile.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return RevealedTileRackTile;
        })();

        return GameStateData;
    })();

    PB.GameData = (function() {

        /**
         * Properties of a GameData.
         * @memberof PB
         * @interface IGameData
         * @property {GameMode|null} [gameMode] GameData gameMode
         * @property {PlayerArrangementMode|null} [playerArrangementMode] GameData playerArrangementMode
         * @property {Array.<PB.GameData.IPosition>|null} [positions] GameData positions
         * @property {Array.<PB.IGameStateData>|null} [gameStateDatas] GameData gameStateDatas
         */

        /**
         * Constructs a new GameData.
         * @memberof PB
         * @classdesc Represents a GameData.
         * @implements IGameData
         * @constructor
         * @param {PB.IGameData=} [properties] Properties to set
         */
        function GameData(properties) {
            this.positions = [];
            this.gameStateDatas = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameData gameMode.
         * @member {GameMode} gameMode
         * @memberof PB.GameData
         * @instance
         */
        GameData.prototype.gameMode = 1;

        /**
         * GameData playerArrangementMode.
         * @member {PlayerArrangementMode} playerArrangementMode
         * @memberof PB.GameData
         * @instance
         */
        GameData.prototype.playerArrangementMode = 0;

        /**
         * GameData positions.
         * @member {Array.<PB.GameData.IPosition>} positions
         * @memberof PB.GameData
         * @instance
         */
        GameData.prototype.positions = $util.emptyArray;

        /**
         * GameData gameStateDatas.
         * @member {Array.<PB.IGameStateData>} gameStateDatas
         * @memberof PB.GameData
         * @instance
         */
        GameData.prototype.gameStateDatas = $util.emptyArray;

        /**
         * Creates a new GameData instance using the specified properties.
         * @function create
         * @memberof PB.GameData
         * @static
         * @param {PB.IGameData=} [properties] Properties to set
         * @returns {PB.GameData} GameData instance
         */
        GameData.create = function create(properties) {
            return new GameData(properties);
        };

        /**
         * Encodes the specified GameData message. Does not implicitly {@link PB.GameData.verify|verify} messages.
         * @function encode
         * @memberof PB.GameData
         * @static
         * @param {PB.IGameData} message GameData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameData.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.gameMode != null && Object.hasOwnProperty.call(message, "gameMode"))
                writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameMode);
            if (message.playerArrangementMode != null && Object.hasOwnProperty.call(message, "playerArrangementMode"))
                writer.uint32(/* id 2, wireType 0 =*/16).int32(message.playerArrangementMode);
            if (message.positions != null && message.positions.length)
                for (var i = 0; i < message.positions.length; ++i)
                    $root.PB.GameData.Position.encode(message.positions[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.gameStateDatas != null && message.gameStateDatas.length)
                for (var i = 0; i < message.gameStateDatas.length; ++i)
                    $root.PB.GameStateData.encode(message.gameStateDatas[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified GameData message, length delimited. Does not implicitly {@link PB.GameData.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PB.GameData
         * @static
         * @param {PB.IGameData} message GameData message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameData.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameData message from the specified reader or buffer.
         * @function decode
         * @memberof PB.GameData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PB.GameData} GameData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameData.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameData();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.gameMode = reader.int32();
                    break;
                case 2:
                    message.playerArrangementMode = reader.int32();
                    break;
                case 3:
                    if (!(message.positions && message.positions.length))
                        message.positions = [];
                    message.positions.push($root.PB.GameData.Position.decode(reader, reader.uint32()));
                    break;
                case 4:
                    if (!(message.gameStateDatas && message.gameStateDatas.length))
                        message.gameStateDatas = [];
                    message.gameStateDatas.push($root.PB.GameStateData.decode(reader, reader.uint32()));
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameData message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PB.GameData
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PB.GameData} GameData
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameData.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameData message.
         * @function verify
         * @memberof PB.GameData
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameData.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                switch (message.gameMode) {
                default:
                    return "gameMode: enum value expected";
                case 1:
                case 2:
                case 3:
                case 4:
                case 5:
                case 6:
                case 7:
                case 8:
                case 9:
                    break;
                }
            if (message.playerArrangementMode != null && message.hasOwnProperty("playerArrangementMode"))
                switch (message.playerArrangementMode) {
                default:
                    return "playerArrangementMode: enum value expected";
                case 0:
                case 1:
                case 2:
                case 3:
                    break;
                }
            if (message.positions != null && message.hasOwnProperty("positions")) {
                if (!Array.isArray(message.positions))
                    return "positions: array expected";
                for (var i = 0; i < message.positions.length; ++i) {
                    var error = $root.PB.GameData.Position.verify(message.positions[i]);
                    if (error)
                        return "positions." + error;
                }
            }
            if (message.gameStateDatas != null && message.hasOwnProperty("gameStateDatas")) {
                if (!Array.isArray(message.gameStateDatas))
                    return "gameStateDatas: array expected";
                for (var i = 0; i < message.gameStateDatas.length; ++i) {
                    var error = $root.PB.GameStateData.verify(message.gameStateDatas[i]);
                    if (error)
                        return "gameStateDatas." + error;
                }
            }
            return null;
        };

        /**
         * Creates a GameData message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PB.GameData
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PB.GameData} GameData
         */
        GameData.fromObject = function fromObject(object) {
            if (object instanceof $root.PB.GameData)
                return object;
            var message = new $root.PB.GameData();
            switch (object.gameMode) {
            case "SINGLES_1":
            case 1:
                message.gameMode = 1;
                break;
            case "SINGLES_2":
            case 2:
                message.gameMode = 2;
                break;
            case "SINGLES_3":
            case 3:
                message.gameMode = 3;
                break;
            case "SINGLES_4":
            case 4:
                message.gameMode = 4;
                break;
            case "SINGLES_5":
            case 5:
                message.gameMode = 5;
                break;
            case "SINGLES_6":
            case 6:
                message.gameMode = 6;
                break;
            case "TEAMS_2_VS_2":
            case 7:
                message.gameMode = 7;
                break;
            case "TEAMS_2_VS_2_VS_2":
            case 8:
                message.gameMode = 8;
                break;
            case "TEAMS_3_VS_3":
            case 9:
                message.gameMode = 9;
                break;
            }
            switch (object.playerArrangementMode) {
            case "VERSION_1":
            case 0:
                message.playerArrangementMode = 0;
                break;
            case "RANDOM_ORDER":
            case 1:
                message.playerArrangementMode = 1;
                break;
            case "EXACT_ORDER":
            case 2:
                message.playerArrangementMode = 2;
                break;
            case "SPECIFY_TEAMS":
            case 3:
                message.playerArrangementMode = 3;
                break;
            }
            if (object.positions) {
                if (!Array.isArray(object.positions))
                    throw TypeError(".PB.GameData.positions: array expected");
                message.positions = [];
                for (var i = 0; i < object.positions.length; ++i) {
                    if (typeof object.positions[i] !== "object")
                        throw TypeError(".PB.GameData.positions: object expected");
                    message.positions[i] = $root.PB.GameData.Position.fromObject(object.positions[i]);
                }
            }
            if (object.gameStateDatas) {
                if (!Array.isArray(object.gameStateDatas))
                    throw TypeError(".PB.GameData.gameStateDatas: array expected");
                message.gameStateDatas = [];
                for (var i = 0; i < object.gameStateDatas.length; ++i) {
                    if (typeof object.gameStateDatas[i] !== "object")
                        throw TypeError(".PB.GameData.gameStateDatas: object expected");
                    message.gameStateDatas[i] = $root.PB.GameStateData.fromObject(object.gameStateDatas[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a GameData message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PB.GameData
         * @static
         * @param {PB.GameData} message GameData
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameData.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults) {
                object.positions = [];
                object.gameStateDatas = [];
            }
            if (options.defaults) {
                object.gameMode = options.enums === String ? "SINGLES_1" : 1;
                object.playerArrangementMode = options.enums === String ? "VERSION_1" : 0;
            }
            if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                object.gameMode = options.enums === String ? $root.GameMode[message.gameMode] : message.gameMode;
            if (message.playerArrangementMode != null && message.hasOwnProperty("playerArrangementMode"))
                object.playerArrangementMode = options.enums === String ? $root.PlayerArrangementMode[message.playerArrangementMode] : message.playerArrangementMode;
            if (message.positions && message.positions.length) {
                object.positions = [];
                for (var j = 0; j < message.positions.length; ++j)
                    object.positions[j] = $root.PB.GameData.Position.toObject(message.positions[j], options);
            }
            if (message.gameStateDatas && message.gameStateDatas.length) {
                object.gameStateDatas = [];
                for (var j = 0; j < message.gameStateDatas.length; ++j)
                    object.gameStateDatas[j] = $root.PB.GameStateData.toObject(message.gameStateDatas[j], options);
            }
            return object;
        };

        /**
         * Converts this GameData to JSON.
         * @function toJSON
         * @memberof PB.GameData
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameData.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        GameData.Position = (function() {

            /**
             * Properties of a Position.
             * @memberof PB.GameData
             * @interface IPosition
             * @property {number|null} [userId] Position userId
             * @property {boolean|null} [isHost] Position isHost
             */

            /**
             * Constructs a new Position.
             * @memberof PB.GameData
             * @classdesc Represents a Position.
             * @implements IPosition
             * @constructor
             * @param {PB.GameData.IPosition=} [properties] Properties to set
             */
            function Position(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Position userId.
             * @member {number} userId
             * @memberof PB.GameData.Position
             * @instance
             */
            Position.prototype.userId = 0;

            /**
             * Position isHost.
             * @member {boolean} isHost
             * @memberof PB.GameData.Position
             * @instance
             */
            Position.prototype.isHost = false;

            /**
             * Creates a new Position instance using the specified properties.
             * @function create
             * @memberof PB.GameData.Position
             * @static
             * @param {PB.GameData.IPosition=} [properties] Properties to set
             * @returns {PB.GameData.Position} Position instance
             */
            Position.create = function create(properties) {
                return new Position(properties);
            };

            /**
             * Encodes the specified Position message. Does not implicitly {@link PB.GameData.Position.verify|verify} messages.
             * @function encode
             * @memberof PB.GameData.Position
             * @static
             * @param {PB.GameData.IPosition} message Position message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Position.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.userId);
                if (message.isHost != null && Object.hasOwnProperty.call(message, "isHost"))
                    writer.uint32(/* id 2, wireType 0 =*/16).bool(message.isHost);
                return writer;
            };

            /**
             * Encodes the specified Position message, length delimited. Does not implicitly {@link PB.GameData.Position.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameData.Position
             * @static
             * @param {PB.GameData.IPosition} message Position message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Position.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Position message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameData.Position
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameData.Position} Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Position.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameData.Position();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.userId = reader.int32();
                        break;
                    case 2:
                        message.isHost = reader.bool();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Position message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameData.Position
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameData.Position} Position
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Position.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Position message.
             * @function verify
             * @memberof PB.GameData.Position
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Position.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.userId != null && message.hasOwnProperty("userId"))
                    if (!$util.isInteger(message.userId))
                        return "userId: integer expected";
                if (message.isHost != null && message.hasOwnProperty("isHost"))
                    if (typeof message.isHost !== "boolean")
                        return "isHost: boolean expected";
                return null;
            };

            /**
             * Creates a Position message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameData.Position
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameData.Position} Position
             */
            Position.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameData.Position)
                    return object;
                var message = new $root.PB.GameData.Position();
                if (object.userId != null)
                    message.userId = object.userId | 0;
                if (object.isHost != null)
                    message.isHost = Boolean(object.isHost);
                return message;
            };

            /**
             * Creates a plain object from a Position message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameData.Position
             * @static
             * @param {PB.GameData.Position} message Position
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Position.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.userId = 0;
                    object.isHost = false;
                }
                if (message.userId != null && message.hasOwnProperty("userId"))
                    object.userId = message.userId;
                if (message.isHost != null && message.hasOwnProperty("isHost"))
                    object.isHost = message.isHost;
                return object;
            };

            /**
             * Converts this Position to JSON.
             * @function toJSON
             * @memberof PB.GameData.Position
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Position.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return Position;
        })();

        return GameData;
    })();

    PB.GameSetupAction = (function() {

        /**
         * Properties of a GameSetupAction.
         * @memberof PB
         * @interface IGameSetupAction
         * @property {PB.GameSetupAction.IJoinGame|null} [joinGame] GameSetupAction joinGame
         * @property {PB.GameSetupAction.IUnjoinGame|null} [unjoinGame] GameSetupAction unjoinGame
         * @property {PB.GameSetupAction.IApproveOfGameSetup|null} [approveOfGameSetup] GameSetupAction approveOfGameSetup
         * @property {PB.GameSetupAction.IChangeGameMode|null} [changeGameMode] GameSetupAction changeGameMode
         * @property {PB.GameSetupAction.IChangePlayerArrangementMode|null} [changePlayerArrangementMode] GameSetupAction changePlayerArrangementMode
         * @property {PB.GameSetupAction.ISwapPositions|null} [swapPositions] GameSetupAction swapPositions
         * @property {PB.GameSetupAction.IKickUser|null} [kickUser] GameSetupAction kickUser
         */

        /**
         * Constructs a new GameSetupAction.
         * @memberof PB
         * @classdesc Represents a GameSetupAction.
         * @implements IGameSetupAction
         * @constructor
         * @param {PB.IGameSetupAction=} [properties] Properties to set
         */
        function GameSetupAction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameSetupAction joinGame.
         * @member {PB.GameSetupAction.IJoinGame|null|undefined} joinGame
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.joinGame = null;

        /**
         * GameSetupAction unjoinGame.
         * @member {PB.GameSetupAction.IUnjoinGame|null|undefined} unjoinGame
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.unjoinGame = null;

        /**
         * GameSetupAction approveOfGameSetup.
         * @member {PB.GameSetupAction.IApproveOfGameSetup|null|undefined} approveOfGameSetup
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.approveOfGameSetup = null;

        /**
         * GameSetupAction changeGameMode.
         * @member {PB.GameSetupAction.IChangeGameMode|null|undefined} changeGameMode
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.changeGameMode = null;

        /**
         * GameSetupAction changePlayerArrangementMode.
         * @member {PB.GameSetupAction.IChangePlayerArrangementMode|null|undefined} changePlayerArrangementMode
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.changePlayerArrangementMode = null;

        /**
         * GameSetupAction swapPositions.
         * @member {PB.GameSetupAction.ISwapPositions|null|undefined} swapPositions
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.swapPositions = null;

        /**
         * GameSetupAction kickUser.
         * @member {PB.GameSetupAction.IKickUser|null|undefined} kickUser
         * @memberof PB.GameSetupAction
         * @instance
         */
        GameSetupAction.prototype.kickUser = null;

        /**
         * Creates a new GameSetupAction instance using the specified properties.
         * @function create
         * @memberof PB.GameSetupAction
         * @static
         * @param {PB.IGameSetupAction=} [properties] Properties to set
         * @returns {PB.GameSetupAction} GameSetupAction instance
         */
        GameSetupAction.create = function create(properties) {
            return new GameSetupAction(properties);
        };

        /**
         * Encodes the specified GameSetupAction message. Does not implicitly {@link PB.GameSetupAction.verify|verify} messages.
         * @function encode
         * @memberof PB.GameSetupAction
         * @static
         * @param {PB.IGameSetupAction} message GameSetupAction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSetupAction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.joinGame != null && Object.hasOwnProperty.call(message, "joinGame"))
                $root.PB.GameSetupAction.JoinGame.encode(message.joinGame, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.unjoinGame != null && Object.hasOwnProperty.call(message, "unjoinGame"))
                $root.PB.GameSetupAction.UnjoinGame.encode(message.unjoinGame, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.approveOfGameSetup != null && Object.hasOwnProperty.call(message, "approveOfGameSetup"))
                $root.PB.GameSetupAction.ApproveOfGameSetup.encode(message.approveOfGameSetup, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.changeGameMode != null && Object.hasOwnProperty.call(message, "changeGameMode"))
                $root.PB.GameSetupAction.ChangeGameMode.encode(message.changeGameMode, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.changePlayerArrangementMode != null && Object.hasOwnProperty.call(message, "changePlayerArrangementMode"))
                $root.PB.GameSetupAction.ChangePlayerArrangementMode.encode(message.changePlayerArrangementMode, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.swapPositions != null && Object.hasOwnProperty.call(message, "swapPositions"))
                $root.PB.GameSetupAction.SwapPositions.encode(message.swapPositions, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.kickUser != null && Object.hasOwnProperty.call(message, "kickUser"))
                $root.PB.GameSetupAction.KickUser.encode(message.kickUser, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified GameSetupAction message, length delimited. Does not implicitly {@link PB.GameSetupAction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PB.GameSetupAction
         * @static
         * @param {PB.IGameSetupAction} message GameSetupAction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameSetupAction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameSetupAction message from the specified reader or buffer.
         * @function decode
         * @memberof PB.GameSetupAction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PB.GameSetupAction} GameSetupAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSetupAction.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.joinGame = $root.PB.GameSetupAction.JoinGame.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.unjoinGame = $root.PB.GameSetupAction.UnjoinGame.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.approveOfGameSetup = $root.PB.GameSetupAction.ApproveOfGameSetup.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.changeGameMode = $root.PB.GameSetupAction.ChangeGameMode.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.changePlayerArrangementMode = $root.PB.GameSetupAction.ChangePlayerArrangementMode.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.swapPositions = $root.PB.GameSetupAction.SwapPositions.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.kickUser = $root.PB.GameSetupAction.KickUser.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a GameSetupAction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PB.GameSetupAction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PB.GameSetupAction} GameSetupAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameSetupAction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a GameSetupAction message.
         * @function verify
         * @memberof PB.GameSetupAction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameSetupAction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.joinGame != null && message.hasOwnProperty("joinGame")) {
                var error = $root.PB.GameSetupAction.JoinGame.verify(message.joinGame);
                if (error)
                    return "joinGame." + error;
            }
            if (message.unjoinGame != null && message.hasOwnProperty("unjoinGame")) {
                var error = $root.PB.GameSetupAction.UnjoinGame.verify(message.unjoinGame);
                if (error)
                    return "unjoinGame." + error;
            }
            if (message.approveOfGameSetup != null && message.hasOwnProperty("approveOfGameSetup")) {
                var error = $root.PB.GameSetupAction.ApproveOfGameSetup.verify(message.approveOfGameSetup);
                if (error)
                    return "approveOfGameSetup." + error;
            }
            if (message.changeGameMode != null && message.hasOwnProperty("changeGameMode")) {
                var error = $root.PB.GameSetupAction.ChangeGameMode.verify(message.changeGameMode);
                if (error)
                    return "changeGameMode." + error;
            }
            if (message.changePlayerArrangementMode != null && message.hasOwnProperty("changePlayerArrangementMode")) {
                var error = $root.PB.GameSetupAction.ChangePlayerArrangementMode.verify(message.changePlayerArrangementMode);
                if (error)
                    return "changePlayerArrangementMode." + error;
            }
            if (message.swapPositions != null && message.hasOwnProperty("swapPositions")) {
                var error = $root.PB.GameSetupAction.SwapPositions.verify(message.swapPositions);
                if (error)
                    return "swapPositions." + error;
            }
            if (message.kickUser != null && message.hasOwnProperty("kickUser")) {
                var error = $root.PB.GameSetupAction.KickUser.verify(message.kickUser);
                if (error)
                    return "kickUser." + error;
            }
            return null;
        };

        /**
         * Creates a GameSetupAction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PB.GameSetupAction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PB.GameSetupAction} GameSetupAction
         */
        GameSetupAction.fromObject = function fromObject(object) {
            if (object instanceof $root.PB.GameSetupAction)
                return object;
            var message = new $root.PB.GameSetupAction();
            if (object.joinGame != null) {
                if (typeof object.joinGame !== "object")
                    throw TypeError(".PB.GameSetupAction.joinGame: object expected");
                message.joinGame = $root.PB.GameSetupAction.JoinGame.fromObject(object.joinGame);
            }
            if (object.unjoinGame != null) {
                if (typeof object.unjoinGame !== "object")
                    throw TypeError(".PB.GameSetupAction.unjoinGame: object expected");
                message.unjoinGame = $root.PB.GameSetupAction.UnjoinGame.fromObject(object.unjoinGame);
            }
            if (object.approveOfGameSetup != null) {
                if (typeof object.approveOfGameSetup !== "object")
                    throw TypeError(".PB.GameSetupAction.approveOfGameSetup: object expected");
                message.approveOfGameSetup = $root.PB.GameSetupAction.ApproveOfGameSetup.fromObject(object.approveOfGameSetup);
            }
            if (object.changeGameMode != null) {
                if (typeof object.changeGameMode !== "object")
                    throw TypeError(".PB.GameSetupAction.changeGameMode: object expected");
                message.changeGameMode = $root.PB.GameSetupAction.ChangeGameMode.fromObject(object.changeGameMode);
            }
            if (object.changePlayerArrangementMode != null) {
                if (typeof object.changePlayerArrangementMode !== "object")
                    throw TypeError(".PB.GameSetupAction.changePlayerArrangementMode: object expected");
                message.changePlayerArrangementMode = $root.PB.GameSetupAction.ChangePlayerArrangementMode.fromObject(object.changePlayerArrangementMode);
            }
            if (object.swapPositions != null) {
                if (typeof object.swapPositions !== "object")
                    throw TypeError(".PB.GameSetupAction.swapPositions: object expected");
                message.swapPositions = $root.PB.GameSetupAction.SwapPositions.fromObject(object.swapPositions);
            }
            if (object.kickUser != null) {
                if (typeof object.kickUser !== "object")
                    throw TypeError(".PB.GameSetupAction.kickUser: object expected");
                message.kickUser = $root.PB.GameSetupAction.KickUser.fromObject(object.kickUser);
            }
            return message;
        };

        /**
         * Creates a plain object from a GameSetupAction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PB.GameSetupAction
         * @static
         * @param {PB.GameSetupAction} message GameSetupAction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        GameSetupAction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.joinGame = null;
                object.unjoinGame = null;
                object.approveOfGameSetup = null;
                object.changeGameMode = null;
                object.changePlayerArrangementMode = null;
                object.swapPositions = null;
                object.kickUser = null;
            }
            if (message.joinGame != null && message.hasOwnProperty("joinGame"))
                object.joinGame = $root.PB.GameSetupAction.JoinGame.toObject(message.joinGame, options);
            if (message.unjoinGame != null && message.hasOwnProperty("unjoinGame"))
                object.unjoinGame = $root.PB.GameSetupAction.UnjoinGame.toObject(message.unjoinGame, options);
            if (message.approveOfGameSetup != null && message.hasOwnProperty("approveOfGameSetup"))
                object.approveOfGameSetup = $root.PB.GameSetupAction.ApproveOfGameSetup.toObject(message.approveOfGameSetup, options);
            if (message.changeGameMode != null && message.hasOwnProperty("changeGameMode"))
                object.changeGameMode = $root.PB.GameSetupAction.ChangeGameMode.toObject(message.changeGameMode, options);
            if (message.changePlayerArrangementMode != null && message.hasOwnProperty("changePlayerArrangementMode"))
                object.changePlayerArrangementMode = $root.PB.GameSetupAction.ChangePlayerArrangementMode.toObject(message.changePlayerArrangementMode, options);
            if (message.swapPositions != null && message.hasOwnProperty("swapPositions"))
                object.swapPositions = $root.PB.GameSetupAction.SwapPositions.toObject(message.swapPositions, options);
            if (message.kickUser != null && message.hasOwnProperty("kickUser"))
                object.kickUser = $root.PB.GameSetupAction.KickUser.toObject(message.kickUser, options);
            return object;
        };

        /**
         * Converts this GameSetupAction to JSON.
         * @function toJSON
         * @memberof PB.GameSetupAction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameSetupAction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        GameSetupAction.JoinGame = (function() {

            /**
             * Properties of a JoinGame.
             * @memberof PB.GameSetupAction
             * @interface IJoinGame
             */

            /**
             * Constructs a new JoinGame.
             * @memberof PB.GameSetupAction
             * @classdesc Represents a JoinGame.
             * @implements IJoinGame
             * @constructor
             * @param {PB.GameSetupAction.IJoinGame=} [properties] Properties to set
             */
            function JoinGame(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new JoinGame instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {PB.GameSetupAction.IJoinGame=} [properties] Properties to set
             * @returns {PB.GameSetupAction.JoinGame} JoinGame instance
             */
            JoinGame.create = function create(properties) {
                return new JoinGame(properties);
            };

            /**
             * Encodes the specified JoinGame message. Does not implicitly {@link PB.GameSetupAction.JoinGame.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {PB.GameSetupAction.IJoinGame} message JoinGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinGame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified JoinGame message, length delimited. Does not implicitly {@link PB.GameSetupAction.JoinGame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {PB.GameSetupAction.IJoinGame} message JoinGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            JoinGame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a JoinGame message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.JoinGame} JoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinGame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.JoinGame();
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
             * Decodes a JoinGame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.JoinGame} JoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            JoinGame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a JoinGame message.
             * @function verify
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            JoinGame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates a JoinGame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.JoinGame} JoinGame
             */
            JoinGame.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.JoinGame)
                    return object;
                return new $root.PB.GameSetupAction.JoinGame();
            };

            /**
             * Creates a plain object from a JoinGame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.JoinGame
             * @static
             * @param {PB.GameSetupAction.JoinGame} message JoinGame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            JoinGame.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this JoinGame to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.JoinGame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            JoinGame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return JoinGame;
        })();

        GameSetupAction.UnjoinGame = (function() {

            /**
             * Properties of an UnjoinGame.
             * @memberof PB.GameSetupAction
             * @interface IUnjoinGame
             */

            /**
             * Constructs a new UnjoinGame.
             * @memberof PB.GameSetupAction
             * @classdesc Represents an UnjoinGame.
             * @implements IUnjoinGame
             * @constructor
             * @param {PB.GameSetupAction.IUnjoinGame=} [properties] Properties to set
             */
            function UnjoinGame(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new UnjoinGame instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {PB.GameSetupAction.IUnjoinGame=} [properties] Properties to set
             * @returns {PB.GameSetupAction.UnjoinGame} UnjoinGame instance
             */
            UnjoinGame.create = function create(properties) {
                return new UnjoinGame(properties);
            };

            /**
             * Encodes the specified UnjoinGame message. Does not implicitly {@link PB.GameSetupAction.UnjoinGame.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {PB.GameSetupAction.IUnjoinGame} message UnjoinGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UnjoinGame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified UnjoinGame message, length delimited. Does not implicitly {@link PB.GameSetupAction.UnjoinGame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {PB.GameSetupAction.IUnjoinGame} message UnjoinGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            UnjoinGame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an UnjoinGame message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.UnjoinGame} UnjoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UnjoinGame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.UnjoinGame();
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
             * Decodes an UnjoinGame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.UnjoinGame} UnjoinGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            UnjoinGame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an UnjoinGame message.
             * @function verify
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            UnjoinGame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an UnjoinGame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.UnjoinGame} UnjoinGame
             */
            UnjoinGame.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.UnjoinGame)
                    return object;
                return new $root.PB.GameSetupAction.UnjoinGame();
            };

            /**
             * Creates a plain object from an UnjoinGame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.UnjoinGame
             * @static
             * @param {PB.GameSetupAction.UnjoinGame} message UnjoinGame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            UnjoinGame.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this UnjoinGame to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.UnjoinGame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            UnjoinGame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return UnjoinGame;
        })();

        GameSetupAction.ApproveOfGameSetup = (function() {

            /**
             * Properties of an ApproveOfGameSetup.
             * @memberof PB.GameSetupAction
             * @interface IApproveOfGameSetup
             */

            /**
             * Constructs a new ApproveOfGameSetup.
             * @memberof PB.GameSetupAction
             * @classdesc Represents an ApproveOfGameSetup.
             * @implements IApproveOfGameSetup
             * @constructor
             * @param {PB.GameSetupAction.IApproveOfGameSetup=} [properties] Properties to set
             */
            function ApproveOfGameSetup(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new ApproveOfGameSetup instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {PB.GameSetupAction.IApproveOfGameSetup=} [properties] Properties to set
             * @returns {PB.GameSetupAction.ApproveOfGameSetup} ApproveOfGameSetup instance
             */
            ApproveOfGameSetup.create = function create(properties) {
                return new ApproveOfGameSetup(properties);
            };

            /**
             * Encodes the specified ApproveOfGameSetup message. Does not implicitly {@link PB.GameSetupAction.ApproveOfGameSetup.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {PB.GameSetupAction.IApproveOfGameSetup} message ApproveOfGameSetup message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ApproveOfGameSetup.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified ApproveOfGameSetup message, length delimited. Does not implicitly {@link PB.GameSetupAction.ApproveOfGameSetup.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {PB.GameSetupAction.IApproveOfGameSetup} message ApproveOfGameSetup message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ApproveOfGameSetup.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ApproveOfGameSetup message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.ApproveOfGameSetup} ApproveOfGameSetup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ApproveOfGameSetup.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.ApproveOfGameSetup();
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
             * Decodes an ApproveOfGameSetup message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.ApproveOfGameSetup} ApproveOfGameSetup
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ApproveOfGameSetup.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ApproveOfGameSetup message.
             * @function verify
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ApproveOfGameSetup.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an ApproveOfGameSetup message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.ApproveOfGameSetup} ApproveOfGameSetup
             */
            ApproveOfGameSetup.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.ApproveOfGameSetup)
                    return object;
                return new $root.PB.GameSetupAction.ApproveOfGameSetup();
            };

            /**
             * Creates a plain object from an ApproveOfGameSetup message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @static
             * @param {PB.GameSetupAction.ApproveOfGameSetup} message ApproveOfGameSetup
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ApproveOfGameSetup.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this ApproveOfGameSetup to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.ApproveOfGameSetup
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ApproveOfGameSetup.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ApproveOfGameSetup;
        })();

        GameSetupAction.ChangeGameMode = (function() {

            /**
             * Properties of a ChangeGameMode.
             * @memberof PB.GameSetupAction
             * @interface IChangeGameMode
             * @property {GameMode|null} [gameMode] ChangeGameMode gameMode
             */

            /**
             * Constructs a new ChangeGameMode.
             * @memberof PB.GameSetupAction
             * @classdesc Represents a ChangeGameMode.
             * @implements IChangeGameMode
             * @constructor
             * @param {PB.GameSetupAction.IChangeGameMode=} [properties] Properties to set
             */
            function ChangeGameMode(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ChangeGameMode gameMode.
             * @member {GameMode} gameMode
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @instance
             */
            ChangeGameMode.prototype.gameMode = 1;

            /**
             * Creates a new ChangeGameMode instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {PB.GameSetupAction.IChangeGameMode=} [properties] Properties to set
             * @returns {PB.GameSetupAction.ChangeGameMode} ChangeGameMode instance
             */
            ChangeGameMode.create = function create(properties) {
                return new ChangeGameMode(properties);
            };

            /**
             * Encodes the specified ChangeGameMode message. Does not implicitly {@link PB.GameSetupAction.ChangeGameMode.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {PB.GameSetupAction.IChangeGameMode} message ChangeGameMode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChangeGameMode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.gameMode != null && Object.hasOwnProperty.call(message, "gameMode"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameMode);
                return writer;
            };

            /**
             * Encodes the specified ChangeGameMode message, length delimited. Does not implicitly {@link PB.GameSetupAction.ChangeGameMode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {PB.GameSetupAction.IChangeGameMode} message ChangeGameMode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChangeGameMode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ChangeGameMode message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.ChangeGameMode} ChangeGameMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChangeGameMode.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.ChangeGameMode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.gameMode = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ChangeGameMode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.ChangeGameMode} ChangeGameMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChangeGameMode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ChangeGameMode message.
             * @function verify
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ChangeGameMode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                    switch (message.gameMode) {
                    default:
                        return "gameMode: enum value expected";
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        break;
                    }
                return null;
            };

            /**
             * Creates a ChangeGameMode message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.ChangeGameMode} ChangeGameMode
             */
            ChangeGameMode.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.ChangeGameMode)
                    return object;
                var message = new $root.PB.GameSetupAction.ChangeGameMode();
                switch (object.gameMode) {
                case "SINGLES_1":
                case 1:
                    message.gameMode = 1;
                    break;
                case "SINGLES_2":
                case 2:
                    message.gameMode = 2;
                    break;
                case "SINGLES_3":
                case 3:
                    message.gameMode = 3;
                    break;
                case "SINGLES_4":
                case 4:
                    message.gameMode = 4;
                    break;
                case "SINGLES_5":
                case 5:
                    message.gameMode = 5;
                    break;
                case "SINGLES_6":
                case 6:
                    message.gameMode = 6;
                    break;
                case "TEAMS_2_VS_2":
                case 7:
                    message.gameMode = 7;
                    break;
                case "TEAMS_2_VS_2_VS_2":
                case 8:
                    message.gameMode = 8;
                    break;
                case "TEAMS_3_VS_3":
                case 9:
                    message.gameMode = 9;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a ChangeGameMode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @static
             * @param {PB.GameSetupAction.ChangeGameMode} message ChangeGameMode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ChangeGameMode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.gameMode = options.enums === String ? "SINGLES_1" : 1;
                if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                    object.gameMode = options.enums === String ? $root.GameMode[message.gameMode] : message.gameMode;
                return object;
            };

            /**
             * Converts this ChangeGameMode to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.ChangeGameMode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ChangeGameMode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ChangeGameMode;
        })();

        GameSetupAction.ChangePlayerArrangementMode = (function() {

            /**
             * Properties of a ChangePlayerArrangementMode.
             * @memberof PB.GameSetupAction
             * @interface IChangePlayerArrangementMode
             * @property {PlayerArrangementMode|null} [playerArrangementMode] ChangePlayerArrangementMode playerArrangementMode
             */

            /**
             * Constructs a new ChangePlayerArrangementMode.
             * @memberof PB.GameSetupAction
             * @classdesc Represents a ChangePlayerArrangementMode.
             * @implements IChangePlayerArrangementMode
             * @constructor
             * @param {PB.GameSetupAction.IChangePlayerArrangementMode=} [properties] Properties to set
             */
            function ChangePlayerArrangementMode(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * ChangePlayerArrangementMode playerArrangementMode.
             * @member {PlayerArrangementMode} playerArrangementMode
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @instance
             */
            ChangePlayerArrangementMode.prototype.playerArrangementMode = 0;

            /**
             * Creates a new ChangePlayerArrangementMode instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {PB.GameSetupAction.IChangePlayerArrangementMode=} [properties] Properties to set
             * @returns {PB.GameSetupAction.ChangePlayerArrangementMode} ChangePlayerArrangementMode instance
             */
            ChangePlayerArrangementMode.create = function create(properties) {
                return new ChangePlayerArrangementMode(properties);
            };

            /**
             * Encodes the specified ChangePlayerArrangementMode message. Does not implicitly {@link PB.GameSetupAction.ChangePlayerArrangementMode.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {PB.GameSetupAction.IChangePlayerArrangementMode} message ChangePlayerArrangementMode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChangePlayerArrangementMode.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.playerArrangementMode != null && Object.hasOwnProperty.call(message, "playerArrangementMode"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.playerArrangementMode);
                return writer;
            };

            /**
             * Encodes the specified ChangePlayerArrangementMode message, length delimited. Does not implicitly {@link PB.GameSetupAction.ChangePlayerArrangementMode.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {PB.GameSetupAction.IChangePlayerArrangementMode} message ChangePlayerArrangementMode message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ChangePlayerArrangementMode.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a ChangePlayerArrangementMode message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.ChangePlayerArrangementMode} ChangePlayerArrangementMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChangePlayerArrangementMode.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.ChangePlayerArrangementMode();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.playerArrangementMode = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a ChangePlayerArrangementMode message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.ChangePlayerArrangementMode} ChangePlayerArrangementMode
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ChangePlayerArrangementMode.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a ChangePlayerArrangementMode message.
             * @function verify
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ChangePlayerArrangementMode.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.playerArrangementMode != null && message.hasOwnProperty("playerArrangementMode"))
                    switch (message.playerArrangementMode) {
                    default:
                        return "playerArrangementMode: enum value expected";
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                        break;
                    }
                return null;
            };

            /**
             * Creates a ChangePlayerArrangementMode message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.ChangePlayerArrangementMode} ChangePlayerArrangementMode
             */
            ChangePlayerArrangementMode.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.ChangePlayerArrangementMode)
                    return object;
                var message = new $root.PB.GameSetupAction.ChangePlayerArrangementMode();
                switch (object.playerArrangementMode) {
                case "VERSION_1":
                case 0:
                    message.playerArrangementMode = 0;
                    break;
                case "RANDOM_ORDER":
                case 1:
                    message.playerArrangementMode = 1;
                    break;
                case "EXACT_ORDER":
                case 2:
                    message.playerArrangementMode = 2;
                    break;
                case "SPECIFY_TEAMS":
                case 3:
                    message.playerArrangementMode = 3;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a ChangePlayerArrangementMode message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @static
             * @param {PB.GameSetupAction.ChangePlayerArrangementMode} message ChangePlayerArrangementMode
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ChangePlayerArrangementMode.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.playerArrangementMode = options.enums === String ? "VERSION_1" : 0;
                if (message.playerArrangementMode != null && message.hasOwnProperty("playerArrangementMode"))
                    object.playerArrangementMode = options.enums === String ? $root.PlayerArrangementMode[message.playerArrangementMode] : message.playerArrangementMode;
                return object;
            };

            /**
             * Converts this ChangePlayerArrangementMode to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.ChangePlayerArrangementMode
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ChangePlayerArrangementMode.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ChangePlayerArrangementMode;
        })();

        GameSetupAction.SwapPositions = (function() {

            /**
             * Properties of a SwapPositions.
             * @memberof PB.GameSetupAction
             * @interface ISwapPositions
             * @property {number|null} [position1] SwapPositions position1
             * @property {number|null} [position2] SwapPositions position2
             */

            /**
             * Constructs a new SwapPositions.
             * @memberof PB.GameSetupAction
             * @classdesc Represents a SwapPositions.
             * @implements ISwapPositions
             * @constructor
             * @param {PB.GameSetupAction.ISwapPositions=} [properties] Properties to set
             */
            function SwapPositions(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * SwapPositions position1.
             * @member {number} position1
             * @memberof PB.GameSetupAction.SwapPositions
             * @instance
             */
            SwapPositions.prototype.position1 = 0;

            /**
             * SwapPositions position2.
             * @member {number} position2
             * @memberof PB.GameSetupAction.SwapPositions
             * @instance
             */
            SwapPositions.prototype.position2 = 0;

            /**
             * Creates a new SwapPositions instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {PB.GameSetupAction.ISwapPositions=} [properties] Properties to set
             * @returns {PB.GameSetupAction.SwapPositions} SwapPositions instance
             */
            SwapPositions.create = function create(properties) {
                return new SwapPositions(properties);
            };

            /**
             * Encodes the specified SwapPositions message. Does not implicitly {@link PB.GameSetupAction.SwapPositions.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {PB.GameSetupAction.ISwapPositions} message SwapPositions message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SwapPositions.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.position1 != null && Object.hasOwnProperty.call(message, "position1"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.position1);
                if (message.position2 != null && Object.hasOwnProperty.call(message, "position2"))
                    writer.uint32(/* id 2, wireType 0 =*/16).int32(message.position2);
                return writer;
            };

            /**
             * Encodes the specified SwapPositions message, length delimited. Does not implicitly {@link PB.GameSetupAction.SwapPositions.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {PB.GameSetupAction.ISwapPositions} message SwapPositions message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SwapPositions.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SwapPositions message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.SwapPositions} SwapPositions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SwapPositions.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.SwapPositions();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.position1 = reader.int32();
                        break;
                    case 2:
                        message.position2 = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a SwapPositions message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.SwapPositions} SwapPositions
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SwapPositions.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a SwapPositions message.
             * @function verify
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            SwapPositions.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.position1 != null && message.hasOwnProperty("position1"))
                    if (!$util.isInteger(message.position1))
                        return "position1: integer expected";
                if (message.position2 != null && message.hasOwnProperty("position2"))
                    if (!$util.isInteger(message.position2))
                        return "position2: integer expected";
                return null;
            };

            /**
             * Creates a SwapPositions message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.SwapPositions} SwapPositions
             */
            SwapPositions.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.SwapPositions)
                    return object;
                var message = new $root.PB.GameSetupAction.SwapPositions();
                if (object.position1 != null)
                    message.position1 = object.position1 | 0;
                if (object.position2 != null)
                    message.position2 = object.position2 | 0;
                return message;
            };

            /**
             * Creates a plain object from a SwapPositions message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.SwapPositions
             * @static
             * @param {PB.GameSetupAction.SwapPositions} message SwapPositions
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            SwapPositions.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.position1 = 0;
                    object.position2 = 0;
                }
                if (message.position1 != null && message.hasOwnProperty("position1"))
                    object.position1 = message.position1;
                if (message.position2 != null && message.hasOwnProperty("position2"))
                    object.position2 = message.position2;
                return object;
            };

            /**
             * Converts this SwapPositions to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.SwapPositions
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            SwapPositions.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return SwapPositions;
        })();

        GameSetupAction.KickUser = (function() {

            /**
             * Properties of a KickUser.
             * @memberof PB.GameSetupAction
             * @interface IKickUser
             * @property {number|null} [userId] KickUser userId
             */

            /**
             * Constructs a new KickUser.
             * @memberof PB.GameSetupAction
             * @classdesc Represents a KickUser.
             * @implements IKickUser
             * @constructor
             * @param {PB.GameSetupAction.IKickUser=} [properties] Properties to set
             */
            function KickUser(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * KickUser userId.
             * @member {number} userId
             * @memberof PB.GameSetupAction.KickUser
             * @instance
             */
            KickUser.prototype.userId = 0;

            /**
             * Creates a new KickUser instance using the specified properties.
             * @function create
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {PB.GameSetupAction.IKickUser=} [properties] Properties to set
             * @returns {PB.GameSetupAction.KickUser} KickUser instance
             */
            KickUser.create = function create(properties) {
                return new KickUser(properties);
            };

            /**
             * Encodes the specified KickUser message. Does not implicitly {@link PB.GameSetupAction.KickUser.verify|verify} messages.
             * @function encode
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {PB.GameSetupAction.IKickUser} message KickUser message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KickUser.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.userId != null && Object.hasOwnProperty.call(message, "userId"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.userId);
                return writer;
            };

            /**
             * Encodes the specified KickUser message, length delimited. Does not implicitly {@link PB.GameSetupAction.KickUser.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {PB.GameSetupAction.IKickUser} message KickUser message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            KickUser.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a KickUser message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameSetupAction.KickUser} KickUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KickUser.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameSetupAction.KickUser();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.userId = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a KickUser message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameSetupAction.KickUser} KickUser
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            KickUser.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a KickUser message.
             * @function verify
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            KickUser.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.userId != null && message.hasOwnProperty("userId"))
                    if (!$util.isInteger(message.userId))
                        return "userId: integer expected";
                return null;
            };

            /**
             * Creates a KickUser message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameSetupAction.KickUser} KickUser
             */
            KickUser.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameSetupAction.KickUser)
                    return object;
                var message = new $root.PB.GameSetupAction.KickUser();
                if (object.userId != null)
                    message.userId = object.userId | 0;
                return message;
            };

            /**
             * Creates a plain object from a KickUser message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameSetupAction.KickUser
             * @static
             * @param {PB.GameSetupAction.KickUser} message KickUser
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            KickUser.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.userId = 0;
                if (message.userId != null && message.hasOwnProperty("userId"))
                    object.userId = message.userId;
                return object;
            };

            /**
             * Converts this KickUser to JSON.
             * @function toJSON
             * @memberof PB.GameSetupAction.KickUser
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            KickUser.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return KickUser;
        })();

        return GameSetupAction;
    })();

    PB.GameAction = (function() {

        /**
         * Properties of a GameAction.
         * @memberof PB
         * @interface IGameAction
         * @property {PB.GameAction.IStartGame|null} [startGame] GameAction startGame
         * @property {PB.GameAction.IPlayTile|null} [playTile] GameAction playTile
         * @property {PB.GameAction.ISelectNewChain|null} [selectNewChain] GameAction selectNewChain
         * @property {PB.GameAction.ISelectMergerSurvivor|null} [selectMergerSurvivor] GameAction selectMergerSurvivor
         * @property {PB.GameAction.ISelectChainToDisposeOfNext|null} [selectChainToDisposeOfNext] GameAction selectChainToDisposeOfNext
         * @property {PB.GameAction.IDisposeOfShares|null} [disposeOfShares] GameAction disposeOfShares
         * @property {PB.GameAction.IPurchaseShares|null} [purchaseShares] GameAction purchaseShares
         * @property {PB.GameAction.IGameOver|null} [gameOver] GameAction gameOver
         */

        /**
         * Constructs a new GameAction.
         * @memberof PB
         * @classdesc Represents a GameAction.
         * @implements IGameAction
         * @constructor
         * @param {PB.IGameAction=} [properties] Properties to set
         */
        function GameAction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * GameAction startGame.
         * @member {PB.GameAction.IStartGame|null|undefined} startGame
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.startGame = null;

        /**
         * GameAction playTile.
         * @member {PB.GameAction.IPlayTile|null|undefined} playTile
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.playTile = null;

        /**
         * GameAction selectNewChain.
         * @member {PB.GameAction.ISelectNewChain|null|undefined} selectNewChain
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.selectNewChain = null;

        /**
         * GameAction selectMergerSurvivor.
         * @member {PB.GameAction.ISelectMergerSurvivor|null|undefined} selectMergerSurvivor
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.selectMergerSurvivor = null;

        /**
         * GameAction selectChainToDisposeOfNext.
         * @member {PB.GameAction.ISelectChainToDisposeOfNext|null|undefined} selectChainToDisposeOfNext
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.selectChainToDisposeOfNext = null;

        /**
         * GameAction disposeOfShares.
         * @member {PB.GameAction.IDisposeOfShares|null|undefined} disposeOfShares
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.disposeOfShares = null;

        /**
         * GameAction purchaseShares.
         * @member {PB.GameAction.IPurchaseShares|null|undefined} purchaseShares
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.purchaseShares = null;

        /**
         * GameAction gameOver.
         * @member {PB.GameAction.IGameOver|null|undefined} gameOver
         * @memberof PB.GameAction
         * @instance
         */
        GameAction.prototype.gameOver = null;

        /**
         * Creates a new GameAction instance using the specified properties.
         * @function create
         * @memberof PB.GameAction
         * @static
         * @param {PB.IGameAction=} [properties] Properties to set
         * @returns {PB.GameAction} GameAction instance
         */
        GameAction.create = function create(properties) {
            return new GameAction(properties);
        };

        /**
         * Encodes the specified GameAction message. Does not implicitly {@link PB.GameAction.verify|verify} messages.
         * @function encode
         * @memberof PB.GameAction
         * @static
         * @param {PB.IGameAction} message GameAction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameAction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.startGame != null && Object.hasOwnProperty.call(message, "startGame"))
                $root.PB.GameAction.StartGame.encode(message.startGame, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.playTile != null && Object.hasOwnProperty.call(message, "playTile"))
                $root.PB.GameAction.PlayTile.encode(message.playTile, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.selectNewChain != null && Object.hasOwnProperty.call(message, "selectNewChain"))
                $root.PB.GameAction.SelectNewChain.encode(message.selectNewChain, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.selectMergerSurvivor != null && Object.hasOwnProperty.call(message, "selectMergerSurvivor"))
                $root.PB.GameAction.SelectMergerSurvivor.encode(message.selectMergerSurvivor, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.selectChainToDisposeOfNext != null && Object.hasOwnProperty.call(message, "selectChainToDisposeOfNext"))
                $root.PB.GameAction.SelectChainToDisposeOfNext.encode(message.selectChainToDisposeOfNext, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.disposeOfShares != null && Object.hasOwnProperty.call(message, "disposeOfShares"))
                $root.PB.GameAction.DisposeOfShares.encode(message.disposeOfShares, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            if (message.purchaseShares != null && Object.hasOwnProperty.call(message, "purchaseShares"))
                $root.PB.GameAction.PurchaseShares.encode(message.purchaseShares, writer.uint32(/* id 7, wireType 2 =*/58).fork()).ldelim();
            if (message.gameOver != null && Object.hasOwnProperty.call(message, "gameOver"))
                $root.PB.GameAction.GameOver.encode(message.gameOver, writer.uint32(/* id 8, wireType 2 =*/66).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified GameAction message, length delimited. Does not implicitly {@link PB.GameAction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PB.GameAction
         * @static
         * @param {PB.IGameAction} message GameAction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        GameAction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a GameAction message from the specified reader or buffer.
         * @function decode
         * @memberof PB.GameAction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PB.GameAction} GameAction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        GameAction.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.startGame = $root.PB.GameAction.StartGame.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.playTile = $root.PB.GameAction.PlayTile.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.selectNewChain = $root.PB.GameAction.SelectNewChain.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.selectMergerSurvivor = $root.PB.GameAction.SelectMergerSurvivor.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.selectChainToDisposeOfNext = $root.PB.GameAction.SelectChainToDisposeOfNext.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.disposeOfShares = $root.PB.GameAction.DisposeOfShares.decode(reader, reader.uint32());
                    break;
                case 7:
                    message.purchaseShares = $root.PB.GameAction.PurchaseShares.decode(reader, reader.uint32());
                    break;
                case 8:
                    message.gameOver = $root.PB.GameAction.GameOver.decode(reader, reader.uint32());
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
         * @memberof PB.GameAction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PB.GameAction} GameAction
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
         * @memberof PB.GameAction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        GameAction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.startGame != null && message.hasOwnProperty("startGame")) {
                var error = $root.PB.GameAction.StartGame.verify(message.startGame);
                if (error)
                    return "startGame." + error;
            }
            if (message.playTile != null && message.hasOwnProperty("playTile")) {
                var error = $root.PB.GameAction.PlayTile.verify(message.playTile);
                if (error)
                    return "playTile." + error;
            }
            if (message.selectNewChain != null && message.hasOwnProperty("selectNewChain")) {
                var error = $root.PB.GameAction.SelectNewChain.verify(message.selectNewChain);
                if (error)
                    return "selectNewChain." + error;
            }
            if (message.selectMergerSurvivor != null && message.hasOwnProperty("selectMergerSurvivor")) {
                var error = $root.PB.GameAction.SelectMergerSurvivor.verify(message.selectMergerSurvivor);
                if (error)
                    return "selectMergerSurvivor." + error;
            }
            if (message.selectChainToDisposeOfNext != null && message.hasOwnProperty("selectChainToDisposeOfNext")) {
                var error = $root.PB.GameAction.SelectChainToDisposeOfNext.verify(message.selectChainToDisposeOfNext);
                if (error)
                    return "selectChainToDisposeOfNext." + error;
            }
            if (message.disposeOfShares != null && message.hasOwnProperty("disposeOfShares")) {
                var error = $root.PB.GameAction.DisposeOfShares.verify(message.disposeOfShares);
                if (error)
                    return "disposeOfShares." + error;
            }
            if (message.purchaseShares != null && message.hasOwnProperty("purchaseShares")) {
                var error = $root.PB.GameAction.PurchaseShares.verify(message.purchaseShares);
                if (error)
                    return "purchaseShares." + error;
            }
            if (message.gameOver != null && message.hasOwnProperty("gameOver")) {
                var error = $root.PB.GameAction.GameOver.verify(message.gameOver);
                if (error)
                    return "gameOver." + error;
            }
            return null;
        };

        /**
         * Creates a GameAction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PB.GameAction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PB.GameAction} GameAction
         */
        GameAction.fromObject = function fromObject(object) {
            if (object instanceof $root.PB.GameAction)
                return object;
            var message = new $root.PB.GameAction();
            if (object.startGame != null) {
                if (typeof object.startGame !== "object")
                    throw TypeError(".PB.GameAction.startGame: object expected");
                message.startGame = $root.PB.GameAction.StartGame.fromObject(object.startGame);
            }
            if (object.playTile != null) {
                if (typeof object.playTile !== "object")
                    throw TypeError(".PB.GameAction.playTile: object expected");
                message.playTile = $root.PB.GameAction.PlayTile.fromObject(object.playTile);
            }
            if (object.selectNewChain != null) {
                if (typeof object.selectNewChain !== "object")
                    throw TypeError(".PB.GameAction.selectNewChain: object expected");
                message.selectNewChain = $root.PB.GameAction.SelectNewChain.fromObject(object.selectNewChain);
            }
            if (object.selectMergerSurvivor != null) {
                if (typeof object.selectMergerSurvivor !== "object")
                    throw TypeError(".PB.GameAction.selectMergerSurvivor: object expected");
                message.selectMergerSurvivor = $root.PB.GameAction.SelectMergerSurvivor.fromObject(object.selectMergerSurvivor);
            }
            if (object.selectChainToDisposeOfNext != null) {
                if (typeof object.selectChainToDisposeOfNext !== "object")
                    throw TypeError(".PB.GameAction.selectChainToDisposeOfNext: object expected");
                message.selectChainToDisposeOfNext = $root.PB.GameAction.SelectChainToDisposeOfNext.fromObject(object.selectChainToDisposeOfNext);
            }
            if (object.disposeOfShares != null) {
                if (typeof object.disposeOfShares !== "object")
                    throw TypeError(".PB.GameAction.disposeOfShares: object expected");
                message.disposeOfShares = $root.PB.GameAction.DisposeOfShares.fromObject(object.disposeOfShares);
            }
            if (object.purchaseShares != null) {
                if (typeof object.purchaseShares !== "object")
                    throw TypeError(".PB.GameAction.purchaseShares: object expected");
                message.purchaseShares = $root.PB.GameAction.PurchaseShares.fromObject(object.purchaseShares);
            }
            if (object.gameOver != null) {
                if (typeof object.gameOver !== "object")
                    throw TypeError(".PB.GameAction.gameOver: object expected");
                message.gameOver = $root.PB.GameAction.GameOver.fromObject(object.gameOver);
            }
            return message;
        };

        /**
         * Creates a plain object from a GameAction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PB.GameAction
         * @static
         * @param {PB.GameAction} message GameAction
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
                object.startGame = $root.PB.GameAction.StartGame.toObject(message.startGame, options);
            if (message.playTile != null && message.hasOwnProperty("playTile"))
                object.playTile = $root.PB.GameAction.PlayTile.toObject(message.playTile, options);
            if (message.selectNewChain != null && message.hasOwnProperty("selectNewChain"))
                object.selectNewChain = $root.PB.GameAction.SelectNewChain.toObject(message.selectNewChain, options);
            if (message.selectMergerSurvivor != null && message.hasOwnProperty("selectMergerSurvivor"))
                object.selectMergerSurvivor = $root.PB.GameAction.SelectMergerSurvivor.toObject(message.selectMergerSurvivor, options);
            if (message.selectChainToDisposeOfNext != null && message.hasOwnProperty("selectChainToDisposeOfNext"))
                object.selectChainToDisposeOfNext = $root.PB.GameAction.SelectChainToDisposeOfNext.toObject(message.selectChainToDisposeOfNext, options);
            if (message.disposeOfShares != null && message.hasOwnProperty("disposeOfShares"))
                object.disposeOfShares = $root.PB.GameAction.DisposeOfShares.toObject(message.disposeOfShares, options);
            if (message.purchaseShares != null && message.hasOwnProperty("purchaseShares"))
                object.purchaseShares = $root.PB.GameAction.PurchaseShares.toObject(message.purchaseShares, options);
            if (message.gameOver != null && message.hasOwnProperty("gameOver"))
                object.gameOver = $root.PB.GameAction.GameOver.toObject(message.gameOver, options);
            return object;
        };

        /**
         * Converts this GameAction to JSON.
         * @function toJSON
         * @memberof PB.GameAction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        GameAction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        GameAction.StartGame = (function() {

            /**
             * Properties of a StartGame.
             * @memberof PB.GameAction
             * @interface IStartGame
             */

            /**
             * Constructs a new StartGame.
             * @memberof PB.GameAction
             * @classdesc Represents a StartGame.
             * @implements IStartGame
             * @constructor
             * @param {PB.GameAction.IStartGame=} [properties] Properties to set
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
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {PB.GameAction.IStartGame=} [properties] Properties to set
             * @returns {PB.GameAction.StartGame} StartGame instance
             */
            StartGame.create = function create(properties) {
                return new StartGame(properties);
            };

            /**
             * Encodes the specified StartGame message. Does not implicitly {@link PB.GameAction.StartGame.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {PB.GameAction.IStartGame} message StartGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StartGame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified StartGame message, length delimited. Does not implicitly {@link PB.GameAction.StartGame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {PB.GameAction.IStartGame} message StartGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            StartGame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a StartGame message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.StartGame} StartGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            StartGame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.StartGame();
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
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.StartGame} StartGame
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
             * @memberof PB.GameAction.StartGame
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
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.StartGame} StartGame
             */
            StartGame.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.StartGame)
                    return object;
                return new $root.PB.GameAction.StartGame();
            };

            /**
             * Creates a plain object from a StartGame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameAction.StartGame
             * @static
             * @param {PB.GameAction.StartGame} message StartGame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            StartGame.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this StartGame to JSON.
             * @function toJSON
             * @memberof PB.GameAction.StartGame
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
             * @memberof PB.GameAction
             * @interface IPlayTile
             * @property {number|null} [tile] PlayTile tile
             */

            /**
             * Constructs a new PlayTile.
             * @memberof PB.GameAction
             * @classdesc Represents a PlayTile.
             * @implements IPlayTile
             * @constructor
             * @param {PB.GameAction.IPlayTile=} [properties] Properties to set
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
             * @memberof PB.GameAction.PlayTile
             * @instance
             */
            PlayTile.prototype.tile = 0;

            /**
             * Creates a new PlayTile instance using the specified properties.
             * @function create
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {PB.GameAction.IPlayTile=} [properties] Properties to set
             * @returns {PB.GameAction.PlayTile} PlayTile instance
             */
            PlayTile.create = function create(properties) {
                return new PlayTile(properties);
            };

            /**
             * Encodes the specified PlayTile message. Does not implicitly {@link PB.GameAction.PlayTile.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {PB.GameAction.IPlayTile} message PlayTile message or plain object to encode
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
             * Encodes the specified PlayTile message, length delimited. Does not implicitly {@link PB.GameAction.PlayTile.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {PB.GameAction.IPlayTile} message PlayTile message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PlayTile.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PlayTile message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.PlayTile} PlayTile
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PlayTile.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.PlayTile();
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
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.PlayTile} PlayTile
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
             * @memberof PB.GameAction.PlayTile
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
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.PlayTile} PlayTile
             */
            PlayTile.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.PlayTile)
                    return object;
                var message = new $root.PB.GameAction.PlayTile();
                if (object.tile != null)
                    message.tile = object.tile | 0;
                return message;
            };

            /**
             * Creates a plain object from a PlayTile message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameAction.PlayTile
             * @static
             * @param {PB.GameAction.PlayTile} message PlayTile
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
             * @memberof PB.GameAction.PlayTile
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
             * @memberof PB.GameAction
             * @interface ISelectNewChain
             * @property {GameBoardType|null} [chain] SelectNewChain chain
             */

            /**
             * Constructs a new SelectNewChain.
             * @memberof PB.GameAction
             * @classdesc Represents a SelectNewChain.
             * @implements ISelectNewChain
             * @constructor
             * @param {PB.GameAction.ISelectNewChain=} [properties] Properties to set
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
             * @memberof PB.GameAction.SelectNewChain
             * @instance
             */
            SelectNewChain.prototype.chain = 0;

            /**
             * Creates a new SelectNewChain instance using the specified properties.
             * @function create
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {PB.GameAction.ISelectNewChain=} [properties] Properties to set
             * @returns {PB.GameAction.SelectNewChain} SelectNewChain instance
             */
            SelectNewChain.create = function create(properties) {
                return new SelectNewChain(properties);
            };

            /**
             * Encodes the specified SelectNewChain message. Does not implicitly {@link PB.GameAction.SelectNewChain.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {PB.GameAction.ISelectNewChain} message SelectNewChain message or plain object to encode
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
             * Encodes the specified SelectNewChain message, length delimited. Does not implicitly {@link PB.GameAction.SelectNewChain.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {PB.GameAction.ISelectNewChain} message SelectNewChain message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SelectNewChain.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SelectNewChain message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.SelectNewChain} SelectNewChain
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SelectNewChain.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.SelectNewChain();
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
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.SelectNewChain} SelectNewChain
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
             * @memberof PB.GameAction.SelectNewChain
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
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.SelectNewChain} SelectNewChain
             */
            SelectNewChain.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.SelectNewChain)
                    return object;
                var message = new $root.PB.GameAction.SelectNewChain();
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
             * @memberof PB.GameAction.SelectNewChain
             * @static
             * @param {PB.GameAction.SelectNewChain} message SelectNewChain
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
             * @memberof PB.GameAction.SelectNewChain
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
             * @memberof PB.GameAction
             * @interface ISelectMergerSurvivor
             * @property {GameBoardType|null} [chain] SelectMergerSurvivor chain
             */

            /**
             * Constructs a new SelectMergerSurvivor.
             * @memberof PB.GameAction
             * @classdesc Represents a SelectMergerSurvivor.
             * @implements ISelectMergerSurvivor
             * @constructor
             * @param {PB.GameAction.ISelectMergerSurvivor=} [properties] Properties to set
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
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @instance
             */
            SelectMergerSurvivor.prototype.chain = 0;

            /**
             * Creates a new SelectMergerSurvivor instance using the specified properties.
             * @function create
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {PB.GameAction.ISelectMergerSurvivor=} [properties] Properties to set
             * @returns {PB.GameAction.SelectMergerSurvivor} SelectMergerSurvivor instance
             */
            SelectMergerSurvivor.create = function create(properties) {
                return new SelectMergerSurvivor(properties);
            };

            /**
             * Encodes the specified SelectMergerSurvivor message. Does not implicitly {@link PB.GameAction.SelectMergerSurvivor.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {PB.GameAction.ISelectMergerSurvivor} message SelectMergerSurvivor message or plain object to encode
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
             * Encodes the specified SelectMergerSurvivor message, length delimited. Does not implicitly {@link PB.GameAction.SelectMergerSurvivor.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {PB.GameAction.ISelectMergerSurvivor} message SelectMergerSurvivor message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SelectMergerSurvivor.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SelectMergerSurvivor message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.SelectMergerSurvivor} SelectMergerSurvivor
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SelectMergerSurvivor.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.SelectMergerSurvivor();
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
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.SelectMergerSurvivor} SelectMergerSurvivor
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
             * @memberof PB.GameAction.SelectMergerSurvivor
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
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.SelectMergerSurvivor} SelectMergerSurvivor
             */
            SelectMergerSurvivor.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.SelectMergerSurvivor)
                    return object;
                var message = new $root.PB.GameAction.SelectMergerSurvivor();
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
             * @memberof PB.GameAction.SelectMergerSurvivor
             * @static
             * @param {PB.GameAction.SelectMergerSurvivor} message SelectMergerSurvivor
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
             * @memberof PB.GameAction.SelectMergerSurvivor
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
             * @memberof PB.GameAction
             * @interface ISelectChainToDisposeOfNext
             * @property {GameBoardType|null} [chain] SelectChainToDisposeOfNext chain
             */

            /**
             * Constructs a new SelectChainToDisposeOfNext.
             * @memberof PB.GameAction
             * @classdesc Represents a SelectChainToDisposeOfNext.
             * @implements ISelectChainToDisposeOfNext
             * @constructor
             * @param {PB.GameAction.ISelectChainToDisposeOfNext=} [properties] Properties to set
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
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @instance
             */
            SelectChainToDisposeOfNext.prototype.chain = 0;

            /**
             * Creates a new SelectChainToDisposeOfNext instance using the specified properties.
             * @function create
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {PB.GameAction.ISelectChainToDisposeOfNext=} [properties] Properties to set
             * @returns {PB.GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext instance
             */
            SelectChainToDisposeOfNext.create = function create(properties) {
                return new SelectChainToDisposeOfNext(properties);
            };

            /**
             * Encodes the specified SelectChainToDisposeOfNext message. Does not implicitly {@link PB.GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {PB.GameAction.ISelectChainToDisposeOfNext} message SelectChainToDisposeOfNext message or plain object to encode
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
             * Encodes the specified SelectChainToDisposeOfNext message, length delimited. Does not implicitly {@link PB.GameAction.SelectChainToDisposeOfNext.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {PB.GameAction.ISelectChainToDisposeOfNext} message SelectChainToDisposeOfNext message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            SelectChainToDisposeOfNext.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a SelectChainToDisposeOfNext message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            SelectChainToDisposeOfNext.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.SelectChainToDisposeOfNext();
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
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext
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
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
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
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.SelectChainToDisposeOfNext} SelectChainToDisposeOfNext
             */
            SelectChainToDisposeOfNext.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.SelectChainToDisposeOfNext)
                    return object;
                var message = new $root.PB.GameAction.SelectChainToDisposeOfNext();
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
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
             * @static
             * @param {PB.GameAction.SelectChainToDisposeOfNext} message SelectChainToDisposeOfNext
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
             * @memberof PB.GameAction.SelectChainToDisposeOfNext
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
             * @memberof PB.GameAction
             * @interface IDisposeOfShares
             * @property {number|null} [tradeAmount] DisposeOfShares tradeAmount
             * @property {number|null} [sellAmount] DisposeOfShares sellAmount
             */

            /**
             * Constructs a new DisposeOfShares.
             * @memberof PB.GameAction
             * @classdesc Represents a DisposeOfShares.
             * @implements IDisposeOfShares
             * @constructor
             * @param {PB.GameAction.IDisposeOfShares=} [properties] Properties to set
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
             * @memberof PB.GameAction.DisposeOfShares
             * @instance
             */
            DisposeOfShares.prototype.tradeAmount = 0;

            /**
             * DisposeOfShares sellAmount.
             * @member {number} sellAmount
             * @memberof PB.GameAction.DisposeOfShares
             * @instance
             */
            DisposeOfShares.prototype.sellAmount = 0;

            /**
             * Creates a new DisposeOfShares instance using the specified properties.
             * @function create
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {PB.GameAction.IDisposeOfShares=} [properties] Properties to set
             * @returns {PB.GameAction.DisposeOfShares} DisposeOfShares instance
             */
            DisposeOfShares.create = function create(properties) {
                return new DisposeOfShares(properties);
            };

            /**
             * Encodes the specified DisposeOfShares message. Does not implicitly {@link PB.GameAction.DisposeOfShares.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {PB.GameAction.IDisposeOfShares} message DisposeOfShares message or plain object to encode
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
             * Encodes the specified DisposeOfShares message, length delimited. Does not implicitly {@link PB.GameAction.DisposeOfShares.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {PB.GameAction.IDisposeOfShares} message DisposeOfShares message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DisposeOfShares.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DisposeOfShares message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.DisposeOfShares} DisposeOfShares
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DisposeOfShares.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.DisposeOfShares();
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
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.DisposeOfShares} DisposeOfShares
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
             * @memberof PB.GameAction.DisposeOfShares
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
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.DisposeOfShares} DisposeOfShares
             */
            DisposeOfShares.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.DisposeOfShares)
                    return object;
                var message = new $root.PB.GameAction.DisposeOfShares();
                if (object.tradeAmount != null)
                    message.tradeAmount = object.tradeAmount | 0;
                if (object.sellAmount != null)
                    message.sellAmount = object.sellAmount | 0;
                return message;
            };

            /**
             * Creates a plain object from a DisposeOfShares message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameAction.DisposeOfShares
             * @static
             * @param {PB.GameAction.DisposeOfShares} message DisposeOfShares
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
             * @memberof PB.GameAction.DisposeOfShares
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
             * @memberof PB.GameAction
             * @interface IPurchaseShares
             * @property {Array.<GameBoardType>|null} [chains] PurchaseShares chains
             * @property {boolean|null} [endGame] PurchaseShares endGame
             */

            /**
             * Constructs a new PurchaseShares.
             * @memberof PB.GameAction
             * @classdesc Represents a PurchaseShares.
             * @implements IPurchaseShares
             * @constructor
             * @param {PB.GameAction.IPurchaseShares=} [properties] Properties to set
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
             * @memberof PB.GameAction.PurchaseShares
             * @instance
             */
            PurchaseShares.prototype.chains = $util.emptyArray;

            /**
             * PurchaseShares endGame.
             * @member {boolean} endGame
             * @memberof PB.GameAction.PurchaseShares
             * @instance
             */
            PurchaseShares.prototype.endGame = false;

            /**
             * Creates a new PurchaseShares instance using the specified properties.
             * @function create
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {PB.GameAction.IPurchaseShares=} [properties] Properties to set
             * @returns {PB.GameAction.PurchaseShares} PurchaseShares instance
             */
            PurchaseShares.create = function create(properties) {
                return new PurchaseShares(properties);
            };

            /**
             * Encodes the specified PurchaseShares message. Does not implicitly {@link PB.GameAction.PurchaseShares.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {PB.GameAction.IPurchaseShares} message PurchaseShares message or plain object to encode
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
             * Encodes the specified PurchaseShares message, length delimited. Does not implicitly {@link PB.GameAction.PurchaseShares.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {PB.GameAction.IPurchaseShares} message PurchaseShares message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            PurchaseShares.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a PurchaseShares message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.PurchaseShares} PurchaseShares
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            PurchaseShares.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.PurchaseShares();
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
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.PurchaseShares} PurchaseShares
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
             * @memberof PB.GameAction.PurchaseShares
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
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.PurchaseShares} PurchaseShares
             */
            PurchaseShares.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.PurchaseShares)
                    return object;
                var message = new $root.PB.GameAction.PurchaseShares();
                if (object.chains) {
                    if (!Array.isArray(object.chains))
                        throw TypeError(".PB.GameAction.PurchaseShares.chains: array expected");
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
             * @memberof PB.GameAction.PurchaseShares
             * @static
             * @param {PB.GameAction.PurchaseShares} message PurchaseShares
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
             * @memberof PB.GameAction.PurchaseShares
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
             * @memberof PB.GameAction
             * @interface IGameOver
             */

            /**
             * Constructs a new GameOver.
             * @memberof PB.GameAction
             * @classdesc Represents a GameOver.
             * @implements IGameOver
             * @constructor
             * @param {PB.GameAction.IGameOver=} [properties] Properties to set
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
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {PB.GameAction.IGameOver=} [properties] Properties to set
             * @returns {PB.GameAction.GameOver} GameOver instance
             */
            GameOver.create = function create(properties) {
                return new GameOver(properties);
            };

            /**
             * Encodes the specified GameOver message. Does not implicitly {@link PB.GameAction.GameOver.verify|verify} messages.
             * @function encode
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {PB.GameAction.IGameOver} message GameOver message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GameOver.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified GameOver message, length delimited. Does not implicitly {@link PB.GameAction.GameOver.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {PB.GameAction.IGameOver} message GameOver message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            GameOver.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a GameOver message from the specified reader or buffer.
             * @function decode
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.GameAction.GameOver} GameOver
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            GameOver.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.GameAction.GameOver();
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
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.GameAction.GameOver} GameOver
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
             * @memberof PB.GameAction.GameOver
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
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.GameAction.GameOver} GameOver
             */
            GameOver.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.GameAction.GameOver)
                    return object;
                return new $root.PB.GameAction.GameOver();
            };

            /**
             * Creates a plain object from a GameOver message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.GameAction.GameOver
             * @static
             * @param {PB.GameAction.GameOver} message GameOver
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            GameOver.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this GameOver to JSON.
             * @function toJSON
             * @memberof PB.GameAction.GameOver
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

    PB.MessageToServer = (function() {

        /**
         * Properties of a MessageToServer.
         * @memberof PB
         * @interface IMessageToServer
         * @property {PB.MessageToServer.ILogin|null} [login] MessageToServer login
         * @property {PB.MessageToServer.ICreateGame|null} [createGame] MessageToServer createGame
         * @property {PB.MessageToServer.IEnterGame|null} [enterGame] MessageToServer enterGame
         * @property {PB.MessageToServer.IExitGame|null} [exitGame] MessageToServer exitGame
         * @property {PB.IGameSetupAction|null} [doGameSetupAction] MessageToServer doGameSetupAction
         * @property {PB.MessageToServer.IDoGameAction|null} [doGameAction] MessageToServer doGameAction
         */

        /**
         * Constructs a new MessageToServer.
         * @memberof PB
         * @classdesc Represents a MessageToServer.
         * @implements IMessageToServer
         * @constructor
         * @param {PB.IMessageToServer=} [properties] Properties to set
         */
        function MessageToServer(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * MessageToServer login.
         * @member {PB.MessageToServer.ILogin|null|undefined} login
         * @memberof PB.MessageToServer
         * @instance
         */
        MessageToServer.prototype.login = null;

        /**
         * MessageToServer createGame.
         * @member {PB.MessageToServer.ICreateGame|null|undefined} createGame
         * @memberof PB.MessageToServer
         * @instance
         */
        MessageToServer.prototype.createGame = null;

        /**
         * MessageToServer enterGame.
         * @member {PB.MessageToServer.IEnterGame|null|undefined} enterGame
         * @memberof PB.MessageToServer
         * @instance
         */
        MessageToServer.prototype.enterGame = null;

        /**
         * MessageToServer exitGame.
         * @member {PB.MessageToServer.IExitGame|null|undefined} exitGame
         * @memberof PB.MessageToServer
         * @instance
         */
        MessageToServer.prototype.exitGame = null;

        /**
         * MessageToServer doGameSetupAction.
         * @member {PB.IGameSetupAction|null|undefined} doGameSetupAction
         * @memberof PB.MessageToServer
         * @instance
         */
        MessageToServer.prototype.doGameSetupAction = null;

        /**
         * MessageToServer doGameAction.
         * @member {PB.MessageToServer.IDoGameAction|null|undefined} doGameAction
         * @memberof PB.MessageToServer
         * @instance
         */
        MessageToServer.prototype.doGameAction = null;

        /**
         * Creates a new MessageToServer instance using the specified properties.
         * @function create
         * @memberof PB.MessageToServer
         * @static
         * @param {PB.IMessageToServer=} [properties] Properties to set
         * @returns {PB.MessageToServer} MessageToServer instance
         */
        MessageToServer.create = function create(properties) {
            return new MessageToServer(properties);
        };

        /**
         * Encodes the specified MessageToServer message. Does not implicitly {@link PB.MessageToServer.verify|verify} messages.
         * @function encode
         * @memberof PB.MessageToServer
         * @static
         * @param {PB.IMessageToServer} message MessageToServer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageToServer.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.login != null && Object.hasOwnProperty.call(message, "login"))
                $root.PB.MessageToServer.Login.encode(message.login, writer.uint32(/* id 1, wireType 2 =*/10).fork()).ldelim();
            if (message.createGame != null && Object.hasOwnProperty.call(message, "createGame"))
                $root.PB.MessageToServer.CreateGame.encode(message.createGame, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.enterGame != null && Object.hasOwnProperty.call(message, "enterGame"))
                $root.PB.MessageToServer.EnterGame.encode(message.enterGame, writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.exitGame != null && Object.hasOwnProperty.call(message, "exitGame"))
                $root.PB.MessageToServer.ExitGame.encode(message.exitGame, writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
            if (message.doGameSetupAction != null && Object.hasOwnProperty.call(message, "doGameSetupAction"))
                $root.PB.GameSetupAction.encode(message.doGameSetupAction, writer.uint32(/* id 5, wireType 2 =*/42).fork()).ldelim();
            if (message.doGameAction != null && Object.hasOwnProperty.call(message, "doGameAction"))
                $root.PB.MessageToServer.DoGameAction.encode(message.doGameAction, writer.uint32(/* id 6, wireType 2 =*/50).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified MessageToServer message, length delimited. Does not implicitly {@link PB.MessageToServer.verify|verify} messages.
         * @function encodeDelimited
         * @memberof PB.MessageToServer
         * @static
         * @param {PB.IMessageToServer} message MessageToServer message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        MessageToServer.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a MessageToServer message from the specified reader or buffer.
         * @function decode
         * @memberof PB.MessageToServer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {PB.MessageToServer} MessageToServer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageToServer.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.login = $root.PB.MessageToServer.Login.decode(reader, reader.uint32());
                    break;
                case 2:
                    message.createGame = $root.PB.MessageToServer.CreateGame.decode(reader, reader.uint32());
                    break;
                case 3:
                    message.enterGame = $root.PB.MessageToServer.EnterGame.decode(reader, reader.uint32());
                    break;
                case 4:
                    message.exitGame = $root.PB.MessageToServer.ExitGame.decode(reader, reader.uint32());
                    break;
                case 5:
                    message.doGameSetupAction = $root.PB.GameSetupAction.decode(reader, reader.uint32());
                    break;
                case 6:
                    message.doGameAction = $root.PB.MessageToServer.DoGameAction.decode(reader, reader.uint32());
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a MessageToServer message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof PB.MessageToServer
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {PB.MessageToServer} MessageToServer
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        MessageToServer.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a MessageToServer message.
         * @function verify
         * @memberof PB.MessageToServer
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        MessageToServer.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.login != null && message.hasOwnProperty("login")) {
                var error = $root.PB.MessageToServer.Login.verify(message.login);
                if (error)
                    return "login." + error;
            }
            if (message.createGame != null && message.hasOwnProperty("createGame")) {
                var error = $root.PB.MessageToServer.CreateGame.verify(message.createGame);
                if (error)
                    return "createGame." + error;
            }
            if (message.enterGame != null && message.hasOwnProperty("enterGame")) {
                var error = $root.PB.MessageToServer.EnterGame.verify(message.enterGame);
                if (error)
                    return "enterGame." + error;
            }
            if (message.exitGame != null && message.hasOwnProperty("exitGame")) {
                var error = $root.PB.MessageToServer.ExitGame.verify(message.exitGame);
                if (error)
                    return "exitGame." + error;
            }
            if (message.doGameSetupAction != null && message.hasOwnProperty("doGameSetupAction")) {
                var error = $root.PB.GameSetupAction.verify(message.doGameSetupAction);
                if (error)
                    return "doGameSetupAction." + error;
            }
            if (message.doGameAction != null && message.hasOwnProperty("doGameAction")) {
                var error = $root.PB.MessageToServer.DoGameAction.verify(message.doGameAction);
                if (error)
                    return "doGameAction." + error;
            }
            return null;
        };

        /**
         * Creates a MessageToServer message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof PB.MessageToServer
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {PB.MessageToServer} MessageToServer
         */
        MessageToServer.fromObject = function fromObject(object) {
            if (object instanceof $root.PB.MessageToServer)
                return object;
            var message = new $root.PB.MessageToServer();
            if (object.login != null) {
                if (typeof object.login !== "object")
                    throw TypeError(".PB.MessageToServer.login: object expected");
                message.login = $root.PB.MessageToServer.Login.fromObject(object.login);
            }
            if (object.createGame != null) {
                if (typeof object.createGame !== "object")
                    throw TypeError(".PB.MessageToServer.createGame: object expected");
                message.createGame = $root.PB.MessageToServer.CreateGame.fromObject(object.createGame);
            }
            if (object.enterGame != null) {
                if (typeof object.enterGame !== "object")
                    throw TypeError(".PB.MessageToServer.enterGame: object expected");
                message.enterGame = $root.PB.MessageToServer.EnterGame.fromObject(object.enterGame);
            }
            if (object.exitGame != null) {
                if (typeof object.exitGame !== "object")
                    throw TypeError(".PB.MessageToServer.exitGame: object expected");
                message.exitGame = $root.PB.MessageToServer.ExitGame.fromObject(object.exitGame);
            }
            if (object.doGameSetupAction != null) {
                if (typeof object.doGameSetupAction !== "object")
                    throw TypeError(".PB.MessageToServer.doGameSetupAction: object expected");
                message.doGameSetupAction = $root.PB.GameSetupAction.fromObject(object.doGameSetupAction);
            }
            if (object.doGameAction != null) {
                if (typeof object.doGameAction !== "object")
                    throw TypeError(".PB.MessageToServer.doGameAction: object expected");
                message.doGameAction = $root.PB.MessageToServer.DoGameAction.fromObject(object.doGameAction);
            }
            return message;
        };

        /**
         * Creates a plain object from a MessageToServer message. Also converts values to other types if specified.
         * @function toObject
         * @memberof PB.MessageToServer
         * @static
         * @param {PB.MessageToServer} message MessageToServer
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        MessageToServer.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                object.login = null;
                object.createGame = null;
                object.enterGame = null;
                object.exitGame = null;
                object.doGameSetupAction = null;
                object.doGameAction = null;
            }
            if (message.login != null && message.hasOwnProperty("login"))
                object.login = $root.PB.MessageToServer.Login.toObject(message.login, options);
            if (message.createGame != null && message.hasOwnProperty("createGame"))
                object.createGame = $root.PB.MessageToServer.CreateGame.toObject(message.createGame, options);
            if (message.enterGame != null && message.hasOwnProperty("enterGame"))
                object.enterGame = $root.PB.MessageToServer.EnterGame.toObject(message.enterGame, options);
            if (message.exitGame != null && message.hasOwnProperty("exitGame"))
                object.exitGame = $root.PB.MessageToServer.ExitGame.toObject(message.exitGame, options);
            if (message.doGameSetupAction != null && message.hasOwnProperty("doGameSetupAction"))
                object.doGameSetupAction = $root.PB.GameSetupAction.toObject(message.doGameSetupAction, options);
            if (message.doGameAction != null && message.hasOwnProperty("doGameAction"))
                object.doGameAction = $root.PB.MessageToServer.DoGameAction.toObject(message.doGameAction, options);
            return object;
        };

        /**
         * Converts this MessageToServer to JSON.
         * @function toJSON
         * @memberof PB.MessageToServer
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        MessageToServer.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        MessageToServer.Login = (function() {

            /**
             * Properties of a Login.
             * @memberof PB.MessageToServer
             * @interface ILogin
             * @property {number|null} [version] Login version
             * @property {string|null} [username] Login username
             * @property {string|null} [password] Login password
             * @property {Array.<PB.MessageToServer.Login.IGameData>|null} [gameDatas] Login gameDatas
             */

            /**
             * Constructs a new Login.
             * @memberof PB.MessageToServer
             * @classdesc Represents a Login.
             * @implements ILogin
             * @constructor
             * @param {PB.MessageToServer.ILogin=} [properties] Properties to set
             */
            function Login(properties) {
                this.gameDatas = [];
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Login version.
             * @member {number} version
             * @memberof PB.MessageToServer.Login
             * @instance
             */
            Login.prototype.version = 0;

            /**
             * Login username.
             * @member {string} username
             * @memberof PB.MessageToServer.Login
             * @instance
             */
            Login.prototype.username = "";

            /**
             * Login password.
             * @member {string} password
             * @memberof PB.MessageToServer.Login
             * @instance
             */
            Login.prototype.password = "";

            /**
             * Login gameDatas.
             * @member {Array.<PB.MessageToServer.Login.IGameData>} gameDatas
             * @memberof PB.MessageToServer.Login
             * @instance
             */
            Login.prototype.gameDatas = $util.emptyArray;

            /**
             * Creates a new Login instance using the specified properties.
             * @function create
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {PB.MessageToServer.ILogin=} [properties] Properties to set
             * @returns {PB.MessageToServer.Login} Login instance
             */
            Login.create = function create(properties) {
                return new Login(properties);
            };

            /**
             * Encodes the specified Login message. Does not implicitly {@link PB.MessageToServer.Login.verify|verify} messages.
             * @function encode
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {PB.MessageToServer.ILogin} message Login message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Login.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.version != null && Object.hasOwnProperty.call(message, "version"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.version);
                if (message.username != null && Object.hasOwnProperty.call(message, "username"))
                    writer.uint32(/* id 2, wireType 2 =*/18).string(message.username);
                if (message.password != null && Object.hasOwnProperty.call(message, "password"))
                    writer.uint32(/* id 3, wireType 2 =*/26).string(message.password);
                if (message.gameDatas != null && message.gameDatas.length)
                    for (var i = 0; i < message.gameDatas.length; ++i)
                        $root.PB.MessageToServer.Login.GameData.encode(message.gameDatas[i], writer.uint32(/* id 4, wireType 2 =*/34).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified Login message, length delimited. Does not implicitly {@link PB.MessageToServer.Login.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {PB.MessageToServer.ILogin} message Login message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            Login.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a Login message from the specified reader or buffer.
             * @function decode
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.MessageToServer.Login} Login
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Login.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer.Login();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.version = reader.int32();
                        break;
                    case 2:
                        message.username = reader.string();
                        break;
                    case 3:
                        message.password = reader.string();
                        break;
                    case 4:
                        if (!(message.gameDatas && message.gameDatas.length))
                            message.gameDatas = [];
                        message.gameDatas.push($root.PB.MessageToServer.Login.GameData.decode(reader, reader.uint32()));
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a Login message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.MessageToServer.Login} Login
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            Login.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a Login message.
             * @function verify
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            Login.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.version != null && message.hasOwnProperty("version"))
                    if (!$util.isInteger(message.version))
                        return "version: integer expected";
                if (message.username != null && message.hasOwnProperty("username"))
                    if (!$util.isString(message.username))
                        return "username: string expected";
                if (message.password != null && message.hasOwnProperty("password"))
                    if (!$util.isString(message.password))
                        return "password: string expected";
                if (message.gameDatas != null && message.hasOwnProperty("gameDatas")) {
                    if (!Array.isArray(message.gameDatas))
                        return "gameDatas: array expected";
                    for (var i = 0; i < message.gameDatas.length; ++i) {
                        var error = $root.PB.MessageToServer.Login.GameData.verify(message.gameDatas[i]);
                        if (error)
                            return "gameDatas." + error;
                    }
                }
                return null;
            };

            /**
             * Creates a Login message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.MessageToServer.Login} Login
             */
            Login.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.MessageToServer.Login)
                    return object;
                var message = new $root.PB.MessageToServer.Login();
                if (object.version != null)
                    message.version = object.version | 0;
                if (object.username != null)
                    message.username = String(object.username);
                if (object.password != null)
                    message.password = String(object.password);
                if (object.gameDatas) {
                    if (!Array.isArray(object.gameDatas))
                        throw TypeError(".PB.MessageToServer.Login.gameDatas: array expected");
                    message.gameDatas = [];
                    for (var i = 0; i < object.gameDatas.length; ++i) {
                        if (typeof object.gameDatas[i] !== "object")
                            throw TypeError(".PB.MessageToServer.Login.gameDatas: object expected");
                        message.gameDatas[i] = $root.PB.MessageToServer.Login.GameData.fromObject(object.gameDatas[i]);
                    }
                }
                return message;
            };

            /**
             * Creates a plain object from a Login message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.MessageToServer.Login
             * @static
             * @param {PB.MessageToServer.Login} message Login
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            Login.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.arrays || options.defaults)
                    object.gameDatas = [];
                if (options.defaults) {
                    object.version = 0;
                    object.username = "";
                    object.password = "";
                }
                if (message.version != null && message.hasOwnProperty("version"))
                    object.version = message.version;
                if (message.username != null && message.hasOwnProperty("username"))
                    object.username = message.username;
                if (message.password != null && message.hasOwnProperty("password"))
                    object.password = message.password;
                if (message.gameDatas && message.gameDatas.length) {
                    object.gameDatas = [];
                    for (var j = 0; j < message.gameDatas.length; ++j)
                        object.gameDatas[j] = $root.PB.MessageToServer.Login.GameData.toObject(message.gameDatas[j], options);
                }
                return object;
            };

            /**
             * Converts this Login to JSON.
             * @function toJSON
             * @memberof PB.MessageToServer.Login
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            Login.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            Login.GameData = (function() {

                /**
                 * Properties of a GameData.
                 * @memberof PB.MessageToServer.Login
                 * @interface IGameData
                 * @property {number|null} [gameId] GameData gameId
                 * @property {number|null} [gameStateHistorySize] GameData gameStateHistorySize
                 */

                /**
                 * Constructs a new GameData.
                 * @memberof PB.MessageToServer.Login
                 * @classdesc Represents a GameData.
                 * @implements IGameData
                 * @constructor
                 * @param {PB.MessageToServer.Login.IGameData=} [properties] Properties to set
                 */
                function GameData(properties) {
                    if (properties)
                        for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                            if (properties[keys[i]] != null)
                                this[keys[i]] = properties[keys[i]];
                }

                /**
                 * GameData gameId.
                 * @member {number} gameId
                 * @memberof PB.MessageToServer.Login.GameData
                 * @instance
                 */
                GameData.prototype.gameId = 0;

                /**
                 * GameData gameStateHistorySize.
                 * @member {number} gameStateHistorySize
                 * @memberof PB.MessageToServer.Login.GameData
                 * @instance
                 */
                GameData.prototype.gameStateHistorySize = 0;

                /**
                 * Creates a new GameData instance using the specified properties.
                 * @function create
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {PB.MessageToServer.Login.IGameData=} [properties] Properties to set
                 * @returns {PB.MessageToServer.Login.GameData} GameData instance
                 */
                GameData.create = function create(properties) {
                    return new GameData(properties);
                };

                /**
                 * Encodes the specified GameData message. Does not implicitly {@link PB.MessageToServer.Login.GameData.verify|verify} messages.
                 * @function encode
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {PB.MessageToServer.Login.IGameData} message GameData message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GameData.encode = function encode(message, writer) {
                    if (!writer)
                        writer = $Writer.create();
                    if (message.gameId != null && Object.hasOwnProperty.call(message, "gameId"))
                        writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameId);
                    if (message.gameStateHistorySize != null && Object.hasOwnProperty.call(message, "gameStateHistorySize"))
                        writer.uint32(/* id 2, wireType 0 =*/16).int32(message.gameStateHistorySize);
                    return writer;
                };

                /**
                 * Encodes the specified GameData message, length delimited. Does not implicitly {@link PB.MessageToServer.Login.GameData.verify|verify} messages.
                 * @function encodeDelimited
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {PB.MessageToServer.Login.IGameData} message GameData message or plain object to encode
                 * @param {$protobuf.Writer} [writer] Writer to encode to
                 * @returns {$protobuf.Writer} Writer
                 */
                GameData.encodeDelimited = function encodeDelimited(message, writer) {
                    return this.encode(message, writer).ldelim();
                };

                /**
                 * Decodes a GameData message from the specified reader or buffer.
                 * @function decode
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @param {number} [length] Message length if known beforehand
                 * @returns {PB.MessageToServer.Login.GameData} GameData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GameData.decode = function decode(reader, length) {
                    if (!(reader instanceof $Reader))
                        reader = $Reader.create(reader);
                    var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer.Login.GameData();
                    while (reader.pos < end) {
                        var tag = reader.uint32();
                        switch (tag >>> 3) {
                        case 1:
                            message.gameId = reader.int32();
                            break;
                        case 2:
                            message.gameStateHistorySize = reader.int32();
                            break;
                        default:
                            reader.skipType(tag & 7);
                            break;
                        }
                    }
                    return message;
                };

                /**
                 * Decodes a GameData message from the specified reader or buffer, length delimited.
                 * @function decodeDelimited
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
                 * @returns {PB.MessageToServer.Login.GameData} GameData
                 * @throws {Error} If the payload is not a reader or valid buffer
                 * @throws {$protobuf.util.ProtocolError} If required fields are missing
                 */
                GameData.decodeDelimited = function decodeDelimited(reader) {
                    if (!(reader instanceof $Reader))
                        reader = new $Reader(reader);
                    return this.decode(reader, reader.uint32());
                };

                /**
                 * Verifies a GameData message.
                 * @function verify
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {Object.<string,*>} message Plain object to verify
                 * @returns {string|null} `null` if valid, otherwise the reason why it is not
                 */
                GameData.verify = function verify(message) {
                    if (typeof message !== "object" || message === null)
                        return "object expected";
                    if (message.gameId != null && message.hasOwnProperty("gameId"))
                        if (!$util.isInteger(message.gameId))
                            return "gameId: integer expected";
                    if (message.gameStateHistorySize != null && message.hasOwnProperty("gameStateHistorySize"))
                        if (!$util.isInteger(message.gameStateHistorySize))
                            return "gameStateHistorySize: integer expected";
                    return null;
                };

                /**
                 * Creates a GameData message from a plain object. Also converts values to their respective internal types.
                 * @function fromObject
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {Object.<string,*>} object Plain object
                 * @returns {PB.MessageToServer.Login.GameData} GameData
                 */
                GameData.fromObject = function fromObject(object) {
                    if (object instanceof $root.PB.MessageToServer.Login.GameData)
                        return object;
                    var message = new $root.PB.MessageToServer.Login.GameData();
                    if (object.gameId != null)
                        message.gameId = object.gameId | 0;
                    if (object.gameStateHistorySize != null)
                        message.gameStateHistorySize = object.gameStateHistorySize | 0;
                    return message;
                };

                /**
                 * Creates a plain object from a GameData message. Also converts values to other types if specified.
                 * @function toObject
                 * @memberof PB.MessageToServer.Login.GameData
                 * @static
                 * @param {PB.MessageToServer.Login.GameData} message GameData
                 * @param {$protobuf.IConversionOptions} [options] Conversion options
                 * @returns {Object.<string,*>} Plain object
                 */
                GameData.toObject = function toObject(message, options) {
                    if (!options)
                        options = {};
                    var object = {};
                    if (options.defaults) {
                        object.gameId = 0;
                        object.gameStateHistorySize = 0;
                    }
                    if (message.gameId != null && message.hasOwnProperty("gameId"))
                        object.gameId = message.gameId;
                    if (message.gameStateHistorySize != null && message.hasOwnProperty("gameStateHistorySize"))
                        object.gameStateHistorySize = message.gameStateHistorySize;
                    return object;
                };

                /**
                 * Converts this GameData to JSON.
                 * @function toJSON
                 * @memberof PB.MessageToServer.Login.GameData
                 * @instance
                 * @returns {Object.<string,*>} JSON object
                 */
                GameData.prototype.toJSON = function toJSON() {
                    return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
                };

                return GameData;
            })();

            return Login;
        })();

        MessageToServer.CreateGame = (function() {

            /**
             * Properties of a CreateGame.
             * @memberof PB.MessageToServer
             * @interface ICreateGame
             * @property {GameMode|null} [gameMode] CreateGame gameMode
             */

            /**
             * Constructs a new CreateGame.
             * @memberof PB.MessageToServer
             * @classdesc Represents a CreateGame.
             * @implements ICreateGame
             * @constructor
             * @param {PB.MessageToServer.ICreateGame=} [properties] Properties to set
             */
            function CreateGame(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * CreateGame gameMode.
             * @member {GameMode} gameMode
             * @memberof PB.MessageToServer.CreateGame
             * @instance
             */
            CreateGame.prototype.gameMode = 1;

            /**
             * Creates a new CreateGame instance using the specified properties.
             * @function create
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {PB.MessageToServer.ICreateGame=} [properties] Properties to set
             * @returns {PB.MessageToServer.CreateGame} CreateGame instance
             */
            CreateGame.create = function create(properties) {
                return new CreateGame(properties);
            };

            /**
             * Encodes the specified CreateGame message. Does not implicitly {@link PB.MessageToServer.CreateGame.verify|verify} messages.
             * @function encode
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {PB.MessageToServer.ICreateGame} message CreateGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateGame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.gameMode != null && Object.hasOwnProperty.call(message, "gameMode"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameMode);
                return writer;
            };

            /**
             * Encodes the specified CreateGame message, length delimited. Does not implicitly {@link PB.MessageToServer.CreateGame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {PB.MessageToServer.ICreateGame} message CreateGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            CreateGame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a CreateGame message from the specified reader or buffer.
             * @function decode
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.MessageToServer.CreateGame} CreateGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateGame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer.CreateGame();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.gameMode = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a CreateGame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.MessageToServer.CreateGame} CreateGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            CreateGame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a CreateGame message.
             * @function verify
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            CreateGame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                    switch (message.gameMode) {
                    default:
                        return "gameMode: enum value expected";
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                    case 9:
                        break;
                    }
                return null;
            };

            /**
             * Creates a CreateGame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.MessageToServer.CreateGame} CreateGame
             */
            CreateGame.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.MessageToServer.CreateGame)
                    return object;
                var message = new $root.PB.MessageToServer.CreateGame();
                switch (object.gameMode) {
                case "SINGLES_1":
                case 1:
                    message.gameMode = 1;
                    break;
                case "SINGLES_2":
                case 2:
                    message.gameMode = 2;
                    break;
                case "SINGLES_3":
                case 3:
                    message.gameMode = 3;
                    break;
                case "SINGLES_4":
                case 4:
                    message.gameMode = 4;
                    break;
                case "SINGLES_5":
                case 5:
                    message.gameMode = 5;
                    break;
                case "SINGLES_6":
                case 6:
                    message.gameMode = 6;
                    break;
                case "TEAMS_2_VS_2":
                case 7:
                    message.gameMode = 7;
                    break;
                case "TEAMS_2_VS_2_VS_2":
                case 8:
                    message.gameMode = 8;
                    break;
                case "TEAMS_3_VS_3":
                case 9:
                    message.gameMode = 9;
                    break;
                }
                return message;
            };

            /**
             * Creates a plain object from a CreateGame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.MessageToServer.CreateGame
             * @static
             * @param {PB.MessageToServer.CreateGame} message CreateGame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            CreateGame.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.gameMode = options.enums === String ? "SINGLES_1" : 1;
                if (message.gameMode != null && message.hasOwnProperty("gameMode"))
                    object.gameMode = options.enums === String ? $root.GameMode[message.gameMode] : message.gameMode;
                return object;
            };

            /**
             * Converts this CreateGame to JSON.
             * @function toJSON
             * @memberof PB.MessageToServer.CreateGame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            CreateGame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return CreateGame;
        })();

        MessageToServer.EnterGame = (function() {

            /**
             * Properties of an EnterGame.
             * @memberof PB.MessageToServer
             * @interface IEnterGame
             * @property {number|null} [gameDisplayNumber] EnterGame gameDisplayNumber
             */

            /**
             * Constructs a new EnterGame.
             * @memberof PB.MessageToServer
             * @classdesc Represents an EnterGame.
             * @implements IEnterGame
             * @constructor
             * @param {PB.MessageToServer.IEnterGame=} [properties] Properties to set
             */
            function EnterGame(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * EnterGame gameDisplayNumber.
             * @member {number} gameDisplayNumber
             * @memberof PB.MessageToServer.EnterGame
             * @instance
             */
            EnterGame.prototype.gameDisplayNumber = 0;

            /**
             * Creates a new EnterGame instance using the specified properties.
             * @function create
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {PB.MessageToServer.IEnterGame=} [properties] Properties to set
             * @returns {PB.MessageToServer.EnterGame} EnterGame instance
             */
            EnterGame.create = function create(properties) {
                return new EnterGame(properties);
            };

            /**
             * Encodes the specified EnterGame message. Does not implicitly {@link PB.MessageToServer.EnterGame.verify|verify} messages.
             * @function encode
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {PB.MessageToServer.IEnterGame} message EnterGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EnterGame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.gameDisplayNumber != null && Object.hasOwnProperty.call(message, "gameDisplayNumber"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameDisplayNumber);
                return writer;
            };

            /**
             * Encodes the specified EnterGame message, length delimited. Does not implicitly {@link PB.MessageToServer.EnterGame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {PB.MessageToServer.IEnterGame} message EnterGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            EnterGame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an EnterGame message from the specified reader or buffer.
             * @function decode
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.MessageToServer.EnterGame} EnterGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EnterGame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer.EnterGame();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.gameDisplayNumber = reader.int32();
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes an EnterGame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.MessageToServer.EnterGame} EnterGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            EnterGame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an EnterGame message.
             * @function verify
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            EnterGame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.gameDisplayNumber != null && message.hasOwnProperty("gameDisplayNumber"))
                    if (!$util.isInteger(message.gameDisplayNumber))
                        return "gameDisplayNumber: integer expected";
                return null;
            };

            /**
             * Creates an EnterGame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.MessageToServer.EnterGame} EnterGame
             */
            EnterGame.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.MessageToServer.EnterGame)
                    return object;
                var message = new $root.PB.MessageToServer.EnterGame();
                if (object.gameDisplayNumber != null)
                    message.gameDisplayNumber = object.gameDisplayNumber | 0;
                return message;
            };

            /**
             * Creates a plain object from an EnterGame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.MessageToServer.EnterGame
             * @static
             * @param {PB.MessageToServer.EnterGame} message EnterGame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            EnterGame.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults)
                    object.gameDisplayNumber = 0;
                if (message.gameDisplayNumber != null && message.hasOwnProperty("gameDisplayNumber"))
                    object.gameDisplayNumber = message.gameDisplayNumber;
                return object;
            };

            /**
             * Converts this EnterGame to JSON.
             * @function toJSON
             * @memberof PB.MessageToServer.EnterGame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            EnterGame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return EnterGame;
        })();

        MessageToServer.ExitGame = (function() {

            /**
             * Properties of an ExitGame.
             * @memberof PB.MessageToServer
             * @interface IExitGame
             */

            /**
             * Constructs a new ExitGame.
             * @memberof PB.MessageToServer
             * @classdesc Represents an ExitGame.
             * @implements IExitGame
             * @constructor
             * @param {PB.MessageToServer.IExitGame=} [properties] Properties to set
             */
            function ExitGame(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * Creates a new ExitGame instance using the specified properties.
             * @function create
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {PB.MessageToServer.IExitGame=} [properties] Properties to set
             * @returns {PB.MessageToServer.ExitGame} ExitGame instance
             */
            ExitGame.create = function create(properties) {
                return new ExitGame(properties);
            };

            /**
             * Encodes the specified ExitGame message. Does not implicitly {@link PB.MessageToServer.ExitGame.verify|verify} messages.
             * @function encode
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {PB.MessageToServer.IExitGame} message ExitGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExitGame.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                return writer;
            };

            /**
             * Encodes the specified ExitGame message, length delimited. Does not implicitly {@link PB.MessageToServer.ExitGame.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {PB.MessageToServer.IExitGame} message ExitGame message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            ExitGame.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes an ExitGame message from the specified reader or buffer.
             * @function decode
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.MessageToServer.ExitGame} ExitGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExitGame.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer.ExitGame();
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
             * Decodes an ExitGame message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.MessageToServer.ExitGame} ExitGame
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            ExitGame.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies an ExitGame message.
             * @function verify
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            ExitGame.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                return null;
            };

            /**
             * Creates an ExitGame message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.MessageToServer.ExitGame} ExitGame
             */
            ExitGame.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.MessageToServer.ExitGame)
                    return object;
                return new $root.PB.MessageToServer.ExitGame();
            };

            /**
             * Creates a plain object from an ExitGame message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.MessageToServer.ExitGame
             * @static
             * @param {PB.MessageToServer.ExitGame} message ExitGame
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            ExitGame.toObject = function toObject() {
                return {};
            };

            /**
             * Converts this ExitGame to JSON.
             * @function toJSON
             * @memberof PB.MessageToServer.ExitGame
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            ExitGame.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return ExitGame;
        })();

        MessageToServer.DoGameAction = (function() {

            /**
             * Properties of a DoGameAction.
             * @memberof PB.MessageToServer
             * @interface IDoGameAction
             * @property {number|null} [gameStateHistorySize] DoGameAction gameStateHistorySize
             * @property {PB.IGameAction|null} [gameAction] DoGameAction gameAction
             */

            /**
             * Constructs a new DoGameAction.
             * @memberof PB.MessageToServer
             * @classdesc Represents a DoGameAction.
             * @implements IDoGameAction
             * @constructor
             * @param {PB.MessageToServer.IDoGameAction=} [properties] Properties to set
             */
            function DoGameAction(properties) {
                if (properties)
                    for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                        if (properties[keys[i]] != null)
                            this[keys[i]] = properties[keys[i]];
            }

            /**
             * DoGameAction gameStateHistorySize.
             * @member {number} gameStateHistorySize
             * @memberof PB.MessageToServer.DoGameAction
             * @instance
             */
            DoGameAction.prototype.gameStateHistorySize = 0;

            /**
             * DoGameAction gameAction.
             * @member {PB.IGameAction|null|undefined} gameAction
             * @memberof PB.MessageToServer.DoGameAction
             * @instance
             */
            DoGameAction.prototype.gameAction = null;

            /**
             * Creates a new DoGameAction instance using the specified properties.
             * @function create
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {PB.MessageToServer.IDoGameAction=} [properties] Properties to set
             * @returns {PB.MessageToServer.DoGameAction} DoGameAction instance
             */
            DoGameAction.create = function create(properties) {
                return new DoGameAction(properties);
            };

            /**
             * Encodes the specified DoGameAction message. Does not implicitly {@link PB.MessageToServer.DoGameAction.verify|verify} messages.
             * @function encode
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {PB.MessageToServer.IDoGameAction} message DoGameAction message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DoGameAction.encode = function encode(message, writer) {
                if (!writer)
                    writer = $Writer.create();
                if (message.gameStateHistorySize != null && Object.hasOwnProperty.call(message, "gameStateHistorySize"))
                    writer.uint32(/* id 1, wireType 0 =*/8).int32(message.gameStateHistorySize);
                if (message.gameAction != null && Object.hasOwnProperty.call(message, "gameAction"))
                    $root.PB.GameAction.encode(message.gameAction, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
                return writer;
            };

            /**
             * Encodes the specified DoGameAction message, length delimited. Does not implicitly {@link PB.MessageToServer.DoGameAction.verify|verify} messages.
             * @function encodeDelimited
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {PB.MessageToServer.IDoGameAction} message DoGameAction message or plain object to encode
             * @param {$protobuf.Writer} [writer] Writer to encode to
             * @returns {$protobuf.Writer} Writer
             */
            DoGameAction.encodeDelimited = function encodeDelimited(message, writer) {
                return this.encode(message, writer).ldelim();
            };

            /**
             * Decodes a DoGameAction message from the specified reader or buffer.
             * @function decode
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @param {number} [length] Message length if known beforehand
             * @returns {PB.MessageToServer.DoGameAction} DoGameAction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DoGameAction.decode = function decode(reader, length) {
                if (!(reader instanceof $Reader))
                    reader = $Reader.create(reader);
                var end = length === undefined ? reader.len : reader.pos + length, message = new $root.PB.MessageToServer.DoGameAction();
                while (reader.pos < end) {
                    var tag = reader.uint32();
                    switch (tag >>> 3) {
                    case 1:
                        message.gameStateHistorySize = reader.int32();
                        break;
                    case 2:
                        message.gameAction = $root.PB.GameAction.decode(reader, reader.uint32());
                        break;
                    default:
                        reader.skipType(tag & 7);
                        break;
                    }
                }
                return message;
            };

            /**
             * Decodes a DoGameAction message from the specified reader or buffer, length delimited.
             * @function decodeDelimited
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
             * @returns {PB.MessageToServer.DoGameAction} DoGameAction
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            DoGameAction.decodeDelimited = function decodeDelimited(reader) {
                if (!(reader instanceof $Reader))
                    reader = new $Reader(reader);
                return this.decode(reader, reader.uint32());
            };

            /**
             * Verifies a DoGameAction message.
             * @function verify
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {Object.<string,*>} message Plain object to verify
             * @returns {string|null} `null` if valid, otherwise the reason why it is not
             */
            DoGameAction.verify = function verify(message) {
                if (typeof message !== "object" || message === null)
                    return "object expected";
                if (message.gameStateHistorySize != null && message.hasOwnProperty("gameStateHistorySize"))
                    if (!$util.isInteger(message.gameStateHistorySize))
                        return "gameStateHistorySize: integer expected";
                if (message.gameAction != null && message.hasOwnProperty("gameAction")) {
                    var error = $root.PB.GameAction.verify(message.gameAction);
                    if (error)
                        return "gameAction." + error;
                }
                return null;
            };

            /**
             * Creates a DoGameAction message from a plain object. Also converts values to their respective internal types.
             * @function fromObject
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {Object.<string,*>} object Plain object
             * @returns {PB.MessageToServer.DoGameAction} DoGameAction
             */
            DoGameAction.fromObject = function fromObject(object) {
                if (object instanceof $root.PB.MessageToServer.DoGameAction)
                    return object;
                var message = new $root.PB.MessageToServer.DoGameAction();
                if (object.gameStateHistorySize != null)
                    message.gameStateHistorySize = object.gameStateHistorySize | 0;
                if (object.gameAction != null) {
                    if (typeof object.gameAction !== "object")
                        throw TypeError(".PB.MessageToServer.DoGameAction.gameAction: object expected");
                    message.gameAction = $root.PB.GameAction.fromObject(object.gameAction);
                }
                return message;
            };

            /**
             * Creates a plain object from a DoGameAction message. Also converts values to other types if specified.
             * @function toObject
             * @memberof PB.MessageToServer.DoGameAction
             * @static
             * @param {PB.MessageToServer.DoGameAction} message DoGameAction
             * @param {$protobuf.IConversionOptions} [options] Conversion options
             * @returns {Object.<string,*>} Plain object
             */
            DoGameAction.toObject = function toObject(message, options) {
                if (!options)
                    options = {};
                var object = {};
                if (options.defaults) {
                    object.gameStateHistorySize = 0;
                    object.gameAction = null;
                }
                if (message.gameStateHistorySize != null && message.hasOwnProperty("gameStateHistorySize"))
                    object.gameStateHistorySize = message.gameStateHistorySize;
                if (message.gameAction != null && message.hasOwnProperty("gameAction"))
                    object.gameAction = $root.PB.GameAction.toObject(message.gameAction, options);
                return object;
            };

            /**
             * Converts this DoGameAction to JSON.
             * @function toJSON
             * @memberof PB.MessageToServer.DoGameAction
             * @instance
             * @returns {Object.<string,*>} JSON object
             */
            DoGameAction.prototype.toJSON = function toJSON() {
                return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
            };

            return DoGameAction;
        })();

        return MessageToServer;
    })();

    return PB;
})();

module.exports = $root;
