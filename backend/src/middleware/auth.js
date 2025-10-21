const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticação JWT
 * Verifica se o token é válido e adiciona os dados do utilizador ao request
 */
const authMiddleware = (req, res, next) => {
    try {
        // Obter token do header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                error: 'Acesso negado. Token não fornecido.'
            });
        }

        // Verificar e decodificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adicionar dados do utilizador ao request
        req.user = decoded;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado. Por favor, faça login novamente.'
            });
        }

        res.status(401).json({
            error: 'Token inválido ou expirado.'
        });
    }
};

/**
 * Middleware para verificar roles/permissões
 * @param  {...string} allowedRoles - Roles permitidos (ex: 'admin', 'gestor')
 */
const checkRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Não autenticado'
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Permissão negada para esta ação',
                requiredRoles: allowedRoles,
                yourRole: req.user.role
            });
        }

        next();
    };
};

/**
 * Middleware opcional de autenticação
 * Adiciona os dados do utilizador se o token existir, mas não bloqueia se não existir
 */
const optionalAuth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }

        next();
    } catch (error) {
        // Continua mesmo se o token for inválido
        next();
    }
};

module.exports = {
    authMiddleware,
    checkRole,
    optionalAuth
};
