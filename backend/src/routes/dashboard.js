const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rotas para Dashboard Executivo Consolidado
 */

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Obter dashboard consolidado completo
router.get('/:exercicio', dashboardController.getDashboardConsolidado);

// Obter evolução de KPIs ao longo dos anos
router.get('/evolucao/:anos', dashboardController.getEvolucaoKPIs);

module.exports = router;
