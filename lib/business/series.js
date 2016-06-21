var request = require.main.require('request');
var util = require.main.require('util');
var config = require.main.require('./lib/config.js');
var seriesModel = require.main.require('./lib/models/series');
var async = require.main.require('async');
var moment = require.main.require('moment');

var series = {};
var internal = {};

internal.mountHeaders = function (token, language) {
    var header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
    };
    if (language !== undefined) {
        header['Accept-Language'] = language;
    }
    return header;
}

internal.authenticate = function (callback, param) {
    if (param === undefined)
        param = null;
    request({
        uri: config.thetvdb.api.login,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        json: { 'apikey': config.thetvdb.apikey }
    }, function (error, response, body) {
        if (error || response.statusCode != 200) {
            callback(JSON.parse(body));
        } else {
            if (param === null)
                callback(null, body.token);
            else
                callback(null, body.token, param);
        }
    });
};

series.getAvailableLanguages = function (viewCallback) {
    async.waterfall([
        function (callback) {
            internal.authenticate(callback);
        }, function (token, callback) {
            request({
                uri: config.thetvdb.api.languages,
                method: 'GET',
                headers: internal.mountHeaders(token)
            }, function (error, response, body) {
                if (error || response.statusCode != 200) {
                    callback(JSON.parse(body));
                } else {
                    callback(null, JSON.parse(body));
                }
            });
        }
    ], function (error, result) {
        viewCallback(error, result);
    });
};

series.searchSeriesByName = function (params, viewCallback) {
    async.waterfall([
        function (callback) {
            internal.authenticate(callback);
        },
        function (token, callback) {
            request({
                uri: util.format(config.thetvdb.api.searchByName, params.seriesTitle),
                method: 'GET',
                headers: internal.mountHeaders(token, params.language)
            }, function (error, response, body) {
                if (error || response.statusCode != 200) {
                    callback(JSON.parse(body));
                } else {
                    callback(null, JSON.parse(body));
                }
            });
        }
    ], function (error, result) {
        viewCallback(error, result);
    });
};

series.getEpisodes = function (seriesId, page, language, viewCallback) {
    async.waterfall([
        function (callback) {
            internal.authenticate(callback);
        },
        function (token, callback) {
            request({
                uri: util.format(config.thetvdb.api.getEpisodesSummary, seriesId, page),
                method: 'GET',
                headers: internal.mountHeaders(token, language)
            }, function (error, response, body) {
                if (error || response.statusCode != 200) {
                    callback(JSON.parse(body));
                } else {
                    callback(null, JSON.parse(body));
                }
            });
        }
    ], function (error, result) {
        viewCallback(error, result);
    });
};

series.getSeriesById = function (params, viewCallback) {
    async.waterfall([
        function (callback) {
            seriesModel.findById(params.id, function (err, result) {
                if (err) {
                    callback(err);
                }
                callback(null, result);
            });
        },
        function (entity, callback) {
            if (entity === null) {
                internal.authenticate(callback, true);
            } else {
                callback(null, null, entity);
            }
        },
        function (token, entity, callback) {
            if (token !== null) {
                request({
                    uri: util.format(config.thetvdb.api.getSeriesById, params.id),
                    method: 'GET',
                    headers: internal.mountHeaders(token, params.language)
                }, function (error, response, body) {
                    if (error || response.statusCode != 200) {
                        callback(error);
                    } else {
                        var data = JSON.parse(body).data;
                        var newSeries = new seriesModel({
                            _id: data.id,
                            seriesName: data.seriesName,
                            overview: data.overview,
                            banner: data.banner,
                            genre: data.genre,
                            siteRating: data.siteRating,
                            status: data.status
                        });
                        var discoverSeasonCallback = function (error, newSeries) {
                            if (error) {
                                callback(error);
                            } else {
                                newSeries.save(function (err) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        callback(null, newSeries);
                                    }
                                });
                            }
                        };
                        series.discover(newSeries, 1, params.language, discoverSeasonCallback);
                    }
                });
            } else {
                callback(null, entity);
            }
        }
    ], function (error, result) {
        viewCallback(error, result);
    });
};

series.discover = function (newSeries, page, language, callback) {
    if (newSeries.episodes === null)
        newSeries.episodes = [];
    var seriesInfo = function (error, content) {
        if (error) {
            callback(true);
        } else {
            if (content.data !== undefined) {
                for (var i = 0; i < content.data.length; i++) {
                    if (content.data[i].airedSeason > 0) {
                        var seasonWebCode = ((content.data[i].airedSeason >= 10) ? 'S' : 'S0') + content.data[i].airedSeason;
                        var episodeWebCode = ((content.data[i].airedEpisodeNumber >= 10) ? 'E' : 'E0') + content.data[i].airedEpisodeNumber;
                        newSeries.episodes.push({
                            seasonNumber: content.data[i].airedSeason,
                            seasonWebCode: seasonWebCode,
                            episodeNumber: content.data[i].airedEpisodeNumber,
                            episodeWebCode: episodeWebCode,
                            title: content.data[i].episodeName,
                            airedAt: content.data[i].firstAired,
                            released: moment(content.data[i].firstAired) < moment()
                        });
                    };
                }
            }
            if (content.data !== undefined && content.links.next !== null) {
                series.discover(newSeries, content.links.next, language, seriesInfo);
            } else {
                callback(false, newSeries);
            }
        }
    }
    series.getEpisodes(newSeries._id, page, language, seriesInfo);
};

module.exports = series;