const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const { authMiddleware, checkRole } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

/**
 * @route   POST /api/documentos/upload
 * @desc    Upload de documento (PDF ou imagem)
 * @access  Private (Admin, Gestor)
 */
router.post(
    '/upload',
    checkRole('admin', 'gestor', 'contador'),
    upload.single('documento'),
    handleUploadError,
    documentoController.upload
);

/**
 * @route   POST /api/documentos/:id/ocr
 * @desc    Processar OCR e classificar documento com IA
 * @access  Private (Admin, Gestor)
 */
router.post(
    '/:id/ocr',
    checkRole('admin', 'gestor', 'contador'),
    documentoController.processOCR
);

/**
 * @route   POST /api/documentos/:id/apply
 * @desc    Aplicar documento classificado ao Balanço de Execução
 * @access  Private (Admin, Gestor)
 */
router.post(
    '/:id/apply',
    checkRole('admin', 'gestor'),
    documentoController.applyDocumento
);

/**
 * @route   GET /api/documentos
 * @desc    Listar documentos da empresa
 * @access  Private
 */
router.get('/', documentoController.listDocumentos);

/**
 * @route   GET /api/documentos/:id
 * @desc    Obter documento específico
 * @access  Private
 */
router.get('/:id', documentoController.getDocumento);

/**
 * @route   DELETE /api/documentos/:id
 * @desc    Eliminar documento
 * @access  Private (Admin, Gestor)
 */
router.delete(
    '/:id',
    checkRole('admin', 'gestor'),
    documentoController.deleteDocumento
);

module.exports = router;
