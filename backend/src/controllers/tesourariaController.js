const pool = require('../config/database');

/**
 * Controller para Tesouraria Mensal
 * Gestão do plano de tesouraria com receitas e despesas mensais
 */

/**
 * Salvar ou atualizar tesouraria mensal
 */
exports.saveTesouraria = async (req, res) => {
    const { user } = req;
    const {
        exercicio,
        mes,
        saldo_inicial,
        // Receitas
        vendas_recebimentos,
        emprestimos_obtidos,
        subsidios_recebidos,
        outras_receitas,
        // Despesas
        fornecedores_pagamentos,
        salarios_encargos,
        impostos_taxas,
        emprestimos_pagamentos,
        investimentos,
        outras_despesas
    } = req.body;

    try {
        // Validações
        if (!exercicio || !mes) {
            return res.status(400).json({
                error: 'Exercício e mês são obrigatórios'
            });
        }

        if (mes < 1 || mes > 12) {
            return res.status(400).json({
                error: 'Mês deve estar entre 1 e 12'
            });
        }

        // Verificar se já existe tesouraria para este mês/exercício
        const existingQuery = `
            SELECT id FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2 AND mes = $3
        `;
        const existing = await pool.query(existingQuery, [user.empresa_id, exercicio, mes]);

        let tesouraria;

        if (existing.rows.length > 0) {
            // Atualizar existente
            const updateQuery = `
                UPDATE tesouraria_mensal
                SET saldo_inicial = $1,
                    vendas_recebimentos = $2,
                    emprestimos_obtidos = $3,
                    subsidios_recebidos = $4,
                    outras_receitas = $5,
                    fornecedores_pagamentos = $6,
                    salarios_encargos = $7,
                    impostos_taxas = $8,
                    emprestimos_pagamentos = $9,
                    investimentos = $10,
                    outras_despesas = $11,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $12
                RETURNING *
            `;

            const result = await pool.query(updateQuery, [
                saldo_inicial || 0,
                vendas_recebimentos || 0,
                emprestimos_obtidos || 0,
                subsidios_recebidos || 0,
                outras_receitas || 0,
                fornecedores_pagamentos || 0,
                salarios_encargos || 0,
                impostos_taxas || 0,
                emprestimos_pagamentos || 0,
                investimentos || 0,
                outras_despesas || 0,
                existing.rows[0].id
            ]);

            tesouraria = result.rows[0];
        } else {
            // Inserir nova
            const insertQuery = `
                INSERT INTO tesouraria_mensal (
                    empresa_id, exercicio, mes, saldo_inicial,
                    vendas_recebimentos, emprestimos_obtidos, subsidios_recebidos, outras_receitas,
                    fornecedores_pagamentos, salarios_encargos, impostos_taxas, emprestimos_pagamentos,
                    investimentos, outras_despesas
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
                RETURNING *
            `;

            const result = await pool.query(insertQuery, [
                user.empresa_id,
                exercicio,
                mes,
                saldo_inicial || 0,
                vendas_recebimentos || 0,
                emprestimos_obtidos || 0,
                subsidios_recebidos || 0,
                outras_receitas || 0,
                fornecedores_pagamentos || 0,
                salarios_encargos || 0,
                impostos_taxas || 0,
                emprestimos_pagamentos || 0,
                investimentos || 0,
                outras_despesas || 0
            ]);

            tesouraria = result.rows[0];
        }

        res.json({
            message: 'Tesouraria mensal salva com sucesso',
            tesouraria
        });

    } catch (error) {
        console.error('Erro ao salvar tesouraria:', error);
        res.status(500).json({
            error: 'Erro ao salvar tesouraria mensal',
            details: error.message
        });
    }
};

/**
 * Obter tesouraria de um mês específico
 */
exports.getTesouraria = async (req, res) => {
    const { user } = req;
    const { exercicio, mes } = req.params;

    try {
        const query = `
            SELECT * FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2 AND mes = $3
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio, mes]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Tesouraria não encontrada para este mês'
            });
        }

        res.json({
            tesouraria: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar tesouraria:', error);
        res.status(500).json({
            error: 'Erro ao buscar tesouraria mensal',
            details: error.message
        });
    }
};

/**
 * Listar tesourarias de um exercício completo
 */
exports.listTesouraria = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        const query = `
            SELECT * FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2
            ORDER BY mes ASC
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio]);

        // Criar array de 12 meses com dados ou valores zerados
        const meses = [];
        for (let i = 1; i <= 12; i++) {
            const mesData = result.rows.find(row => row.mes === i);

            if (mesData) {
                meses.push(mesData);
            } else {
                // Mês sem dados - criar estrutura vazia
                meses.push({
                    mes: i,
                    exercicio: parseInt(exercicio),
                    saldo_inicial: 0,
                    vendas_recebimentos: 0,
                    emprestimos_obtidos: 0,
                    subsidios_recebidos: 0,
                    outras_receitas: 0,
                    total_receitas: 0,
                    fornecedores_pagamentos: 0,
                    salarios_encargos: 0,
                    impostos_taxas: 0,
                    emprestimos_pagamentos: 0,
                    investimentos: 0,
                    outras_despesas: 0,
                    total_despesas: 0,
                    saldo_final: 0
                });
            }
        }

        res.json({
            exercicio: parseInt(exercicio),
            meses
        });

    } catch (error) {
        console.error('Erro ao listar tesouraria:', error);
        res.status(500).json({
            error: 'Erro ao listar tesouraria mensal',
            details: error.message
        });
    }
};

/**
 * Deletar tesouraria de um mês
 */
exports.deleteTesouraria = async (req, res) => {
    const { user } = req;
    const { exercicio, mes } = req.params;

    try {
        const query = `
            DELETE FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2 AND mes = $3
            RETURNING *
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio, mes]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Tesouraria não encontrada'
            });
        }

        res.json({
            message: 'Tesouraria deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar tesouraria:', error);
        res.status(500).json({
            error: 'Erro ao deletar tesouraria',
            details: error.message
        });
    }
};

/**
 * Obter resumo anual da tesouraria
 */
exports.getResumoAnual = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        const query = `
            SELECT
                SUM(total_receitas) as total_receitas_ano,
                SUM(total_despesas) as total_despesas_ano,
                AVG(saldo_final) as saldo_medio,
                MIN(saldo_final) as saldo_minimo,
                MAX(saldo_final) as saldo_maximo
            FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio]);

        res.json({
            exercicio: parseInt(exercicio),
            resumo: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao gerar resumo:', error);
        res.status(500).json({
            error: 'Erro ao gerar resumo anual',
            details: error.message
        });
    }
};
