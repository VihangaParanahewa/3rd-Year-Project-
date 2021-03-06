var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs  = require('express-handlebars');
var session= require('express-session');
var validator = require('express-validator');
var flash = require('connect-flash');
var passport = require('passport');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');
var profile = require('./routes/profile');
var chatBox = require('./routes/chatBox');
var news = require('./routes/news');
var donation = require('./routes/donation');
var event = require('./routes/event');
var operations = require('./routes/operations');
var handlingDonations = require('./routes/handlingDonations');
var video = require('./routes/video');
var test = require('./routes/test');
var map = require('./routes/map');
var mongoose = require('mongoose');

var app = express();

mongoose.connect('mongodb://localhost:27017/sahana');
require('./config/passport');

// view engine setup
app.engine('hbs', hbs({extname: 'hbs', defaultLayout: 'landing', layoutsDir:__dirname+'/views/layouts/'}));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
    secret: 'foo',
    saveUninitialized: false ,
    resave: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie : { maxAge : 180 * 60 * 1000}
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.session = req.session;

    if (req.isAuthenticated()){
        res.locals.user = req.user;
        if(req.user.role === 'Admin'){
            res.locals.userRole= true;
            res.locals.userRole2= true;
            res.locals.userRole3= true;
        } else if(req.user.role === 'Super Volunteer'){
            res.locals.userRole= false;
            res.locals.userRole2= true;
            res.locals.userRole3= true;
        } else if (req.user.role === 'Volunteer'){
            res.locals.userRole= false;
            res.locals.userRole2= false;
            res.locals.userRole3= true;
        }
        res.locals.mobileDigital = "0" + req.user.mobile.slice(3);
        res.locals.nicDigital = req.user.nic.slice(0,11);
    }
    next();
});

app.use('/', index);
app.use('/users', users);
app.use('/profile', profile);
app.use('/chatBox', chatBox);
app.use('/news', news);
app.use('/donation', donation);
app.use('/event', event);
app.use('/operations', operations);
app.use('/handlingDonations', handlingDonations);
app.use('/video', video);
app.use('/test', test);
app.use('/map', map);

//for testingdevice
app.use('/device', chatBox);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error', {edata:err});
});

module.exports = app;
