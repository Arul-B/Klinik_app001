var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config();
var socket_io    = require( "socket.io" );
//session
const session = require('express-session')
//flash
const flash = require('connect-flash')
//method-edit
const methodOverride = require('method-override')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const adminRouter = require('./routes/admin')


var app = express();
var io           = socket_io();
app.io           = io;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'))
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    expires: new Date(Date.now() + 60 * 10000), 
    maxAge: 60*10000 
  }
}))
app.use(flash())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/sb-admin-2',express.static(path.join(__dirname, 'node_modules/startbootstrap-sb-admin-2')));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/admin',adminRouter)
// socket.io events
io.on( "connection", function( socket )
{
    console.log( "A user connected" );
    io.emit('hello','tes')
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
