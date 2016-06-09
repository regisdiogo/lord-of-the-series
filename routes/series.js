var express = require.main.require('express');
var series = require.main.require('./lib/business/series');
var router = express.Router();

router.post('/search', function(req, res) {
    var callback = function(error, response) {
        if (error) {
            res.status(204).json(response);
        } else {
            res.json(response);
        }
    };
    series.searchSeriesByName(req.body, callback);
});

router.get('/:language/:id', function(req, res) {
    var callback = function(error, response) {
        if (error) {
            res.status(500).json(response);
        } else {
            res.json(response);
        }
    }
    series.getSeriesById(req.params, callback);
});

router.get('/:language/:id/seasons', function(req, res) {
    var callback = function(error, response) {
        if (error) {
            res.status(500).json(response);
        } else {
            res.json(response);
        }
    }
    series.getEpisodesSummary(req.params.id, req.params.language, callback);
});

router.get('/:language/:id/season/:seasonNumber', function(req, res) {
    var callback = function(error, response) {
        if (error) {
            res.status(500).json(response);
        } else {
            res.json(response);
        }
    }
    series.getSeasonDetail(req.params.id, req.params.seasonNumber, req.params.language, callback);
});

module.exports = router;