var common_functions = require('./common_functions'),
    enums = require('./enums'),
    pubsub = require('./pubsub'),
    current_page = null,
    show_on_game_page = false,
    page_to_position = {},
    details = {};

function setPosition() {
    var position = page_to_position[current_page];

    common_functions.setElementPosition($('#options'), position.left, position.top, position.width, position.height);
}

function setPage(page) {
    current_page = page;

    if (page === 'lobby' || (page === 'game' && show_on_game_page)) {
        setPosition();
        $('#options').show();
    } else {
        $('#options').hide();
    }
}

function setShowOnGamePage(show) {
    show_on_game_page = show;

    if (current_page === 'game') {
        setPage(current_page);
    }
}

function setPositionForPage(page, left, top, width, height) {
    page_to_position[page] = {
        left: left,
        top: top,
        width: width,
        height: height,
    };

    if (page === current_page) {
        setPosition();
    }
}

function getStoredOptionValue(key) {
    var value = null;

    try {
        if (localStorage) {
            value = localStorage[key];
        }
    } catch (e) {}

    if (value === undefined) {
        value = null;
    } else {
        try {
            value = JSON.parse(value);
        } catch (e) {
            value = null;
        }
    }

    return value;
}

function setStoredOptionValue(key, value) {
    try {
        if (localStorage) {
            localStorage[key] = JSON.stringify(value);
        }
    } catch (e) {}
}

function initialize() {
    var option_id, key, detail, $input, value;

    details[enums.Options.EnablePageTitleNotifications] = {
        type: 'checkbox',
        default: true,
        valid: [true, false],
    };
    details[enums.Options.Sound] = {
        type: 'select',
        default: 'beep',
        valid: ['beep', 'cha-ching'],
    };
    details[enums.Options.Volume] = {
        type: 'select',
        default: '100',
        valid: ['100', '90', '80', '70', '60', '50', '40', '30', '20', '10', '0'],
        disable: document.getElementById('beep').pause === undefined,
        'disabled-value': '0',
    };
    details[enums.Options.EnableHighContrastColors] = {
        type: 'checkbox',
        default: true,
        valid: [true, false],
    };
    details[enums.Options.EnableTextBackgroundColors] = {
        type: 'checkbox',
        default: true,
        valid: [true, false],
    };
    details[enums.Options.ColorScheme] = {
        type: 'select',
        default: 'netacquire',
        valid: ['netacquire', 'white'],
    };
    details[enums.Options.GameBoardLabelMode] = {
        type: 'select',
        default: 'nothing',
        valid: ['nothing', 'coordinates', 'hotel initials'],
    };

    for (option_id in details) {
        if (details.hasOwnProperty(option_id)) {
            option_id = parseInt(option_id, 10);
            key = common_functions.getHyphenatedStringFromEnumName(enums.Options[option_id]);
            detail = details[option_id];
            $input = $('#option-' + key);
            value = getStoredOptionValue(key);

            // smooth transition from EnableSoundNotifications to Volume
            if (option_id === enums.Options.Volume && value === null) {
                if (getStoredOptionValue('enable-sound-notifications') === false) {
                    value = '0';
                }
            }

            if ($.inArray(value, detail.valid) === -1) {
                value = detail['default'];
            }

            if (detail.hasOwnProperty('disable') && detail.disable) {
                value = detail.hasOwnProperty('disable-value') ? detail['disable-value'] : false;
                $input.prop('disabled', true);
                $input.parent().addClass('disabled');
            }

            switch (detail.type) {
                case 'checkbox':
                    $input.prop('checked', value);
                    break;
                case 'select':
                    $input.val(value);
                    break;
            }

            setStoredOptionValue(key, value);
            pubsub.publish(enums.PubSub.Client_SetOption, option_id, value);
        }
    }
}

function processChange() {
    /* jshint validthis:true */
    var $input = $(this),
        key = $input.attr('id').substr(7),
        option_id = enums.Options[common_functions.getEnumNameFromHyphenatedString(key)],
        detail = details[option_id],
        value;

    switch (detail.type) {
        case 'checkbox':
            value = $input.prop('checked');
            break;
        case 'select':
            value = $input.val();
            break;
    }

    setStoredOptionValue(key, value);
    pubsub.publish(enums.PubSub.Client_SetOption, option_id, value);
}

function onInitializationComplete() {
    initialize();

    $('#options input, #options select').change(processChange);
}

pubsub.subscribe(enums.PubSub.Client_SetPage, setPage);
pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

module.exports = {
    setShowOnGamePage: setShowOnGamePage,
    setPositionForPage: setPositionForPage,
};
