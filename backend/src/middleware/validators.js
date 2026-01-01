const { body, validationResult } = require('express-validator');

const validateRegistration = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Contraseña debe tener al menos 6 caracteres'),
  body('name').trim().notEmpty().withMessage('Nombre es requerido'),
];

const validateDebt = [
  body('description').trim().notEmpty().withMessage('Descripción es requerida'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor a 0'),
  body('dueDate').optional().isISO8601().withMessage('Fecha válida requerida'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateRegistration,
  validateDebt,
  handleValidationErrors,
};
