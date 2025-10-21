const express = require('express');
const router = express.Router();
const tesourariaController = require('../controllers/tesourariaController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Rotas para Tesouraria Mensal
 */

// Aplicar autenticação em todas as rotas
router.use(authenticateToken);

// Salvar/Atualizar tesouraria mensal
router.post('/', tesourariaController.saveTesouraria);

// Obter tesouraria de um mês específico
router.get('/:exercicio/:mes', tesourariaController.getTesouraria);

// Listar todas as tesourarias de um exercício
router.get('/:exercicio', tesourariaController.listTesouraria);

// Obter resumo anual
router.get('/:exercicio/resumo', tesourariaController.getResumoAnual);

// Deletar tesouraria de um mês
router.delete('/:exercicio/:mes', tesourariaController.deleteTesouraria);

module.exports = router;
