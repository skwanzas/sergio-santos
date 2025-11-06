const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    process.exit(1); // Sai com falha
  }
};

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('Recebido SIGINT. Fechando conexão com MongoDB...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Recebido SIGTERM. Fechando conexão com MongoDB...');
  await mongoose.connection.close();
  process.exit(0);
});

module.exports = connectDB;
