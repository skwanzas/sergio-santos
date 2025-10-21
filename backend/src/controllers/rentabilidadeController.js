const pool = require('../config/database');

// ==================== SALVAR/ATUALIZAR ANÁLISE ====================

exports.saveRentabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            id,
            exercicio,
            cultura,
            variedade,
            safra,
            area_hectares,
            producao_total_kg,
            rendimento_kg_ha,
            perdas_kg,
            preco_venda_kg,
            preco_mercado_kg,
            receita_venda_principal,
            receita_venda_secundaria,
            receita_subsidios,
            custo_sementes,
            custo_fertilizantes,
            custo_fitosanitarios,
            custo_irrigacao,
            custo_mao_obra_colheita,
            custo_transporte,
            custo_outros_variaveis,
            custo_arrendamento,
            custo_depreciacao,
            custo_mao_obra_fixa,
            custo_outros_fixos,
            data_plantio,
            data_colheita,
            observacoes,
            clima_condicoes,
            solo_tipo
        } = req.body;

        // Validações
        if (!exercicio || !cultura || !area_hectares) {
            return res.status(400).json({
                error: 'Campos obrigatórios: exercicio, cultura, area_hectares'
            });
        }

        // Calcular rendimento se não fornecido
        let rendimento = rendimento_kg_ha;
        if (!rendimento && producao_total_kg && area_hectares > 0) {
            rendimento = parseFloat(producao_total_kg) / parseFloat(area_hectares);
        }

        // Calcular dias de ciclo se datas fornecidas
        let dias_ciclo = null;
        if (data_plantio && data_colheita) {
            const plantio = new Date(data_plantio);
            const colheita = new Date(data_colheita);
            dias_ciclo = Math.floor((colheita - plantio) / (1000 * 60 * 60 * 24));
        }

        let rentabilidade;

        if (id) {
            // Atualizar existente
            const result = await pool.query(
                `UPDATE rentabilidade_culturas SET
                    exercicio = $1, cultura = $2, variedade = $3, safra = $4,
                    area_hectares = $5, producao_total_kg = $6, rendimento_kg_ha = $7,
                    perdas_kg = $8, preco_venda_kg = $9, preco_mercado_kg = $10,
                    receita_venda_principal = $11, receita_venda_secundaria = $12,
                    receita_subsidios = $13, custo_sementes = $14, custo_fertilizantes = $15,
                    custo_fitosanitarios = $16, custo_irrigacao = $17, custo_mao_obra_colheita = $18,
                    custo_transporte = $19, custo_outros_variaveis = $20, custo_arrendamento = $21,
                    custo_depreciacao = $22, custo_mao_obra_fixa = $23, custo_outros_fixos = $24,
                    data_plantio = $25, data_colheita = $26, dias_ciclo = $27,
                    observacoes = $28, clima_condicoes = $29, solo_tipo = $30
                WHERE id = $31 AND user_id = $32
                RETURNING *`,
                [
                    exercicio, cultura, variedade, safra, area_hectares, producao_total_kg,
                    rendimento, perdas_kg, preco_venda_kg, preco_mercado_kg,
                    receita_venda_principal, receita_venda_secundaria, receita_subsidios,
                    custo_sementes, custo_fertilizantes, custo_fitosanitarios, custo_irrigacao,
                    custo_mao_obra_colheita, custo_transporte, custo_outros_variaveis,
                    custo_arrendamento, custo_depreciacao, custo_mao_obra_fixa, custo_outros_fixos,
                    data_plantio, data_colheita, dias_ciclo, observacoes, clima_condicoes, solo_tipo,
                    id, userId
                ]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Análise não encontrada' });
            }

            rentabilidade = result.rows[0];
        } else {
            // Criar novo
            const result = await pool.query(
                `INSERT INTO rentabilidade_culturas (
                    user_id, exercicio, cultura, variedade, safra, area_hectares,
                    producao_total_kg, rendimento_kg_ha, perdas_kg, preco_venda_kg, preco_mercado_kg,
                    receita_venda_principal, receita_venda_secundaria, receita_subsidios,
                    custo_sementes, custo_fertilizantes, custo_fitosanitarios, custo_irrigacao,
                    custo_mao_obra_colheita, custo_transporte, custo_outros_variaveis,
                    custo_arrendamento, custo_depreciacao, custo_mao_obra_fixa, custo_outros_fixos,
                    data_plantio, data_colheita, dias_ciclo, observacoes, clima_condicoes, solo_tipo
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                    $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
                ) RETURNING *`,
                [
                    userId, exercicio, cultura, variedade, safra, area_hectares,
                    producao_total_kg, rendimento, perdas_kg || 0, preco_venda_kg, preco_mercado_kg,
                    receita_venda_principal || 0, receita_venda_secundaria || 0, receita_subsidios || 0,
                    custo_sementes || 0, custo_fertilizantes || 0, custo_fitosanitarios || 0,
                    custo_irrigacao || 0, custo_mao_obra_colheita || 0, custo_transporte || 0,
                    custo_outros_variaveis || 0, custo_arrendamento || 0, custo_depreciacao || 0,
                    custo_mao_obra_fixa || 0, custo_outros_fixos || 0, data_plantio, data_colheita,
                    dias_ciclo, observacoes, clima_condicoes, solo_tipo
                ]
            );

            rentabilidade = result.rows[0];
        }

        // Calcular indicadores
        const indicadores = calcularIndicadores(rentabilidade);

        // Atualizar indicadores na base de dados
        await pool.query(
            `UPDATE rentabilidade_culturas SET
                margem_bruta = $1, margem_liquida = $2,
                margem_bruta_percentual = $3, margem_liquida_percentual = $4,
                rentabilidade_hectare = $5, custo_producao_kg = $6,
                ponto_equilibrio_kg = $7, roi_percentual = $8
            WHERE id = $9 RETURNING *`,
            [
                indicadores.margem_bruta, indicadores.margem_liquida,
                indicadores.margem_bruta_percentual, indicadores.margem_liquida_percentual,
                indicadores.rentabilidade_hectare, indicadores.custo_producao_kg,
                indicadores.ponto_equilibrio_kg, indicadores.roi_percentual,
                rentabilidade.id
            ]
        );

        // Buscar dados atualizados
        const finalResult = await pool.query(
            'SELECT * FROM rentabilidade_culturas WHERE id = $1',
            [rentabilidade.id]
        );

        res.json({
            message: id ? 'Análise atualizada com sucesso' : 'Análise criada com sucesso',
            rentabilidade: finalResult.rows[0],
            indicadores
        });

    } catch (error) {
        console.error('Erro ao salvar análise:', error);

        if (error.code === '23505') {
            return res.status(400).json({
                error: 'Já existe uma análise para esta cultura e safra no exercício selecionado'
            });
        }

        res.status(500).json({ error: 'Erro ao salvar análise de rentabilidade' });
    }
};

