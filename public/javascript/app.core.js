var app = {};
app.methods = {};
app.core = {};
app.params = {};

app.core.doPost = function (url, data, callback) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data

    }).done(function (data) {
        callback(false, data);

    }).error(function (data) {
        if (data.responseJSON) {
            $.each(data.responseJSON, function () {
                $.each(this, function (field, message) {
                    $('[name=' + field + ']').before($('<span />').addClass('label label-danger error-label').html(message));
                });
            });
            callback(data.responseJSON[0]);
        } else {
            callback(data);
        }
    });
};


app.core.doGet = function (url, callback) {
    $.ajax({
        type: 'GET',
        url: url

    }).done(function (data) {
        callback(data);

    }).error(function (data) {
        callback(false, data);
    });
};

app.methods.getCurrentUser = function (callback) {
    if (app.params.user !== undefined) {
        return callback();
    }
    var internalCallback = function (error, data) {
        if (data.status == 401) {
            window.location = '#login'
        } else {
            app.params.user = data;
            callback();
        }
    };
    app.core.doGet('/user/', internalCallback);
};

app.methods.login = function () {
    console.debug('app.methods.login');
    $('.error-label').remove();
    var callback = function (error, data) {
        if (error || data === undefined) {
            console.log(error);
        } else {
            app.params.user = data;
            window.location = '#home';
        }
    }
    app.core.doPost('user/login', $('#login-page').find('form').serialize(), callback);
};

app.methods.logout = function () {
    console.debug('app.methods.logout');
    var callback = function (error, data) {
        if (error) {
            console.debug(error);
        } else {
            app.params.user = undefined;
            window.location = '#';
        }
    }
    app.core.doGet('user/logout', callback);
};

app.methods.signup = function () {
    console.debug('app.methods.signup');
    $('.error-label').remove();
    var callback = function (error, data) {
        if (error) {
            console.log(error);
        } else {
            app.params.user = data;
            window.location = '#home';
        }
    }
    app.core.doPost('user/signup', $('#signup-page').find('form').serialize(), callback);
};

app.events = {
    'main-title': function () {
        console.debug('app.events.main-title');
        window.location = '#';
    },

    'show-login': function () {
        console.debug('app.events.show-login');
        window.location = '#login';
    },

    'login': function () {
        console.debug('app.events.login');
        app.methods.login();
    },

    'show-signup': function () {
        console.debug('app.events.show-signup');
        window.location = '#signup'
    },

    'signup': function () {
        console.debug('app.events.signup');
        app.methods.signup();
    }
};

app.render = function (url) {
    console.debug('app.render(\'' + url + '\')');
    var params = url.split('/');
    $('.error-label').remove();

    var map = {
        '': function () {
            var callback = function () {
                window.location = '#home';
            };
            app.methods.getCurrentUser(callback);
        },

        '#login': function () {
            $('.main-area').hide();
            $('#login-page').show().find('input').first().focus();
        },

        '#logout': function () {
            app.methods.logout();
        },

        '#signup': function () {
            $('.main-area').hide();
            $('#signup-page').show().find('input').first().focus();
        },

        '#home': function () {
            var callback = function () {
                $('.main-area').hide();
                $('#home-page').show().find('input').first().focus();
            };
            app.methods.getCurrentUser(callback);
        },

        '#search': function () {
            app.methods.getCurrentUser();
        },

        '#series': function () {
            app.methods.getCurrentUser();
        }
    };

    if (map[params[0]]) {
        map[params[0]]();
        if (app.params.user === undefined)
            $('#language-selector').hide();
        else
            $('#language-selector').show();
    } else {
        console.error('404 Page: ' + params[0]);
    }
};

$(window).on('hashchange', function () {
    app.render(decodeURI(window.location.hash));
});

$(document).ready(function () {
    var eventsFunc = function (obj) {
        if (app.events[obj.attr('data-event')]) {
            app.events[obj.attr('data-event')]();
        } else {
            console.error('404 Event: ' + obj.attr('data-event'));
        }
        return false;
    };

    $('.app-control').click(function () {
        return eventsFunc($(this));
    });

    $('.app-control-submit').submit(function () {
        return eventsFunc($(this));
    });

    app.render(decodeURI(window.location.hash));
});