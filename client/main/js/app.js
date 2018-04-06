var common_functions = require('./common_functions'),
    enums = require('./enums'),
    network = require('./network'),
    pubsub = require('./pubsub'),
    current_page = 'loading',
    periodic_resize_check_width = null,
    periodic_resize_check_height = null,
    error_message_lookup = {},
    option_color_scheme = null;

function showPage(page) {
    if (page !== current_page) {
        $('.page').hide();
        $('#page-' + page).show();

        if (page === 'login') {
            $('#login-form-username').focus();
        }

        if (page === 'lobby' || page === 'game') {
            $('body').addClass('hide-overflow');
        } else {
            $('body').removeClass('hide-overflow');
        }

        current_page = page;

        updateColorScheme();

        pubsub.publish(enums.PubSub.Client_SetPage, page);
    }
}

function periodicResizeCheck() {
    var width = $(window).width(),
        height = $(window).height();

    if (width !== periodic_resize_check_width || height !== periodic_resize_check_height) {
        periodic_resize_check_width = width;
        periodic_resize_check_height = height;
        pubsub.publish(enums.PubSub.Client_Resize, width, height);
    }

    setTimeout(periodicResizeCheck, 500);
}

function initializeUsername() {
    var username;

    try {
        if (localStorage) {
            username = localStorage.username;
        }
    } catch (e) {}

    if (username !== undefined) {
        $('#login-form-username').val(username);
    }
}

function onSubmitLoginForm() {
    var username = $('#login-form-username')
            .val()
            .replace(/\s+/g, ' ')
            .trim(),
        password = $('#login-form-password').val();

    if (username.length === 0 || username.length > 32 || !common_functions.isASCII(username)) {
        setLoginErrorMessage(enums.Errors.InvalidUsername);
    } else {
        try {
            if (localStorage) {
                localStorage.username = username;
            }
        } catch (e) {}

        showPage('connecting');
        setLoginErrorMessage(enums.Errors.LostConnection);
        network.connect(username, password.length > 0 ? getPasswordHash(username, password) : '');
    }

    return false;
}

function onSubmitSetPasswordForm() {
    var username = $('#set-password-form-username')
            .val()
            .replace(/\s+/g, ' ')
            .trim(),
        password = $('#set-password-form-password').val(),
        password_repeat = $('#set-password-form-password-repeat').val(),
        $inputs;

    if (username.length < 1 || username.length > 32 || !common_functions.isASCII(username)) {
        setSetPasswordErrorMessage(enums.Errors.InvalidUsername);
    } else if (password.length < 8) {
        setSetPasswordErrorMessage(enums.Errors.InvalidPassword);
    } else if (password !== password_repeat) {
        setSetPasswordErrorMessage(enums.Errors.NonMatchingPasswords);
    } else {
        $inputs = $('#set-password-form input');
        $inputs.prop('disabled', true);

        $.ajax({
            type: 'POST',
            url: network.getServerUrl() + '/server/set-password',
            data: {
                version: $('#page-login').attr('data-version'),
                username: username,
                password: getPasswordHash(username, password),
            },
            success: function(data) {
                setSetPasswordErrorMessage(data);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $.post('/server/report-error', {
                    message: 'set-password ajax error',
                    trace: JSON.stringify({
                        jqXHR: jqXHR,
                        textStatus: textStatus,
                        errorThrown: errorThrown,
                    }),
                });
                setSetPasswordErrorMessage(enums.Errors.GenericError);
            },
            complete: function() {
                $inputs.prop('disabled', false);
            },
            dataType: 'json',
        });
    }

    return false;
}

function getPasswordHash(username, password) {
    return CryptoJS.SHA256('acquire ' + username + ' ' + password).toString();
}

function onClientSetClientData() {
    showPage('lobby');
}

function initializeErrorMessageLookup() {
    error_message_lookup[enums.Errors.NotUsingLatestVersion] =
        'You are not using the latest version. Please <a href="#" class="link-reload-page">reload this page</a> to get it!';
    error_message_lookup[enums.Errors.GenericError] = 'An error occurred during the processing of your request.';
    error_message_lookup[enums.Errors.InvalidUsername] = 'Invalid username. Username must have between 1 and 32 ASCII characters.';
    error_message_lookup[enums.Errors.InvalidPassword] = 'Invalid password. Password must have at least 8 characters.';
    error_message_lookup[enums.Errors.MissingPassword] = 'Password is required.';
    error_message_lookup[enums.Errors.ProvidedPassword] = 'Password is not set for this user.';
    error_message_lookup[enums.Errors.IncorrectPassword] = 'Password is incorrect.';
    error_message_lookup[enums.Errors.NonMatchingPasswords] = 'Password and Repeat Password must match.';
    error_message_lookup[enums.Errors.ExistingPassword] = 'Password already exists for this username.';
    error_message_lookup[enums.Errors.UsernameAlreadyInUse] = 'Username already in use.';
    error_message_lookup[enums.Errors.LostConnection] = 'Lost connection to the server.';
}

