const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
module.exports = (req, res, next) => {
  const token = req.cookies?.jwt || req.headers.authorization?.split(' ')[1];
  if (!token) return next(new AppError('Not authenticated', 401));
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError('Invalid token', 401));
  }
};