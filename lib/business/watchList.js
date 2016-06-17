var async = require.main.require('async');
var seriesBusiness = require.main.require('./lib/business/series');
var userModel = require.main.require('./lib/models/user');

var watchList = {};
var internal = {};

watchList.add = function (user, params, callback) {
    var exists = false;
    for (var i = 0; i < user.watchList.length; i++) {
        if (user.watchList[i].seriesId.toString() === params.seriesId.toString()) {
            exists = true;
            break;
        }
    }

    if (exists) {
        callback(true, [{ message: 'This series in already on your watch list' }]);
    }
    else {
        async.waterfall([
            function (asyncCallback) {
                seriesBusiness.getSeriesById({ id: params.seriesId, language: 'en' }, asyncCallback);
            },
            function (series, asyncCallback) {
                var watchItem = {
                    seriesId: series._id,
                    seriesName: series.seriesName,
                    seasons: []
                };
                for (var i = (params.seasonNumber - 1); i < series.seasons.length; i++) {
                    var season = {
                        number: series.seasons[i].number,
                        webCode: series.seasons[i].webCode,
                        episodes: []
                    };
                    var j = 0;
                    if ((params.seasonNumber - 1) == i)
                        j = params.episodeNumber - 1;
                    for (; j < series.seasons[i].episodes.length; j++) {
                        if (series.seasons[i].episodes[j].released) {
                            season.episodes.push({
                                number: series.seasons[i].episodes[j].number,
                                webCode: series.seasons[i].episodes[j].webCode
                            });
                        }
                    }
                    watchItem.seasons.push(season);
                }
                asyncCallback(null, watchItem);
            },
            function (watchItem, callback) {
                userModel.findOneAndUpdate(
                    { email: user.email },
                    { $addToSet: { watchList: watchItem } },
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
};

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

module.exports = watchList;
