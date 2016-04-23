var express = require('express');
var request = require('request');
var parseString = require('xml2js').parseString;
var config = require('../config.js');

var router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        title: 'My Home'
    });
});

router.post('/series', function(req, res) {
    var url = config.thetvdb.searchByName + req.body.seriesTitle;
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            parseString(body, function(err, result) {
                console.log(result.Data.Series);
                res.render('series', {
                    title: 'Series',
                    list: result.Data.Series
                });
            });
        }
    });
});

module.exports = router;