var app = {};
app.methods = {};

app.methods.getCurrentUser = function() {
    $.ajax({
        type: 'GET',
        url: 'user/'

    }).done(function(data, statusText, xhr) {


    }).error(function(error) {
        if (error.status == 401) {
            console.log("Show login");
        } else {
            console.error(error);
        }
    });
};

app.events = {
    'main-title': function() {
        console.log('app.events.main-title');
    },

    'do-login': function() {
        console.log('app.events.do-login');
    },

    'show-signup': function() {
        console.log('app.events.show-signup');
    }
};

app.render = function(url) {
    console.log('app.render(\'' + url + '\')');
    app.methods.getCurrentUser();
    var params = url.split('/');
    var map = {
        '': function() {},

        '#search': function() {},

        '#series': function() {}
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
    $('.app-control').click(function() {
        if (app.events[$(this).attr('data-event')]) {
            app.events[$(this).attr('data-event')]();
        } else {
            console.error('404 Event: ' + $(this).attr('data-event'));
        }
        return false;
    });
    window.location = '#';
});