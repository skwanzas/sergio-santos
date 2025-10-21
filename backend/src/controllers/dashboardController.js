const pool = require('../config/database');

/**
 * Controller para Dashboard Executivo Consolidado
 * Agrega dados de todos os módulos do sistema
 */

/**
 * Obter dashboard consolidado completo
 */
exports.getDashboardConsolidado = async (req, res) => {
    const { user } = req;
    const { exercicio } = req.params;

    try {
        const dashboard = {
            exercicio: parseInt(exercicio),
            gerado_em: new Date().toISOString()
        };

        // ===== 1. DEMONSTRAÇÃO DE RESULTADOS =====
        try {
            const drQuery = `
                SELECT
                    total_proveitos,
                    total_custos,
                    resultado_operacional,
                    imposto_industrial,
                    resultado_liquido,
                    margem_liquida
                FROM demonstracao_resultados
                WHERE empresa_id = $1 AND exercicio = $2
            `;
            const drResult = await pool.query(drQuery, [user.empresa_id, exercicio]);

            if (drResult.rows.length > 0) {
                dashboard.demonstracao_resultados = drResult.rows[0];
            } else {
                dashboard.demonstracao_resultados = null;
            }
        } catch (error) {
            console.error('Erro ao buscar DR:', error);
            dashboard.demonstracao_resultados = null;
        }

        // ===== 2. BALANÇO PREVISIONAL =====
        try {
            const balancoQuery = `
                SELECT
                    total_ativo,
                    total_passivo,
                    total_capital_proprio
                FROM balanco_previsional
                WHERE empresa_id = $1 AND exercicio = $2
            `;
            const balancoResult = await pool.query(balancoQuery, [user.empresa_id, exercicio]);

            if (balancoResult.rows.length > 0) {
                const balanco = balancoResult.rows[0];
                dashboard.balanco_previsional = {
                    ...balanco,
                    equilibrado: Math.abs(
                        parseFloat(balanco.total_ativo) -
                        (parseFloat(balanco.total_passivo) + parseFloat(balanco.total_capital_proprio))
                    ) < 0.01
                };
            } else {
                dashboard.balanco_previsional = null;
            }
        } catch (error) {
            console.error('Erro ao buscar Balanço:', error);
            dashboard.balanco_previsional = null;
        }

        // ===== 3. TESOURARIA (RESUMO ANUAL) =====
        try {
            const tesourariaQuery = `
                SELECT
                    COUNT(*) as meses_planejados,
                    SUM(total_receitas) as total_receitas_ano,
                    SUM(total_despesas) as total_despesas_ano,
                    AVG(saldo_final) as saldo_medio,
                    MIN(saldo_final) as saldo_minimo,
                    MAX(saldo_final) as saldo_maximo
                FROM tesouraria_mensal
                WHERE empresa_id = $1 AND exercicio = $2
            `;
            const tesourariaResult = await pool.query(tesourariaQuery, [user.empresa_id, exercicio]);

            if (tesourariaResult.rows.length > 0 && tesourariaResult.rows[0].meses_planejados > 0) {
                dashboard.tesouraria = tesourariaResult.rows[0];
            } else {
                dashboard.tesouraria = null;
            }
        } catch (error) {
            console.error('Erro ao buscar Tesouraria:', error);
            dashboard.tesouraria = null;
        }

        // ===== 4. DOCUMENTOS (EXECUÇÃO) =====
        try {
            const docQuery = `
                SELECT
                    COUNT(*) as total_documentos,
                    COUNT(CASE WHEN status = 'validado' THEN 1 END) as validados,
                    COUNT(CASE WHEN status = 'pendente' THEN 1 END) as pendentes,
                    SUM(CASE WHEN status = 'validado' THEN valor ELSE 0 END) as valor_validado,
                    SUM(valor) as valor_total
                FROM documentos
                WHERE empresa_id = $1
                AND EXTRACT(YEAR FROM data_documento) = $2
            `;
            const docResult = await pool.query(docQuery, [user.empresa_id, exercicio]);

            if (docResult.rows.length > 0) {
                const docs = docResult.rows[0];
                dashboard.documentos = {
                    ...docs,
                    taxa_validacao: docs.total_documentos > 0
                        ? parseFloat(((docs.validados / docs.total_documentos) * 100).toFixed(2))
                        : 0
                };
            } else {
                dashboard.documentos = {
                    total_documentos: 0,
                    validados: 0,
                    pendentes: 0,
                    valor_validado: 0,
                    valor_total: 0,
                    taxa_validacao: 0
                };
            }
        } catch (error) {
            console.error('Erro ao buscar Documentos:', error);
            dashboard.documentos = null;
        }

        // ===== 5. INDICADORES PRINCIPAIS =====
        if (dashboard.demonstracao_resultados && dashboard.balanco_previsional) {
            const dr = dashboard.demonstracao_resultados;
            const balanco = dashboard.balanco_previsional;

            const totalProveitos = parseFloat(dr.total_proveitos) || 0;
            const totalCustos = parseFloat(dr.total_custos) || 0;
            const resultadoLiquido = parseFloat(dr.resultado_liquido) || 0;
            const totalAtivo = parseFloat(balanco.total_ativo) || 0;
            const totalCapitalProprio = parseFloat(balanco.total_capital_proprio) || 0;
            const totalPassivo = parseFloat(balanco.total_passivo) || 0;

            dashboard.indicadores_chave = {
                // Rentabilidade
                margem_liquida: totalProveitos > 0 ? ((resultadoLiquido / totalProveitos) * 100).toFixed(2) : 0,
                roe: totalCapitalProprio > 0 ? ((resultadoLiquido / totalCapitalProprio) * 100).toFixed(2) : 0,
                roa: totalAtivo > 0 ? ((resultadoLiquido / totalAtivo) * 100).toFixed(2) : 0,

                // Estrutura
                autonomia_financeira: totalAtivo > 0 ? ((totalCapitalProprio / totalAtivo) * 100).toFixed(2) : 0,
                endividamento: totalAtivo > 0 ? ((totalPassivo / totalAtivo) * 100).toFixed(2) : 0,

                // Liquidez (estimativa)
                liquidez_geral: 1.5, // placeholder - seria calculado com ativo/passivo circulante
            };
        } else {
            dashboard.indicadores_chave = null;
        }

        // ===== 6. COMPARAÇÃO PREVISTO VS REALIZADO =====
        if (dashboard.demonstracao_resultados && dashboard.documentos) {
            const previsto = parseFloat(dashboard.demonstracao_resultados.total_proveitos) || 0;
            const realizado = parseFloat(dashboard.documentos.valor_validado) || 0;

            dashboard.execucao = {
                previsto,
                realizado,
                desvio: realizado - previsto,
                desvio_percentual: previsto > 0 ? parseFloat(((realizado - previsto) / previsto * 100).toFixed(2)) : 0,
                taxa_execucao: previsto > 0 ? parseFloat((realizado / previsto * 100).toFixed(2)) : 0,
                performance: previsto > 0
                    ? ((realizado / previsto * 100) > 110 ? 'acima_esperado' :
                       (realizado / previsto * 100) < 90 ? 'abaixo_esperado' : 'dentro_esperado')
                    : 'sem_dados'
            };
        } else {
            dashboard.execucao = null;
        }

        // ===== 7. SAÚDE FINANCEIRA GERAL =====
        const scores = [];

        // Score 1: Resultado Líquido
        if (dashboard.demonstracao_resultados) {
            const resultadoLiquido = parseFloat(dashboard.demonstracao_resultados.resultado_liquido) || 0;
            if (resultadoLiquido > 0) scores.push(100);
            else if (resultadoLiquido === 0) scores.push(50);
            else scores.push(0);
        }

        // Score 2: Balanço Equilibrado
        if (dashboard.balanco_previsional) {
            scores.push(dashboard.balanco_previsional.equilibrado ? 100 : 0);
        }

        // Score 3: Taxa de Validação de Documentos
        if (dashboard.documentos) {
            scores.push(dashboard.documentos.taxa_validacao);
        }

        // Score 4: Autonomia Financeira
        if (dashboard.indicadores_chave) {
            const autonomia = parseFloat(dashboard.indicadores_chave.autonomia_financeira);
            if (autonomia >= 30) scores.push(100);
            else if (autonomia >= 20) scores.push(70);
            else if (autonomia >= 10) scores.push(40);
            else scores.push(20);
        }

        // Score 5: Performance de Execução
        if (dashboard.execucao) {
            if (dashboard.execucao.performance === 'dentro_esperado') scores.push(100);
            else if (dashboard.execucao.performance === 'acima_esperado') scores.push(90);
            else if (dashboard.execucao.performance === 'abaixo_esperado') scores.push(40);
            else scores.push(0);
        }

        const scoreGeral = scores.length > 0
            ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2))
            : 0;

        dashboard.saude_financeira = {
            score: scoreGeral,
            classificacao: scoreGeral >= 80 ? 'excelente' :
                          scoreGeral >= 60 ? 'boa' :
                          scoreGeral >= 40 ? 'media' : 'fraca',
            componentes: {
                resultado: scores[0] || 0,
                balanco: scores[1] || 0,
                documentos: scores[2] || 0,
                autonomia: scores[3] || 0,
                execucao: scores[4] || 0
            }
        };

        // ===== 8. ALERTAS E RECOMENDAÇÕES =====
        const alertas = [];
        const recomendacoes = [];

        if (dashboard.demonstracao_resultados) {
            const resultadoLiquido = parseFloat(dashboard.demonstracao_resultados.resultado_liquido) || 0;
            const margemLiquida = parseFloat(dashboard.demonstracao_resultados.margem_liquida) || 0;

            if (resultadoLiquido < 0) {
                alertas.push({
                    nivel: 'critico',
                    modulo: 'Demonstração de Resultados',
                    mensagem: 'Resultado líquido negativo',
                    valor: resultadoLiquido
                });
                recomendacoes.push('Analisar custos operacionais e identificar áreas para redução');
            }

            if (margemLiquida < 5) {
                alertas.push({
                    nivel: 'atencao',
                    modulo: 'Demonstração de Resultados',
                    mensagem: 'Margem líquida abaixo de 5%',
                    valor: margemLiquida
                });
                recomendacoes.push('Avaliar política de preços e estrutura de custos');
            }
        }

        if (dashboard.balanco_previsional && !dashboard.balanco_previsional.equilibrado) {
            alertas.push({
                nivel: 'critico',
                modulo: 'Balanço Previsional',
                mensagem: 'Balanço não equilibrado',
                valor: null
            });
            recomendacoes.push('Corrigir o balanço previsional para equilibrar Ativo com Passivo + Capital Próprio');
        }

        if (dashboard.tesouraria) {
            const saldoMinimo = parseFloat(dashboard.tesouraria.saldo_minimo) || 0;
            if (saldoMinimo < 0) {
                alertas.push({
                    nivel: 'critico',
                    modulo: 'Tesouraria',
                    mensagem: 'Saldo negativo previsto',
                    valor: saldoMinimo
                });
                recomendacoes.push('Rever planeamento de tesouraria e considerar fontes de financiamento');
            }
        }

        if (dashboard.documentos && dashboard.documentos.pendentes > 10) {
            alertas.push({
                nivel: 'atencao',
                modulo: 'Documentos',
                mensagem: `${dashboard.documentos.pendentes} documentos pendentes de validação`,
                valor: dashboard.documentos.pendentes
            });
            recomendacoes.push('Processar documentos pendentes para melhorar controlo de execução');
        }

        if (dashboard.execucao && Math.abs(dashboard.execucao.desvio_percentual) > 20) {
            alertas.push({
                nivel: 'atencao',
                modulo: 'Execução Orçamental',
                mensagem: `Desvio de ${dashboard.execucao.desvio_percentual}% entre previsto e realizado`,
                valor: dashboard.execucao.desvio_percentual
            });
            recomendacoes.push('Ajustar planeamento orçamental com base na execução real');
        }

        dashboard.alertas = alertas;
        dashboard.recomendacoes = recomendacoes;

        // ===== 9. RESUMO EXECUTIVO =====
        dashboard.resumo_executivo = {
            modulos_configurados: [
                dashboard.demonstracao_resultados ? 'DR' : null,
                dashboard.balanco_previsional ? 'Balanço' : null,
                dashboard.tesouraria ? 'Tesouraria' : null
            ].filter(m => m !== null),
            completude: parseFloat((
                (dashboard.demonstracao_resultados ? 1 : 0) +
                (dashboard.balanco_previsional ? 1 : 0) +
                (dashboard.tesouraria ? 1 : 0) +
                (dashboard.documentos && dashboard.documentos.total_documentos > 0 ? 1 : 0)
            ) / 4 * 100).toFixed(2),
            total_alertas: alertas.length,
            alertas_criticos: alertas.filter(a => a.nivel === 'critico').length,
            alertas_atencao: alertas.filter(a => a.nivel === 'atencao').length
        };

        res.json(dashboard);

    } catch (error) {
        console.error('Erro ao gerar dashboard:', error);
        res.status(500).json({
            error: 'Erro ao gerar dashboard consolidado',
            details: error.message
        });
    }
};

