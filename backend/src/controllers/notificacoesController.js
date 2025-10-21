const pool = require('../config/database');

// ==================== CRIAR NOTIFICAÇÃO ====================

exports.createNotificacao = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            titulo,
            mensagem,
            tipo,
            categoria,
            entidade_tipo,
            entidade_id,
            link_acao,
            prioridade,
            expira_em,
            dados_extras
        } = req.body;

        // Validações
        if (!titulo || !mensagem || !tipo) {
            return res.status(400).json({
                error: 'Campos obrigatórios: titulo, mensagem, tipo'
            });
        }

        const tiposValidos = ['info', 'warning', 'success', 'error', 'alert'];
        if (!tiposValidos.includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo inválido. Deve ser: info, warning, success, error ou alert'
            });
        }

        const result = await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, entidade_tipo,
                entidade_id, link_acao, prioridade, expira_em, dados_extras
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *`,
            [
                userId, titulo, mensagem, tipo, categoria, entidade_tipo,
                entidade_id, link_acao, prioridade || 0, expira_em,
                dados_extras ? JSON.stringify(dados_extras) : null
            ]
        );

        res.status(201).json({
            message: 'Notificação criada com sucesso',
            notificacao: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao criar notificação:', error);
        res.status(500).json({ error: 'Erro ao criar notificação' });
    }
};

// ==================== LISTAR NOTIFICAÇÕES ====================

exports.listNotificacoes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { lida, tipo, categoria, limit = 50, offset = 0 } = req.query;

        let query = `
            SELECT * FROM notificacoes
            WHERE user_id = $1
            AND (expira_em IS NULL OR expira_em > CURRENT_TIMESTAMP)
        `;
        const params = [userId];
        let paramCount = 1;

        if (lida !== undefined) {
            paramCount++;
            query += ` AND lida = $${paramCount}`;
            params.push(lida === 'true');
        }

        if (tipo) {
            paramCount++;
            query += ` AND tipo = $${paramCount}`;
            params.push(tipo);
        }

        if (categoria) {
            paramCount++;
            query += ` AND categoria = $${paramCount}`;
            params.push(categoria);
        }

        query += ` ORDER BY prioridade DESC, created_at DESC`;

        paramCount++;
        query += ` LIMIT $${paramCount}`;
        params.push(parseInt(limit));

        paramCount++;
        query += ` OFFSET $${paramCount}`;
        params.push(parseInt(offset));

        const result = await pool.query(query, params);

        // Contar total não lidas
        const countResult = await pool.query(
            'SELECT COUNT(*) as total FROM notificacoes WHERE user_id = $1 AND lida = false AND (expira_em IS NULL OR expira_em > CURRENT_TIMESTAMP)',
            [userId]
        );

        res.json({
            notificacoes: result.rows,
            nao_lidas: parseInt(countResult.rows[0].total),
            total: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao listar notificações:', error);
        res.status(500).json({ error: 'Erro ao listar notificações' });
    }
};

// ==================== OBTER NOTIFICAÇÃO ESPECÍFICA ====================

exports.getNotificacao = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM notificacoes WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notificação não encontrada' });
        }

        res.json({
            notificacao: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao obter notificação:', error);
        res.status(500).json({ error: 'Erro ao obter notificação' });
    }
};

// ==================== MARCAR COMO LIDA ====================

exports.marcarComoLida = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE notificacoes
            SET lida = true, data_leitura = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notificação não encontrada' });
        }

        res.json({
            message: 'Notificação marcada como lida',
            notificacao: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao marcar notificação como lida:', error);
        res.status(500).json({ error: 'Erro ao marcar notificação como lida' });
    }
};

// ==================== MARCAR TODAS COMO LIDAS ====================

exports.marcarTodasComoLidas = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `UPDATE notificacoes
            SET lida = true, data_leitura = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND lida = false
            RETURNING id`,
            [userId]
        );

        res.json({
            message: 'Todas as notificações foram marcadas como lidas',
            quantidade: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao marcar todas como lidas:', error);
        res.status(500).json({ error: 'Erro ao marcar todas como lidas' });
    }
};

// ==================== DELETAR NOTIFICAÇÃO ====================

exports.deleteNotificacao = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM notificacoes WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Notificação não encontrada' });
        }

        res.json({
            message: 'Notificação deletada com sucesso',
            notificacao: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao deletar notificação:', error);
        res.status(500).json({ error: 'Erro ao deletar notificação' });
    }
};

// ==================== DELETAR TODAS LIDAS ====================

exports.deletarTodasLidas = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            'DELETE FROM notificacoes WHERE user_id = $1 AND lida = true RETURNING id',
            [userId]
        );

        res.json({
            message: 'Todas as notificações lidas foram deletadas',
            quantidade: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao deletar notificações lidas:', error);
        res.status(500).json({ error: 'Erro ao deletar notificações lidas' });
    }
};

// ==================== CONTAR NÃO LIDAS ====================

exports.contarNaoLidas = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT COUNT(*) as total FROM notificacoes
            WHERE user_id = $1 AND lida = false
            AND (expira_em IS NULL OR expira_em > CURRENT_TIMESTAMP)`,
            [userId]
        );

        res.json({
            nao_lidas: parseInt(result.rows[0].total)
        });

    } catch (error) {
        console.error('Erro ao contar não lidas:', error);
        res.status(500).json({ error: 'Erro ao contar não lidas' });
    }
};

