const express = require('express');
const { body, param } = require('express-validator');
const taskController = require('../controllers/taskController');

const router = express.Router();

// Validation middleware
const taskValidation = [
  body('channelId').isUUID().withMessage('Invalid channel ID'),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['message', 'command', 'moderation', 'custom']).withMessage('Invalid task type'),
  body('schedule').isString().trim().notEmpty().withMessage('Schedule is required'),
  body('action').isObject().withMessage('Action must be an object'),
  body('isEnabled').isBoolean().withMessage('isEnabled must be a boolean')
];

// Create a new scheduled task
router.post('/', taskValidation, taskController.createTask);

// Get all tasks for a channel
router.get('/channel/:channelId', [
  param('channelId').isUUID().withMessage('Invalid channel ID')
], taskController.getChannelTasks);

// Get a specific task
router.get('/:taskId', [
  param('taskId').isUUID().withMessage('Invalid task ID')
], taskController.getTask);

// Update a task
router.put('/:taskId', [
  param('taskId').isUUID().withMessage('Invalid task ID'),
  ...taskValidation
], taskController.updateTask);

// Delete a task
router.delete('/:taskId', [
  param('taskId').isUUID().withMessage('Invalid task ID')
], taskController.deleteTask);

// Get task history
router.get('/:taskId/history', [
  param('taskId').isUUID().withMessage('Invalid task ID')
], taskController.getTaskHistory);

// Execute a task immediately
router.post('/:taskId/execute', [
  param('taskId').isUUID().withMessage('Invalid task ID')
], taskController.executeTask);

module.exports = router; 