const pool = require('../config/database');

/**
 * Controller para Balanço de Execução
 * Comparação entre Previsto (planeado) vs Realizado (executado)
 */

/**
 * Obter comparação Previsto vs Realizado para um exercício
 */
exports.getComparacao = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        // 1. Obter dados PREVISTOS da DR
        const drQuery = `
            SELECT * FROM demonstracao_resultados
            WHERE empresa_id = $1 AND exercicio = $2
        `;
        const drResult = await pool.query(drQuery, [user.empresa_id, exercicio]);

        // 2. Obter dados REALIZADOS dos documentos aplicados
        const docQuery = `
            SELECT
                categoria_pgc,
                SUM(valor) as total_realizado,
                COUNT(*) as num_documentos
            FROM documentos
            WHERE empresa_id = $1
            AND EXTRACT(YEAR FROM data_documento) = $2
            AND status = 'validado'
            GROUP BY categoria_pgc
        `;
        const docResult = await pool.query(docQuery, [user.empresa_id, exercicio]);

        // 3. Mapear documentos por categoria
        const realizadoPorCategoria = {};
        docResult.rows.forEach(row => {
            realizadoPorCategoria[row.categoria_pgc] = {
                valor: parseFloat(row.total_realizado),
                documentos: parseInt(row.num_documentos)
            };
        });

        // 4. Se não houver DR prevista, retornar apenas realizados
        if (drResult.rows.length === 0) {
            return res.json({
                exercicio: parseInt(exercicio),
                previsto: null,
                realizado: realizadoPorCategoria,
                comparacao: null,
                message: 'Não existe DR prevista para este exercício'
            });
        }

        const dr = drResult.rows[0];

        // 5. Mapear campos da DR para categorias PGC-AO
        const mapeamentoCategoriaDR = {
            // Receitas/Proveitos
            'vendas_oleo_sesamo': '71 - Vendas',
            'vendas_torta_sesamo': '71 - Vendas',
            'vendas_graos_sesamo': '71 - Vendas',
            'vendas_mel': '71 - Vendas',
            'vendas_carne_bovina': '71 - Vendas',
            'vendas_carne_suina': '71 - Vendas',
            'vendas_carne_caprina': '71 - Vendas',
            'vendas_enchidos': '71 - Vendas',
            'vendas_toucinho': '71 - Vendas',
            'vendas_leite': '71 - Vendas',
            'vendas_queijos': '71 - Vendas',
            'vendas_requeijao': '71 - Vendas',
            'vendas_manteiga': '71 - Vendas',
            'prestacao_servicos': '72 - Prestação de Serviços',
            'subsidios_exploracao': '75 - Subsídios',

            // Custos
            'cmvmc': '61 - Compras',
            'fornecimentos_servicos_externos': '62 - Fornecimentos e Serviços Externos',
            'custos_pessoal': '64 - Custos com Pessoal',
            'custos_financeiros': '69 - Custos Financeiros',
            'amortizacoes_depreciacao': '66 - Amortizações',
            'impostos': '67 - Impostos'
        };

        // 6. Calcular totais previstos por categoria
        const previstosPorCategoria = {};

        // Agregar vendas
        let totalVendasPrevisto = 0;
        ['vendas_oleo_sesamo', 'vendas_torta_sesamo', 'vendas_graos_sesamo', 'vendas_mel',
         'vendas_carne_bovina', 'vendas_carne_suina', 'vendas_carne_caprina',
         'vendas_enchidos', 'vendas_toucinho', 'vendas_leite', 'vendas_queijos',
         'vendas_requeijao', 'vendas_manteiga'].forEach(campo => {
            totalVendasPrevisto += parseFloat(dr[campo]) || 0;
        });
        previstosPorCategoria['71 - Vendas'] = totalVendasPrevisto;

        // Outros proveitos
        previstosPorCategoria['72 - Prestação de Serviços'] = parseFloat(dr.prestacao_servicos) || 0;
        previstosPorCategoria['75 - Subsídios'] = parseFloat(dr.subsidios_exploracao) || 0;

        // Custos
        previstosPorCategoria['61 - Compras'] = parseFloat(dr.cmvmc) || 0;
        previstosPorCategoria['62 - Fornecimentos e Serviços Externos'] = parseFloat(dr.fornecimentos_servicos_externos) || 0;
        previstosPorCategoria['64 - Custos com Pessoal'] = parseFloat(dr.custos_pessoal) || 0;
        previstosPorCategoria['69 - Custos Financeiros'] = parseFloat(dr.custos_financeiros) || 0;
        previstosPorCategoria['66 - Amortizações'] = parseFloat(dr.amortizacoes_depreciacao) || 0;
        previstosPorCategoria['67 - Impostos'] = parseFloat(dr.impostos) || 0;

        // 7. Criar comparação detalhada
        const comparacao = [];
        const todasCategorias = new Set([
            ...Object.keys(previstosPorCategoria),
            ...Object.keys(realizadoPorCategoria)
        ]);

        let totalPrevisto = 0;
        let totalRealizado = 0;

        todasCategorias.forEach(categoria => {
            const previsto = previstosPorCategoria[categoria] || 0;
            const realizado = realizadoPorCategoria[categoria]?.valor || 0;
            const desvio = realizado - previsto;
            const desvioPercentual = previsto !== 0 ? (desvio / previsto) * 100 : 0;

            // Determinar tipo (receita ou despesa)
            const isReceita = categoria.startsWith('71') || categoria.startsWith('72') ||
                             categoria.startsWith('75') || categoria.startsWith('76');

            if (isReceita) {
                totalPrevisto += previsto;
                totalRealizado += realizado;
            } else {
                totalPrevisto -= previsto;
                totalRealizado -= realizado;
            }

            comparacao.push({
                categoria,
                tipo: isReceita ? 'receita' : 'despesa',
                previsto,
                realizado,
                desvio,
                desvio_percentual: parseFloat(desvioPercentual.toFixed(2)),
                num_documentos: realizadoPorCategoria[categoria]?.documentos || 0,
                status: Math.abs(desvioPercentual) > 20 ? 'alerta' :
                       Math.abs(desvioPercentual) > 10 ? 'atencao' : 'ok'
            });
        });

        // 8. Calcular totais
        const totalDesvio = totalRealizado - totalPrevisto;
        const totalDesvioPercentual = totalPrevisto !== 0 ? (totalDesvio / totalPrevisto) * 100 : 0;

        // 9. Análise de performance
        const analise = {
            performance: totalDesvioPercentual > 10 ? 'acima_esperado' :
                        totalDesvioPercentual < -10 ? 'abaixo_esperado' : 'dentro_esperado',
            resultado_previsto: totalPrevisto,
            resultado_realizado: totalRealizado,
            desvio_total: totalDesvio,
            desvio_percentual_total: parseFloat(totalDesvioPercentual.toFixed(2)),
            categorias_alerta: comparacao.filter(c => c.status === 'alerta').length,
            categorias_atencao: comparacao.filter(c => c.status === 'atencao').length,
            taxa_execucao: totalPrevisto !== 0 ? parseFloat(((totalRealizado / totalPrevisto) * 100).toFixed(2)) : 0
        };

        res.json({
            exercicio: parseInt(exercicio),
            previsto: {
                demonstracao_resultados: dr,
                totais: previstosPorCategoria
            },
            realizado: realizadoPorCategoria,
            comparacao: comparacao.sort((a, b) => Math.abs(b.desvio_percentual) - Math.abs(a.desvio_percentual)),
            analise,
            gerado_em: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao gerar comparação:', error);
        res.status(500).json({
            error: 'Erro ao gerar comparação previsto vs realizado',
            details: error.message
        });
    }
};

