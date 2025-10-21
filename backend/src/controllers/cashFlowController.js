const pool = require('../config/database');

/**
 * Controller para Cash Flow (Demonstração de Fluxo de Caixa)
 * Método Direto: Receitas e Pagamentos de Caixa
 * Classificação por Atividades: Operacional, Investimento, Financiamento
 */

/**
 * Salvar ou atualizar Cash Flow
 */
exports.saveCashFlow = async (req, res) => {
    const { user } = req;
    const {
        exercicio,
        // Atividades Operacionais
        recebimentos_clientes,
        pagamentos_fornecedores,
        pagamentos_pessoal,
        pagamentos_impostos,
        outros_recebimentos_operacionais,
        outros_pagamentos_operacionais,
        // Atividades de Investimento
        recebimentos_venda_ativos,
        pagamentos_aquisicao_ativos,
        recebimentos_juros_dividendos,
        outros_recebimentos_investimento,
        outros_pagamentos_investimento,
        // Atividades de Financiamento
        recebimentos_emprestimos,
        pagamentos_emprestimos,
        pagamentos_juros,
        pagamentos_dividendos,
        outros_recebimentos_financiamento,
        outros_pagamentos_financiamento,
        // Saldos
        saldo_inicial,
        saldo_final
    } = req.body;

    try {
        // Validações
        if (!exercicio) {
            return res.status(400).json({
                error: 'Exercício é obrigatório'
            });
        }

        // Verificar se já existe cash flow para este exercício
        const existingQuery = `
            SELECT id FROM cash_flow
            WHERE empresa_id = $1 AND exercicio = $2
        `;
        const existing = await pool.query(existingQuery, [user.empresa_id, exercicio]);

        let cashFlow;

        if (existing.rows.length > 0) {
            // Atualizar existente
            const updateQuery = `
                UPDATE cash_flow
                SET recebimentos_clientes = $1,
                    pagamentos_fornecedores = $2,
                    pagamentos_pessoal = $3,
                    pagamentos_impostos = $4,
                    outros_recebimentos_operacionais = $5,
                    outros_pagamentos_operacionais = $6,
                    recebimentos_venda_ativos = $7,
                    pagamentos_aquisicao_ativos = $8,
                    recebimentos_juros_dividendos = $9,
                    outros_recebimentos_investimento = $10,
                    outros_pagamentos_investimento = $11,
                    recebimentos_emprestimos = $12,
                    pagamentos_emprestimos = $13,
                    pagamentos_juros = $14,
                    pagamentos_dividendos = $15,
                    outros_recebimentos_financiamento = $16,
                    outros_pagamentos_financiamento = $17,
                    saldo_inicial = $18,
                    saldo_final = $19,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $20
                RETURNING *
            `;

            const result = await pool.query(updateQuery, [
                recebimentos_clientes || 0,
                pagamentos_fornecedores || 0,
                pagamentos_pessoal || 0,
                pagamentos_impostos || 0,
                outros_recebimentos_operacionais || 0,
                outros_pagamentos_operacionais || 0,
                recebimentos_venda_ativos || 0,
                pagamentos_aquisicao_ativos || 0,
                recebimentos_juros_dividendos || 0,
                outros_recebimentos_investimento || 0,
                outros_pagamentos_investimento || 0,
                recebimentos_emprestimos || 0,
                pagamentos_emprestimos || 0,
                pagamentos_juros || 0,
                pagamentos_dividendos || 0,
                outros_recebimentos_financiamento || 0,
                outros_pagamentos_financiamento || 0,
                saldo_inicial || 0,
                saldo_final || 0,
                existing.rows[0].id
            ]);

            cashFlow = result.rows[0];
        } else {
            // Inserir novo
            const insertQuery = `
                INSERT INTO cash_flow (
                    empresa_id, exercicio,
                    recebimentos_clientes, pagamentos_fornecedores, pagamentos_pessoal,
                    pagamentos_impostos, outros_recebimentos_operacionais, outros_pagamentos_operacionais,
                    recebimentos_venda_ativos, pagamentos_aquisicao_ativos, recebimentos_juros_dividendos,
                    outros_recebimentos_investimento, outros_pagamentos_investimento,
                    recebimentos_emprestimos, pagamentos_emprestimos, pagamentos_juros,
                    pagamentos_dividendos, outros_recebimentos_financiamento, outros_pagamentos_financiamento,
                    saldo_inicial, saldo_final
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
                RETURNING *
            `;

            const result = await pool.query(insertQuery, [
                user.empresa_id,
                exercicio,
                recebimentos_clientes || 0,
                pagamentos_fornecedores || 0,
                pagamentos_pessoal || 0,
                pagamentos_impostos || 0,
                outros_recebimentos_operacionais || 0,
                outros_pagamentos_operacionais || 0,
                recebimentos_venda_ativos || 0,
                pagamentos_aquisicao_ativos || 0,
                recebimentos_juros_dividendos || 0,
                outros_recebimentos_investimento || 0,
                outros_pagamentos_investimento || 0,
                recebimentos_emprestimos || 0,
                pagamentos_emprestimos || 0,
                pagamentos_juros || 0,
                pagamentos_dividendos || 0,
                outros_recebimentos_financiamento || 0,
                outros_pagamentos_financiamento || 0,
                saldo_inicial || 0,
                saldo_final || 0
            ]);

            cashFlow = result.rows[0];
        }

        res.json({
            message: 'Cash Flow salvo com sucesso',
            cash_flow: cashFlow
        });

    } catch (error) {
        console.error('Erro ao salvar cash flow:', error);
        res.status(500).json({
            error: 'Erro ao salvar cash flow',
            details: error.message
        });
    }
};

