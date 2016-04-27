$('.alert .close').on('click', function(e) {
    $(this).parent().hide();
});

$('.searchSeries').submit(function() {
    var $btn = $('#btnSearchSeries').button('loading');
    resetHome();
    $.ajax({
        type: 'POST',
        url: 'series/search',
        data: $(this).serialize()

    }).done(function(data, statusText, xhr) {
        $btn.button('reset');
        if (xhr.status == 204) {
            $('#error').html('No results found').show();
        } else {
            var result = data.data;
            for (var i = 0; i < result.length; i++) {
                $('#searchResults .table').append('<tr onclick="window.location=\'#series/' + result[i].id + '/' + convertToSlug(result[i].seriesName) + '\'">' +
                    '<td>' + result[i].id + '</td>' +
                    '<td>' + result[i].seriesName + '</td>' +
                    '<td>' + result[i].status + '</td>' +
                    '<td>' + result[i].overview + '</td>' +
                    '</tr>');
            };
            $('#searchResults').show();
        }

    }).error(function(error) {
        $btn.button('reset');
        console.log(error);
    });

    return false;
});

var resetHome = function() {
    $('.searchSeries input').val('');
    $('#error').html('').hide();
    $('#searchResults').hide();
    $('#searchResults .table tr').children(':not(th)').parent().remove();
}

var render = function(url) {
    var params = url.split('/');
    var map = {
        '': function() {
            console.log('home page');
            resetHome();
        },
        '#series': function() {
            console.log('series detail: ' + params[2]);
        }
    };

    if (map[params[0]]) {
        map[params[0]]();
    } else {
        console.error('404');
    }
}

var convertToSlug = function(text) {
    return text.toLowerCase()
        .replace(/[^\w ]+/g, '')
        .replace(/ +/g, '-');
}

$(window).on('hashchange', function() {
    render(decodeURI(window.location.hash));
});

$(document).ready(function() {
    render(decodeURI(window.location.hash));
});