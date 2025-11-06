const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'O nome é obrigatório.'],
  },
  email: {
    type: String,
    required: [true, 'O email é obrigatório.'],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'gestor'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'A senha é obrigatória.'],
    minlength: 8,
    select: false, // Não inclui no output das queries por padrão
  },
  passwordChangedAt: Date,
});

// Hook Pre-Save: Hash da senha antes de salvar
userSchema.pre('save', async function (next) {
  // Apenas executa se a senha foi modificada
  if (!this.isModified('password')) return next();

  // Hash da senha com custo 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método de Instância: Compara senha
userSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
