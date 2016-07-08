var config = require.main.require('./lib/config.js');
var async = require.main.require('async');
var seriesModel = require.main.require('./lib/models/series');
var userModel = require.main.require('./lib/models/user');
var util = require.main.require('util');
var request = require.main.require('request');

var crawler = {};
var internal = {};

internal.discoverTorrent = function (url, format, callback) {
    request(url, function (error, response, body) {
        if (!error) {
            var body = JSON.parse(body);
            console.log(url);
            console.log(body.list.length);
            if (body != null && body.list.length > 0 && body.list[0] != null) {
                callback(null, {
                    type: format,
                    title: body.list[0].title,
                    torrent: body.list[0].torrentLink,
                    size: body.list[0].size,
                    hash: body.list[0].hash
                });
            } else {
                console.log('Not found [format ' + format == '' ? 'HD' : format + ']');
            }
        } else {
            console.log(error);
            callback(error);
        }
    });
}

internal.crawler = function (watchItem, series, mainCallback) {
    for (var s = 0; s < watchItem.episodes.length; s++) {
        for (var r = 0; r < series.episodes.length; r++) {
            if (watchItem.episodes[s].seasonNumber == series.episodes[r].seasonNumber &&
                watchItem.episodes[s].episodeNumber == series.episodes[r].episodeNumber) {
                var episode = series.episodes[r];
                var searchText = (series.seriesName + ' ' + episode.seasonWebCode + episode.episodeWebCode);
                async.series([
                    function (callback) {
                        callback(null, episode);
                    },
                    function (callback) {
                        internal.discoverTorrent(util.format(config.katUrl, searchText + ' 1080p'), '1080p', callback);
                    },
                    function (callback) {
                        internal.discoverTorrent(util.format(config.katUrl, searchText + ' 720p'), '720p', callback);
                    }
                ], function (error, result) {
                    if (!error) {
                        var episode = result.shift();
                        console.log('seriesModel.update');
                        seriesModel.update(
                            {
                                _id: series._id,
                                episodes: {
                                    $elemMatch: {
                                        seasonNumber: episode.seasonNumber,
                                        episodeNumber: episode.episodeNumber
                                    }
                                }
                            },
                            {
                                $set: { 'episodes.$.link': result },
                                'episodes.$.discovered': true
                            },
                            function (error, result) {
                                if (!error) {
                                    console.log('seriesModel.update.result');
                                    console.log(result);
                                    console.log('userModel.update');
                                    console.log({
                                        seriesId: series._id,
                                        seasonNumber: episode.seasonNumber,
                                        episodeNumber: episode.episodeNumber
                                    });
                                    userModel.update(
                                        {
                                            watchList: {
                                                $elemMatch: {
                                                    seriesId: series._id,
                                                    seasonNumber: episode.seasonNumber,
                                                    episodeNumber: episode.episodeNumber
                                                }
                                            }
                                        },
                                        { $set: { watchList: { discovered: true } } },
                                        function (error, result) {
                                            if (!error) {
                                                console.log('userModel.update.result');
                                                console.log(result);
                                            }
                                        });
                                }
                            });

                    }
                    console.log(result);
                });
            }
        }
    }
    mainCallback(null, { ok: true });
}

crawler.init = function () {
    async.waterfall([
        function (callback) {
            userModel.find(
                { 'watchList.discovered': false },
                function (error, result) {
                    if (error)
                        callback(error);
                    else
                        callback(null, result);
                }
            );
        },
        function (users, callback) {
            var series = [];
            for (var u = 0; u < users.length; u++) {
                for (var w = 0; w < users[u].watchList.length; w++) {
                    if (!users[u].watchList[w].discovered) {
                        var k = 0;
                        var exists = false;
                        for (; k < series.length; k++) {
                            if (series[k].seriesId == users[u].watchList[w].seriesId) {
                                exists = true;
                                break;
                            }
                        }
                        var e = {
                            seasonNumber: users[u].watchList[w].seasonNumber,
                            episodeNumber: users[u].watchList[w].episodeNumber
                        };
                        if (!exists) {
                            series.push({
                                seriesId: users[u].watchList[w].seriesId,
                                episodes: [e]
                            })
                        } else {
                            series[k].episodes.push(e);
                        }
                    }
                }
            }
            callback(null, series);
        }
    ], function (error, result) {
        if (!error) {
            var functions = [];
            for (var i = 0; i < result.length; i++) {
                var watchItem = result[i];
                functions.push(function (callback) {
                    seriesModel.findById(watchItem.seriesId, function (error, result) {
                        if (error) {
                            callback(error);
                        } else {
                            internal.crawler(watchItem, result, callback);
                        }
                    });
                });
            }
            async.series(functions, function (error, result) {
                console.log([error, result]);
            });
        } else {
            console.log(error);
        }
    });
};

module.exports = crawler;