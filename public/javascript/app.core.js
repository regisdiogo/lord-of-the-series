var app = {};
app.methods = {};
app.core = {};
app.params = {};
app.util = {};

app.params.language = 'en';
app.params.title = 'Lord of The Series';

app.core.locked = false;

app.util.equalizeThumbnails = function () {
    for (var i = 0; i < $('#watchlist-result').children('.watch-first-column').length; i++) {
        if (i > 0) {
            var height = $('#watchlist-result').children('.watch-first-column:eq(' + (i) + ')').height();
            var offset = $('#watchlist-result').children('.watch-first-column:eq(' + (i - 1) + ')').offset();
            $('#watchlist-result').children('.watch-first-column:eq(' + i + ')').offset({ top: offset.top + height + 30 });
        }
    }
    /*for (var i = 0; i < $('#watchlist-result').children('.watch-second-column').length; i++) {
        if (i > 0) {
            var height = $('#watchlist-result').children('.watch-second-column:eq(' + (i) + ')').height();
            var offset = $('#watchlist-result').children('.watch-second-column:eq(' + (i - 1) + ')').offset();
            $('#watchlist-result').children('.watch-second-column:eq(' + i + ')').offset({ top: offset.top + height + 40 });
        }
    }
    for (var i = 0; i < $('#watchlist-result').children('.watch-third-column').length; i++) {
        if (i > 0) {
            var height = $('#watchlist-result').children('.watch-third-column:eq(' + (i) + ')').height();
            var offset = $('#watchlist-result').children('.watch-third-column:eq(' + (i - 1) + ')').offset();
            $('#watchlist-result').children('.watch-third-column:eq(' + i + ')').offset({ top: offset.top + height + 40 });
        }
    }*/
};

app.util.dateFormat = function (date) {
    if (date == null)
        return '';
    return date.substring(0, 10).replace(/-/g, '/');
};

