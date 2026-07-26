const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authenticate');
const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const dataToValidate = req.method === 'GET' ? req.query : req.body;
    const { error } = schema.validate(dataToValidate, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({ field: detail.path.join('.'), message: detail.message }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
  };
};

const auditLogFilterSchema = Joi.object({
  user_id: Joi.number().integer().positive().optional(),
  action: Joi.string().optional(),
  start_date: Joi.date().optional(),
  end_date: Joi.date().min(Joi.ref('start_date')).optional().messages({
    'date.min': 'End date must be greater than or equal to start date'
  })
});

const chatbotQuerySchema = Joi.object({
  query: Joi.string().min(1).max(500).required().messages({
    'string.empty': 'Query cannot be empty',
    'string.max': 'Query cannot exceed 500 characters'
  }),
  context: Joi.object().optional()
});

const integrationSchema = Joi.object({
  name: Joi.string().required(),
  webhook_url: Joi.string().uri({ scheme: ['http', 'https'] }).required().messages({
    'string.uri': 'Valid webhook URL starting with http/https is required'
  }),
  secret_key: Joi.string().min(16).required()
});

// Audit Logs
router.get('/audit-logs', authenticate, validate(auditLogFilterSchema), (req, res) => {
  res.json({ message: 'Audit logs retrieved', data: [] });
});

// Chatbot AI
router.post('/ai/chat', authenticate, validate(chatbotQuerySchema), (req, res) => {
  res.json({ message: 'Response generated', reply: 'I am a mock AI assistant.' });
});

// Webhook Integration
router.post('/integrations', authenticate, validate(integrationSchema), (req, res) => {
  res.status(201).json({ message: 'Integration created successfully', data: req.body });
});

// Seed 100+ Demo Records (open for testing/verification)
router.get('/seed-demo-data', async (req, res) => {
  try {
    const seeder = require('../migrations/021_seed_100_demo_records');
    const result = await seeder.up();
    res.json({
      status: 'success',
      message: 'Successfully seeded 100+ comprehensive demo records across all ERP modules!',
      details: result
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to seed demo data',
      error: error.message
    });
  }
});

module.exports = router;