/**
 * Obter desvios por período (mensal)
 */
exports.getDesviosMensais = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        // Obter tesouraria prevista
        const tesourariaQuery = `
            SELECT
                mes,
                total_receitas as receitas_previstas,
                total_despesas as despesas_previstas,
                saldo_final as saldo_previsto
            FROM tesouraria_mensal
            WHERE empresa_id = $1 AND exercicio = $2
            ORDER BY mes
        `;
        const tesourariaResult = await pool.query(tesourariaQuery, [user.empresa_id, exercicio]);

        // Obter documentos realizados agrupados por mês
        const docQuery = `
            SELECT
                EXTRACT(MONTH FROM data_documento) as mes,
                SUM(CASE
                    WHEN categoria_pgc LIKE '71%' OR
                         categoria_pgc LIKE '72%' OR
                         categoria_pgc LIKE '75%'
                    THEN valor ELSE 0
                END) as receitas_realizadas,
                SUM(CASE
                    WHEN categoria_pgc LIKE '61%' OR
                         categoria_pgc LIKE '62%' OR
                         categoria_pgc LIKE '64%' OR
                         categoria_pgc LIKE '66%' OR
                         categoria_pgc LIKE '67%' OR
                         categoria_pgc LIKE '69%'
                    THEN valor ELSE 0
                END) as despesas_realizadas
            FROM documentos
            WHERE empresa_id = $1
            AND EXTRACT(YEAR FROM data_documento) = $2
            AND status = 'validado'
            GROUP BY EXTRACT(MONTH FROM data_documento)
            ORDER BY mes
        `;
        const docResult = await pool.query(docQuery, [user.empresa_id, exercicio]);

        // Mapear documentos por mês
        const realizadosPorMes = {};
        docResult.rows.forEach(row => {
            realizadosPorMes[row.mes] = {
                receitas: parseFloat(row.receitas_realizadas),
                despesas: parseFloat(row.despesas_realizadas)
            };
        });

        // Criar comparação mensal
        const comparacaoMensal = tesourariaResult.rows.map(mes => {
            const realizado = realizadosPorMes[mes.mes] || { receitas: 0, despesas: 0 };

            const desvioReceitas = realizado.receitas - parseFloat(mes.receitas_previstas || 0);
            const desvioDespesas = realizado.despesas - parseFloat(mes.despesas_previstas || 0);
            const saldoRealizado = realizado.receitas - realizado.despesas;
            const saldoPrevisto = parseFloat(mes.saldo_previsto || 0);
            const desvioSaldo = saldoRealizado - saldoPrevisto;

            return {
                mes: mes.mes,
                receitas_previstas: parseFloat(mes.receitas_previstas || 0),
                receitas_realizadas: realizado.receitas,
                desvio_receitas: desvioReceitas,
                desvio_receitas_percentual: mes.receitas_previstas ?
                    parseFloat(((desvioReceitas / mes.receitas_previstas) * 100).toFixed(2)) : 0,

                despesas_previstas: parseFloat(mes.despesas_previstas || 0),
                despesas_realizadas: realizado.despesas,
                desvio_despesas: desvioDespesas,
                desvio_despesas_percentual: mes.despesas_previstas ?
                    parseFloat(((desvioDespesas / mes.despesas_previstas) * 100).toFixed(2)) : 0,

                saldo_previsto: saldoPrevisto,
                saldo_realizado: saldoRealizado,
                desvio_saldo: desvioSaldo,
                desvio_saldo_percentual: saldoPrevisto ?
                    parseFloat(((desvioSaldo / saldoPrevisto) * 100).toFixed(2)) : 0
            };
        });

        res.json({
            exercicio: parseInt(exercicio),
            comparacao_mensal: comparacaoMensal,
            gerado_em: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao gerar desvios mensais:', error);
        res.status(500).json({
            error: 'Erro ao gerar desvios mensais',
            details: error.message
        });
    }
};

