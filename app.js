//requiring necessary packages which are used in whole application
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const exHbs = require('express-handlebars');
const helpers = require('handlebars-helpers')();


//requiring nocache package to restrict user from accessing previous page of browser
const nocache = require("nocache");

//requiring route to handle requests
const indexRouter = require('./routes/index');
const userRouter = require('./routes/users');
const dashboardRouter = require('./routes/dashboard');
const settingRouter = require('./routes/settings');
const userListRouter = require('./routes/userList');
//Requiring Flash
const flash = require('connect-flash');

//Requiring AUTH.JS file to authenticate Process
const auth = require('./helpers/auth');

//connection of application and database
require('./connection')();

const app = express();


//default layout set to application
const hbs = exHbs.create({
  extname: '.hbs',
  defaultLayout: 'main',
  helpers: {
    ...helpers
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

auth.login(app);

app.use(flash());
app.use((req, res, next) => {
  if (req.user) {
    res.locals.user = req.user;
  }
  const error = req.flash("error");
  const success = req.flash("success");
  if (success.length > 0) {
    res.locals.flash = {
      type: "success",
      message: success,
    };
  }
  if (error.length > 0) {
    res.locals.flash = {
      type: "error",
      message: error,
    };
  }
  return next();
});

app.use(nocache());


app.use('/', indexRouter);
app.use('/user', userRouter);

//common middleware that restricts to access next all pages and routes without login
app.use(auth.commonMiddleware);

//dashboard page 
//this page is only accessible after login
app.use('/dashboard', dashboardRouter);
app.use('/settings', settingRouter);
app.use('/userList', userListRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
