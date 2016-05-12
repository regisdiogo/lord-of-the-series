var user = {};

var request = require.main.require('request');
var util = require.main.require('util');
var config = require.main.require('./lib/config.js');
var userModel = require.main.require('./lib/models/user');

user.login = function (params, callback) {
    var errors = [];

    if (params.email === undefined) {
        errors.push({ 'email': 'E-mail is required' });
    }

    if (errors.length > 0) {
        callback(errors, params);

    } else {
        userModel.find({
            email: params.email,
            password: params.password
        }, function (err, users) {
            if (err) throw err;

            if (users.length === 0)
                callback([{ 'email': 'Wrong username or password' }]);

            callback(false, users[0]);
        });
    }
};


user.findById = function (user, callback) {
    var errors = [];

    if (user === undefined) {
        errors.push({ "error": "must be logged" });
    }

    if (errors.length > 0) {
        callback(errors, user);

    } else {
        userModel.findById(id, function (err, user) {
            if (err) throw err;

            callback(false, user);
        });
    }
};

user.signup = function (params, callback) {
    var errors = [];

    if (params.password !== params.confirmPassword) {
        errors.push({ 'confirmPassword': 'Must match password' });
    }

    if (errors.length > 0) {
        callback(errors, params);

    } else {

        var newUser = new userModel({
            email: params.email,
            password: params.password
        });

        newUser.save(function (err) {
            if (err) {
                if (err.code === 11000 || err.code === 11001)
                    callback([{ 'email': 'E-mail already registered' }])
                else
                    callback(err);
            } else {
                callback(false, newUser);
            }
        });
    }
};

module.exports = user;