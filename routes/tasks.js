const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const verifyToken = require('../middleware/auth');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

router.use(verifyToken);

router.get('/', catchAsync(async (req, res) => {
  const tasks = await Task.find({ owner: req.user.id });
  res.json({ status: 'success', tasks });
}));

router.post('/', catchAsync(async (req, res) => {
  const task = await Task.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ status: 'success', task });
}));

router.delete('/:id', catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError('Task not found', 404));
  if (task.owner.toString() !== req.user.id) return next(new AppError('Unauthorized', 403));
  await task.deleteOne();
  res.status(204).send();
}));

module.exports = router;