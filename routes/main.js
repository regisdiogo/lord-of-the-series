var express = require('express');
var request = require('request');
var cheerio = require('cheerio');
var config = require('../config.js');

var router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        title: 'My Home'
    });
});

router.post('/series', function(req, res) {
    var url = config.thetvdb.searchByName + "how to get";
    request(url, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body, {
                xmlMode: true
            });
            console.log($('data').children());
        }
    });
    res.render('series', {
        title: 'Series'
    });
});





module.exports = router;