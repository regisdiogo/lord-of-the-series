var express = require.main.require('express');
var series = require.main.require('./lib/business/series');

var router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        title: 'My Home'
    });
});

router.post('/series/search', function(req, res) {
    var callback = function(error, response) {
        if (!error) {
            res.json(response);
        } else {
            res.status(204).json(response);
        }
    };
    series.searchSeriesByName(req.body, callback);
});

router.get('/series/:language/:id', function(req, res) {
    var callback = function(error, response) {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).json(response);
        }
    }
    series.getSeriesById(req.params, callback);
});

router.get('/languages', function(req, res) {
    var callback = function(error, response) {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).json(response);
        }
    }
    series.getAvailableLanguages(callback);
});

module.exports = router;