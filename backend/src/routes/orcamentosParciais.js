const express = require('express');
const router = express.Router();
const orcamentosParciaisController = require('../controllers/orcamentosParciaisController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

// ==================== CRUD BÁSICO ====================

// Criar/Atualizar orçamento parcial
router.post('/', orcamentosParciaisController.saveOrcamento);

// Listar orçamentos (com filtros opcionais: exercicio, tipo, status)
router.get('/', orcamentosParciaisController.listOrcamentos);

// Obter orçamento específico
router.get('/:id', orcamentosParciaisController.getOrcamento);

// Deletar orçamento
router.delete('/:id', orcamentosParciaisController.deleteOrcamento);

// ==================== OPERAÇÕES ESPECIAIS ====================

// Aprovar orçamento
router.post('/:id/aprovar', orcamentosParciaisController.aprovarOrcamento);

// Atualizar status do orçamento
router.patch('/:id/status', orcamentosParciaisController.updateStatus);

// ==================== ANÁLISE E COMPARAÇÃO ====================

// Comparar múltiplos orçamentos
router.get('/comparar/multiplos', orcamentosParciaisController.compararOrcamentos);

// Consolidação por exercício
router.get('/consolidacao/:exercicio', orcamentosParciaisController.getConsolidacao);

module.exports = router;
