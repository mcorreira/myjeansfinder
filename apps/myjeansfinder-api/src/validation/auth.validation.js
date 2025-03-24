const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string()
    .required()
    .min(2)
    .max(100)
    .message('Name must be between 2 and 100 characters'),

  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .message('Valid email required'),

  password: Joi.string()
    .required()
    .min(8)
    .max(200)
    .pattern(
      new RegExp(
        '^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z])(?=.*[@#$%^&+=!]){8,}$'
      )
    )
    .message(
      'Password contain at least 8 characters and one lowercase letter, one uppercase letter, one number, and one special character'
    ),

  confirmPassword: Joi.string()
    .required()
    .valid(Joi.ref('password'))
    .message('Passwords do not match'),
}).with('password', 'confirmPassword');

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .message('Valid email required'),

  password: Joi.string()
    .required()
    .min(8)
    .message('Password must be at least 8 characters long'),
});

module.exports = {
  registerSchema,
  loginSchema,
};
