const Joi = require('joi');
const { passwordStrength } = require('check-password-strength');

// Custom password validation using check-password-strength
const customPasswordValidator = (value, helpers) => {
  const result = passwordStrength(value);
  if (result.id < 2) {
    // Medium strength or better
    return helpers.error('password.weak', {
      warning: result.feedback.warning,
      suggestions: result.feedback.suggestions,
    });
  }
  return value;
};

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required',
    'string.min': 'Name must be at least {#limit} characters',
    'string.max': 'Name cannot exceed {#limit} characters',
    'any.required': 'Name is required',
  }),

  email: Joi.string()
    .trim()
    .lowercase()
    .email({ tlds: { allow: false } }) // Disallow invalid TLDs
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .required()
    .custom(customPasswordValidator, 'Password strength validation')
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least {#limit} characters',
      'string.max': 'Password cannot exceed {#limit} characters',
      'password.weak': 'Password is too weak: {#warning}',
    }),

  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Passwords do not match',
    'any.required': 'Please confirm your password',
  }),
}).with('password', 'confirmPassword');

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'string.empty': 'Email is required',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'string.empty': 'Password is required',
    'any.required': 'Password is required',
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
