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

exports.validateCreateTalhao = [
  body('nome').notEmpty().withMessage('O nome do talhão é obrigatório.'),
  body('area')
    .isNumeric()
    .withMessage('A área deve ser um número.')
    .isFloat({ min: 0 })
    .withMessage('A área deve ser um valor positivo.'),
  body('cultura').notEmpty().withMessage('A cultura é obrigatória.'),
  handleValidationErrors,
];

exports.validateUpdateTalhao = [
  body('nome').optional().notEmpty().withMessage('O nome do talhão não pode estar vazio.'),
  body('area')
    .optional()
    .isNumeric()
    .withMessage('A área deve ser um número.')
    .isFloat({ min: 0 })
    .withMessage('A área deve ser um valor positivo.'),
  body('cultura').optional().notEmpty().withMessage('A cultura não pode estar vazia.'),
  handleValidationErrors,
];
