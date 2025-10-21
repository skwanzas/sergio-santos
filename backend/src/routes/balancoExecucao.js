const express = require('express');
const router = express.Router();
const balancoExecucaoController = require('../controllers/balancoExecucaoController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rotas para Balanço de Execução (Previsto vs Realizado)
 */

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Obter comparação previsto vs realizado de um exercício
router.get('/:exercicio/comparacao', balancoExecucaoController.getComparacao);

// Obter desvios mensais
router.get('/:exercicio/desvios-mensais', balancoExecucaoController.getDesviosMensais);

// Obter análise de variações
router.get('/:exercicio/analise-variacoes', balancoExecucaoController.getAnaliseVariacoes);

// Obter dashboard de execução
router.get('/:exercicio/dashboard', balancoExecucaoController.getDashboardExecucao);

module.exports = router;
