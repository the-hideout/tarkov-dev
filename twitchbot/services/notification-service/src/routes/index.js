const express = require('express');
const { validateRequest } = require('../middleware/validation');
const {
  createTemplate,
  getTemplates,
  updateTemplate,
  createRule,
  getRules,
  updateRule,
  getHistory,
  testNotification
} = require('../controllers/notification');

const router = express.Router();

// Template Routes
router.post('/templates', validateRequest, createTemplate);
router.get('/templates', getTemplates);
router.put('/templates/:id', validateRequest, updateTemplate);

// Rule Routes
router.post('/rules', validateRequest, createRule);
router.get('/rules', getRules);
router.put('/rules/:id', validateRequest, updateRule);

// History Routes
router.get('/history', getHistory);

// Test Routes
router.post('/test', validateRequest, testNotification);

module.exports = router; 