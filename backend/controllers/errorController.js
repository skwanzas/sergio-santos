const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Valor inválido ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Valor duplicado: ${value}. Por favor, use outro valor.`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // A) Erros operacionais, confiáveis: envia mensagem ao cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  // B) Erro de programação ou desconhecido: não vaza detalhes
  } else {
    // 1) Log do erro
    console.error('ERROR 💥', err);
    // 2) Envia mensagem genérica
    res.status(500).json({
      status: 'error',
      message: 'Algo correu muito mal!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, message: err.message };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    // ... (outros handlers de erro, ex: validação Mongoose)

    sendErrorProd(error, res);
  }
};
