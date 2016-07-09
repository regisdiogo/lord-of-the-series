var async = require.main.require('async');
var seriesBusiness = require.main.require('./lib/business/series');
var userModel = require.main.require('./lib/models/user');
var seriesModel = require.main.require('./lib/models/series');

var watchList = {};
var internal = {};

watchList.add = function (user, params, callback) {
    async.waterfall([
        function (asyncCallback) {
            seriesBusiness.getSeriesById({ id: params.seriesId, language: 'en' }, asyncCallback);
        },
        function (series, asyncCallback) {
            var watchItems = [];
            for (var i = 0; i < series.episodes.length; i++) {
                if (series.episodes[i].released &&
                    ((series.episodes[i].seasonNumber == params.seasonNumber && series.episodes[i].episodeNumber >= params.episodeNumber) ||
                        (series.episodes[i].seasonNumber > params.seasonNumber))) {
                    watchItems.push({
                        seriesId: series._id,
                        seasonNumber: series.episodes[i].seasonNumber,
                        episodeNumber: series.episodes[i].episodeNumber
                    });
                }
            }
            asyncCallback(null, watchItems);
        },
        function (watchItems, callback) {
            userModel.findOneAndUpdate(
                { email: user.email },
                { $pushAll: { watchList: watchItems } },
                { new: true },
                function (err, data) {
                    if (err)
                        callback(err, data);
                    else
                        callback(err, { email: data.email, watchList: data.watchList });
                }
            );
        }
    ], function (error, result) {
        callback(error, result);
    });
}

watchList.remove = function (user, seriesId, callback) {
    userModel.findOneAndUpdate(
        { email: user.email },
        { $pull: { watchList: { seriesId: seriesId } } },
        { new: true },
        function (err, result) {
            if (err)
                callback(err, result);
            else
                callback(err, { email: result.email, watchList: result.watchList });
        }
    );
};

watchList.list = function (user, callback) {
    var series = [];
    for (var i = 0; i < user.watchList.length; i++) {
        var isNew = true;
        for (var j = 0; j < series.length; j++) {
            if (user.watchList[i].seriesId == series[j].seriesId) {
                isNew = false;
                series[j].episodes.push({
                    seasonNumber: user.watchList[i].seasonNumber,
                    episodeNumber: user.watchList[i].episodeNumber,
                });
                break;
            }
        }
        if (isNew) {
            series.push({
                seriesId: user.watchList[i].seriesId,
                episodes: [{
                    seasonNumber: user.watchList[i].seasonNumber,
                    episodeNumber: user.watchList[i].episodeNumber,
                }]
            });
        }
    }
    var functions = [];
    functions.push(function (asyncCallback) {
        asyncCallback(null, series);
    });
    for (var i = 0; i < series.length; i++) {
        functions.push(makeCallbackFunc(series[i].seriesId));
    }
    async.series(functions, function (error, result) {
        var wishlist = result.shift();
        var series = [];
        for (var i = 0; i < wishlist.length; i++) {
            for (var j = 0; j < result.length; j++) {
                if (wishlist[i].seriesId === result[j]._id) {
                    var item = {
                        banner: result[j].banner,
                        download: wishlist[i].download,
                        episodes: []
                    };
                    for (var e = 0; e < wishlist[i].episodes.length; e++) {
                        for (var f = 0; f < result[j].episodes.length; f++) {
                            if (wishlist[i].episodes[e].seasonNumber === result[j].episodes[f].seasonNumber &&
                                wishlist[i].episodes[e].episodeNumber === result[j].episodes[f].episodeNumber) {
                                item.episodes.push(result[j].episodes[f]);
                            }
                        }
                    }
                    series.push(item);
                }
            }
        }
        callback(error, series);
    });
};

function makeCallbackFunc(seriesId) {
    return function (asyncCallback) {
        seriesModel.findById(seriesId, function (error, result) {
            asyncCallback(error, result);
        });
    };
}

module.exports = watchList;
