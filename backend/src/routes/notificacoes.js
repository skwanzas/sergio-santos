const express = require('express');
const router = express.Router();
const notificacoesController = require('../controllers/notificacoesController');
const auth = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(auth);

// ==================== CRUD BÁSICO ====================

// Criar notificação
router.post('/', notificacoesController.createNotificacao);

// Listar notificações (com filtros opcionais: lida, tipo, categoria)
router.get('/', notificacoesController.listNotificacoes);

// Obter notificação específica
router.get('/:id', notificacoesController.getNotificacao);

// Deletar notificação
router.delete('/:id', notificacoesController.deleteNotificacao);

// ==================== OPERAÇÕES ESPECIAIS ====================

// Marcar notificação como lida
router.patch('/:id/marcar-lida', notificacoesController.marcarComoLida);

// Marcar todas como lidas
router.post('/marcar-todas-lidas', notificacoesController.marcarTodasComoLidas);

// Deletar todas lidas
router.delete('/deletar-todas-lidas/bulk', notificacoesController.deletarTodasLidas);

// Contar não lidas
router.get('/contar/nao-lidas', notificacoesController.contarNaoLidas);

// Limpar notificações expiradas
router.post('/limpar-expiradas', notificacoesController.limparExpiradas);

module.exports = router;
