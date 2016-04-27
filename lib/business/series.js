var series = {};

var request = require.main.require('request');
var config = require.main.require('./lib/config.js');

series.getSeriesByName = function(name, callback) {
    var seriesByName = function(error, token) {
        request({
            uri: config.thetvdb.api.searchByName + name,
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
    series.authenticate(seriesByName);
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