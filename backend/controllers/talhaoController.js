const Talhao = require('../models/talhaoModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Obter todos os talhões
exports.getAllTalhoes = catchAsync(async (req, res, next) => {
  const talhoes = await Talhao.find({ proprietario: req.user.id })
    .populate('proprietario', 'nome email');

  res.status(200).json({
    status: 'success',
    results: talhoes.length,
    data: {
      talhoes,
    },
  });
});

// Obter um talhão específico
exports.getTalhao = catchAsync(async (req, res, next) => {
  const talhao = await Talhao.findById(req.params.id)
    .populate('proprietario', 'nome email');

  if (!talhao) {
    return next(new AppError('Talhão não encontrado com esse ID.', 404));
  }

  // Verifica se o utilizador é o proprietário
  if (talhao.proprietario._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Você não tem permissão para aceder a este talhão.', 403));
  }

  res.status(200).json({
    status: 'success',
    data: {
      talhao,
    },
  });
});

// Criar novo talhão
exports.createTalhao = catchAsync(async (req, res, next) => {
  // Define o proprietário como o utilizador logado
  const novoTalhao = await Talhao.create({
    ...req.body,
    proprietario: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      talhao: novoTalhao,
    },
  });
});

// Atualizar talhão
exports.updateTalhao = catchAsync(async (req, res, next) => {
  const talhao = await Talhao.findById(req.params.id);

  if (!talhao) {
    return next(new AppError('Talhão não encontrado com esse ID.', 404));
  }

  // Verifica se o utilizador é o proprietário
  if (talhao.proprietario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Você não tem permissão para atualizar este talhão.', 403));
  }

  const talhaoAtualizado = await Talhao.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: {
      talhao: talhaoAtualizado,
    },
  });
});

// Eliminar talhão
exports.deleteTalhao = catchAsync(async (req, res, next) => {
  const talhao = await Talhao.findById(req.params.id);

  if (!talhao) {
    return next(new AppError('Talhão não encontrado com esse ID.', 404));
  }

  // Verifica se o utilizador é o proprietário
  if (talhao.proprietario.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('Você não tem permissão para eliminar este talhão.', 403));
  }

  await Talhao.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Obter estatísticas dos talhões (para dashboard)
exports.getStats = catchAsync(async (req, res, next) => {
  const stats = await Talhao.aggregate([
    {
      $match: { proprietario: req.user._id },
    },
    {
      $group: {
        _id: '$cultura',
        totalTalhoes: { $sum: 1 },
        areaTotal: { $sum: '$area' },
        areaMedia: { $avg: '$area' },
      },
    },
    {
      $sort: { areaTotal: -1 },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      stats,
    },
  });
});
