const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');

// Carregar variáveis de ambiente
dotenv.config();

// Importar configuração da base de dados
const db = require('./src/config/database');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const drRoutes = require('./src/routes/dr');
const balancoRoutes = require('./src/routes/balanco');
const documentosRoutes = require('./src/routes/documentos');

const app = express();

// =====================================================
// MIDDLEWARE DE SEGURANÇA
// =====================================================

// Helmet - Headers de segurança
app.use(helmet());

// CORS - Permitir requisições do frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate Limiting - Limitar requisições por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Limite de 100 requisições por IP
    message: 'Demasiadas requisições deste IP. Por favor, tente novamente mais tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// =====================================================
// MIDDLEWARE GERAL
// =====================================================

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compressão de respostas
app.use(compression());

// Logging (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// =====================================================
// ROTAS DA API
// =====================================================

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'ENDIAGRO API está funcional',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Rotas principais
app.use('/api/auth', authRoutes);
app.use('/api/dr', drRoutes);
app.use('/api/balanco', balancoRoutes);
app.use('/api/documentos', documentosRoutes);

// Rota 404 - Não encontrado
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
});

// =====================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS
// =====================================================

app.use((err, req, res, next) => {
    console.error('Erro capturado:', err.stack);

    // Erro de validação do Express Validator
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Erro de validação',
            details: err.details
        });
    }

    // Erro de sintaxe JSON
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            error: 'JSON inválido no corpo da requisição'
        });
    }

    // Erro genérico
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Erro interno do servidor',
            status: err.status || 500,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// =====================================================
// INICIALIZAÇÃO DO SERVIDOR
// =====================================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Testar conexão com a base de dados
        console.log('🔄 A testar conexão com a base de dados...');
        const isConnected = await db.testConnection();

        if (!isConnected) {
            console.error('✗ Falha ao conectar com a base de dados');
            console.error('✗ Verifique se o PostgreSQL está a correr e as credenciais em .env');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log('');
            console.log('╔═══════════════════════════════════════════════════════╗');
            console.log('║                                                       ║');
            console.log('║         🌾 ENDIAGRO - API de Gestão Financeira       ║');
            console.log('║                                                       ║');
            console.log('╚═══════════════════════════════════════════════════════╝');
            console.log('');
            console.log(`✓ Servidor a correr na porta: ${PORT}`);
            console.log(`✓ Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`✓ Base de Dados: ${process.env.DB_NAME}`);
            console.log(`✓ URL da API: http://localhost:${PORT}/api`);
            console.log('');
            console.log('Rotas disponíveis:');
            console.log('  POST   /api/auth/register     - Registar utilizador');
            console.log('  POST   /api/auth/login        - Login');
            console.log('  GET    /api/auth/profile      - Obter perfil');
            console.log('  POST   /api/dr                - Criar/Atualizar DR');
            console.log('  GET    /api/dr                - Listar DRs');
            console.log('  GET    /api/dr/:exercicio     - Obter DR específica');
            console.log('');
            console.log('Pressione CTRL+C para parar o servidor');
            console.log('');
        });

    } catch (error) {
        console.error('✗ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};

// Tratamento de shutdown gracioso
process.on('SIGTERM', async () => {
    console.log('🔄 SIGTERM recebido. A fechar servidor...');
    await db.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n🔄 SIGINT recebido. A fechar servidor...');
    await db.end();
    console.log('✓ Servidor fechado com sucesso');
    process.exit(0);
});

// Iniciar servidor
startServer();

// Exportar app para testes
module.exports = app;
