var app = {};

app.params = {};
app.events = {};
app.methods = {};

app.params.selectedLanguage = 'en';
app.params.lastPage = '#';

app.methods.renderPage = function (url) {
    console.log('app.methods.renderPage(' + url + ')');
    var params = url.split('/');
    var map = {
        '': function () {
            app.methods.resetPage(true);
            $('.main-area').addClass('hidden-area');
            $('#home-page').removeClass('hidden-area');
        },
        '#search': function () {
            app.methods.searchSeries(params[1].split('=')[1], function () {
                $('.tableRow').click(app.events.tableRowClick);
                $('#searchResults').show();
                $('.main-area').addClass('hidden-area');
                $('#home-page').removeClass('hidden-area');
            });
        },
        '#series': function () {
            app.methods.seriesDetail(params[1], function () {
                //$('.main-area').addClass('hidden-area');
                //$('#series-detail').removeClass('hidden-area');
            });
        }
    };

    if (map[params[0]]) {
        map[params[0]]();
    } else {
        console.error('404');
    }
};

app.methods.resetPage = function (resetInput) {
    if (resetInput) {
        $('.searchSeries input').val('');
    }
    $('#series-detail dl dd').html('');
    $('#series-detail img').attr('src', '');
    $('#error').html('').hide();
    $('#searchResults').hide();
    $('#searchResults .table tr').children(':not(th)').parent().remove();
};

app.methods.convertToSlug = function (text) {
    return text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
};

app.methods.getAvailableLanguages = function () {
    console.log('app.methods.getAvailableLanguages');
    $.ajax({
        type: 'GET',
        url: 'languages'

    }).done(function (data, statusText, xhr) {
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

    }).error(function (error) {
        console.log(error);
    });
};

app.methods.searchSeries = function (query, callback) {
    console.log('app.methods.searchSeries(' + query + ')');
    app.methods.resetPage(false);
    var $btn = $('#btnSearchSeries').button('loading');
    $.ajax({
        type: 'POST',
        url: 'series/search',
        data: "seriesTitle=" + query + '&language=' + app.params.selectedLanguage

    }).done(function (data, statusText, xhr) {
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
            callback();
        }

    }).error(function (error) {
        $btn.button('reset');
        console.log(error);
    });
};

app.methods.seriesDetail = function (id, callback) {
    console.log('app.methods.seriesDetail(' + id + ')');
    $.ajax({
        type: 'GET',
        url: 'series/' + app.params.selectedLanguage + '/' + id

    }).done(function (data, statusText, xhr) {
        if (xhr.status == 500) {
            console.error(data);
        } else {
            $.each(data.data, function (key, value) {
                var $obj = $('#series-detail').find('.' + key);
                if ($obj.is('img')) {
                    $obj.attr('src', 'http://thetvdb.com/banners/' + value);
                } else {
                    $obj.html(value);
                }
            });
            $('#series-detail').modal('show');
            callback();
        }

    }).error(function (error) {
        console.log(error);
    });
};

app.events.searchSeries = function () {
    console.log('app.events.searchSeries');
    app.params.lastPage = window.location.href;
    window.location = '#search/q=' + $(this).children('#seriesTitle').val();
    return false;
};

app.events.tableRowClick = function () {
    console.log('app.events.tableRowClick');
    app.params.lastPage = window.location.href;
    window.location = '#series/' + $(this).attr('data');
};

app.events.selectLanguage = function () {
    console.log('app.events.selectLanguage');
    if ($(this).val() != '') {
        app.params.selectedLanguage = $(this).val();
        window.location = '#';
    }
};

$(window).on('hashchange', function () {
    console.log('$(window).on(hashchange)');
    app.methods.renderPage(decodeURI(window.location.hash));
});

$('#series-detail').on('hidden.bs.modal', function (e) {
    window.location = app.params.lastPage;
})

$(document).ready(function () {
    console.log('$(document).ready');
    $('.searchSeries').submit(app.events.searchSeries);
    $('#select-language').change(app.events.selectLanguage);
    app.methods.renderPage(decodeURI(window.location.hash));
});