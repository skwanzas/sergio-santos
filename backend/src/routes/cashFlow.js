const express = require('express');
const router = express.Router();
const cashFlowController = require('../controllers/cashFlowController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rotas para Cash Flow (Demonstração de Fluxo de Caixa)
 */

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Salvar/Atualizar Cash Flow
router.post('/', cashFlowController.saveCashFlow);

// Obter Cash Flow de um exercício
router.get('/:exercicio', cashFlowController.getCashFlow);

// Listar todos os Cash Flows
router.get('/', cashFlowController.listCashFlows);

// Gerar Cash Flow automaticamente a partir da Tesouraria
router.post('/:exercicio/gerar-automatico', cashFlowController.gerarAutomatico);

// Obter análise do Cash Flow
router.get('/:exercicio/analise', cashFlowController.getAnalise);

// Deletar Cash Flow
router.delete('/:exercicio', cashFlowController.deleteCashFlow);

module.exports = router;