/**
 * Obter evolução de KPIs principais ao longo dos anos
 */
exports.getEvolucaoKPIs = async (req, res) => {
    const { user } = req;
    const { anos } = req.params; // formato: "2023,2024,2025"

    try {
        const anosArray = anos.split(',').map(a => parseInt(a));

        const evolucao = [];

        for (const ano of anosArray) {
            const drQuery = `
                SELECT
                    resultado_liquido,
                    margem_liquida,
                    total_proveitos,
                    total_custos
                FROM demonstracao_resultados
                WHERE empresa_id = $1 AND exercicio = $2
            `;
            const drResult = await pool.query(drQuery, [user.empresa_id, ano]);

            const balancoQuery = `
                SELECT
                    total_ativo,
                    total_capital_proprio
                FROM balanco_previsional
                WHERE empresa_id = $1 AND exercicio = $2
            `;
            const balancoResult = await pool.query(balancoQuery, [user.empresa_id, ano]);

            if (drResult.rows.length > 0 || balancoResult.rows.length > 0) {
                const dr = drResult.rows[0] || {};
                const balanco = balancoResult.rows[0] || {};

                evolucao.push({
                    ano,
                    resultado_liquido: parseFloat(dr.resultado_liquido) || 0,
                    margem_liquida: parseFloat(dr.margem_liquida) || 0,
                    total_proveitos: parseFloat(dr.total_proveitos) || 0,
                    total_custos: parseFloat(dr.total_custos) || 0,
                    total_ativo: parseFloat(balanco.total_ativo) || 0,
                    capital_proprio: parseFloat(balanco.total_capital_proprio) || 0,
                    roe: balanco.total_capital_proprio && dr.resultado_liquido
                        ? parseFloat(((dr.resultado_liquido / balanco.total_capital_proprio) * 100).toFixed(2))
                        : 0
                });
            }
        }

        res.json({
            anos: anosArray,
            evolucao,
            gerado_em: new Date().toISOString()
        });

    } catch (error) {
        console.error('Erro ao gerar evolução:', error);
        res.status(500).json({
            error: 'Erro ao gerar evolução de KPIs',
            details: error.message
        });
    }
};