// ==================== LIMPAR NOTIFICAÇÕES EXPIRADAS ====================

exports.limparExpiradas = async (req, res) => {
    try {
        const result = await pool.query('SELECT limpar_notificacoes_expiradas()');
        const quantidade = result.rows[0].limpar_notificacoes_expiradas;

        res.json({
            message: 'Notificações expiradas foram limpas',
            quantidade: quantidade
        });

    } catch (error) {
        console.error('Erro ao limpar expiradas:', error);
        res.status(500).json({ error: 'Erro ao limpar expiradas' });
    }
};

// ==================== FUNÇÕES AUXILIARES PARA CRIAR NOTIFICAÇÕES AUTOMÁTICAS ====================

/**
 * Criar notificação de orçamento pendente de aprovação
 */
exports.notificarOrcamentoPendenteAprovacao = async (userId, orcamentoId, nomeOrcamento) => {
    try {
        await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, entidade_tipo,
                entidade_id, link_acao, prioridade
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                userId,
                'Orçamento Pendente de Aprovação',
                `O orçamento "${nomeOrcamento}" está aguardando aprovação.`,
                'warning',
                'aprovacao',
                'orcamento_parcial',
                orcamentoId,
                `/orcamentos-parciais`,
                3
            ]
        );
    } catch (error) {
        console.error('Erro ao criar notificação de orçamento pendente:', error);
    }
};

/**
 * Criar notificação de desvio orçamentário significativo
 */
exports.notificarDesvioOrcamentario = async (userId, orcamentoId, nomeOrcamento, percentualDesvio) => {
    try {
        const tipo = Math.abs(percentualDesvio) > 20 ? 'error' : 'warning';
        const prioridade = Math.abs(percentualDesvio) > 20 ? 4 : 2;

        await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, entidade_tipo,
                entidade_id, link_acao, prioridade, dados_extras
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                userId,
                'Desvio Orçamentário Detectado',
                `O orçamento "${nomeOrcamento}" apresenta um desvio de ${percentualDesvio.toFixed(1)}% em relação ao previsto.`,
                tipo,
                'desvio',
                'orcamento_parcial',
                orcamentoId,
                `/orcamentos-parciais`,
                prioridade,
                JSON.stringify({ percentual_desvio: percentualDesvio })
            ]
        );
    } catch (error) {
        console.error('Erro ao criar notificação de desvio:', error);
    }
};

/**
 * Criar notificação de cash flow negativo
 */
exports.notificarCashFlowNegativo = async (userId, exercicio, saldoFinal) => {
    try {
        await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, entidade_tipo,
                link_acao, prioridade, dados_extras
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                userId,
                'Cash Flow Negativo Detectado',
                `O cash flow do exercício ${exercicio} está negativo (${saldoFinal.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA). Atenção à liquidez!`,
                'error',
                'cash_flow',
                'cash_flow',
                `/cash-flow`,
                4,
                JSON.stringify({ saldo_final: saldoFinal, exercicio })
            ]
        );
    } catch (error) {
        console.error('Erro ao criar notificação de cash flow negativo:', error);
    }
};

/**
 * Criar notificação de indicador crítico
 */
exports.notificarIndicadorCritico = async (userId, nomeIndicador, valor, limiar) => {
    try {
        await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, link_acao, prioridade, dados_extras
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                userId,
                'Indicador Financeiro Crítico',
                `O indicador "${nomeIndicador}" atingiu valor crítico: ${valor.toFixed(2)} (limite: ${limiar.toFixed(2)}).`,
                'alert',
                'indicador',
                `/indicadores`,
                4,
                JSON.stringify({ indicador: nomeIndicador, valor, limiar })
            ]
        );
    } catch (error) {
        console.error('Erro ao criar notificação de indicador crítico:', error);
    }
};

/**
 * Criar notificação de objetivo alcançado
 */
exports.notificarObjetivoAlcancado = async (userId, objetivo, detalhes) => {
    try {
        await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, prioridade, dados_extras
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
                userId,
                'Objetivo Alcançado!',
                `Parabéns! ${objetivo}`,
                'success',
                'sistema',
                1,
                JSON.stringify({ detalhes })
            ]
        );
    } catch (error) {
        console.error('Erro ao criar notificação de objetivo:', error);
    }
};

/**
 * Criar notificação de prazo se aproximando
 */
exports.notificarPrazoAproximando = async (userId, entidadeTipo, entidadeId, nomePrazo, diasRestantes) => {
    try {
        const prioridade = diasRestantes <= 3 ? 4 : diasRestantes <= 7 ? 3 : 2;
        const tipo = diasRestantes <= 3 ? 'error' : 'warning';

        await pool.query(
            `INSERT INTO notificacoes (
                user_id, titulo, mensagem, tipo, categoria, entidade_tipo,
                entidade_id, prioridade, dados_extras
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
                userId,
                'Prazo se Aproximando',
                `${nomePrazo} termina em ${diasRestantes} dia(s).`,
                tipo,
                'prazo',
                entidadeTipo,
                entidadeId,
                prioridade,
                JSON.stringify({ dias_restantes: diasRestantes })
            ]
        );
    } catch (error) {
        console.error('Erro ao criar notificação de prazo:', error);
    }
};

module.exports = exports;
