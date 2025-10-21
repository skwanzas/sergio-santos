const pool = require('../../config/database');

/**
 * =====================================================
 * FUNÇÕES AUXILIARES DE CÁLCULO
 * =====================================================
 */

/**
 * Calcular Valor Presente (VP) de um fluxo de caixa
 */
function calcularVP(fluxo, taxa, periodo) {
    return fluxo / Math.pow(1 + taxa / 100, periodo);
}

/**
 * Calcular VPL (Valor Presente Líquido)
 */
function calcularVPL(fluxos, taxaDesconto) {
    let vpl = 0;
    fluxos.forEach(fluxo => {
        const vp = calcularVP(fluxo.fluxo_caixa_liquido, taxaDesconto, fluxo.ano);
        vpl += vp;
    });
    return vpl;
}

/**
 * Calcular TIR (Taxa Interna de Retorno) usando método de Newton-Raphson
 */
function calcularTIR(fluxos, estimativaInicial = 10) {
    const maxIteracoes = 1000;
    const precisao = 0.0001;
    let tir = estimativaInicial;

    for (let i = 0; i < maxIteracoes; i++) {
        let vpl = 0;
        let derivada = 0;

        fluxos.forEach(fluxo => {
            const ano = fluxo.ano;
            const fc = fluxo.fluxo_caixa_liquido;

            vpl += fc / Math.pow(1 + tir / 100, ano);
            derivada -= (ano * fc) / Math.pow(1 + tir / 100, ano + 1);
        });

        if (Math.abs(vpl) < precisao) {
            return tir;
        }

        if (derivada === 0) {
            return null; // Não converge
        }

        tir = tir - (vpl / derivada) * 100;

        // Limitar TIR entre -100% e 1000%
        if (tir < -100) tir = -100;
        if (tir > 1000) tir = 1000;
    }

    return tir; // Retorna melhor estimativa mesmo sem convergência perfeita
}

/**
 * Calcular Payback Simples (sem desconto)
 */
function calcularPaybackSimples(fluxos) {
    let saldoAcumulado = 0;

    for (let i = 0; i < fluxos.length; i++) {
        saldoAcumulado += fluxos[i].fluxo_caixa_liquido;

        if (saldoAcumulado >= 0) {
            // Interpolação para encontrar o período exato
            const saldoAnterior = saldoAcumulado - fluxos[i].fluxo_caixa_liquido;
            const fracao = Math.abs(saldoAnterior) / fluxos[i].fluxo_caixa_liquido;
            return fluxos[i].ano - 1 + fracao;
        }
    }

    return null; // Não recupera o investimento
}

/**
 * Calcular Payback Descontado (com desconto)
 */
function calcularPaybackDescontado(fluxos, taxaDesconto) {
    let saldoAcumulado = 0;

    for (let i = 0; i < fluxos.length; i++) {
        const vp = calcularVP(fluxos[i].fluxo_caixa_liquido, taxaDesconto, fluxos[i].ano);
        saldoAcumulado += vp;

        if (saldoAcumulado >= 0) {
            const saldoAnterior = saldoAcumulado - vp;
            const fracao = Math.abs(saldoAnterior) / vp;
            return fluxos[i].ano - 1 + fracao;
        }
    }

    return null;
}

/**
 * Calcular Índice de Rentabilidade
 */
function calcularIndiceRentabilidade(vpl, investimentoInicial) {
    if (investimentoInicial === 0) return null;
    return vpl / investimentoInicial;
}

/**
 * Calcular Relação Benefício/Custo
 */
function calcularRelacaoBeneficioCusto(fluxos, taxaDesconto) {
    let vpBeneficios = 0;
    let vpCustos = 0;

    fluxos.forEach(fluxo => {
        const vp = calcularVP(fluxo.fluxo_caixa_liquido, taxaDesconto, fluxo.ano);
        if (vp > 0) {
            vpBeneficios += vp;
        } else {
            vpCustos += Math.abs(vp);
        }
    });

    if (vpCustos === 0) return null;
    return vpBeneficios / vpCustos;
}

/**
 * =====================================================
 * CONTROLLERS
 * =====================================================
 */

/**
 * Salvar/Atualizar Projeto de Viabilidade
 */
