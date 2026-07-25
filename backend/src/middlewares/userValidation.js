const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().min(2).max(50).optional().allow('', null),
  email: Joi.string().email().required().messages({
    'string.email': 'Valid email is required',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(4).required().messages({
    'string.min': 'Password must be at least 4 characters long',
    'any.required': 'Password is required'
  }),
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().max(50).optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  role_id: Joi.number().integer().positive().required(),
  branch_id: Joi.number().integer().positive().optional().allow(null),
  status: Joi.string().optional().allow('', null)
}).options({ stripUnknown: true, allowUnknown: true });

const updateUserSchema = Joi.object({
  username: Joi.string().min(2).max(50).optional().allow('', null),
  email: Joi.string().email().optional().allow('', null),
  role_id: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  first_name: Joi.string().min(1).max(50).optional(),
  last_name: Joi.string().max(50).optional().allow('', null),
  phone: Joi.string().optional().allow('', null),
  branch_id: Joi.number().integer().positive().optional().allow(null)
}).min(1).options({ stripUnknown: true, allowUnknown: true });

const roleSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': 'Role name is required',
    'any.required': 'Role name is required'
  }),
  description: Joi.string().max(255).optional().allow('', null),
  permissions: Joi.object().pattern(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional().messages({
    'object.pattern.base': 'Permissions must be an object with string keys and array of strings values'
  }),
  is_active: Joi.boolean().optional()
});

const updateRoleSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  description: Joi.string().max(255).optional().allow('', null),
  permissions: Joi.object().pattern(
    Joi.string(),
    Joi.array().items(Joi.string())
  ).optional(),
  is_active: Joi.boolean().optional()
}).min(1);

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    next();
  };
};

module.exports = {
  validateUser: validate(userSchema),
  validateUpdateUser: validate(updateUserSchema),
  validateRole: validate(roleSchema),
  validateUpdateRole: validate(updateRoleSchema)
};
