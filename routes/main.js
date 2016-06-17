var express = require.main.require('express');
var router = express.Router();
var crawler = require.main.require('./lib/business/crawler');

router.get('/', function (req, res) {
    res.render('home', { title: 'Lord of The Series' });
});

router.get('/languages', function (req, res) {
    //TODO
});


router.get('/crawler', function (req, res) {
    crawler.init();
    res.status(200).json({});
});

module.exports = router;