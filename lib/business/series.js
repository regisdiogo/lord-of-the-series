var series = {};

var request = require.main.require('request');
var util = require.main.require('util');
var config = require.main.require('./lib/config.js');

series.searchSeriesByName = function (params, callback) {
    var seriesByName = function (error, token) {
        request({
            uri: util.format(config.thetvdb.api.searchByName, params.seriesTitle),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Accept-Language': params.language
            }
        }, function (error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    };
    series.authenticate(seriesByName);
};

series.getSeriesById = function (params, callback) {
    var seriesById = function (error, token) {
        request({
            uri: util.format(config.thetvdb.api.getSeriesById, params.id),
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token,
                'Accept-Language': params.language
            }
        }, function (error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    };
    series.authenticate(seriesById);
};

series.getAvailableLanguages = function (callback) {
    var availableLanguages = function (error, token) {
        request({
            uri: config.thetvdb.api.languages,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }, function (error, response, body) {
            if (error || response.statusCode != 200) {
                callback(JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    };
    series.authenticate(availableLanguages);
};

series.authenticate = function (callback) {
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
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(false, body.token);
        } else {
            console.dir(body);
            callback(true);
        }
    });
}

module.exports = series;