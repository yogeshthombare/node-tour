const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const AppError = require('./utils/appError');
const globalErrHandler = require('./controllers/errorController');

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cookieParser = require('cookie-parser');
const compression = require('compression');


const app = express();

// For heroku deployment
app.enable('truxt proxy');

// Global Middlewares
app.options('*', cors());
// Security http header

if (process.env.NODE_ENV = 'development') {
  app.use(morgan('dev'));
}
app.use(helmet());

// Limit request from user api
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour'
});

app.use(limiter);

app.use(express.json({ limit: '2mb' }));
// app.use(express.urlencoded({ limit: '20kb' }));
app.use(cookieParser());
// input data sanitization against Nosql query injection
app.use(mongoSanitize());

// sanitize against xss
app.use(xss());

// Prevent Parameter pollution/ duplicate paramaters in the url as query params
app.use(
  hpp({
    whitelist: ['duration', 'price']
  })
);

app.use(compression());

// Serve static files
app.use(express.static(`${__dirname}/public`));

// middleware to log request time
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);


app.get('/', (req, res) => {
  res.json({ 'message': 'Server is running' })
});

// Handle invalid route
app.all('*', (req, res, next) => {
  next(new AppError(`Could not find ${req.originalUrl}`, 404));
});

app.use(globalErrHandler);

module.exports = app;