app.util.convertToSlug = function (text) {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

app.core.bindEvents = function () {
    var eventsFunc = function (obj) {
        if (app.events[obj.attr('data-event')]) {
            app.events[obj.attr('data-event')](obj.attr('data-param'));
        } else {
            console.error('404 Event: ' + obj.attr('data-event'));
        }
        return false;
    };

    $('.app-control').each(function () {
        if ($(this).is('form')) {
            $(this).unbind('submit').bind('submit', function () {
                return eventsFunc($(this))
            });
        } else {
            $(this).unbind('click').bind('click', function () {
                return eventsFunc($(this))
            });
        }
    });
};

app.core.doPost = function (url, data, callback) {
    $('button').button('loading');
    $.ajax({
        type: 'POST',
        url: url,
        data: data

    }).done(function (data) {
        callback(false, data);
        $('button').button('reset');

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
        $('button').button('reset');
    });
};

app.core.doGet = function (url, callback) {
    $('button').button('loading');
    $.ajax({
        type: 'GET',
        url: url

    }).done(function (data) {
        callback(false, data);
        $('button').button('reset');

    }).error(function (data) {
        callback(data);
        $('button').button('reset');
    });
};

app.core.doRemove = function (url, callback) {
    $('button').button('loading');
    $.ajax({
        type: 'DELETE',
        url: url

    }).done(function (data) {
        callback(false, data);
        $('button').button('reset');

    }).error(function (data) {
        callback(data);
        $('button').button('reset');
    });
};

app.core.clearView = function () {
    $('#search-results .table tr').children(':not(th)').parent().remove();
};

app.methods.search = function (query) {
    $('#seriesTitle').val(query);
    var callback = function (error, response) {
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
                    $('#search-results .table').append('<tr class="table-row app-control" data-event="table-row-click" data-param="' + result[i].id + '/' + app.util.convertToSlug(result[i].seriesName) + '">' +
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

app.methods.seriesDetail = function (id, callback) {
    var internalCallback = function (error, response) {
        if (error) {
            console.log(error);
        } else {
            $.each(response, function (key, value) {
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
            $('#seasons-list-header').html('');
            $('#seasons-list-episodes').html('');
            var seasons = [];
            response.episodes.forEach(function (episode) {
                var k = 0;
                var exists = false;
                for (; k < seasons.length; k++) {
                    if (seasons[k].number == episode.seasonNumber) {
                        exists = true;
                        break;
                    }
                }
                var e = {
                    number: episode.episodeNumber,
                    webCode: episode.episodeWebCode,
                    title: episode.title,
                    airedAt: episode.airedAt,
                    released: episode.released
                };
                if (!exists) {
                    seasons.push({
                        number: episode.seasonNumber,
                        webCode: episode.seasonWebCode,
                        episodes: [e]
                    });
                } else {
                    seasons[k].episodes.push(e);
                }
            });

            console.log(seasons);

            $.each(seasons, function (key, season) {
                if (season != null) {
                    $('#seasons-list-header').append('<li><a href="#tab' + season.number + 'default" data-toggle="tab">' + season.webCode + '</a></li>')
                    $('#seasons-list-episodes').append('<div class="tab-pane fade" id="tab' + season.number + 'default"></div>');
                    $('#tab' + season.number + 'default').append(
                        '<table class="table table-condensed"><thead><tr><th>Next?</th><th>Title</th><th>Aired Date</th></tr></thead><tbody>'
                    );
                    $.each(season.episodes, function (k, episode) {
                        var label = '<span class="label label-success">Released</span>';
                        if (!episode.released)
                            label = '<span class="label label-warning">Not Released</span>';
                        $('#tab' + season.number + 'default table').append(
                            '<tr>' +
                            '<td><input type="radio" name="current-episode" id="current-episode" value="' + season.number + '-' + episode.number + '"></td>' +
                            '<td>' + episode.webCode + ' - ' + episode.title + '</td>' +
                            '<td>' + app.util.dateFormat(episode.airedAt) +
                            '&nbsp;' + label +
                            '</td>' +
                            '</tr>'
                        );
                    });
                    $('#tab' + season.number + 'default').append('</tbody></table>');
                }
            });
            $('#seasons-list-header').children(':first').addClass('active');
            $('#seasons-list-episodes').children(':first').addClass('in active');
            $('#add-series').show();
            $('#remove-series,.added-series').hide();
            for (var p = 0; p < app.params.user.watchList.length; p++) {
                if (app.params.user.watchList[p].seriesId == id) {
                    $('#add-series').hide();
                    $('#remove-series,.added-series').show();
                    break;
                }
            };
            callback();
        }
    }
    app.core.doGet('/series/' + app.params.language + '/' + id, internalCallback);
};

app.methods.getCurrentUser = function (callback) {
    if (app.params.user !== undefined) {
        return callback();
    }
    var internalCallback = function (error, data) {
        if (error) {
            if (error.status == 401) {
                window.location = '#login'
            } else {
                console.error(error);
            }
        } else {
            app.params.user = data;
            $('#language-selector').show();
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

app.methods.addSeries = function (seriesId) {
    console.debug('app.methods.addSeries');
    $('#series-detail-message').removeClass('alert-danger').removeClass('alert-info').hide();
    if ($('#current-episode:checked').val() === undefined) {
        $('#series-detail-message').addClass('alert-danger').show().html('Please select what is the next episode you are going to watch');
        $('html, body').animate({ scrollTop: 0 }, 500);
    } else {
        var aux = $('#current-episode:checked').val().split('-');
        var content = {
            seriesId: seriesId,
            seasonNumber: aux[0],
            episodeNumber: aux[1]
        };
        var callback = function (error, data) {
            if (error) {
                $('#series-detail-message').addClass('alert-danger').show().html(error.message);
                $('html, body').animate({ scrollTop: 0 }, 500);
            } else {
                app.params.user = data;
                $('#add-series').hide();
                $('#remove-series,.added-series').show();
                $('#series-detail-message').addClass('alert-info').show().html('Successfully added to your watch list');
                $('html, body').animate({ scrollTop: 0 }, 500);
            }
        };
        app.core.doPost('watchList', content, callback);
    }
};

app.methods.removeSeries = function (seriesId) {
    console.debug('app.methods.removeSeries');
    var callback = function (error, data) {
        if (error) {
            $('#series-detail-message').addClass('alert-danger').show().html(error.message);
            $('html, body').animate({ scrollTop: 0 }, 500);
        } else {
            app.params.user = data;
            $('#remove-series,.added-series').hide();
            $('#add-series').show();
            $('#series-detail-message').addClass('alert-info').show().html('Successfully removed from your watch list');
            $('html, body').animate({ scrollTop: 0 }, 500);
        }
    };
    app.core.doRemove('watchList/' + seriesId, callback);
};

app.events = {
    'main-title': function () {
        console.debug('app.events.main-title');
        window.location = '#';
    },

    'show-watchlist': function () {
        console.debug('app.events.show-watchlist');
        window.location = '#watchlist';
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
    },

    'search-series': function () {
        console.debug('app.events.search-series');
        window.location = '#search-series/q=' + encodeURIComponent($('#seriesTitle').val());
    },

    'table-row-click': function (param) {
        if (!app.core.locked) {
            console.debug('app.events.table-row-click');
            app.core.locked = true;
            window.location = '#series/' + param + '&q=' + encodeURIComponent($('#seriesTitle').val());
        }
    },

    'add-series': function () {
        console.debug('app.events.add-series');
        app.methods.addSeries(decodeURI(window.location.hash).split('/')[1]);
    },

    'remove-series': function () {
        console.debug('app.events.remove-series');
        app.methods.removeSeries(decodeURI(window.location.hash).split('/')[1]);
    },

    'series-go-back': function () {
        console.debug('app.events.series-go-back');
        window.location = '#search-series/q=' + encodeURIComponent(decodeURI(window.location.hash).split('q=')[1]);
    },

    'open-download-list': function (param) {
        if ($('.download-item-' + param).is(':visible')) {
            $('.download-list').hide();
        } else {
            $('.download-list').hide();
            $('.download-item-' + param).show();
        }
    },

    'download-link': function (param) {
        console.log(param);
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
            app.core.clearView();
            $('.main-area').hide();
            $('#login-page').show().find('input').first().focus();
            $('head title').html('Login - ' + app.params.title);
        },

        '#logout': function () {
            app.core.clearView();
            app.methods.logout();
        },

        '#signup': function () {
            app.core.clearView();
            $('.main-area').hide();
            $('#signup-page').show().find('input').first().focus();
            $('head title').html('Signup - ' + app.params.title);
        },

        '#watchlist': function () {
            app.core.clearView();
            var callback = function (error, data) {
                if (!error) {
                    console.log(data);
                    $('#watchlist-result').html('');
                    if (data !== undefined && data.length > 0) {
                        var content = '';
                        var col = 1;
                        for (var i = 0; i < data.length; i++) {
                            var eol = '';
                            if (col % 2 == 0) {
                                eol = ' watch-second-column';
                            } else if (col % 3 == 0) {
                                eol = ' watch-third-column';
                            } else {
                                eol = ' watchitem-eol watch-first-column';
                            }
                            if (++col > 3)
                                col = 1;

                            content += '<div class="col-md-4 col-xs-12 watchitem' + eol + '">';
                            content += '<div class="thumbnail hvr-float-shadow">';
                            content += '<img src="http://thetvdb.com/banners/' + data[i].banner + '" alt="' + data[i].seriesName + '" />';
                            content += '<div class="caption">';
                            for (var j = 0; j < data[i].episodes.length; j++) {
                                var p1080 = {
                                    seriesId: data[i].seriesId,
                                    seasonNumber: data[i].episodes[j].seasonNumber,
                                    episodeNumber: data[i].episodes[j].episodeNumber,
                                    format: '1080p'
                                };
                                var p720 = {
                                    seriesId: data[i].seriesId,
                                    seasonNumber: data[i].episodes[j].seasonNumber,
                                    episodeNumber: data[i].episodes[j].episodeNumber,
                                    format: '720p'
                                };
                                content += '<p class="pull-right">';
                                content += '<a href="javascript:console.log(' + JSON.stringify(p720).replace(/"/g, "\'") + ')"  class="btn btn-default btn-sm" role="button">720p</a>';
                                content += '<a href="javascript:console.log(' + JSON.stringify(p1080).replace(/"/g, "\'") + ')" class="btn btn-default  btn-sm" role="button">1080p</a>';
                                content += '</p>';
                                content += '<h4 class="series-title"><span class="label label-default">' + data[i].episodes[j].seasonWebCode + data[i].episodes[j].episodeWebCode + '</span></h4>';

                                if (j < data[i].episodes.length - 1) {
                                    content += '<hr/>';
                                }
                            }
                            content += '</div>';
                            content += '</div>';
                            content += '</div>';
                        }
                        $('#watchlist-result').html(content);
                    }
                    $('head title').html('Watchlist - ' + app.params.title);
                    $('.main-area').hide();
                    $('.top-menu').children().removeClass('active').children('[data-event="show-watchlist"]').parent().addClass('active');
                    $('#watchlist-page').show();
                    app.core.bindEvents();
                    app.util.equalizeThumbnails();
                }
            };
            app.methods.getCurrentUser(function () { });
            app.core.doGet('/watchlist/', callback);
        },

        '#home': function () {
            $('#search-results').hide();
            app.core.clearView();
            var callback = function () {
                $('.form-group').find('input').val('');
                $('.main-area').hide();
                $('.top-menu').children().removeClass('active').children('[data-event="main-title"]').parent().addClass('active');
                $('#home-page').show().find('input').first().focus();
            };
            app.methods.getCurrentUser(callback);
            $('head title').html('Search - ' + app.params.title);
        },

        '#search-series': function () {
            app.methods.getCurrentUser(function () { });
            app.methods.search(params[1].substring(2));
        },

        '#series': function () {
            app.methods.getCurrentUser(function () { });
            var callback = function () {
                $('#series-detail-message').html('').hide();
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

$(window).on('hashchange', function () {
    app.render(decodeURI(window.location.hash));
});

$(document).ready(function () {
    app.core.bindEvents();
    app.render(decodeURI(window.location.hash));
});