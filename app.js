global.require = function(name) {
    return require(__dirname + '/' + name);
}

var express = require.main.require('express');
var path = require.main.require('path');
var logger = require.main.require('morgan');
var handlebars = require.main.require('express-handlebars');
var bodyParser = require.main.require('body-parser')

var app = express();

// View
app.engine('handlebars', handlebars({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./routes/main'));

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