exports.saveViabilidade = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userId = req.user.id;
        const {
            id,
            nome_projeto,
            descricao,
            tipo_projeto,
            localizacao,
            responsavel,
            data_inicio,
            data_fim,
            periodo_construcao_anos,
            periodo_operacao_anos,
            vida_util_anos,
            taxa_desconto_percentual,
            inflacao_anual_percentual,
            taxa_risco_percentual,
            investimento_terreno,
            investimento_construcao,
            investimento_equipamentos,
            investimento_veiculos,
            investimento_capital_giro,
            investimento_outros,
            tem_financiamento,
            percentual_financiado,
            taxa_juros_financiamento,
            prazo_financiamento_anos,
            carencia_anos,
            receita_anual_media,
            custo_operacional_anual_medio,
            depreciacao_anual,
            valor_residual,
            premissas,
            riscos,
            observacoes
        } = req.body;

        let query, values, result;

        if (id) {
            // Atualizar projeto existente
            query = `
                UPDATE viabilidade_projetos SET
                    nome_projeto = $1,
                    descricao = $2,
                    tipo_projeto = $3,
                    localizacao = $4,
                    responsavel = $5,
                    data_inicio = $6,
                    data_fim = $7,
                    periodo_construcao_anos = $8,
                    periodo_operacao_anos = $9,
                    vida_util_anos = $10,
                    taxa_desconto_percentual = $11,
                    inflacao_anual_percentual = $12,
                    taxa_risco_percentual = $13,
                    investimento_terreno = $14,
                    investimento_construcao = $15,
                    investimento_equipamentos = $16,
                    investimento_veiculos = $17,
                    investimento_capital_giro = $18,
                    investimento_outros = $19,
                    tem_financiamento = $20,
                    percentual_financiado = $21,
                    taxa_juros_financiamento = $22,
                    prazo_financiamento_anos = $23,
                    carencia_anos = $24,
                    receita_anual_media = $25,
                    custo_operacional_anual_medio = $26,
                    depreciacao_anual = $27,
                    valor_residual = $28,
                    premissas = $29,
                    riscos = $30,
                    observacoes = $31
                WHERE id = $32 AND user_id = $33
                RETURNING *
            `;

            values = [
                nome_projeto, descricao, tipo_projeto, localizacao, responsavel,
                data_inicio, data_fim, periodo_construcao_anos || 0, periodo_operacao_anos, vida_util_anos,
                taxa_desconto_percentual, inflacao_anual_percentual || 0, taxa_risco_percentual || 0,
                investimento_terreno || 0, investimento_construcao || 0, investimento_equipamentos || 0,
                investimento_veiculos || 0, investimento_capital_giro || 0, investimento_outros || 0,
                tem_financiamento || false, percentual_financiado || 0, taxa_juros_financiamento || 0,
                prazo_financiamento_anos || 0, carencia_anos || 0,
                receita_anual_media || 0, custo_operacional_anual_medio || 0, depreciacao_anual || 0,
                valor_residual || 0, premissas, riscos, observacoes,
                id, userId
            ];

            result = await client.query(query, values);

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Projeto não encontrado' });
            }

        } else {
            // Criar novo projeto
            query = `
                INSERT INTO viabilidade_projetos (
                    user_id, nome_projeto, descricao, tipo_projeto, localizacao, responsavel,
                    data_inicio, data_fim, periodo_construcao_anos, periodo_operacao_anos, vida_util_anos,
                    taxa_desconto_percentual, inflacao_anual_percentual, taxa_risco_percentual,
                    investimento_terreno, investimento_construcao, investimento_equipamentos,
                    investimento_veiculos, investimento_capital_giro, investimento_outros,
                    tem_financiamento, percentual_financiado, taxa_juros_financiamento,
                    prazo_financiamento_anos, carencia_anos,
                    receita_anual_media, custo_operacional_anual_medio, depreciacao_anual,
                    valor_residual, premissas, riscos, observacoes
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
                )
                RETURNING *
            `;

            values = [
                userId, nome_projeto, descricao, tipo_projeto, localizacao, responsavel,
                data_inicio, data_fim, periodo_construcao_anos || 0, periodo_operacao_anos, vida_util_anos,
                taxa_desconto_percentual, inflacao_anual_percentual || 0, taxa_risco_percentual || 0,
                investimento_terreno || 0, investimento_construcao || 0, investimento_equipamentos || 0,
                investimento_veiculos || 0, investimento_capital_giro || 0, investimento_outros || 0,
                tem_financiamento || false, percentual_financiado || 0, taxa_juros_financiamento || 0,
                prazo_financiamento_anos || 0, carencia_anos || 0,
                receita_anual_media || 0, custo_operacional_anual_medio || 0, depreciacao_anual || 0,
                valor_residual || 0, premissas, riscos, observacoes
            ];

            result = await client.query(query, values);
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: id ? 'Projeto atualizado com sucesso' : 'Projeto criado com sucesso',
            projeto: result.rows[0]
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao salvar viabilidade:', error);
        res.status(500).json({ error: 'Erro ao salvar projeto de viabilidade' });
    } finally {
        client.release();
    }
};

