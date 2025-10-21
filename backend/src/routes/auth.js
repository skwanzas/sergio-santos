const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Registar novo utilizador
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login de utilizador
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Obter perfil do utilizador autenticado
 * @access  Private
 */
router.get('/profile', authMiddleware, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Atualizar perfil do utilizador
 * @access  Private
 */
router.put('/profile', authMiddleware, authController.updateProfile);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Alterar password
 * @access  Private
 */
router.put('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
