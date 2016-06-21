var async = require.main.require('async');
var seriesBusiness = require.main.require('./lib/business/series');
var userModel = require.main.require('./lib/models/user');

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

module.exports = watchList;
