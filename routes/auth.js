const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Signup
router.post('/signup', catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const hash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, password: hash });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('jwt', token, { httpOnly: true, secure: true });
  res.status(201).json({ status: 'success', token });
}));

// Login
router.post('/login', catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError('Invalid credentials', 401));
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('jwt', token, { httpOnly: true, secure: true });
  res.json({ status: 'success', token });
}));

// Google OAuth
router.get('/google', require('passport').authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', require('passport').authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('jwt', token, { httpOnly: true, secure: true });
  res.redirect('/');
});

module.exports = router;