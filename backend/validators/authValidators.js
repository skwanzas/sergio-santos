const { body, validationResult } = require('express-validator');
const AppError = require('../utils/appError');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((err) => err.msg);
    return next(new AppError(`Erro de validação: ${messages.join('. ')}`, 400));
  }
  next();
};

exports.validateSignup = [
  body('nome').notEmpty().withMessage('O nome é obrigatório.'),
  body('email').isEmail().withMessage('Deve ser um email válido.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('A senha deve ter pelo menos 8 caracteres.'),
  handleValidationErrors,
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Deve ser um email válido.'),
  body('password').notEmpty().withMessage('A senha é obrigatória.'),
  handleValidationErrors,
];
