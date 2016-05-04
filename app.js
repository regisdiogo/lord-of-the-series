global.require = function(name) {
    return require(__dirname + '/' + name);
}

var express = require.main.require('express');
var path = require.main.require('path');
var logger = require.main.require('morgan');
var handlebars = require.main.require('express-handlebars');
var bodyParser = require.main.require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/lord-of-the-series');
var app = express();

// View
app.engine('handlebars', handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(session({
    secret: 'foobar',
    name: 'lord-of-the-series',
    store: new MongoStore({
        mongooseConnection: mongoose.connection
    }),
    resave: true,
    saveUninitialized: true
}));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));

app.all('*', function(req, res, next) {
    if (req.session.userToken === undefined) {
        if (req.accepts('json')) {
            res.status(401).send({
                error: 'Not found'
            });
        } else {
            console.log('aqui');
        }
    } else {
        next();
    }
});

app.use('/', require('./routes/main'));
app.use('/series', require('./routes/series'));
app.use('/user', require('./routes/user'));

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

//Listening
app.listen(3000, function() {
    console.log('Ready to go on port 3000!');
});