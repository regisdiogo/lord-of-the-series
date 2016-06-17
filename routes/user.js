var express = require.main.require('express');
var user = require.main.require('./lib/business/user');
var router = express.Router();

router.get('/', function (req, res) {
    var callback = function (error, data) {
        if (error || data === null) {
            res.status(401).json(error);
        } else {
            res.json(data);
        }
    };
    if (req.session.user !== undefined)
        user.findByEmail(req.session.user.email, callback);
    else
        callback(true);
});

router.post('/login', function (req, res) {
    var callback = function (error, data) {
        if (error) {
            res.status(400).json(error);
        } else {
            req.session.user = data;
            res.json(data);
        }
    };
    user.login(req.body, callback);
});

router.get('/logout', function (req, res) {
    req.session.user = undefined;
    res.status(200).json(null);
});

router.post('/signup', function (req, res) {
    var callback = function (error, data) {
        if (error) {
            res.status(400).json(error);
        } else {
            req.session.user = data;
            res.json(data);
        }
    };
    user.signup(req.body, callback);
});

module.exports = router;