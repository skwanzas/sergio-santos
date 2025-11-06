const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

// Importadores de Rota
const authRoutes = require('./routes/authRoutes');
const talhaoRoutes = require('./routes/talhaoRoutes');

const app = express();

// 1) MIDDLEWARES GLOBAIS
// Define cabeçalhos de segurança HTTP
app.use(helmet());

// Permite Cross-Origin Resource Sharing
app.use(cors());
app.options('*', cors()); // Habilita pre-flight para todas as rotas

// Body parser, lê dados do body para req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization contra NoSQL query injection
app.use(mongoSanitize());

// Data sanitization contra XSS
app.use(xss());

// Comprime todo o texto enviado nas respostas
app.use(compression());

// 2) ROTAS
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/talhoes', talhaoRoutes);
// ... (outras rotas)

// 3) HANDLER 404 (Rotas não encontradas)
app.all('*', (req, res, next) => {
  next(new AppError(`Não foi possível encontrar ${req.originalUrl} neste servidor.`, 404));
});

// 4) MIDDLEWARE GLOBAL DE TRATAMENTO DE ERROS
app.use(globalErrorHandler);

module.exports = app;