/**
 * Listar Projetos de Viabilidade
 */
exports.listViabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { tipo_projeto, status } = req.query;

        let query = 'SELECT * FROM viabilidade_projetos WHERE user_id = $1';
        const values = [userId];
        let paramCount = 1;

        if (tipo_projeto) {
            paramCount++;
            query += ` AND tipo_projeto = $${paramCount}`;
            values.push(tipo_projeto);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            values.push(status);
        }

        query += ' ORDER BY created_at DESC';

        const result = await pool.query(query, values);

        res.status(200).json({
            projetos: result.rows,
            total: result.rows.length
        });

    } catch (error) {
        console.error('Erro ao listar viabilidade:', error);
        res.status(500).json({ error: 'Erro ao listar projetos' });
    }
};

/**
 * Obter Projeto Específico
 */
exports.getViabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Buscar projeto
        const projetoResult = await pool.query(
            'SELECT * FROM viabilidade_projetos WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (projetoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        // Buscar fluxos de caixa
        const fluxosResult = await pool.query(
            'SELECT * FROM viabilidade_fluxos_caixa WHERE projeto_id = $1 ORDER BY ano ASC',
            [id]
        );

        res.status(200).json({
            projeto: projetoResult.rows[0],
            fluxos: fluxosResult.rows
        });

    } catch (error) {
        console.error('Erro ao obter viabilidade:', error);
        res.status(500).json({ error: 'Erro ao obter projeto' });
    }
};

/**
 * Deletar Projeto
 */
exports.deleteViabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM viabilidade_projetos WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        res.status(200).json({
            message: 'Projeto deletado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar viabilidade:', error);
        res.status(500).json({ error: 'Erro ao deletar projeto' });
    }
};

/**
 * Salvar Fluxos de Caixa do Projeto
 */
exports.saveFluxosCaixa = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userId = req.user.id;
        const { projeto_id, fluxos } = req.body;

        // Verificar se o projeto pertence ao usuário
        const projetoCheck = await client.query(
            'SELECT * FROM viabilidade_projetos WHERE id = $1 AND user_id = $2',
            [projeto_id, userId]
        );

        if (projetoCheck.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const projeto = projetoCheck.rows[0];
        const taxaDesconto = parseFloat(projeto.taxa_desconto_percentual);

        // Deletar fluxos anteriores
        await client.query('DELETE FROM viabilidade_fluxos_caixa WHERE projeto_id = $1', [projeto_id]);

        // Inserir novos fluxos
        for (const fluxo of fluxos) {
            const fatorDesconto = 1 / Math.pow(1 + taxaDesconto / 100, fluxo.ano);
            const fluxoLiquido = (fluxo.receitas_operacionais || 0) +
                                 (fluxo.receitas_nao_operacionais || 0) +
                                 (fluxo.valor_residual || 0) -
                                 (fluxo.investimentos || 0) -
                                 (fluxo.custos_operacionais || 0) -
                                 (fluxo.custos_fixos || 0) -
                                 (fluxo.impostos || 0) -
                                 (fluxo.pagamento_financiamento || 0);

            const vpFluxo = fluxoLiquido * fatorDesconto;

            await client.query(`
                INSERT INTO viabilidade_fluxos_caixa (
                    projeto_id, ano, descricao,
                    receitas_operacionais, receitas_nao_operacionais, valor_residual,
                    investimentos, custos_operacionais, custos_fixos, impostos, pagamento_financiamento,
                    fator_desconto, vp_fluxo_caixa
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            `, [
                projeto_id, fluxo.ano, fluxo.descricao,
                fluxo.receitas_operacionais || 0,
                fluxo.receitas_nao_operacionais || 0,
                fluxo.valor_residual || 0,
                fluxo.investimentos || 0,
                fluxo.custos_operacionais || 0,
                fluxo.custos_fixos || 0,
                fluxo.impostos || 0,
                fluxo.pagamento_financiamento || 0,
                fatorDesconto,
                vpFluxo
            ]);
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Fluxos de caixa salvos com sucesso'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao salvar fluxos de caixa:', error);
        res.status(500).json({ error: 'Erro ao salvar fluxos de caixa' });
    } finally {
        client.release();
    }
};

