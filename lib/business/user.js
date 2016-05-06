var user = {};

var request = require.main.require('request');
var util = require.main.require('util');
var config = require.main.require('./lib/config.js');

user.login = function(params, callback) {
    var errors = [];
    console.log(params.email);
    if (params.email !== 'test@test.com')
        errors.push({
            'email': 'Wrong user name or password'
        });

    if (errors.length > 0)
        callback(errors, params);
    else
        callback(false, params);
};

user.signup = function(params, callback) {
    var errors = [];
    if (params.password !== params.confirmPassword)
        errors.push({
            'confirmPassword': 'Must match password'
        });

    if (errors.length > 0)
        callback(errors, params);
    else
        callback(false, params);
};

module.exports = user;