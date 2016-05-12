var express = require.main.require('express');
var user = require.main.require('./lib/business/user');
var router = express.Router();

router.get('/', function (req, res) {
    var callback = function (error, response) {
        if (error) {
            res.status(401).json(error);
        } else {
            res.json(response);
        }
    };
    user.findById(req.session.user, callback);
});

router.post('/login', function (req, res) {
    var callback = function (error, response) {
        if (error) {
            res.status(400).json(error);
        } else {
            req.session.user = response;
            res.json(response);
        }
    };
    user.login(req.body, callback);
});

router.get('/logout', function (req, res) {
    req.session.user = undefined;
    res.status(200).json();
});

router.post('/signup', function (req, res) {
    var callback = function (error, response) {
        if (error) {
            res.status(400).json(error);
        } else {
            req.session.user = response;
            res.json(response);
        }
    };
    user.signup(req.body, callback);
});

module.exports = router;