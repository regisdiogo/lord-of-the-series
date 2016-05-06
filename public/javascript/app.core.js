var app = {};
app.methods = {};
app.core = {};

app.core.doPost = function(url, data, callback) {
    $.ajax({
        type: 'POST',
        url: url,
        data: data

    }).done(function(data) {
        callback(false, data);

    }).error(function(data) {
        if (data.responseJSON) {
            $.each(data.responseJSON, function() {
                $.each(this, function(field, message) {
                    $('[name=' + field + ']').before($('<span />').addClass('label label-danger error-label').html(message));
                });
            });
            callback(data.responseJSON[0]);
        } else {
            callback(data);
        }
    });
};

app.methods.getCurrentUser = function() {
    $.ajax({
        type: 'GET',
        url: 'user/'

    }).done(function(data) {


    }).error(function(data) {
        if (data.status == 401) {
            window.location = '#login'
        } else {
            console.error(data);
        }
    });
};

app.methods.login = function() {
    console.debug('app.methods.login');
    $('.error-label').remove();
    var callback = function(error, data) {
        if (error)
            console.debug(error);
        else
            console.debug(data);
    }
    app.core.doPost('user/login', $('#login-page').find('form').serialize(), callback);
};

app.methods.signup = function() {
    console.debug('app.methods.signup');
    $('.error-label').remove();
    var callback = function(error, data) {
        if (error)
            console.debug(error);
        else
            console.debug(data);
    }
    app.core.doPost('user/signup', $('#signup-page').find('form').serialize(), callback);
};

app.events = {
    'main-title': function() {
        console.debug('app.events.main-title');
        window.location = '#';
    },

    'show-login': function() {
        console.debug('app.events.show-login');
        window.location = '#login';
    },

    'login': function() {
        console.debug('app.events.login');
        app.methods.login();
    },

    'show-signup': function() {
        console.debug('app.events.show-signup');
        window.location = '#signup'
    },

    'signup': function() {
        console.debug('app.events.signup');
        app.methods.signup();
    }
};

app.render = function(url) {
    console.debug('app.render(\'' + url + '\')');
    var params = url.split('/');

    var map = {
        '': function() {
            app.methods.getCurrentUser();
        },

        '#login': function() {
            $('.main-area').hide();
            $('#login-page').show().find('input').first().focus();
        },

        '#signup': function() {
            $('.main-area').hide();
            $('#signup-page').show().find('input').first().focus();
        },

        '#search': function() {
            app.methods.getCurrentUser();
        },

        '#series': function() {
            app.methods.getCurrentUser();
        }
    };

    if (map[params[0]]) {
        map[params[0]]();
    } else {
        console.error('404 Page: ' + params[0]);
    }
};

$(window).on('hashchange', function() {
    app.render(decodeURI(window.location.hash));
});

$(document).ready(function() {
    var eventsFunc = function(obj) {
        if (app.events[obj.attr('data-event')]) {
            app.events[obj.attr('data-event')]();
        } else {
            console.error('404 Event: ' + obj.attr('data-event'));
        }
        return false;
    };
    $('.app-control').click(function() {
        return eventsFunc($(this));
    });
    $('.app-control-submit').submit(function() {
        return eventsFunc($(this));
    });
    app.render(decodeURI(window.location.hash));
});