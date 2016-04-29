var app = {};

app.params = {};
app.events = {};
app.methods = {};

app.params.selectedLanguage = 'en';
app.params.locked = true;
app.params.lastPage = '#';

app.methods.renderPage = function(url) {
    var params = url.split('/');
    $('.main-area').addClass('hidden-area');
    var map = {
        '': function() {
            app.methods.resetPage(true);
            $('#home-page').removeClass('hidden-area');
        },
        '#search': function() {
            app.methods.searchSeries(params[1].split('=')[1]);
            $('#home-page').removeClass('hidden-area');
        },
        '#series': function() {
            app.methods.seriesDetail(params[1]);
            $('#series-detail').removeClass('hidden-area');
        }
    };

    if (map[params[0]]) {
        map[params[0]]();
    } else {
        console.error('404');
    }
};

app.methods.resetPage = function(resetInput) {
    if (resetInput)
        $('.searchSeries input').val('');
    $('#series-detail dl dd').html('');
    $('#series-detail img').attr('src', '');
    $('#error').html('').hide();
    $('#searchResults').hide();
    $('#searchResults .table tr').children(':not(th)').parent().remove();
};

app.methods.convertToSlug = function(text) {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

app.methods.getAvailableLanguages = function() {
    $.ajax({
        type: 'GET',
        url: 'languages'

    }).done(function(data, statusText, xhr) {
        if (xhr.status == 500) {
            console.error(data);
        } else {
            var result = data.data;
            app.params.languages = result;
            for (var i = 0; i < app.params.languages.length; i++) {
                var opt = document.createElement('option');
                opt.value = app.params.languages[i].abbreviation;
                opt.innerHTML = app.params.languages[i].name;
                $('#select-language').append(opt);
            }
        }

    }).error(function(error) {
        console.log(error);
    });
};

app.methods.searchSeries = function(query) {
    var $btn = $('#btnSearchSeries').button('loading');
    $.ajax({
        type: 'POST',
        url: 'series/search',
        data: "seriesTitle=" + query + '&language=' + app.params.selectedLanguage

    }).done(function(data, statusText, xhr) {
        $btn.button('reset');
        if (xhr.status == 204) {
            $('#error').html('No results found').show();
        } else {
            var result = data.data;
            for (var i = 0; i < result.length; i++) {
                $('#searchResults .table').append('<tr class="tableRow" data="' + result[i].id + '/' + app.methods.convertToSlug(result[i].seriesName) + '">' +
                    '<td>' + result[i].id + '</td>' +
                    '<td>' + result[i].seriesName + '</td>' +
                    '<td>' + result[i].status + '</td>' +
                    '<td>' + result[i].overview + '</td>' +
                    '</tr>');
            };
            $('.tableRow').click(app.events.tableRowClick);
            $('#searchResults').show();
        }

    }).error(function(error) {
        $btn.button('reset');
        console.log(error);
    });
};

app.methods.seriesDetail = function(id) {
    $.ajax({
        type: 'GET',
        url: 'series/' + app.params.selectedLanguage + '/' + id

    }).done(function(data, statusText, xhr) {
        if (xhr.status == 500) {
            console.error(data);
        } else {
            $.each(data.data, function(key, value) {
                var $obj = $('#series-detail dl dd.' + key);
                if (!$obj.length) {
                    $obj = $('#series-detail .' + key);
                }
                if ($obj.is('img')) {
                    $obj.attr('src', 'http://thetvdb.com/banners/' + value);
                } else {
                    $obj.html(value);
                }
            });
        }

    }).error(function(error) {
        console.log(error);
    });
};

app.events.searchSeries = function() {
    app.methods.resetPage(false);
    app.params.lastPage = window.location.href;
    window.location = '#search/q=' + $(this).children('#seriesTitle').val();
    return false;
};

app.events.tableRowClick = function() {
    app.params.lastPage = window.location.href;
    window.location = '#series/' + $(this).attr('data');
};

app.events.selectLanguage = function() {
    if ($(this).val() != '') {
        app.params.selectedLanguage = $(this).val();
        window.location = '#';
    }
};

app.events.goBack = function() {
    console.log('go back');
    window.location = app.params.lastPage;
};

$(window).on('hashchange', function() {
    app.methods.renderPage(decodeURI(window.location.hash));
});

$(document).ready(function() {
    $('.searchSeries').submit(app.events.searchSeries);
    $('#select-language').change(app.events.selectLanguage);
    $('.go-back').click(app.events.goBack);
    app.methods.getAvailableLanguages();
    app.methods.renderPage(decodeURI(window.location.hash));
});