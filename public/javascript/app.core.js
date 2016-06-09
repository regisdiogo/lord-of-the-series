var app = {};
app.methods = {};
app.core = {};
app.params = {};

app.params.language = 'en';
app.params.title = 'Lord of The Series';

app.core.locked = false;

app.core.bindEvents = function() {
    var eventsFunc = function(obj) {
        if (app.events[obj.attr('data-event')]) {
            app.events[obj.attr('data-event')](obj.attr('data-param'));
        } else {
            console.error('404 Event: ' + obj.attr('data-event'));
        }
        return false;
    };

    $('.app-control').each(function() {
        if ($(this).is('form')) {
            $(this).unbind('submit').bind('submit', function() {
                return eventsFunc($(this))
            });
        } else {
            $(this).unbind('click').bind('click', function() {
                return eventsFunc($(this))
            });
        }
    });
};

app.core.doPost = function(url, data, callback) {
    $('button').button('loading');
    $.ajax({
        type: 'POST',
        url: url,
        data: data

    }).done(function(data) {
        callback(false, data);
        $('button').button('reset');

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
        $('button').button('reset');
    });
};

app.core.doGet = function(url, callback) {
    $('button').button('loading');
    $.ajax({
        type: 'GET',
        url: url

    }).done(function(data) {
        callback(false, data);
        $('button').button('reset');

    }).error(function(data) {
        callback(data);
        $('button').button('reset');
    });
};

app.core.clearView = function() {
    $('#search-results .table tr').children(':not(th)').parent().remove();
};

app.methods.convertToSlug = function(text) {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

app.methods.search = function(query) {
    $('#seriesTitle').val(query);
    var callback = function(error, response) {
        if (error) {
            console.log(error);
        } else {
            $('.main-area').hide();
            $('#home-page').show().find('input').first().focus();
            app.core.clearView();
            if (response.status == 204) {
                $('#error').html('No results found').show();
            } else {
                var result = response.data;
                for (var i = 0; i < result.length; i++) {
                    $('#search-results .table').append('<tr class="table-row app-control" data-event="table-row-click" data-param="' + result[i].id + '/' + app.methods.convertToSlug(result[i].seriesName) + '">' +
                        '<td>' + result[i].id + '</td>' +
                        '<td>' + result[i].seriesName + '</td>' +
                        '<td>' + result[i].status + '</td>' +
                        '<td>' + result[i].overview + '</td>' +
                        '</tr>');
                };
                app.core.bindEvents();
                $('#search-results').show();
            }
        }
    }
    var data = {
        'seriesTitle': query,
        'language': app.params.language
    }
    app.core.doPost('/series/search', $.param(data), callback);
};

app.methods.seriesDetail = function(id, callback) {
    var internalCallback = function(error, response) {
        if (error) {
            console.log(error);
        } else {
            $.each(response.data, function(key, value) {
                var $obj = $('#series-detail').find('.' + key);
                if ($obj.is('img')) {
                    $obj.attr('src', 'http://thetvdb.com/banners/' + value);
                } else {
                    if ($.isArray(value))
                        $obj.html(value.join(', '));
                    else
                        $obj.html(value);
                }
            });
            callback();
        }
    }
    app.core.doGet('/series/' + app.params.language + '/' + id, internalCallback);
};

app.methods.getCurrentUser = function(callback) {
    if (app.params.user !== undefined) {
        return callback();
    }
    var internalCallback = function(error, data) {
        if (error) {
            if (error.status == 401) {
                window.location = '#login'
            } else {
                console.error(error);
            }
        } else {
            app.params.user = data;
            callback();
        }
    };
    app.core.doGet('/user/', internalCallback);
};

app.methods.login = function() {
    console.debug('app.methods.login');
    $('.error-label').remove();
    var callback = function(error, data) {
        if (error || data === undefined) {
            console.log(error);
        } else {
            app.params.user = data;
            window.location = '#home';
        }
    }
    app.core.doPost('user/login', $('#login-page').find('form').serialize(), callback);
};

app.methods.logout = function() {
    console.debug('app.methods.logout');
    var callback = function(error, data) {
        if (error) {
            console.debug(error);
        } else {
            app.params.user = undefined;
            window.location = '#';
        }
    }
    app.core.doGet('user/logout', callback);
};

app.methods.signup = function() {
    console.debug('app.methods.signup');
    $('.error-label').remove();
    var callback = function(error, data) {
        if (error) {
            console.log(error);
        } else {
            app.params.user = data;
            window.location = '#home';
        }
    }
    app.core.doPost('user/signup', $('#signup-page').find('form').serialize(), callback);
};

app.methods.addSeries = function(seriesId) {
    console.debug('app.methods.addSeries');
    console.log(params);
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
    },

    'search-series': function() {
        console.debug('app.events.search-series');
        window.location = '#search-series/q=' + encodeURIComponent($('#seriesTitle').val());
    },

    'table-row-click': function(param) {
        if (!app.core.locked) {
            console.debug('app.events.table-row-click');
            app.core.locked = true;
            window.location = '#series/' + param + '&q=' + encodeURIComponent($('#seriesTitle').val());
        }
    },

    'add-series': function() {
        console.debug('app.events.add-series');
        app.methods.addSeries(decodeURI(window.location.hash).split('/')[1]);
    },

    'series-go-back': function() {
        console.debug('app.events.series-go-back');
        window.location = '#search-series/q=' + encodeURIComponent(decodeURI(window.location.hash).split('q=')[1]);
    }
};

app.render = function(url) {
    console.debug('app.render(\'' + url + '\')');
    var params = url.split('/');
    $('.error-label').remove();

    var map = {
        '': function() {
            var callback = function() {
                window.location = '#home';
            };
            app.methods.getCurrentUser(callback);
        },

        '#login': function() {
            app.core.clearView();
            $('.main-area').hide();
            $('#login-page').show().find('input').first().focus();
            $('head title').html('Login - ' + app.params.title);
        },

        '#logout': function() {
            app.core.clearView();
            app.methods.logout();
        },

        '#signup': function() {
            app.core.clearView();
            $('.main-area').hide();
            $('#signup-page').show().find('input').first().focus();
            $('head title').html('Signup - ' + app.params.title);
        },

        '#home': function() {
            $('#search-results').hide();
            app.core.clearView();
            var callback = function() {
                $('.form-group').find('input').val('');
                $('.main-area').hide();
                $('#home-page').show().find('input').first().focus();
            };
            app.methods.getCurrentUser(callback);
            $('head title').html('Search - ' + app.params.title);
        },

        '#search-series': function() {
            app.methods.getCurrentUser(function() {});
            app.methods.search(params[1].substring(2));
        },

        '#series': function() {
            app.methods.getCurrentUser(function() {});
            var callback = function() {
                $('.main-area').hide();
                $('#series-detail').show();
                app.core.locked = false;
            };
            app.methods.seriesDetail(params[1], callback);
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

$(window).on('hashchange', function() {
    app.render(decodeURI(window.location.hash));
});

$(document).ready(function() {
    app.core.bindEvents();
    app.render(decodeURI(window.location.hash));
});