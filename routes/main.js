var express = require.main.require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.render('home', { title: 'Lord of The Series' });
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