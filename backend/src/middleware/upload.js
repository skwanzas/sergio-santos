const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Criar diretório de uploads se não existir
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Gerar nome único para o ficheiro
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);

        // Sanitizar nome do ficheiro
        const sanitizedName = nameWithoutExt
            .replace(/[^a-zA-Z0-9]/g, '_')
            .substring(0, 50);

        cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
});

// Filtro de tipos de ficheiros permitidos
const fileFilter = function (req, file, cb) {
    // Tipos permitidos
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/bmp',
        'image/tiff',
        'application/pdf'
    ];

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de ficheiro não permitido: ${ext}. Permitidos: ${allowedExtensions.join(', ')}`), false);
    }
};

// Configuração do Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB padrão
        files: 1 // Apenas 1 ficheiro por vez
    }
});

// Middleware de tratamento de erros de upload
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // Erros do Multer
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Ficheiro muito grande',
                details: `Tamanho máximo: ${(parseInt(process.env.MAX_FILE_SIZE) || 10485760) / 1024 / 1024}MB`
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Demasiados ficheiros',
                details: 'Apenas 1 ficheiro por vez é permitido'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de ficheiro inesperado',
                details: 'Use o campo "documento" para fazer upload'
            });
        }
    } else if (err) {
        // Outros erros
        return res.status(400).json({
            error: err.message
        });
    }
    next();
};

module.exports = {
    upload,
    handleUploadError,
    uploadDir
};
