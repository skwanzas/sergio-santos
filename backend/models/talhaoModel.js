const mongoose = require('mongoose');

const talhaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome do talhão é obrigatório.'],
  },
  area: {
    type: Number,
    required: [true, 'A área do talhão é obrigatória.'],
    min: [0, 'A área deve ser um valor positivo.'],
  },
  cultura: {
    type: String,
    required: [true, 'A cultura é obrigatória.'],
  },
  localizacao: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      required: false,
    },
  },
  proprietario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'O proprietário é obrigatório.'],
  },
  dataCriacao: {
    type: Date,
    default: Date.now,
  },
  ativo: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Índice geoespacial para localização
talhaoSchema.index({ localizacao: '2dsphere' });

const Talhao = mongoose.model('Talhao', talhaoSchema);

module.exports = Talhao;
