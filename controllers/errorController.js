const AppError = require('../utils/appError');
const errorEmoji = '❌';
///////////////////////////////////////////////////////////////////////////////
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate field value:${JSON.stringify(err.keyValue)}.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  // Extract validation errors from the error object
  const validationErrors = err.errors;
  // Extract specific error messages for each field
  const errorMessages = Object.keys(validationErrors).map((field) => {
    const fieldError = validationErrors[field];
    return `${fieldError.message}`;
  });
  const errorMessage = errorMessages.join(' | ');
  const message = `Validation Error: ${errorMessage}`;
  return new AppError(message, 400);
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please login again.', 401);
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please login again.', 401);
};
///////////////////////////////////////////////////////////////////////////////
const sendErrorDev = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } 
  
  // RENDERED WEBSITE
  console.log(`ERROR: ${err}`);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message,
  });
};

const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }

    // Programming, other unknown error
    console.log(`ERROR: ${err}`);
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong.',
    });
  }

  // RENDERED WEBSITE
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // Programming, other unknown error
  console.log(`ERROR: ${err}`);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};
///////////////////////////////////////////////////////////////////////////////
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    // res.status(500).json({
    //   status: 'error',
    //   message: err,
    // });

    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateFieldsDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();
    sendErrorProd(error, req, res);
  }
};
