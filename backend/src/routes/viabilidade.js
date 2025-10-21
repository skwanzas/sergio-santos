const express = require('express');
const router = express.Router();
const viabilidadeController = require('../controllers/viabilidadeController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

/**
 * POST /api/viabilidade
 * Criar/Atualizar Projeto de Viabilidade
 */
router.post('/', viabilidadeController.saveViabilidade);

/**
 * GET /api/viabilidade
 * Listar Projetos
 */
router.get('/', viabilidadeController.listViabilidade);

/**
 * GET /api/viabilidade/:id
 * Obter Projeto Específico
 */
router.get('/:id', viabilidadeController.getViabilidade);

/**
 * DELETE /api/viabilidade/:id
 * Deletar Projeto
 */
router.delete('/:id', viabilidadeController.deleteViabilidade);

/**
 * POST /api/viabilidade/fluxos
 * Salvar Fluxos de Caixa
 */
router.post('/fluxos', viabilidadeController.saveFluxosCaixa);

/**
 * POST /api/viabilidade/:id/calcular
 * Calcular Indicadores
 */
router.post('/:id/calcular', viabilidadeController.calcularIndicadores);

/**
 * POST /api/viabilidade/:id/aprovar
 * Aprovar/Rejeitar Projeto
 */
router.post('/:id/aprovar', viabilidadeController.aprovarProjeto);

/**
 * GET /api/viabilidade/resumo/todos
 * Obter Resumo de Todos os Projetos
 */
router.get('/resumo/todos', viabilidadeController.getResumo);

/**
 * GET /api/viabilidade/ranking/vpl
 * Obter Ranking por VPL
 */
router.get('/ranking/vpl', viabilidadeController.getRanking);

/**
 * POST /api/viabilidade/:id/sensibilidade
 * Análise de Sensibilidade
 */
router.post('/:id/sensibilidade', viabilidadeController.analiseSensibilidade);

module.exports = router;
