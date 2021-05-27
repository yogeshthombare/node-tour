const express = require('express');
const morgan = require('morgan');

const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const globalErrHandler = require('./controllers/errorController');

const AppError = require('./utils/appError');

const app = express();
if (process.env.NODE_ENV = 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.post('/api/v1/signup', authRoutes.signnp);
app.post('/api/v1/login', authRoutes.login);

app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);


app.get('/', (req, res) => {
  res.json({ 'message': 'Server is running' })
});

app.all('*', (req, res, next) => {
  next(new AppError(`Could not find ${req.originalUrl}`, 404));
});

app.use(globalErrHandler);

module.exports = app;