const express = require('express');
const { register, login } = require('../controllers/authController');
const { validateRegistration, handleValidationErrors } = require('../middleware/validators');

const router = express.Router();

// Rutas de autenticación
router.post('/register', validateRegistration, handleValidationErrors, register);
router.post('/login', login);

module.exports = router;
