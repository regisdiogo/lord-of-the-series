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
    series.getSeriesByName(req.body.seriesTitle, callback);
});

router.get('/series/:id/', function(req, res) {
    var callback = function(error, response) {

    }
});

module.exports = router;