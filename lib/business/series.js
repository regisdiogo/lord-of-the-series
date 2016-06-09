var series = {};

var request = require.main.require('request');
var util = require.main.require('util');
var config = require.main.require('./lib/config.js');
var seriesModel = require.main.require('./lib/models/series');

series.discover = function(newSeries, language, callback) {
    var seriesInfo = function(error, content) {
        if (!error) {
            var seasons = [];
            for (var i = 0; i < content.data.length; i++) {
                if (content.data[i].airedSeason > 0) {
                    if (seasons[content.data[i].airedSeason] === undefined) {
                        seasons[content.data[i].airedSeason] = {
                            id: content.data[i].airedSeason,
                            code: content.data[i].airedSeason.length > 1 ? 'S' : 'S0' + content.data[i].airedSeason,
                            episodes: [{
                                title: content.data[i].episodeName,
                                code: content.data[i].airedEpisodeNumber.length > 1 ? 'E' : 'E0' + content.data[i].airedEpisodeNumber,
                                airedAt: content.data[i].firstAired
                            }]
                        };
                    } else {
                        seasons[content.data[i].airedSeason].episodes.push({
                            title: content.data[i].episodeName,
                            code: content.data[i].airedEpisodeNumber.length > 1 ? 'E' : 'E0' + content.data[i].airedEpisodeNumber,
                            airedAt: content.data[i].firstAired
                        });
                    }
                }
            };
            callback(false, newSeries, seasons);
        } else {
            callback(true);
        }
    };
    console.log('newSeries._id ' + newSeries._id);
    series.getEpisodesSummary(newSeries._id, language, seriesInfo);
};

series.searchSeriesByName = function(params, callback) {
    var seriesByName = function(error, token) {
        request({
            uri: util.format(config.thetvdb.api.searchByName, params.seriesTitle),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Accept-Language': params.language
            }
        }, function(error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    };
    series.authenticate(seriesByName);
};

series.getSeriesById = function(params, callback) {
    var seriesById = function(error, token) {
        request({
            uri: util.format(config.thetvdb.api.getSeriesById, params.id),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Accept-Language': params.language
            }
        }, function(error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                var res = JSON.parse(body);
                seriesModel.findById(res.data.id, function(err, result) {
                    if (err) {
                        throw err;
                    }
                    if (result == null) {
                        console.log('result');
                        var newSeries = new seriesModel({
                            _id: res.data.id,
                            seriesName: res.data.seriesName,
                            overview: res.data.overview,
                            banner: res.data.banner
                        });
                        var discoverSeasonCallback = function(error, newSeries, seasons) {
                            if (error) {
                                callback(error, content);
                            } else {
                                newSeries.seasons = seasons;
                                newSeries.save(function(err) {
                                    if (err) {
                                        callback(err);
                                    } else {
                                        console.log(newSeries);
                                        callback(false, newSeries);
                                    }
                                });
                            }
                        };

                        series.discover(newSeries, params.language, discoverSeasonCallback);

                    } else {
                        console.log('else');
                        callback(false, result);
                    }
                });
            }
        });
    };
    series.authenticate(seriesById);
};

series.getEpisodesSummary = function(seriesId, language, callback) {
    var episodesSummary = function(error, token) {
        request({
            uri: util.format(config.thetvdb.api.getEpisodesSummary, seriesId),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Accept-Language': language
            }
        }, function(error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    }
    series.authenticate(episodesSummary);
};

series.getSeasonDetail = function(seriesId, seasonNumber, language, callback) {
    var seasonDetail = function(error, token) {
        request({
            uri: util.format(config.thetvdb.api.getSeasonDetail, seriesId, seasonNumber),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Accept-Language': language
            }
        }, function(error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    }
    series.authenticate(seasonDetail);
};

series.getAvailableLanguages = function(callback) {
    var availableLanguages = function(error, token) {
        request({
            uri: config.thetvdb.api.languages,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }, function(error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    };
    series.authenticate(availableLanguages);
};

series.authenticate = function(callback) {
    request({
        uri: config.thetvdb.api.login,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        json: {
            'apikey': config.thetvdb.apikey
        }
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(false, body.token);
        } else {
            console.dir(body);
            callback(true);
        }
    });
}

module.exports = series;