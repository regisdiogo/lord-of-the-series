$('.searchSeries').submit(function() {
    var $btn = $('#btnSearchSeries').button('loading');
    $('#error').html('').hide();
    $('#searchResults').hide();
    $('#searchResults .table tr').children(':not(th)').parent().remove();

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
                $('#searchResults .table').append('<tr onclick="javascript:seriesDetails(' + result[i].id + ');">' +
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

var seriesDetails = function(id) {
    console.log(id);
}

$('.alert .close').on('click', function(e) {
    $(this).parent().hide();
});