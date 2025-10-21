const pool = require('../config/database');

// ==================== CRIAR/ATUALIZAR ORÇAMENTO PARCIAL ====================

exports.saveOrcamento = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            id,
            exercicio,
            nome,
            tipo,
            descricao,
            area_hectares,
            data_inicio,
            data_fim,
            // Receitas
            receita_venda_principal,
            receita_venda_secundaria,
            receita_subsidios,
            receita_outras,
            // Custos Variáveis
            custo_sementes,
            custo_fertilizantes,
            custo_fitosanitarios,
            custo_combustivel,
            custo_mao_obra_temporaria,
            custo_agua_irrigacao,
            custo_embalagens,
            custo_transporte,
            custo_outros_variaveis,
            // Custos Fixos
            custo_mao_obra_permanente,
            custo_arrendamento,
            custo_depreciacao_equipamento,
            custo_seguros,
            custo_manutencao,
            custo_administrativos,
            custo_outros_fixos,
            // Investimentos
            investimento_equipamento,
            investimento_infraestrutura,
            investimento_outros,
            // Realizados
            realizado_receitas,
            realizado_custos_variaveis,
            realizado_custos_fixos,
            realizado_investimentos,
            // Análise
            rendimento_esperado_kg,
            preco_venda_kg,
            status,
            observacoes
        } = req.body;

        // Validações
        if (!exercicio || !nome || !tipo) {
            return res.status(400).json({
                error: 'Campos obrigatórios: exercicio, nome, tipo'
            });
        }

        if (!['cultura', 'projeto', 'centro_custo'].includes(tipo)) {
            return res.status(400).json({
                error: 'Tipo inválido. Deve ser: cultura, projeto ou centro_custo'
            });
        }

        let orcamento;

        if (id) {
            // Atualizar existente
            const result = await pool.query(
                `UPDATE orcamentos_parciais SET
                    exercicio = $1,
                    nome = $2,
                    tipo = $3,
                    descricao = $4,
                    area_hectares = $5,
                    data_inicio = $6,
                    data_fim = $7,
                    receita_venda_principal = $8,
                    receita_venda_secundaria = $9,
                    receita_subsidios = $10,
                    receita_outras = $11,
                    custo_sementes = $12,
                    custo_fertilizantes = $13,
                    custo_fitosanitarios = $14,
                    custo_combustivel = $15,
                    custo_mao_obra_temporaria = $16,
                    custo_agua_irrigacao = $17,
                    custo_embalagens = $18,
                    custo_transporte = $19,
                    custo_outros_variaveis = $20,
                    custo_mao_obra_permanente = $21,
                    custo_arrendamento = $22,
                    custo_depreciacao_equipamento = $23,
                    custo_seguros = $24,
                    custo_manutencao = $25,
                    custo_administrativos = $26,
                    custo_outros_fixos = $27,
                    investimento_equipamento = $28,
                    investimento_infraestrutura = $29,
                    investimento_outros = $30,
                    realizado_receitas = $31,
                    realizado_custos_variaveis = $32,
                    realizado_custos_fixos = $33,
                    realizado_investimentos = $34,
                    rendimento_esperado_kg = $35,
                    preco_venda_kg = $36,
                    status = $37,
                    observacoes = $38
                WHERE id = $39 AND user_id = $40
                RETURNING *`,
                [
                    exercicio, nome, tipo, descricao, area_hectares, data_inicio, data_fim,
                    receita_venda_principal, receita_venda_secundaria, receita_subsidios, receita_outras,
                    custo_sementes, custo_fertilizantes, custo_fitosanitarios, custo_combustivel,
                    custo_mao_obra_temporaria, custo_agua_irrigacao, custo_embalagens, custo_transporte,
                    custo_outros_variaveis, custo_mao_obra_permanente, custo_arrendamento,
                    custo_depreciacao_equipamento, custo_seguros, custo_manutencao, custo_administrativos,
                    custo_outros_fixos, investimento_equipamento, investimento_infraestrutura,
                    investimento_outros, realizado_receitas, realizado_custos_variaveis,
                    realizado_custos_fixos, realizado_investimentos, rendimento_esperado_kg,
                    preco_venda_kg, status || 'planejamento', observacoes,
                    id, userId
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Orçamento não encontrado' });
            }

            orcamento = result.rows[0];
        } else {
            // Criar novo
            const result = await pool.query(
                `INSERT INTO orcamentos_parciais (
                    user_id, exercicio, nome, tipo, descricao, area_hectares, data_inicio, data_fim,
                    receita_venda_principal, receita_venda_secundaria, receita_subsidios, receita_outras,
                    custo_sementes, custo_fertilizantes, custo_fitosanitarios, custo_combustivel,
                    custo_mao_obra_temporaria, custo_agua_irrigacao, custo_embalagens, custo_transporte,
                    custo_outros_variaveis, custo_mao_obra_permanente, custo_arrendamento,
                    custo_depreciacao_equipamento, custo_seguros, custo_manutencao, custo_administrativos,
                    custo_outros_fixos, investimento_equipamento, investimento_infraestrutura,
                    investimento_outros, realizado_receitas, realizado_custos_variaveis,
                    realizado_custos_fixos, realizado_investimentos, rendimento_esperado_kg,
                    preco_venda_kg, status, observacoes
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
                    $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
                    $35, $36, $37, $38
                ) RETURNING *`,
                [
                    userId, exercicio, nome, tipo, descricao, area_hectares, data_inicio, data_fim,
                    receita_venda_principal || 0, receita_venda_secundaria || 0, receita_subsidios || 0,
                    receita_outras || 0, custo_sementes || 0, custo_fertilizantes || 0,
                    custo_fitosanitarios || 0, custo_combustivel || 0, custo_mao_obra_temporaria || 0,
                    custo_agua_irrigacao || 0, custo_embalagens || 0, custo_transporte || 0,
                    custo_outros_variaveis || 0, custo_mao_obra_permanente || 0, custo_arrendamento || 0,
                    custo_depreciacao_equipamento || 0, custo_seguros || 0, custo_manutencao || 0,
                    custo_administrativos || 0, custo_outros_fixos || 0, investimento_equipamento || 0,
                    investimento_infraestrutura || 0, investimento_outros || 0, realizado_receitas || 0,
                    realizado_custos_variaveis || 0, realizado_custos_fixos || 0,
                    realizado_investimentos || 0, rendimento_esperado_kg, preco_venda_kg,
                    status || 'planejamento', observacoes
                ]
            );

            orcamento = result.rows[0];
        }

        // Calcular indicadores
        const analise = calcularAnalise(orcamento);

        res.json({
            message: id ? 'Orçamento atualizado com sucesso' : 'Orçamento criado com sucesso',
            orcamento,
            analise
        });

    } catch (error) {
        console.error('Erro ao salvar orçamento parcial:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                error: 'Já existe um orçamento com este nome para o exercício selecionado'
            });
        }

        res.status(500).json({ error: 'Erro ao salvar orçamento parcial' });
    }
};