/**
 * Calcular Indicadores de Viabilidade
 */
exports.calcularIndicadores = async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userId = req.user.id;
        const { id } = req.params;

        // Buscar projeto
        const projetoResult = await client.query(
            'SELECT * FROM viabilidade_projetos WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (projetoResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const projeto = projetoResult.rows[0];

        // Buscar fluxos de caixa
        const fluxosResult = await client.query(
            'SELECT * FROM viabilidade_fluxos_caixa WHERE projeto_id = $1 ORDER BY ano ASC',
            [id]
        );

        if (fluxosResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Nenhum fluxo de caixa cadastrado para este projeto' });
        }

        const fluxos = fluxosResult.rows;
        const taxaDesconto = parseFloat(projeto.taxa_desconto_percentual);
        const investimentoInicial = parseFloat(projeto.investimento_total);

        // Calcular indicadores
        const vpl = calcularVPL(fluxos, taxaDesconto);
        const tir = calcularTIR(fluxos);
        const paybackSimples = calcularPaybackSimples(fluxos);
        const paybackDescontado = calcularPaybackDescontado(fluxos, taxaDesconto);
        const indiceRentabilidade = calcularIndiceRentabilidade(vpl, investimentoInicial);
        const relacaoBC = calcularRelacaoBeneficioCusto(fluxos, taxaDesconto);

        // Atualizar projeto com os indicadores
        await client.query(`
            UPDATE viabilidade_projetos SET
                vpl = $1,
                tir_percentual = $2,
                payback_simples_anos = $3,
                payback_descontado_anos = $4,
                indice_rentabilidade = $5,
                relacao_beneficio_custo = $6
            WHERE id = $7
        `, [vpl, tir, paybackSimples, paybackDescontado, indiceRentabilidade, relacaoBC, id]);

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Indicadores calculados com sucesso',
            indicadores: {
                vpl,
                tir_percentual: tir,
                payback_simples_anos: paybackSimples,
                payback_descontado_anos: paybackDescontado,
                indice_rentabilidade: indiceRentabilidade,
                relacao_beneficio_custo: relacaoBC,
                viavel: vpl > 0 && tir > taxaDesconto
            }
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Erro ao calcular indicadores:', error);
        res.status(500).json({ error: 'Erro ao calcular indicadores' });
    } finally {
        client.release();
    }
};

/**
 * Aprovar/Rejeitar Projeto
 */
