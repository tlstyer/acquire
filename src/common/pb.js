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

module.exports = $root;
