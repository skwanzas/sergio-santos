const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  // Remove a senha do output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    nome: req.body.nome,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Verifica se email e senha existem
  if (!email || !password) {
    return next(new AppError('Por favor, forneça email e senha.', 400));
  }

  // 2) Verifica se o utilizador existe e a senha está correta
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    return next(new AppError('Email ou senha incorretos.', 401));
  }

  // 3) Se tudo estiver ok, envia o token
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // 1) Obtém o token e verifica se existe
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('Você não está logado. Por favor, faça login.', 401)
    );
  }

  // 2) Verifica o token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Verifica se o utilizador ainda existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('O utilizador deste token não existe mais.', 401)
    );
  }

  // 4) (Opcional) Verifica se o utilizador mudou a senha após o token ser emitido
  // ...

  // GARANTE ACESSO À ROTA
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles é um array ['admin', 'gestor']. req.user.role vem do middleware 'protect'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Você não tem permissão para realizar esta ação.', 403)
      );
    }
    next();
  };
};