// ==================== LISTAR ANÁLISES ====================

exports.listRentabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio, cultura } = req.query;

        let query = 'SELECT * FROM rentabilidade_culturas WHERE user_id = $1';
        const params = [userId];
        let paramCount = 1;

        if (exercicio) {
            paramCount++;
            query += ` AND exercicio = $${paramCount}`;
            params.push(exercicio);
        }

        if (cultura) {
            paramCount++;
            query += ` AND cultura ILIKE $${paramCount}`;
            params.push(`%${cultura}%`);
        }

        query += ' ORDER BY exercicio DESC, margem_liquida_percentual DESC NULLS LAST';

        const result = await pool.query(query, params);

        res.json({
            analises: result.rows
        });

    } catch (error) {
        console.error('Erro ao listar análises:', error);
        res.status(500).json({ error: 'Erro ao listar análises' });
    }
};

// ==================== OBTER ANÁLISE ESPECÍFICA ====================

exports.getRentabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'SELECT * FROM rentabilidade_culturas WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Análise não encontrada' });
        }

        res.json({
            rentabilidade: result.rows[0]
        });

    } catch (error) {
        console.error('Erro ao obter análise:', error);
        res.status(500).json({ error: 'Erro ao obter análise' });
    }
};

// ==================== DELETAR ANÁLISE ====================

exports.deleteRentabilidade = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM rentabilidade_culturas WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Análise não encontrada' });
        }

        res.json({
            message: 'Análise deletada com sucesso'
        });

    } catch (error) {
        console.error('Erro ao deletar análise:', error);
        res.status(500).json({ error: 'Erro ao deletar análise' });
    }
};

// ==================== COMPARAR CULTURAS ====================

exports.compararCulturas = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.params;

        const result = await pool.query(
            `SELECT
                cultura,
                COUNT(*) as num_analises,
                SUM(area_hectares) as area_total,
                AVG(rendimento_kg_ha) as rendimento_medio,
                AVG(preco_venda_kg) as preco_medio,
                SUM(receita_total) as receita_total,
                SUM(custo_total) as custo_total,
                AVG(margem_liquida_percentual) as margem_media,
                AVG(rentabilidade_hectare) as rentabilidade_media_ha
            FROM rentabilidade_culturas
            WHERE user_id = $1 AND exercicio = $2
            GROUP BY cultura
            ORDER BY rentabilidade_media_ha DESC NULLS LAST`,
            [userId, exercicio]
        );

        res.json({
            exercicio,
            comparacao: result.rows
        });

    } catch (error) {
        console.error('Erro ao comparar culturas:', error);
        res.status(500).json({ error: 'Erro ao comparar culturas' });
    }
};

