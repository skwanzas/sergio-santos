const express = require('express');
const router = express.Router();
const indicadoresController = require('../controllers/indicadoresController');
const { authMiddleware } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route   GET /api/indicadores/:exercicio
 * @desc    Obter todos os indicadores de um exercício
 * @access  Private
 */
router.get('/:exercicio', indicadoresController.getIndicadores);

/**
 * @route   GET /api/indicadores/evolucao/:anos
 * @desc    Obter evolução de indicadores ao longo de vários anos (ex: 2023,2024,2025)
 * @access  Private
 */
router.get('/evolucao/:anos', indicadoresController.getEvolucao);

module.exports = router;
