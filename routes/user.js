var express = require.main.require('express');
var user = require.main.require('./lib/business/user');
var router = express.Router();

router.post('/login', function(req, res) {
    var callback = function(error, response) {
        if (error) {
            res.status(400).json(error);
        } else {
            res.json(response);
        }
    };
    user.login(req.body, callback);
});

router.post('/signup', function(req, res) {
    var callback = function(error, response) {
        if (error) {
            res.status(400).json(error);
        } else {
            res.json(response);
        }
    };
    user.signup(req.body, callback);
});

module.exports = router;