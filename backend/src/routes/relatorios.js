const express = require('express');
const router = express.Router();
const relatoriosController = require('../controllers/relatoriosController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

// ==================== DEMONSTRAÇÃO DE RESULTADOS ====================
router.get('/dr/:exercicio/pdf', relatoriosController.gerarDRPDF);
router.get('/dr/:exercicio/excel', relatoriosController.gerarDRExcel);

// ==================== BALANÇO PREVISIONAL ====================
router.get('/balanco/:exercicio/pdf', relatoriosController.gerarBalancoPDF);
router.get('/balanco/:exercicio/excel', relatoriosController.gerarBalancoExcel);

// ==================== TESOURARIA MENSAL ====================
router.get('/tesouraria/:exercicio/pdf', relatoriosController.gerarTesourariaPDF);
router.get('/tesouraria/:exercicio/excel', relatoriosController.gerarTesourariaExcel);

// ==================== CASH FLOW ====================
router.get('/cash-flow/:exercicio/pdf', relatoriosController.gerarCashFlowPDF);
router.get('/cash-flow/:exercicio/excel', relatoriosController.gerarCashFlowExcel);

module.exports = router;