/**
 * Obter Cash Flow de um exercício
 */
exports.getCashFlow = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        const query = `
            SELECT * FROM cash_flow
            WHERE empresa_id = $1 AND exercicio = $2
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cash Flow não encontrado para este exercício'
            });
        }

        res.json({
            cash_flow: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao buscar cash flow:', error);
        res.status(500).json({
            error: 'Erro ao buscar cash flow',
            details: error.message
        });
    }
};

/**
 * Listar todos os Cash Flows
 */
exports.listCashFlows = async (req, res) => {
    const { user } = req;

    try {
        const query = `
            SELECT * FROM cash_flow
            WHERE empresa_id = $1
            ORDER BY exercicio DESC
        `;

        const result = await pool.query(query, [user.empresa_id]);

        res.json({
            cash_flows: result.rows
        });

    } catch (error) {
        console.error('Erro ao listar cash flows:', error);
        res.status(500).json({
            error: 'Erro ao listar cash flows',
            details: error.message
        });
    }
};

/**
 * Gerar Cash Flow automaticamente a partir da Tesouraria
 */
exports.gerarAutomatico = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        // Buscar dados da tesouraria mensal
        const tesourariaQuery = `
            SELECT
                SUM(vendas_recebimentos) as total_recebimentos_clientes,
                SUM(fornecedores_pagamentos) as total_pagamentos_fornecedores,
                SUM(salarios_encargos) as total_pagamentos_pessoal,
                SUM(impostos_taxas) as total_pagamentos_impostos,
                SUM(emprestimos_obtidos) as total_recebimentos_emprestimos,
                SUM(emprestimos_pagamentos) as total_pagamentos_emprestimos,
                SUM(investimentos) as total_pagamentos_investimento,
                MIN(saldo_inicial) as saldo_inicial_ano,
                MAX(saldo_final) as saldo_final_ano
            FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2
        `;

        const tesourariaResult = await pool.query(tesourariaQuery, [user.empresa_id, exercicio]);

        if (tesourariaResult.rows.length === 0 || !tesourariaResult.rows[0].total_recebimentos_clientes) {
            return res.status(404).json({
                error: 'Nenhum dado de tesouraria encontrado para gerar Cash Flow',
                message: 'Por favor, preencha a Tesouraria Mensal primeiro'
            });
        }

        const tesouraria = tesourariaResult.rows[0];

        // Criar cash flow com dados da tesouraria
        const cashFlowData = {
            // Operacionais
            recebimentos_clientes: parseFloat(tesouraria.total_recebimentos_clientes) || 0,
            pagamentos_fornecedores: parseFloat(tesouraria.total_pagamentos_fornecedores) || 0,
            pagamentos_pessoal: parseFloat(tesouraria.total_pagamentos_pessoal) || 0,
            pagamentos_impostos: parseFloat(tesouraria.total_pagamentos_impostos) || 0,
            outros_recebimentos_operacionais: 0,
            outros_pagamentos_operacionais: 0,

            // Investimento
            recebimentos_venda_ativos: 0,
            pagamentos_aquisicao_ativos: parseFloat(tesouraria.total_pagamentos_investimento) || 0,
            recebimentos_juros_dividendos: 0,
            outros_recebimentos_investimento: 0,
            outros_pagamentos_investimento: 0,

            // Financiamento
            recebimentos_emprestimos: parseFloat(tesouraria.total_recebimentos_emprestimos) || 0,
            pagamentos_emprestimos: parseFloat(tesouraria.total_pagamentos_emprestimos) || 0,
            pagamentos_juros: 0,
            pagamentos_dividendos: 0,
            outros_recebimentos_financiamento: 0,
            outros_pagamentos_financiamento: 0,

            // Saldos
            saldo_inicial: parseFloat(tesouraria.saldo_inicial_ano) || 0,
            saldo_final: parseFloat(tesouraria.saldo_final_ano) || 0
        };

        // Salvar usando o método saveCashFlow
        req.body = {
            exercicio,
            ...cashFlowData
        };

        return this.saveCashFlow(req, res);

    } catch (error) {
        console.error('Erro ao gerar cash flow automático:', error);
        res.status(500).json({
            error: 'Erro ao gerar cash flow automático',
            details: error.message
        });
    }
};

/**
 * Obter análise do Cash Flow
 */
exports.getAnalise = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        const query = `
            SELECT * FROM cash_flow
            WHERE empresa_id = $1 AND exercicio = $2
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cash Flow não encontrado'
            });
        }

        const cf = result.rows[0];

        // Calcular totais por atividade
        const fluxoOperacional =
            parseFloat(cf.recebimentos_clientes || 0) +
            parseFloat(cf.outros_recebimentos_operacionais || 0) -
            parseFloat(cf.pagamentos_fornecedores || 0) -
            parseFloat(cf.pagamentos_pessoal || 0) -
            parseFloat(cf.pagamentos_impostos || 0) -
            parseFloat(cf.outros_pagamentos_operacionais || 0);

        const fluxoInvestimento =
            parseFloat(cf.recebimentos_venda_ativos || 0) +
            parseFloat(cf.recebimentos_juros_dividendos || 0) +
            parseFloat(cf.outros_recebimentos_investimento || 0) -
            parseFloat(cf.pagamentos_aquisicao_ativos || 0) -
            parseFloat(cf.outros_pagamentos_investimento || 0);

        const fluxoFinanciamento =
            parseFloat(cf.recebimentos_emprestimos || 0) +
            parseFloat(cf.outros_recebimentos_financiamento || 0) -
            parseFloat(cf.pagamentos_emprestimos || 0) -
            parseFloat(cf.pagamentos_juros || 0) -
            parseFloat(cf.pagamentos_dividendos || 0) -
            parseFloat(cf.outros_pagamentos_financiamento || 0);

        const variacaoCaixa = fluxoOperacional + fluxoInvestimento + fluxoFinanciamento;
        const saldoFinalCalculado = parseFloat(cf.saldo_inicial || 0) + variacaoCaixa;

        // Análise de saúde
        const analise = {
            fluxo_operacional: fluxoOperacional,
            fluxo_investimento: fluxoInvestimento,
            fluxo_financiamento: fluxoFinanciamento,
            variacao_caixa: variacaoCaixa,
            saldo_inicial: parseFloat(cf.saldo_inicial || 0),
            saldo_final_calculado: saldoFinalCalculado,
            saldo_final_registrado: parseFloat(cf.saldo_final || 0),
            diferenca_reconciliacao: Math.abs(saldoFinalCalculado - parseFloat(cf.saldo_final || 0)),

            // Classificações
            saude_operacional: fluxoOperacional > 0 ? 'positivo' : 'negativo',
            dependencia_financiamento: fluxoFinanciamento > Math.abs(fluxoOperacional) ? 'alta' : 'baixa',
            atividade_investimento: fluxoInvestimento < 0 ? 'expansao' : 'desinvestimento',

            // Indicadores
            percentual_operacional: variacaoCaixa !== 0 ?
                parseFloat(((fluxoOperacional / Math.abs(variacaoCaixa)) * 100).toFixed(2)) : 0,
            percentual_investimento: variacaoCaixa !== 0 ?
                parseFloat(((fluxoInvestimento / Math.abs(variacaoCaixa)) * 100).toFixed(2)) : 0,
            percentual_financiamento: variacaoCaixa !== 0 ?
                parseFloat(((fluxoFinanciamento / Math.abs(variacaoCaixa)) * 100).toFixed(2)) : 0
        };

        // Recomendações
        const recomendacoes = [];

        if (fluxoOperacional < 0) {
            recomendacoes.push('Fluxo operacional negativo: avaliar eficiência operacional e gestão de recebimentos');
        }

        if (fluxoFinanciamento > 0 && fluxoOperacional < 0) {
            recomendacoes.push('Dependência de financiamento externo: fortalecer geração de caixa operacional');
        }

        if (fluxoInvestimento < 0 && fluxoInvestimento < fluxoOperacional) {
            recomendacoes.push('Investimentos superiores à geração operacional: monitorar sustentabilidade');
        }

        if (variacaoCaixa < 0) {
            recomendacoes.push('Redução de caixa no período: implementar plano de geração de caixa');
        }

        res.json({
            exercicio: parseInt(exercicio),
            analise,
            recomendacoes,
            gerado_em: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao gerar análise:', error);
        res.status(500).json({
            error: 'Erro ao gerar análise de cash flow',
            details: error.message
        });
    }
};

/**
 * Deletar Cash Flow
 */
exports.deleteCashFlow = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        const query = `
            DELETE FROM cash_flow
            WHERE empresa_id = $1 AND exercicio = $2
            RETURNING *
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: 'Cash Flow não encontrado'
            });
        }

        res.json({
            message: 'Cash Flow deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar cash flow:', error);
        res.status(500).json({
            error: 'Erro ao deletar cash flow',
            details: error.message
        });
    }
};