exports.aprovarProjeto = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status, decisao, aprovado_por } = req.body;

        const result = await pool.query(`
            UPDATE viabilidade_projetos SET
                status = $1,
                decisao = $2,
                data_decisao = CURRENT_DATE,
                aprovado_por = $3
            WHERE id = $4 AND user_id = $5
            RETURNING *
        `, [status, decisao, aprovado_por, id, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        res.status(200).json({
            message: 'Decisão registrada com sucesso',
            projeto: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao aprovar projeto:', error);
        res.status(500).json({ error: 'Erro ao registrar decisão' });
    }
};

/**
 * Obter Resumo de Todos os Projetos
 */
exports.getResumo = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT * FROM vw_resumo_viabilidade WHERE user_id = $1
        `, [userId]);

        // Estatísticas gerais
        const totalProjetos = result.rows.length;
        const projetosViaveis = result.rows.filter(p => p.viabilidade === 'Viável').length;
        const projetosInviaveis = result.rows.filter(p => p.viabilidade === 'Inviável').length;
        const investimentoTotal = result.rows.reduce((sum, p) => sum + parseFloat(p.investimento_total || 0), 0);
        const vplTotal = result.rows.reduce((sum, p) => sum + parseFloat(p.vpl || 0), 0);

        res.status(200).json({
            projetos: result.rows,
            estatisticas: {
                total_projetos: totalProjetos,
                projetos_viaveis: projetosViaveis,
                projetos_inviaveis: projetosInviaveis,
                investimento_total: investimentoTotal,
                vpl_total: vplTotal
            }
        });

    } catch (error) {
        console.error('Erro ao obter resumo:', error);
        res.status(500).json({ error: 'Erro ao obter resumo' });
    }
};

/**
 * Obter Ranking de Projetos por VPL
 */
exports.getRanking = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
            SELECT * FROM vw_ranking_projetos_vpl WHERE user_id = $1
        `, [userId]);

        res.status(200).json({
            ranking: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter ranking:', error);
        res.status(500).json({ error: 'Erro ao obter ranking' });
    }
};

/**
 * Análise de Sensibilidade
 */
exports.analiseSensibilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { variacao_receita, variacao_custo } = req.body; // % de variação

        // Buscar projeto e fluxos
        const projetoResult = await pool.query(
            'SELECT * FROM viabilidade_projetos WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (projetoResult.rows.length === 0) {
            return res.status(404).json({ error: 'Projeto não encontrado' });
        }

        const projeto = projetoResult.rows[0];
        const fluxosResult = await pool.query(
            'SELECT * FROM viabilidade_fluxos_caixa WHERE projeto_id = $1 ORDER BY ano ASC',
            [id]
        );

        const fluxos = fluxosResult.rows;
        const taxaDesconto = parseFloat(projeto.taxa_desconto_percentual);

        // Cenário Otimista (+ receita, - custo)
        const fluxosOtimistas = fluxos.map(f => ({
            ...f,
            receitas_operacionais: parseFloat(f.receitas_operacionais) * (1 + variacao_receita / 100),
            custos_operacionais: parseFloat(f.custos_operacionais) * (1 - variacao_custo / 100),
            fluxo_caixa_liquido: (
                parseFloat(f.receitas_operacionais) * (1 + variacao_receita / 100) +
                parseFloat(f.receitas_nao_operacionais || 0) +
                parseFloat(f.valor_residual || 0) -
                parseFloat(f.investimentos || 0) -
                parseFloat(f.custos_operacionais) * (1 - variacao_custo / 100) -
                parseFloat(f.custos_fixos || 0) -
                parseFloat(f.impostos || 0) -
                parseFloat(f.pagamento_financiamento || 0)
            )
        }));

        // Cenário Pessimista (- receita, + custo)
        const fluxosPessimistas = fluxos.map(f => ({
            ...f,
            receitas_operacionais: parseFloat(f.receitas_operacionais) * (1 - variacao_receita / 100),
            custos_operacionais: parseFloat(f.custos_operacionais) * (1 + variacao_custo / 100),
            fluxo_caixa_liquido: (
                parseFloat(f.receitas_operacionais) * (1 - variacao_receita / 100) +
                parseFloat(f.receitas_nao_operacionais || 0) +
                parseFloat(f.valor_residual || 0) -
                parseFloat(f.investimentos || 0) -
                parseFloat(f.custos_operacionais) * (1 + variacao_custo / 100) -
                parseFloat(f.custos_fixos || 0) -
                parseFloat(f.impostos || 0) -
                parseFloat(f.pagamento_financiamento || 0)
            )
        }));

        const vplOtimista = calcularVPL(fluxosOtimistas, taxaDesconto);
        const tirOtimista = calcularTIR(fluxosOtimistas);
        const vplPessimista = calcularVPL(fluxosPessimistas, taxaDesconto);
        const tirPessimista = calcularTIR(fluxosPessimistas);

        // Salvar cenários no projeto
        await pool.query(`
            UPDATE viabilidade_projetos SET
                cenario_otimista = $1,
                cenario_pessimista = $2
            WHERE id = $3
        `, [
            JSON.stringify({ vpl: vplOtimista, tir: tirOtimista }),
            JSON.stringify({ vpl: vplPessimista, tir: tirPessimista }),
            id
        ]);

        res.status(200).json({
            message: 'Análise de sensibilidade concluída',
            cenario_base: {
                vpl: parseFloat(projeto.vpl),
                tir: parseFloat(projeto.tir_percentual)
            },
            cenario_otimista: {
                vpl: vplOtimista,
                tir: tirOtimista
            },
            cenario_pessimista: {
                vpl: vplPessimista,
                tir: tirPessimista
            }
        });

    } catch (error) {
        console.error('Erro na análise de sensibilidade:', error);
        res.status(500).json({ error: 'Erro na análise de sensibilidade' });
    }
};
