const express = require('express');
const talhaoController = require('../controllers/talhaoController');
const talhaoValidators = require('../validators/talhaoValidators');
const authController = require('../controllers/authController');

const router = express.Router();

// Todas as rotas abaixo requerem autenticação
router.use(authController.protect);

// Rotas para talhões
router
  .route('/')
  .get(talhaoController.getAllTalhoes)
  .post(
    talhaoValidators.validateCreateTalhao,
    talhaoController.createTalhao
  );

router
  .route('/stats')
  .get(talhaoController.getStats);

router
  .route('/:id')
  .get(talhaoController.getTalhao)
  .patch(
    talhaoValidators.validateUpdateTalhao,
    talhaoController.updateTalhao
  )
  .delete(talhaoController.deleteTalhao);

module.exports = router;
