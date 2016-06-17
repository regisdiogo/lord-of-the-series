var express = require.main.require('express');
var watchList = require.main.require('./lib/business/watchList');
var router = express.Router();

router.post('/', function (req, res) {
    var callback = function (error, data) {
        if (error) {
            res.status(400).json(data);
        } else {
            req.session.user = data;
            res.json(data);
        }
    }
    watchList.add(req.session.user, req.body, callback);
});

router.delete('/:seriesId', function (req, res) {
    var callback = function (error, data) {
        if (error) {
            res.status(400).json(data);
        } else {
            req.session.user = data;
            res.json(data);
        }
    }
    watchList.remove(req.session.user, req.params.seriesId, callback);
});

module.exports = router;