var config = require.main.require('./lib/config.js');
var async = require.main.require('async');
var seriesModel = require.main.require('./lib/models/series');
var userModel = require.main.require('./lib/models/user');
var util = require.main.require('util');
var request = require.main.require('request');

var crawler = {};
var internal = {};

internal.crawler = function (series) {
    series.seasons.forEach(function (season) {
        season.episodes.forEach(function (episode) {
            var formats = ['1080', '720', ''];
            var searchText = (series.seriesName + ' ' + season.webCode + episode.webCode);
            formats.forEach(function (format) {
                request(util.format(config.katUrl, searchText + ' ' + format), function (error, response, body) {
                    if (!error) {
                        var body = JSON.parse(body);
                        if (body != null && body.list.length > 0 && body.list[0] != null) {
                            console.log(format == '' ? 'HD' : format + ' Torrent: ' + body.list[0].torrentLink);
                        } else {
                            console.log('Not found [format ' + format == '' ? 'HD' : format + ']');
                        }
                    } else {
                        console.log("We’ve encountered an error: " + error);
                    }
                });
            });
        });
    });
};

crawler.init = function () {
    var callback = function (error, users) {
        users.forEach(function (user) {
            user.watchList.forEach(function (series) {
                internal.crawler(series);
            });
        });
    };
    userModel.find(
        { 'watchList.seasons.episodes.link': { $exists: false } },
        function (error, result) {
            if (error)
                callback(error);
            else
                callback(null, result);
        }
    );
};

module.exports = crawler;