/**
 * Obter análise de variações (variance analysis)
 */
exports.getAnaliseVariacoes = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        // Obter todas as variações significativas
        const query = `
            SELECT
                d.categoria_pgc,
                d.descricao,
                d.valor,
                d.data_documento,
                d.numero_documento,
                EXTRACT(MONTH FROM d.data_documento) as mes
            FROM documentos d
            WHERE d.empresa_id = $1
            AND EXTRACT(YEAR FROM d.data_documento) = $2
            AND d.status = 'validado'
            ORDER BY d.valor DESC
            LIMIT 50
        `;

        const result = await pool.query(query, [user.empresa_id, exercicio]);

        // Agrupar por categoria e mês
        const variacoesPorCategoria = {};
        const variacoesPorMes = {};

        result.rows.forEach(row => {
            // Por categoria
            if (!variacoesPorCategoria[row.categoria_pgc]) {
                variacoesPorCategoria[row.categoria_pgc] = {
                    total: 0,
                    documentos: []
                };
            }
            variacoesPorCategoria[row.categoria_pgc].total += parseFloat(row.valor);
            variacoesPorCategoria[row.categoria_pgc].documentos.push(row);

            // Por mês
            if (!variacoesPorMes[row.mes]) {
                variacoesPorMes[row.mes] = {
                    total: 0,
                    documentos: []
                };
            }
            variacoesPorMes[row.mes].total += parseFloat(row.valor);
            variacoesPorMes[row.mes].documentos.push(row);
        });

        // Identificar variações significativas (top 10 documentos)
        const top10Documentos = result.rows.slice(0, 10);

        res.json({
            exercicio: parseInt(exercicio),
            variacoes_por_categoria: variacoesPorCategoria,
            variacoes_por_mes: variacoesPorMes,
            documentos_significativos: top10Documentos,
            total_documentos_analisados: result.rows.length,
            gerado_em: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao gerar análise de variações:', error);
        res.status(500).json({
            error: 'Erro ao gerar análise de variações',
            details: error.message
        });
    }
};

/**
 * Obter dashboard de execução (resumo executivo)
 */
exports.getDashboardExecucao = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        // Estatísticas gerais
        const statsQuery = `
            SELECT
                COUNT(*) as total_documentos,
                COUNT(CASE WHEN status = 'validado' THEN 1 END) as documentos_validados,
                COUNT(CASE WHEN status = 'pendente' THEN 1 END) as documentos_pendentes,
                SUM(valor) as valor_total,
                AVG(valor) as valor_medio,
                MAX(valor) as valor_maximo,
                MIN(valor) as valor_minimo
            FROM documentos
            WHERE empresa_id = $1
            AND EXTRACT(YEAR FROM data_documento) = $2
        `;
        const statsResult = await pool.query(statsQuery, [user.empresa_id, exercicio]);

        // Estatísticas por categoria
        const categoriaQuery = `
            SELECT
                categoria_pgc,
                COUNT(*) as num_documentos,
                SUM(valor) as total_valor
            FROM documentos
            WHERE empresa_id = $1
            AND EXTRACT(YEAR FROM data_documento) = $2
            AND status = 'validado'
            GROUP BY categoria_pgc
            ORDER BY total_valor DESC
        `;
        const categoriaResult = await pool.query(categoriaQuery, [user.empresa_id, exercicio]);

        res.json({
            exercicio: parseInt(exercicio),
            estatisticas_gerais: statsResult.rows[0],
            por_categoria: categoriaResult.rows,
            gerado_em: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao gerar dashboard:', error);
        res.status(500).json({
            error: 'Erro ao gerar dashboard de execução',
            details: error.message
        });
    }
};
