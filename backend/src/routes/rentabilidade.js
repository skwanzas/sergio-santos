const express = require('express');
const router = express.Router();
const rentabilidadeController = require('../controllers/rentabilidadeController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

// ==================== CRUD BÁSICO ====================

// Criar/Atualizar análise de rentabilidade
router.post('/', rentabilidadeController.saveRentabilidade);

// Listar análises (com filtros opcionais: exercicio, cultura)
router.get('/', rentabilidadeController.listRentabilidade);

// Obter análise específica
router.get('/:id', rentabilidadeController.getRentabilidade);

// Deletar análise
router.delete('/:id', rentabilidadeController.deleteRentabilidade);

// ==================== ANÁLISE E COMPARAÇÃO ====================

// Comparar culturas por exercício
router.get('/comparar/:exercicio', rentabilidadeController.compararCulturas);

// Ranking de rentabilidade por exercício
router.get('/ranking/:exercicio', rentabilidadeController.getRanking);

// Consolidação por exercício
router.get('/consolidacao/:exercicio', rentabilidadeController.getConsolidacao);

module.exports = router;
