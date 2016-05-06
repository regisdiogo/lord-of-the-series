global.require = function(name) {
    return require(__dirname + '/' + name);
}

var express = require.main.require('express');
var path = require.main.require('path');
var logger = require.main.require('morgan');
var handlebars = require.main.require('express-handlebars');
var bodyParser = require.main.require('body-parser');
var session = require.main.require('express-session');
var mongoStore = require.main.require('connect-mongo')(session);
var mongoose = require.main.require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost/lord-of-the-series');

// View
app.engine('handlebars', handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Session
app.use(session({
    secret: 'foobar',
    name: 'lord-of-the-series',
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    }),
    resave: true,
    saveUninitialized: true
}));

// Configs
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

// Check authentication
app.all('*', function(req, res, next) {
    var allowed = ['/', '/user/login', '/user/signup'];
    if (allowed.indexOf(req.url) === -1 && req.session.userToken === undefined) {
        res.status(401).json();
    } else {
        next();
    }
});

// Routes
app.use('/', require.main.require('./routes/main'));
app.use('/series', require.main.require('./routes/series'));
app.use('/user', require.main.require('./routes/user'));

//404
app.use(function(req, res, next) {
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', {
            title: '404 Not Found'
        });
    } else if (req.accepts('json')) {
        res.send({
            error: 'Not found'
        });
    } else {
        res.type('txt').send('Not found');
    }
});

//Start server
app.listen(3000, function() {
    console.log('Ready to go on port 3000!');
});