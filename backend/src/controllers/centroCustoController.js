const pool = require('../../config/database');

/**
 * =====================================================
 * GESTÃO DE CENTROS DE CUSTO
 * =====================================================
 */

/**
 * Salvar/Atualizar Centro de Custo
 */
exports.saveCentroCusto = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            id,
            codigo,
            nome,
            descricao,
            tipo,
            centro_pai_id,
            classificacao,
            responsavel,
            orcamento_anual,
            exercicio,
            ativo,
            data_inicio,
            data_fim
        } = req.body;

        let query, values, result;

        if (id) {
            // Atualizar
            query = `
                UPDATE centros_custo SET
                    codigo = $1,
                    nome = $2,
                    descricao = $3,
                    tipo = $4,
                    centro_pai_id = $5,
                    classificacao = $6,
                    responsavel = $7,
                    orcamento_anual = $8,
                    exercicio = $9,
                    ativo = $10,
                    data_inicio = $11,
                    data_fim = $12
                WHERE id = $13 AND user_id = $14
                RETURNING *
            `;

            values = [
                codigo, nome, descricao, tipo, centro_pai_id || null,
                classificacao, responsavel, orcamento_anual || 0, exercicio,
                ativo !== undefined ? ativo : true, data_inicio, data_fim,
                id, userId
            ];

            result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Centro de custo não encontrado' });
            }

        } else {
            // Criar
            query = `
                INSERT INTO centros_custo (
                    user_id, codigo, nome, descricao, tipo, centro_pai_id,
                    classificacao, responsavel, orcamento_anual, exercicio,
                    ativo, data_inicio, data_fim
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;

            values = [
                userId, codigo, nome, descricao, tipo, centro_pai_id || null,
                classificacao, responsavel, orcamento_anual || 0, exercicio,
                ativo !== undefined ? ativo : true, data_inicio, data_fim
            ];

            result = await pool.query(query, values);
        }

        res.status(200).json({
            message: id ? 'Centro de custo atualizado com sucesso' : 'Centro de custo criado com sucesso',
            centro_custo: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao salvar centro de custo:', error);
        if (error.code === '23505') {
            return res.status(400).json({ error: 'Código já existe para este exercício' });
        }
        res.status(500).json({ error: 'Erro ao salvar centro de custo' });
    }
};

/**
 * Listar Centros de Custo
 */
exports.listCentrosCusto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio, tipo, ativo } = req.query;

        let query = 'SELECT * FROM centros_custo WHERE user_id = $1';
        const values = [userId];
        let paramCount = 1;

        if (exercicio) {
            paramCount++;
            query += ` AND exercicio = $${paramCount}`;
            values.push(exercicio);
        }

        if (tipo) {
            paramCount++;
            query += ` AND tipo = $${paramCount}`;
            values.push(tipo);
        }

        if (ativo !== undefined) {
            paramCount++;
            query += ` AND ativo = $${paramCount}`;
            values.push(ativo === 'true');
        }

        query += ' ORDER BY codigo ASC';

        const result = await pool.query(query, values);

        res.status(200).json({
            centros: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao listar centros de custo:', error);
        res.status(500).json({ error: 'Erro ao listar centros de custo' });
    }
};

/**
 * Obter Centro de Custo Específico
 */
exports.getCentroCusto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM centros_custo WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Centro de custo não encontrado' });
        }

        res.status(200).json({
            centro_custo: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao obter centro de custo:', error);
        res.status(500).json({ error: 'Erro ao obter centro de custo' });
    }
};

/**
 * Deletar Centro de Custo
 */
exports.deleteCentroCusto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM centros_custo WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Centro de custo não encontrado' });
        }

        res.status(200).json({
            message: 'Centro de custo deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar centro de custo:', error);
        res.status(500).json({ error: 'Erro ao deletar centro de custo' });
    }
};

/**
 * =====================================================
 * GESTÃO DE LANÇAMENTOS DE CUSTO
 * =====================================================
 */

/**
 * Salvar Lançamento de Custo
 */
exports.saveLancamento = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            id,
            centro_custo_id,
            data_lancamento,
            exercicio,
            mes,
            documento,
            descricao,
            tipo_custo,
            categoria,
            subcategoria,
            valor,
            quantidade,
            unidade,
            valor_unitario,
            fornecedor,
            conta_contabil,
            observacoes
        } = req.body;

        let query, values, result;

        if (id) {
            // Atualizar
            query = `
                UPDATE lancamentos_custo SET
                    centro_custo_id = $1,
                    data_lancamento = $2,
                    exercicio = $3,
                    mes = $4,
                    documento = $5,
                    descricao = $6,
                    tipo_custo = $7,
                    categoria = $8,
                    subcategoria = $9,
                    valor = $10,
                    quantidade = $11,
                    unidade = $12,
                    valor_unitario = $13,
                    fornecedor = $14,
                    conta_contabil = $15,
                    observacoes = $16
                WHERE id = $17 AND user_id = $18
                RETURNING *
            `;

            values = [
                centro_custo_id, data_lancamento, exercicio, mes, documento,
                descricao, tipo_custo, categoria, subcategoria, valor,
                quantidade, unidade, valor_unitario, fornecedor, conta_contabil,
                observacoes, id, userId
            ];

            result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Lançamento não encontrado' });
            }

        } else {
            // Criar
            query = `
                INSERT INTO lancamentos_custo (
                    user_id, centro_custo_id, data_lancamento, exercicio, mes,
                    documento, descricao, tipo_custo, categoria, subcategoria,
                    valor, quantidade, unidade, valor_unitario, fornecedor,
                    conta_contabil, observacoes
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING *
            `;

            values = [
                userId, centro_custo_id, data_lancamento, exercicio, mes,
                documento, descricao, tipo_custo, categoria, subcategoria,
                valor, quantidade, unidade, valor_unitario, fornecedor,
                conta_contabil, observacoes
            ];

            result = await pool.query(query, values);
        }

        res.status(200).json({
            message: id ? 'Lançamento atualizado com sucesso' : 'Lançamento criado com sucesso',
            lancamento: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao salvar lançamento:', error);
        res.status(500).json({ error: 'Erro ao salvar lançamento' });
    }
};

/**
 * Listar Lançamentos de Custo
 */
exports.listLancamentos = async (req, res) => {
    try {
        const userId = req.user.id;
        const { centro_custo_id, exercicio, mes, tipo_custo, categoria } = req.query;

        let query = `
            SELECT l.*, c.codigo AS centro_codigo, c.nome AS centro_nome
            FROM lancamentos_custo l
            INNER JOIN centros_custo c ON l.centro_custo_id = c.id
            WHERE l.user_id = $1
        `;
        const values = [userId];
        let paramCount = 1;

        if (centro_custo_id) {
            paramCount++;
            query += ` AND l.centro_custo_id = $${paramCount}`;
            values.push(centro_custo_id);
        }

        if (exercicio) {
            paramCount++;
            query += ` AND l.exercicio = $${paramCount}`;
            values.push(exercicio);
        }

        if (mes) {
            paramCount++;
            query += ` AND l.mes = $${paramCount}`;
            values.push(mes);
        }

        if (tipo_custo) {
            paramCount++;
            query += ` AND l.tipo_custo = $${paramCount}`;
            values.push(tipo_custo);
        }

        if (categoria) {
            paramCount++;
            query += ` AND l.categoria = $${paramCount}`;
            values.push(categoria);
        }

        query += ' ORDER BY l.data_lancamento DESC, l.id DESC';

        const result = await pool.query(query, values);

        res.status(200).json({
            lancamentos: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao listar lançamentos:', error);
        res.status(500).json({ error: 'Erro ao listar lançamentos' });
    }
};

/**
 * Deletar Lançamento
 */
exports.deleteLancamento = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM lancamentos_custo WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Lançamento não encontrado' });
        }

        res.status(200).json({
            message: 'Lançamento deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar lançamento:', error);
        res.status(500).json({ error: 'Erro ao deletar lançamento' });
    }
};

/**
 * =====================================================
 * ANÁLISES E RELATÓRIOS
 * =====================================================
 */

/**
 * Obter Custos por Centro (Resumo Mensal)
 */
exports.getCustosPorCentroMes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio, mes } = req.query;

        if (!exercicio || !mes) {
            return res.status(400).json({ error: 'Exercício e mês são obrigatórios' });
        }

        const query = `
            SELECT * FROM vw_custos_por_centro_mes
            WHERE centro_custo_id IN (
                SELECT id FROM centros_custo WHERE user_id = $1
            )
            AND exercicio = $2
            AND mes = $3
            ORDER BY total_custo DESC
        `;

        const result = await pool.query(query, [userId, exercicio, mes]);

        res.status(200).json({
            custos: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter custos por centro:', error);
        res.status(500).json({ error: 'Erro ao obter custos por centro' });
    }
};

/**
 * Obter Custos por Centro (Resumo Anual)
 */
exports.getCustosPorCentroAno = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.query;

        if (!exercicio) {
            return res.status(400).json({ error: 'Exercício é obrigatório' });
        }

        const query = `
            SELECT * FROM vw_custos_por_centro_ano
            WHERE centro_custo_id IN (
                SELECT id FROM centros_custo WHERE user_id = $1
            )
            AND exercicio = $2
            ORDER BY total_custo DESC
        `;

        const result = await pool.query(query, [userId, exercicio]);

        res.status(200).json({
            custos: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter custos por centro:', error);
        res.status(500).json({ error: 'Erro ao obter custos por centro' });
    }
};

/**
 * Obter Custos por Categoria
 */
exports.getCustosPorCategoria = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio, mes } = req.query;

        let query = `
            SELECT * FROM vw_custos_por_categoria
            WHERE exercicio IN (
                SELECT DISTINCT exercicio FROM lancamentos_custo WHERE user_id = $1
            )
        `;

        const values = [userId];
        let paramCount = 1;

        if (exercicio) {
            paramCount++;
            query += ` AND exercicio = $${paramCount}`;
            values.push(exercicio);
        }

        if (mes) {
            paramCount++;
            query += ` AND mes = $${paramCount}`;
            values.push(mes);
        }

        query += ' ORDER BY exercicio DESC, mes DESC, total_custo DESC';

        const result = await pool.query(query, values);

        res.status(200).json({
            custos: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter custos por categoria:', error);
        res.status(500).json({ error: 'Erro ao obter custos por categoria' });
    }
};

/**
 * Obter Ranking de Centros de Custo
 */
exports.getRanking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.query;

        if (!exercicio) {
            return res.status(400).json({ error: 'Exercício é obrigatório' });
        }

        const query = `
            SELECT * FROM vw_ranking_centros_custo
            WHERE centro_custo_id IN (
                SELECT id FROM centros_custo WHERE user_id = $1
            )
            AND exercicio = $2
            ORDER BY posicao ASC
        `;

        const result = await pool.query(query, [userId, exercicio]);

        res.status(200).json({
            ranking: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter ranking:', error);
        res.status(500).json({ error: 'Erro ao obter ranking' });
    }
};

/**
 * Comparar Centros de Custo
 */
exports.compararCentros = async (req, res) => {
    try {
        const userId = req.user.id;
        const { centros_ids, exercicio } = req.query;

        if (!centros_ids || !exercicio) {
            return res.status(400).json({ error: 'IDs dos centros e exercício são obrigatórios' });
        }

        const idsArray = centros_ids.split(',').map(id => parseInt(id));

        const query = `
            SELECT
                cc.id,
                cc.codigo,
                cc.nome,
                cc.tipo,
                cc.orcamento_anual,
                COALESCE(SUM(lc.valor), 0) AS total_custo,
                COALESCE(SUM(CASE WHEN lc.tipo_custo = 'direto' THEN lc.valor ELSE 0 END), 0) AS custo_direto,
                COALESCE(SUM(CASE WHEN lc.tipo_custo = 'indireto' THEN lc.valor ELSE 0 END), 0) AS custo_indireto,
                COALESCE(SUM(CASE WHEN lc.tipo_custo = 'fixo' THEN lc.valor ELSE 0 END), 0) AS custo_fixo,
                COALESCE(SUM(CASE WHEN lc.tipo_custo = 'variavel' THEN lc.valor ELSE 0 END), 0) AS custo_variavel
            FROM centros_custo cc
            LEFT JOIN lancamentos_custo lc ON cc.id = lc.centro_custo_id AND lc.exercicio = $2
            WHERE cc.id = ANY($1) AND cc.user_id = $3
            GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.orcamento_anual
            ORDER BY total_custo DESC
        `;

        const result = await pool.query(query, [idsArray, exercicio, userId]);

        res.status(200).json({
            comparacao: result.rows
        });

    } catch (error) {
        console.error('Erro ao comparar centros:', error);
        res.status(500).json({ error: 'Erro ao comparar centros' });
    }
};

/**
 * Dashboard de Custos
 */
exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.query;

        if (!exercicio) {
            return res.status(400).json({ error: 'Exercício é obrigatório' });
        }

        // Total de centros de custo
        const totalCentros = await pool.query(
            'SELECT COUNT(*) as total FROM centros_custo WHERE user_id = $1 AND exercicio = $2 AND ativo = TRUE',
            [userId, exercicio]
        );

        // Total de lançamentos
        const totalLancamentos = await pool.query(
            'SELECT COUNT(*) as total, SUM(valor) as soma FROM lancamentos_custo WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        // Custos por tipo
        const custosPorTipo = await pool.query(`
            SELECT tipo_custo, SUM(valor) as total
            FROM lancamentos_custo
            WHERE user_id = $1 AND exercicio = $2
            GROUP BY tipo_custo
        `, [userId, exercicio]);

        // Evolução mensal
        const evolucaoMensal = await pool.query(`
            SELECT mes, SUM(valor) as total
            FROM lancamentos_custo
            WHERE user_id = $1 AND exercicio = $2
            GROUP BY mes
            ORDER BY mes ASC
        `, [userId, exercicio]);

        // Top 5 centros de custo
        const top5Centros = await pool.query(`
            SELECT
                cc.codigo,
                cc.nome,
                SUM(lc.valor) as total_custo
            FROM centros_custo cc
            INNER JOIN lancamentos_custo lc ON cc.id = lc.centro_custo_id
            WHERE cc.user_id = $1 AND lc.exercicio = $2
            GROUP BY cc.id, cc.codigo, cc.nome
            ORDER BY total_custo DESC
            LIMIT 5
        `, [userId, exercicio]);

        // Top 5 categorias
        const top5Categorias = await pool.query(`
            SELECT categoria, SUM(valor) as total
            FROM lancamentos_custo
            WHERE user_id = $1 AND exercicio = $2 AND categoria IS NOT NULL
            GROUP BY categoria
            ORDER BY total DESC
            LIMIT 5
        `, [userId, exercicio]);

        res.status(200).json({
            total_centros: parseInt(totalCentros.rows[0].total),
            total_lancamentos: parseInt(totalLancamentos.rows[0].total),
            total_custo: parseFloat(totalLancamentos.rows[0].soma || 0),
            custos_por_tipo: custosPorTipo.rows,
            evolucao_mensal: evolucaoMensal.rows,
            top5_centros: top5Centros.rows,
            top5_categorias: top5Categorias.rows
        });

    } catch (error) {
        console.error('Erro ao obter dashboard:', error);
        res.status(500).json({ error: 'Erro ao obter dashboard' });
    }
};

/**
 * =====================================================
 * RATEIO DE CUSTOS
 * =====================================================
 */

/**
 * Criar Rateio de Custo
 */
exports.createRateio = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userId = req.user.id;
        const {
            descricao,
            exercicio,
            mes,
            data_rateio,
            valor_total,
            tipo_custo,
            categoria,
            criterio_rateio,
            base_calculo,
            detalhes // Array de { centro_custo_id, percentual, base_calculo_valor }
        } = req.body;

        // Validar que os percentuais somam 100
        const somaPercentuais = detalhes.reduce((sum, d) => sum + parseFloat(d.percentual), 0);
        if (Math.abs(somaPercentuais - 100) > 0.01) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'A soma dos percentuais deve ser 100%' });
        }

        // Criar rateio
        const rateioResult = await client.query(`
            INSERT INTO rateios_custo (
                user_id, descricao, exercicio, mes, data_rateio,
                valor_total, tipo_custo, categoria, criterio_rateio, base_calculo
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `, [
            userId, descricao, exercicio, mes, data_rateio,
            valor_total, tipo_custo, categoria, criterio_rateio, base_calculo
        ]);

        const rateioId = rateioResult.rows[0].id;

        // Criar detalhes e lançamentos
        for (const detalhe of detalhes) {
            const valor_rateado = (parseFloat(valor_total) * parseFloat(detalhe.percentual)) / 100;

            // Inserir detalhe
            const detalheResult = await client.query(`
                INSERT INTO rateios_custo_detalhes (
                    rateio_id, centro_custo_id, percentual, valor_rateado, base_calculo_valor
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `, [rateioId, detalhe.centro_custo_id, detalhe.percentual, valor_rateado, detalhe.base_calculo_valor]);

            // Criar lançamento de custo
            const lancamentoResult = await client.query(`
                INSERT INTO lancamentos_custo (
                    user_id, centro_custo_id, data_lancamento, exercicio, mes,
                    descricao, tipo_custo, categoria, valor, percentual_rateio, lancamento_original_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NULL)
                RETURNING *
            `, [
                userId, detalhe.centro_custo_id, data_rateio, exercicio, mes,
                `[RATEIO] ${descricao}`, tipo_custo, categoria, valor_rateado, detalhe.percentual
            ]);

            // Atualizar detalhe com o ID do lançamento
            await client.query(
                'UPDATE rateios_custo_detalhes SET lancamento_id = $1 WHERE id = $2',
                [lancamentoResult.rows[0].id, detalheResult.rows[0].id]
            );
        }

        // Marcar rateio como aplicado
        await client.query(
            'UPDATE rateios_custo SET status = $1 WHERE id = $2',
            ['aplicado', rateioId]
        );

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Rateio criado e aplicado com sucesso',
            rateio: rateioResult.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao criar rateio:', error);
        res.status(500).json({ error: 'Erro ao criar rateio' });
    } finally {
        client.release();
    }
};

/**
 * Listar Rateios
 */
exports.listRateios = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio, mes, status } = req.query;

        let query = 'SELECT * FROM rateios_custo WHERE user_id = $1';
        const values = [userId];
        let paramCount = 1;

        if (exercicio) {
            paramCount++;
            query += ` AND exercicio = $${paramCount}`;
            values.push(exercicio);
        }

        if (mes) {
            paramCount++;
            query += ` AND mes = $${paramCount}`;
            values.push(mes);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            values.push(status);
        }

        query += ' ORDER BY data_rateio DESC';

        const result = await pool.query(query, values);

        res.status(200).json({
            rateios: result.rows
        });

    } catch (error) {
        console.error('Erro ao listar rateios:', error);
        res.status(500).json({ error: 'Erro ao listar rateios' });
    }
};

/**
 * Obter Detalhes do Rateio
 */
exports.getRateioDetalhes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Buscar rateio
        const rateioResult = await pool.query(
            'SELECT * FROM rateios_custo WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (rateioResult.rows.length === 0) {
            return res.status(404).json({ error: 'Rateio não encontrado' });
        }

        // Buscar detalhes
        const detalhesResult = await pool.query(`
            SELECT
                rd.*,
                cc.codigo AS centro_codigo,
                cc.nome AS centro_nome
            FROM rateios_custo_detalhes rd
            INNER JOIN centros_custo cc ON rd.centro_custo_id = cc.id
            WHERE rd.rateio_id = $1
            ORDER BY rd.valor_rateado DESC
        `, [id]);

        res.status(200).json({
            rateio: rateioResult.rows[0],
            detalhes: detalhesResult.rows
        });

    } catch (error) {
        console.error('Erro ao obter detalhes do rateio:', error);
        res.status(500).json({ error: 'Erro ao obter detalhes do rateio' });
    }
};