// ==================== LISTAR ORÇAMENTOS ====================

exports.listOrcamentos = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio, tipo, status } = req.query;

        let query = 'SELECT * FROM orcamentos_parciais WHERE user_id = $1';
        const params = [userId];
        let paramCount = 1;

        if (exercicio) {
            paramCount++;
            query += ` AND exercicio = $${paramCount}`;
            params.push(exercicio);
        }

        if (tipo) {
            paramCount++;
            query += ` AND tipo = $${paramCount}`;
            params.push(tipo);
        }

        if (status) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }

        query += ' ORDER BY exercicio DESC, created_at DESC';

        const result = await pool.query(query, params);

        // Adicionar análise a cada orçamento
        const orcamentosComAnalise = result.rows.map(orc => ({
            ...orc,
            analise: calcularAnalise(orc)
        }));

        res.json({
            orcamentos: orcamentosComAnalise
        });

    } catch (error) {
        console.error('Erro ao listar orçamentos:', error);
        res.status(500).json({ error: 'Erro ao listar orçamentos' });
    }
};

// ==================== OBTER ORÇAMENTO ESPECÍFICO ====================

exports.getOrcamento = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM orcamentos_parciais WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        const orcamento = result.rows[0];
        const analise = calcularAnalise(orcamento);

        res.json({
            orcamento,
            analise
        });

    } catch (error) {
        console.error('Erro ao obter orçamento:', error);
        res.status(500).json({ error: 'Erro ao obter orçamento' });
    }
};

