const express = require('express');
const router = express.Router();
const centroCustoController = require('../controllers/centroCustoController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

/**
 * =====================================================
 * ROTAS DE CENTROS DE CUSTO
 * =====================================================
 */

/**
 * POST /api/centros-custo
 * Criar/Atualizar Centro de Custo
 */
router.post('/', centroCustoController.saveCentroCusto);

/**
 * GET /api/centros-custo
 * Listar Centros de Custo
 */
router.get('/', centroCustoController.listCentrosCusto);

/**
 * GET /api/centros-custo/:id
 * Obter Centro de Custo Específico
 */
router.get('/:id', centroCustoController.getCentroCusto);

/**
 * DELETE /api/centros-custo/:id
 * Deletar Centro de Custo
 */
router.delete('/:id', centroCustoController.deleteCentroCusto);

/**
 * =====================================================
 * ROTAS DE LANÇAMENTOS DE CUSTO
 * =====================================================
 */

/**
 * POST /api/centros-custo/lancamentos
 * Criar/Atualizar Lançamento de Custo
 */
router.post('/lancamentos/save', centroCustoController.saveLancamento);

/**
 * GET /api/centros-custo/lancamentos
 * Listar Lançamentos de Custo
 */
router.get('/lancamentos/list', centroCustoController.listLancamentos);

/**
 * DELETE /api/centros-custo/lancamentos/:id
 * Deletar Lançamento
 */
router.delete('/lancamentos/:id', centroCustoController.deleteLancamento);

/**
 * =====================================================
 * ROTAS DE ANÁLISES E RELATÓRIOS
 * =====================================================
 */

/**
 * GET /api/centros-custo/analise/por-centro-mes
 * Obter Custos por Centro (Resumo Mensal)
 */
router.get('/analise/por-centro-mes', centroCustoController.getCustosPorCentroMes);

/**
 * GET /api/centros-custo/analise/por-centro-ano
 * Obter Custos por Centro (Resumo Anual)
 */
router.get('/analise/por-centro-ano', centroCustoController.getCustosPorCentroAno);

/**
 * GET /api/centros-custo/analise/por-categoria
 * Obter Custos por Categoria
 */
router.get('/analise/por-categoria', centroCustoController.getCustosPorCategoria);

/**
 * GET /api/centros-custo/analise/ranking
 * Obter Ranking de Centros de Custo
 */
router.get('/analise/ranking', centroCustoController.getRanking);

/**
 * GET /api/centros-custo/analise/comparar
 * Comparar Centros de Custo
 */
router.get('/analise/comparar', centroCustoController.compararCentros);

/**
 * GET /api/centros-custo/analise/dashboard
 * Dashboard de Custos
 */
router.get('/analise/dashboard', centroCustoController.getDashboard);

/**
 * =====================================================
 * ROTAS DE RATEIO DE CUSTOS
 * =====================================================
 */

/**
 * POST /api/centros-custo/rateios
 * Criar Rateio de Custo
 */
router.post('/rateios/create', centroCustoController.createRateio);

/**
 * GET /api/centros-custo/rateios
 * Listar Rateios
 */
router.get('/rateios/list', centroCustoController.listRateios);

/**
 * GET /api/centros-custo/rateios/:id/detalhes
 * Obter Detalhes do Rateio
 */
router.get('/rateios/:id/detalhes', centroCustoController.getRateioDetalhes);

module.exports = router;
