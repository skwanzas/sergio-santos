const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'endiagro_db',
    user: process.env.DB_USER || 'endiagro_user',
    password: process.env.DB_PASSWORD,
    max: 20, // Máximo de conexões no pool
    idleTimeoutMillis: 30000, // Tempo máximo de conexão inativa
    connectionTimeoutMillis: 2000, // Tempo máximo de espera para conexão
});

// Event listeners para monitoramento
pool.on('connect', () => {
    console.log('✓ Nova conexão estabelecida com PostgreSQL');
});

pool.on('error', (err) => {
    console.error('✗ Erro inesperado na conexão PostgreSQL:', err);
    process.exit(-1);
});

// Função para testar a conexão
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✓ Conexão PostgreSQL bem-sucedida:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('✗ Erro ao conectar com PostgreSQL:', error.message);
        return false;
    }
};

// Exportar funções úteis
module.exports = {
    // Executar query simples
    query: (text, params) => pool.query(text, params),

    // Obter cliente do pool (para transações)
    getClient: () => pool.connect(),

    // Pool completo (caso necessário)
    pool,

    // Testar conexão
    testConnection,

    // Fechar todas as conexões (para shutdown gracioso)
    end: () => pool.end()
};