// ==================== DELETAR ORÇAMENTO ====================

exports.deleteOrcamento = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM orcamentos_parciais WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        res.json({
            message: 'Orçamento deletado com sucesso',
            orcamento: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao deletar orçamento:', error);
        res.status(500).json({ error: 'Erro ao deletar orçamento' });
    }
};

// ==================== APROVAR ORÇAMENTO ====================

exports.aprovarOrcamento = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE orcamentos_parciais SET
                status = 'aprovado',
                aprovado_por = $1,
                data_aprovacao = CURRENT_TIMESTAMP
            WHERE id = $2 AND user_id = $1
            RETURNING *`,
            [userId, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        const orcamento = result.rows[0];
        const analise = calcularAnalise(orcamento);

        res.json({
            message: 'Orçamento aprovado com sucesso',
            orcamento,
            analise
        });

    } catch (error) {
        console.error('Erro ao aprovar orçamento:', error);
        res.status(500).json({ error: 'Erro ao aprovar orçamento' });
    }
};

// ==================== ATUALIZAR STATUS ====================

exports.updateStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body;

        const statusValidos = ['planejamento', 'aprovado', 'em_execucao', 'concluido', 'cancelado'];
        if (!statusValidos.includes(status)) {
            return res.status(400).json({ error: 'Status inválido' });
        }

        const result = await pool.query(
            'UPDATE orcamentos_parciais SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [status, id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        const orcamento = result.rows[0];
        const analise = calcularAnalise(orcamento);

        res.json({
            message: 'Status atualizado com sucesso',
            orcamento,
            analise
        });

    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
};

// ==================== COMPARAR ORÇAMENTOS ====================

exports.compararOrcamentos = async (req, res) => {
    try {
        const userId = req.user.id;
        const { ids } = req.query; // Formato: "1,2,3"

        if (!ids) {
            return res.status(400).json({ error: 'IDs dos orçamentos não fornecidos' });
        }

        const idsArray = ids.split(',').map(id => parseInt(id));

        const result = await pool.query(
            'SELECT * FROM orcamentos_parciais WHERE id = ANY($1) AND user_id = $2',
            [idsArray, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum orçamento encontrado' });
        }

        const comparacao = result.rows.map(orc => {
            const analise = calcularAnalise(orc);
            return {
                id: orc.id,
                nome: orc.nome,
                tipo: orc.tipo,
                exercicio: orc.exercicio,
                ...analise
            };
        });

        res.json({
            comparacao
        });

    } catch (error) {
        console.error('Erro ao comparar orçamentos:', error);
        res.status(500).json({ error: 'Erro ao comparar orçamentos' });
    }
};

// ==================== CONSOLIDAÇÃO POR EXERCÍCIO ====================

exports.getConsolidacao = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.params;

        const result = await pool.query(
            'SELECT * FROM orcamentos_parciais WHERE user_id = $1 AND exercicio = $2',
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.json({
                exercicio,
                total_orcamentos: 0,
                consolidacao: {
                    receitas_previstas: 0,
                    custos_previstos: 0,
                    investimentos_previstos: 0,
                    resultado_previsto: 0,
                    receitas_realizadas: 0,
                    custos_realizados: 0,
                    investimentos_realizados: 0,
                    resultado_realizado: 0
                },
                por_tipo: {}
            });
        }

        let receitasPrevistas = 0;
        let custosPrevistosVar = 0;
        let custosPrevistosFixos = 0;
        let investimentosPrevistos = 0;
        let receitasRealizadas = 0;
        let custosRealizadosVar = 0;
        let custosRealizadosFixos = 0;
        let investimentosRealizados = 0;

        const porTipo = {};

        result.rows.forEach(orc => {
            const analise = calcularAnalise(orc);

            receitasPrevistas += analise.total_receitas;
            custosPrevistosVar += analise.total_custos_variaveis;
            custosPrevistosFixos += analise.total_custos_fixos;
            investimentosPrevistos += analise.total_investimentos;
            receitasRealizadas += parseFloat(orc.realizado_receitas || 0);
            custosRealizadosVar += parseFloat(orc.realizado_custos_variaveis || 0);
            custosRealizadosFixos += parseFloat(orc.realizado_custos_fixos || 0);
            investimentosRealizados += parseFloat(orc.realizado_investimentos || 0);

            // Agrupar por tipo
            if (!porTipo[orc.tipo]) {
                porTipo[orc.tipo] = {
                    quantidade: 0,
                    receitas: 0,
                    custos: 0,
                    resultado: 0
                };
            }

            porTipo[orc.tipo].quantidade++;
            porTipo[orc.tipo].receitas += analise.total_receitas;
            porTipo[orc.tipo].custos += analise.total_custos_variaveis + analise.total_custos_fixos;
            porTipo[orc.tipo].resultado += analise.resultado_liquido;
        });

        const custosPrevistos = custosPrevistosVar + custosPrevistosFixos;
        const custosRealizados = custosRealizadosVar + custosRealizadosFixos;

        res.json({
            exercicio,
            total_orcamentos: result.rows.length,
            consolidacao: {
                receitas_previstas: receitasPrevistas,
                custos_previstos: custosPrevistos,
                investimentos_previstos: investimentosPrevistos,
                resultado_previsto: receitasPrevistas - custosPrevistos,
                receitas_realizadas: receitasRealizadas,
                custos_realizados: custosRealizados,
                investimentos_realizados: investimentosRealizados,
                resultado_realizado: receitasRealizadas - custosRealizados,
                desvio_receitas: receitasRealizadas - receitasPrevistas,
                desvio_custos: custosRealizados - custosPrevistos,
                desvio_resultado: (receitasRealizadas - custosRealizados) - (receitasPrevistas - custosPrevistos),
                percentual_execucao_receitas: receitasPrevistas > 0 ? (receitasRealizadas / receitasPrevistas * 100) : 0,
                percentual_execucao_custos: custosPrevistos > 0 ? (custosRealizados / custosPrevistos * 100) : 0
            },
            por_tipo: porTipo,
            detalhes: result.rows.map(orc => ({
                id: orc.id,
                nome: orc.nome,
                tipo: orc.tipo,
                status: orc.status,
                analise: calcularAnalise(orc)
            }))
        });

    } catch (error) {
        console.error('Erro ao obter consolidação:', error);
        res.status(500).json({ error: 'Erro ao obter consolidação' });
    }
};

// ==================== FUNÇÃO AUXILIAR: CALCULAR ANÁLISE ====================

function calcularAnalise(orcamento) {
    // Receitas
    const totalReceitas =
        parseFloat(orcamento.receita_venda_principal || 0) +
        parseFloat(orcamento.receita_venda_secundaria || 0) +
        parseFloat(orcamento.receita_subsidios || 0) +
        parseFloat(orcamento.receita_outras || 0);

    // Custos Variáveis
    const totalCustosVariaveis =
        parseFloat(orcamento.custo_sementes || 0) +
        parseFloat(orcamento.custo_fertilizantes || 0) +
        parseFloat(orcamento.custo_fitosanitarios || 0) +
        parseFloat(orcamento.custo_combustivel || 0) +
        parseFloat(orcamento.custo_mao_obra_temporaria || 0) +
        parseFloat(orcamento.custo_agua_irrigacao || 0) +
        parseFloat(orcamento.custo_embalagens || 0) +
        parseFloat(orcamento.custo_transporte || 0) +
        parseFloat(orcamento.custo_outros_variaveis || 0);

    // Custos Fixos
    const totalCustosFixos =
        parseFloat(orcamento.custo_mao_obra_permanente || 0) +
        parseFloat(orcamento.custo_arrendamento || 0) +
        parseFloat(orcamento.custo_depreciacao_equipamento || 0) +
        parseFloat(orcamento.custo_seguros || 0) +
        parseFloat(orcamento.custo_manutencao || 0) +
        parseFloat(orcamento.custo_administrativos || 0) +
        parseFloat(orcamento.custo_outros_fixos || 0);

    // Investimentos
    const totalInvestimentos =
        parseFloat(orcamento.investimento_equipamento || 0) +
        parseFloat(orcamento.investimento_infraestrutura || 0) +
        parseFloat(orcamento.investimento_outros || 0);

    // Indicadores
    const margemContribuicao = totalReceitas - totalCustosVariaveis;
    const totalCustos = totalCustosVariaveis + totalCustosFixos;
    const resultadoLiquido = totalReceitas - totalCustos;
    const margemLiquida = totalReceitas > 0 ? (resultadoLiquido / totalReceitas * 100) : 0;
    const pontoEquilibrio = margemContribuicao > 0 ? (totalCustosFixos / (margemContribuicao / totalReceitas)) : 0;

    // ROI (se houver investimentos)
    const roi = totalInvestimentos > 0 ? (resultadoLiquido / totalInvestimentos * 100) : 0;

    // Para culturas: análise por hectare
    let analiseHectare = null;
    if (orcamento.tipo === 'cultura' && parseFloat(orcamento.area_hectares || 0) > 0) {
        const area = parseFloat(orcamento.area_hectares);
        analiseHectare = {
            receita_por_ha: totalReceitas / area,
            custo_por_ha: totalCustos / area,
            resultado_por_ha: resultadoLiquido / area,
            rendimento_esperado_kg: parseFloat(orcamento.rendimento_esperado_kg || 0),
            preco_venda_kg: parseFloat(orcamento.preco_venda_kg || 0)
        };
    }

    // Realizado vs Previsto
    const realizadoReceitas = parseFloat(orcamento.realizado_receitas || 0);
    const realizadoCustosVar = parseFloat(orcamento.realizado_custos_variaveis || 0);
    const realizadoCustosFixos = parseFloat(orcamento.realizado_custos_fixos || 0);
    const realizadoInvest = parseFloat(orcamento.realizado_investimentos || 0);
    const realizadoCustos = realizadoCustosVar + realizadoCustosFixos;
    const realizadoResultado = realizadoReceitas - realizadoCustos;

    const desvioReceitas = realizadoReceitas - totalReceitas;
    const desvioCustos = realizadoCustos - totalCustos;
    const desvioResultado = realizadoResultado - resultadoLiquido;

    const execucaoReceitas = totalReceitas > 0 ? (realizadoReceitas / totalReceitas * 100) : 0;
    const execucaoCustos = totalCustos > 0 ? (realizadoCustos / totalCustos * 100) : 0;

    return {
        total_receitas: totalReceitas,
        total_custos_variaveis: totalCustosVariaveis,
        total_custos_fixos: totalCustosFixos,
        total_custos: totalCustos,
        total_investimentos: totalInvestimentos,
        margem_contribuicao: margemContribuicao,
        resultado_liquido: resultadoLiquido,
        margem_liquida_percentual: margemLiquida,
        ponto_equilibrio: pontoEquilibrio,
        roi_percentual: roi,
        analise_hectare: analiseHectare,
        realizado: {
            receitas: realizadoReceitas,
            custos_variaveis: realizadoCustosVar,
            custos_fixos: realizadoCustosFixos,
            custos_totais: realizadoCustos,
            investimentos: realizadoInvest,
            resultado: realizadoResultado
        },
        desvios: {
            receitas: desvioReceitas,
            custos: desvioCustos,
            resultado: desvioResultado,
            percentual_receitas: desvioReceitas !== 0 && totalReceitas > 0 ? (desvioReceitas / totalReceitas * 100) : 0,
            percentual_custos: desvioCustos !== 0 && totalCustos > 0 ? (desvioCustos / totalCustos * 100) : 0
        },
        execucao: {
            receitas_percentual: execucaoReceitas,
            custos_percentual: execucaoCustos
        }
    };
}

module.exports = exports;
