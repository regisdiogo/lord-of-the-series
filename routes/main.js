var express = require('express');
var series = require('../business/series.js');

var router = express.Router();

router.get('/', function(req, res) {
    res.render('home', {
        title: 'My Home'
    });
});

router.post('/series/search', function(req, res) {
    series.getSeriesByName(req.body.seriesTitle, function(success, response) {
        if (success) {
            res.json(response);
        } else {
            res.json(204, response);
        }
    });
});

//router.get('/series/:id/')

module.exports = router;