var series = {};

var request = require('request');
var querystring = require('querystring');
var config = require('../config.js');


series.getSeriesByName = function(name, callback) {
    series.authenticate(function(token) {
        request({
            uri: config.thetvdb.api.searchByName + name,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(true, JSON.parse(body));
            } else {
                callback(false, JSON.parse(body));
            }
        });
    });
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
            callback(body.token);
        } else {
            console.dir(JSON.parse(response.body));
        }
    });
}

module.exports = series;