function onClickLinkReloadPage() {
    document.location.reload();
    return false;
}

function setLoginErrorMessage(error_id) {
    var message;

    if (error_message_lookup.hasOwnProperty(error_id)) {
        message = error_message_lookup[error_id];
    } else {
        message = 'Unknown error.';
    }

    $('#login-error-message').html($('<p/>').html(message));
}

function setSetPasswordErrorMessage(error_id) {
    var message,
        $set_password_success_message = $('#set-password-success-message'),
        $set_password_error_message = $('#set-password-error-message');

    if (error_id === null) {
        $set_password_success_message.html($('<p/>').text('Success!'));
        $set_password_error_message.empty();
    } else {
        if (error_message_lookup.hasOwnProperty(error_id)) {
            message = error_message_lookup[error_id];
        } else {
            message = 'Unknown error.';
        }

        $set_password_success_message.empty();
        $set_password_error_message.html($('<p/>').html(message));
    }
}

function onClientSetOption(option_id, value) {
    if (option_id === enums.Options.EnableHighContrastColors) {
        if (value) {
            $('body').addClass('enable-high-contrast-colors');
        } else {
            $('body').removeClass('enable-high-contrast-colors');
        }
    } else if (option_id === enums.Options.EnableTextBackgroundColors) {
        if (value) {
            $('body').addClass('enable-text-background-colors');
            $('body').removeClass('disable-text-background-colors');
        } else {
            $('body').addClass('disable-text-background-colors');
            $('body').removeClass('enable-text-background-colors');
        }
    } else if (option_id === enums.Options.ColorScheme) {
        option_color_scheme = value;
        updateColorScheme();
    }
}

function updateColorScheme() {
    var color_scheme = 'default';

    if (current_page !== 'login' && current_page !== 'connecting') {
        color_scheme = option_color_scheme;
    }

    if (color_scheme === 'netacquire') {
        $('body').addClass('color-scheme-netacquire');
    } else {
        $('body').removeClass('color-scheme-netacquire');
    }
}

function onClientJoinGame() {
    showPage('game');
}

function onClientLeaveGame() {
    showPage('lobby');
}

function onNetworkDisconnect() {
    showPage('login');
}

function onInitializationComplete() {
    periodicResizeCheck();
    initializeUsername();
    initializeErrorMessageLookup();
    showPage('login');

    $('#login-form').submit(onSubmitLoginForm);
    $('#set-password-form').submit(onSubmitSetPasswordForm);
    $('#page-login').on('click', '.link-reload-page', onClickLinkReloadPage);
}

function publishInitializationCompleteWhenReady() {
    if (
        document.readyState === 'complete' &&
        typeof JSON !== 'undefined' &&
        typeof $ !== 'undefined' &&
        typeof StackTrace !== 'undefined' &&
        typeof CryptoJS !== 'undefined' &&
        typeof SockJS !== 'undefined'
    ) {
        pubsub.publish(enums.PubSub.Client_InitializationComplete);
    } else {
        setTimeout(publishInitializationCompleteWhenReady, 10);
    }
}

require('./lobby_page');
require('./game');

window.onerror = function(message, file, line_number) {
    $.post('/server/report-error', {
        message: message,
        trace: file + ':' + line_number,
    });
};

pubsub.subscribe(enums.PubSub.Client_SetClientData, onClientSetClientData);
pubsub.subscribe(enums.PubSub.Server_FatalError, setLoginErrorMessage);
pubsub.subscribe(enums.PubSub.Client_SetOption, onClientSetOption);
pubsub.subscribe(enums.PubSub.Client_JoinGame, onClientJoinGame);
pubsub.subscribe(enums.PubSub.Client_LeaveGame, onClientLeaveGame);
pubsub.subscribe(enums.PubSub.Network_Disconnect, onNetworkDisconnect);
pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

publishInitializationCompleteWhenReady();
