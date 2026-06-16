const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const mongoose = require('mongoose');
const AppError = require('./utils/appError');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/tasks', require('./routes/tasks'));

// Centralized error handler
app.use((err, req, res, next) => {
  if (err.isOperational) return res.status(err.statusCode).json({ status: 'fail', message: err.message });
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Something went wrong!' });
});

mongoose.connect(process.env.MONGO_URI).then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('Server running'));
});

module.exports = app;