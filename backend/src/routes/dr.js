const express = require('express');
const router = express.Router();
const drController = require('../controllers/drController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route   POST /api/dr
 * @desc    Criar/Atualizar Demonstração de Resultados
 * @access  Private (Admin, Gestor)
 */
router.post('/', checkRole('admin', 'gestor'), drController.saveDR);

/**
 * @route   GET /api/dr
 * @desc    Listar todas as DRs da empresa
 * @access  Private
 */
router.get('/', drController.listDRs);

/**
 * @route   GET /api/dr/:exercicio
 * @desc    Obter DR de um exercício específico
 * @access  Private
 */
router.get('/:exercicio', drController.getDR);

/**
 * @route   GET /api/dr/comparativo/:anos
 * @desc    Obter comparativo de vários exercícios (ex: 2023,2024,2025)
 * @access  Private
 */
router.get('/comparativo/:anos', drController.getComparativo);

/**
 * @route   DELETE /api/dr/:exercicio
 * @desc    Eliminar DR de um exercício
 * @access  Private (Admin, Gestor)
 */
router.delete('/:exercicio', checkRole('admin', 'gestor'), drController.deleteDR);

module.exports = router;
