const express = require('express');
const router = express.Router();
const balancoController = require('../controllers/balancoController');
const { authMiddleware, checkRole } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route   POST /api/balanco
 * @desc    Criar/Atualizar Balanço Previsional
 * @access  Private (Admin, Gestor)
 */
router.post('/', checkRole('admin', 'gestor'), balancoController.saveBalanco);

/**
 * @route   GET /api/balanco
 * @desc    Listar todos os Balanços da empresa
 * @access  Private
 */
router.get('/', balancoController.listBalancos);

/**
 * @route   GET /api/balanco/:exercicio
 * @desc    Obter Balanço de um exercício específico
 * @access  Private
 */
router.get('/:exercicio', balancoController.getBalanco);

/**
 * @route   POST /api/balanco/:exercicio/importar-resultado
 * @desc    Importar Resultado Líquido da DR para o Balanço
 * @access  Private (Admin, Gestor)
 */
router.post('/:exercicio/importar-resultado', checkRole('admin', 'gestor'), balancoController.importarResultadoDR);

/**
 * @route   DELETE /api/balanco/:exercicio
 * @desc    Eliminar Balanço de um exercício
 * @access  Private (Admin, Gestor)
 */
router.delete('/:exercicio', checkRole('admin', 'gestor'), balancoController.deleteBalanco);

module.exports = router;