// ==================== RANKING DE RENTABILIDADE ====================

exports.getRanking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.params;

        const result = await pool.query(
            `SELECT * FROM vw_ranking_rentabilidade
            WHERE user_id = $1 AND exercicio = $2
            ORDER BY ranking_margem`,
            [userId, exercicio]
        );

        res.json({
            exercicio,
            ranking: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter ranking:', error);
        res.status(500).json({ error: 'Erro ao obter ranking' });
    }
};

// ==================== ANÁLISE CONSOLIDADA POR EXERCÍCIO ====================

exports.getConsolidacao = async (req, res) => {
    try {
        const userId = req.user.id;
        const { exercicio } = req.params;

        const result = await pool.query(
            `SELECT * FROM rentabilidade_culturas
            WHERE user_id = $1 AND exercicio = $2
            ORDER BY margem_liquida_percentual DESC NULLS LAST`,
            [userId, exercicio]
        );

        if (result.rows.length === 0) {
            return res.json({
                exercicio,
                total_analises: 0,
                consolidacao: {}
            });
        }

        // Consolidar dados
        const consolidacao = {
            area_total: 0,
            receita_total: 0,
            custo_total: 0,
            margem_liquida: 0,
            producao_total: 0,
            num_culturas: new Set()
        };

        result.rows.forEach(item => {
            consolidacao.area_total += parseFloat(item.area_hectares || 0);
            consolidacao.receita_total += parseFloat(item.receita_total || 0);
            consolidacao.custo_total += parseFloat(item.custo_total || 0);
            consolidacao.margem_liquida += parseFloat(item.margem_liquida || 0);
            consolidacao.producao_total += parseFloat(item.producao_total_kg || 0);
            consolidacao.num_culturas.add(item.cultura);
        });

        consolidacao.num_culturas = consolidacao.num_culturas.size;
        consolidacao.margem_percentual = consolidacao.receita_total > 0
            ? (consolidacao.margem_liquida / consolidacao.receita_total * 100)
            : 0;
        consolidacao.receita_por_hectare = consolidacao.area_total > 0
            ? (consolidacao.receita_total / consolidacao.area_total)
            : 0;
        consolidacao.custo_por_hectare = consolidacao.area_total > 0
            ? (consolidacao.custo_total / consolidacao.area_total)
            : 0;

        res.json({
            exercicio,
            total_analises: result.rows.length,
            consolidacao,
            detalhes: result.rows
        });

    } catch (error) {
        console.error('Erro ao obter consolidação:', error);
        res.status(500).json({ error: 'Erro ao obter consolidação' });
    }
};

// ==================== FUNÇÃO AUXILIAR: CALCULAR INDICADORES ====================

function calcularIndicadores(rentabilidade) {
    const receita_total = parseFloat(rentabilidade.receita_total || 0);
    const custo_variaveis = parseFloat(rentabilidade.custo_variaveis_total || 0);
    const custo_fixos = parseFloat(rentabilidade.custo_fixos_total || 0);
    const custo_total = parseFloat(rentabilidade.custo_total || 0);
    const area = parseFloat(rentabilidade.area_hectares || 0);
    const producao = parseFloat(rentabilidade.producao_total_kg || 0);
    const preco_venda = parseFloat(rentabilidade.preco_venda_kg || 0);

    // Margem Bruta
    const margem_bruta = receita_total - custo_variaveis;
    const margem_bruta_percentual = receita_total > 0 ? (margem_bruta / receita_total * 100) : 0;

    // Margem Líquida
    const margem_liquida = receita_total - custo_total;
    const margem_liquida_percentual = receita_total > 0 ? (margem_liquida / receita_total * 100) : 0;

    // Rentabilidade por Hectare
    const rentabilidade_hectare = area > 0 ? (margem_liquida / area) : 0;

    // Custo de Produção por Kg
    const custo_producao_kg = producao > 0 ? (custo_total / producao) : 0;

    // Ponto de Equilíbrio em Kg
    const ponto_equilibrio_kg = preco_venda > 0 ? (custo_total / preco_venda) : 0;

    // ROI
    const roi_percentual = custo_total > 0 ? (margem_liquida / custo_total * 100) : 0;

    return {
        margem_bruta,
        margem_liquida,
        margem_bruta_percentual,
        margem_liquida_percentual,
        rentabilidade_hectare,
        custo_producao_kg,
        ponto_equilibrio_kg,
        roi_percentual
    };
}

module.exports = exports;
