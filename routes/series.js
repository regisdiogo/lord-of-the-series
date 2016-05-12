var express = require.main.require('express');
var series = require.main.require('./lib/business/series');
var router = express.Router();

router.post('/series/search', function (req, res) {
    var callback = function (error, response) {
        if (error) {
            res.status(204).json(response);
        } else {
            res.json(response);
        }
    };
    series.searchSeriesByName(req.body, callback);
});

router.get('/series/:language/:id', function (req, res) {
    var callback = function (error, response) {
        if (error) {
            res.status(500).json(response);
        } else {
            res.json(response);
        }
    }
    series.getSeriesById(req.params, callback);
});

router.get('/languages', function (req, res) {
    var callback = function (error, response) {
        if (error) {
            res.status(500).json(response);
        } else {
            res.json(response);
        }
    }
    series.getAvailableLanguages(callback);
});

module.exports = router;