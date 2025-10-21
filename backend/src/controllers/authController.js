const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

class AuthController {
    /**
     * Registar novo utilizador
     * POST /api/auth/register
     */
    async register(req, res) {
        try {
            const { nome, email, password, role, empresa_id } = req.body;

            // Validação básica
            if (!nome || !email || !password) {
                return res.status(400).json({
                    error: 'Nome, email e password são obrigatórios'
                });
            }

            // Verificar se email já existe
            const userExists = await db.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (userExists.rows.length > 0) {
                return res.status(400).json({
                    error: 'Email já registado'
                });
            }

            // Hash da password
            const saltRounds = 10;
            const password_hash = await bcrypt.hash(password, saltRounds);

            // Inserir utilizador
            const result = await db.query(
                `INSERT INTO users (nome, email, password_hash, role, empresa_id)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, nome, email, role, empresa_id`,
                [nome, email, password_hash, role || 'gestor', empresa_id]
            );

            const user = result.rows[0];

            // Gerar JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    empresa_id: user.empresa_id
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.status(201).json({
                message: 'Utilizador registado com sucesso',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    role: user.role,
                    empresa_id: user.empresa_id
                },
                token
            });

        } catch (error) {
            console.error('Erro no registo:', error);
            res.status(500).json({
                error: 'Erro ao registar utilizador',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Login de utilizador
     * POST /api/auth/login
     */
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validação básica
            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email e password são obrigatórios'
                });
            }

            // Buscar utilizador
            const result = await db.query(
                `SELECT id, nome, email, password_hash, role, empresa_id, ativo
                 FROM users WHERE email = $1`,
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    error: 'Email ou password incorretos'
                });
            }

            const user = result.rows[0];

            // Verificar se está ativo
            if (!user.ativo) {
                return res.status(403).json({
                    error: 'Conta desativada. Contacte o administrador'
                });
            }

            // Verificar password
            const passwordMatch = await bcrypt.compare(
                password,
                user.password_hash
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Email ou password incorretos'
                });
            }

            // Atualizar último login
            await db.query(
                'UPDATE users SET ultimo_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            // Gerar JWT token
            const token = jwt.sign(
                {
                    userId: user.id,
                    email: user.email,
                    role: user.role,
                    empresa_id: user.empresa_id
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            res.json({
                message: 'Login bem-sucedido',
                user: {
                    id: user.id,
                    nome: user.nome,
                    email: user.email,
                    role: user.role,
                    empresa_id: user.empresa_id
                },
                token
            });

        } catch (error) {
            console.error('Erro no login:', error);
            res.status(500).json({
                error: 'Erro ao fazer login',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Obter perfil do utilizador autenticado
     * GET /api/auth/profile
     */
    async getProfile(req, res) {
        try {
            const result = await db.query(
                `SELECT id, nome, email, role, empresa_id, created_at, ultimo_login
                 FROM users WHERE id = $1`,
                [req.user.userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Utilizador não encontrado'
                });
            }

            res.json({
                user: result.rows[0]
            });

        } catch (error) {
            console.error('Erro ao obter perfil:', error);
            res.status(500).json({
                error: 'Erro ao obter perfil'
            });
        }
    }

    /**
     * Atualizar perfil do utilizador
     * PUT /api/auth/profile
     */
    async updateProfile(req, res) {
        try {
            const { nome, email } = req.body;
            const userId = req.user.userId;

            // Verificar se email já existe para outro utilizador
            if (email) {
                const emailExists = await db.query(
                    'SELECT id FROM users WHERE email = $1 AND id != $2',
                    [email, userId]
                );

                if (emailExists.rows.length > 0) {
                    return res.status(400).json({
                        error: 'Email já utilizado por outro utilizador'
                    });
                }
            }

            // Atualizar dados
            const result = await db.query(
                `UPDATE users
                 SET nome = COALESCE($1, nome),
                     email = COALESCE($2, email)
                 WHERE id = $3
                 RETURNING id, nome, email, role, empresa_id`,
                [nome, email, userId]
            );

            res.json({
                message: 'Perfil atualizado com sucesso',
                user: result.rows[0]
            });

        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            res.status(500).json({
                error: 'Erro ao atualizar perfil'
            });
        }
    }

    /**
     * Alterar password
     * PUT /api/auth/change-password
     */
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    error: 'Password atual e nova password são obrigatórias'
                });
            }

            // Buscar utilizador
            const result = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Utilizador não encontrado'
                });
            }

            // Verificar password atual
            const passwordMatch = await bcrypt.compare(
                currentPassword,
                result.rows[0].password_hash
            );

            if (!passwordMatch) {
                return res.status(401).json({
                    error: 'Password atual incorreta'
                });
            }

            // Hash da nova password
            const saltRounds = 10;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // Atualizar password
            await db.query(
                'UPDATE users SET password_hash = $1 WHERE id = $2',
                [newPasswordHash, userId]
            );

            res.json({
                message: 'Password alterada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao alterar password:', error);
            res.status(500).json({
                error: 'Erro ao alterar password'
            });
        }
    }
}

module.exports = new AuthController();
