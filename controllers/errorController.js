/* 
  We can use this controller to check how much severe the error is 
  and we can also implement logic to send an email to administrator
*/

const AppError = require("../utils/appError")

const handleCastErrorDB = err => {
  const message = `Invalid value ${err.value} for field ${err.path}`;
  return new AppError(message, 400);
}

const handleDuplicateFieldDB = (err) => {
  const fieldName = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate field value: ${fieldName}, try again.`;
  return new AppError(message, 400);
}

const handleValidationDB = err => {
  const errors = Object.keys(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join(". \n")}`;
  return new AppError(message, 400);
}

const handleJWTError = err => new AppError('Invalid Token, please login again', 401);

const handleTokenExpiredError = err => new AppError('Your token has expired, please login again', 401);

const sendErrDev = (err, res) => {

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  })
}

const sendErrProd = (err, res) => {
  console.error('ERROR ', err);

  if (err.isOperational) {
    // if error from code
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // for error from library
    res.status(500).json({
      status: err.status,
      message: 'Something went wrong'
    });
  }
}

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = { ...err };

  if (process.env.NODE_ENV == 'development') {
    sendErrDev(error, res);
  } else {
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError') error = handleValidationDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError(error);
    if (error.name === 'TokenExpiredError') error = handleTokenExpiredError(error);

    sendErrProd(error, res);
  }
}