"use strict";

var path = require('path');

var express = require('express');

var morgan = require('morgan');

var rateLimit = require('express-rate-limit');

var helmet = require('helmet');

var mongoSanitize = require('express-mongo-sanitize');

var xss = require('xss-clean');

var hpp = require('hpp');

var AppError = require('./utils/appError');

var globalErrorHandler = require('./controllers/errorController');

var tourRouter = require('./routes/tourRoutes');

var userRouter = require('./routes/userRoutes');

var reviewRouter = require('./routes/reviewRoutes');

var viewRouter = require('./routes/viewRoutes');

var app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views')); // GLOBAL MIDDLEWARES

app.use(express["static"](path.join(__dirname, 'public'))); // Serving static files

app.use(helmet()); // Set Security HTTP headers

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // logging in development
}

var limiter = rateLimit({
  // middleware func
  max: process.env.MAX_REQUESTS_PER_HOUR,
  windowMs: 60 * 60 * 1000,
  // 100 requests per hour from the same IP
  message: 'Too many requests from this IP. Please try again in an hour.'
});
app.use('/api', limiter); // Apply limit requests to /api
// Body parser, reading data from body to req.body

app.use(express.json({
  limit: '10kb'
})); // body < 10kb
// Data sanitization against NoSQL query injection, filter out request content

app.use(mongoSanitize()); // Data sanitization against cross-site scripting attacks

app.use(xss()); // Clean user input from malicious HTML code

app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
})); // Prevent parameter pollution of the query string
// Test middleware

app.use(function (req, res, next) {
  req.requestTime = new Date().toISOString();
  next();
}); // MOUNT ROUTERS MIDDLEWARES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.all('*', function (req, res, next) {
  next(new AppError("'".concat(req.originalUrl, "' not found."), 404));
});
app.use(globalErrorHandler);
module.exports = app;