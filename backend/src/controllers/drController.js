const db = require('../config/database');

class DRController {
    /**
     * Criar/Atualizar Demonstração de Resultados
     * POST /api/dr
     */
    async saveDR(req, res) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const { exercicio, proveitos, custos } = req.body;
            const empresa_id = req.user.empresa_id;

            // Validação
            if (!exercicio || exercicio < 2020 || exercicio > 2100) {
                return res.status(400).json({
                    error: 'Exercício inválido (deve estar entre 2020 e 2100)'
                });
            }

            // Verificar se já existe DR para este exercício
            const existingDR = await client.query(
                'SELECT id FROM demonstracao_resultados WHERE empresa_id = $1 AND exercicio = $2',
                [empresa_id, exercicio]
            );

            let query, params;

            if (existingDR.rows.length > 0) {
                // Atualizar DR existente
                query = `
                    UPDATE demonstracao_resultados
                    SET vendas_oleo_sesamo = $3,
                        vendas_torta_sesamo = $4,
                        vendas_feijao_guandu = $5,
                        vendas_carne_ovina = $6,
                        vendas_carne_suina = $7,
                        vendas_linguica_porco = $8,
                        vendas_presunto_bacon = $9,
                        vendas_linguica_cordeiro = $10,
                        vendas_carne_ovina_proc = $11,
                        vendas_leite_sesamo = $12,
                        vendas_queijo_sesamo = $13,
                        vendas_queijo_ovelha = $14,
                        vendas_queijo_cordeiro = $15,
                        vendas_mel = $16,
                        servicos_agricolas = $17,
                        servicos_tecnicos = $18,
                        subsidios_agricultura = $19,
                        subsidios_pecuaria = $20,
                        juros_obtidos = $21,
                        materias_primas = $22,
                        combustiveis = $23,
                        embalagens = $24,
                        sal_mineral = $25,
                        medicamentos = $26,
                        condimentos = $27,
                        materiais_diversos = $28,
                        subcontratos = $29,
                        servicos_especializados = $30,
                        agua_fluidos = $31,
                        deslocacoes = $32,
                        seguros = $33,
                        remuneracoes_pessoal = $34,
                        encargos_remuneracoes = $35,
                        amortizacoes = $36,
                        juros_suportados = $37,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE empresa_id = $1 AND exercicio = $2
                    RETURNING *`;
            } else {
                // Inserir nova DR
                query = `
                    INSERT INTO demonstracao_resultados (
                        empresa_id, exercicio,
                        vendas_oleo_sesamo, vendas_torta_sesamo, vendas_feijao_guandu,
                        vendas_carne_ovina, vendas_carne_suina, vendas_linguica_porco,
                        vendas_presunto_bacon, vendas_linguica_cordeiro, vendas_carne_ovina_proc,
                        vendas_leite_sesamo, vendas_queijo_sesamo, vendas_queijo_ovelha,
                        vendas_queijo_cordeiro, vendas_mel, servicos_agricolas, servicos_tecnicos,
                        subsidios_agricultura, subsidios_pecuaria, juros_obtidos,
                        materias_primas, combustiveis, embalagens, sal_mineral, medicamentos,
                        condimentos, materiais_diversos, subcontratos, servicos_especializados,
                        agua_fluidos, deslocacoes, seguros, remuneracoes_pessoal,
                        encargos_remuneracoes, amortizacoes, juros_suportados
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                        $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
                        $29, $30, $31, $32, $33, $34, $35, $36, $37
                    )
                    RETURNING *`;
            }

            params = [
                empresa_id, exercicio,
                proveitos?.vendasOleoSesamo || 0,
                proveitos?.vendasTortaSesamo || 0,
                proveitos?.vendasFeijaoGuandu || 0,
                proveitos?.vendasCarneOvina || 0,
                proveitos?.vendasCarneSuina || 0,
                proveitos?.vendasLinguicaPorco || 0,
                proveitos?.vendasPresuntoBacon || 0,
                proveitos?.vendasLinguicaCordeiro || 0,
                proveitos?.vendasCarneOvinaProc || 0,
                proveitos?.vendasLeiteSesamo || 0,
                proveitos?.vendasQueijoSesamo || 0,
                proveitos?.vendasQueijoOvelha || 0,
                proveitos?.vendasQueijoCordeiro || 0,
                proveitos?.vendasMel || 0,
                proveitos?.servicosAgricolas || 0,
                proveitos?.servicosTecnicos || 0,
                proveitos?.subsidiosAgricultura || 0,
                proveitos?.subsidiosPecuaria || 0,
                proveitos?.jurosObtidos || 0,
                custos?.materiasPrimas || 0,
                custos?.combustiveis || 0,
                custos?.embalagens || 0,
                custos?.salMineral || 0,
                custos?.medicamentos || 0,
                custos?.condimentos || 0,
                custos?.materiaisDiversos || 0,
                custos?.subcontratos || 0,
                custos?.servicosEspecializados || 0,
                custos?.aguaFluidos || 0,
                custos?.deslocacoes || 0,
                custos?.seguros || 0,
                custos?.remuneracoesPessoal || 0,
                custos?.encargosRemuneracoes || 0,
                custos?.amortizacoes || 0,
                custos?.jurosSuportados || 0
            ];

            const result = await client.query(query, params);
            const dr = result.rows[0];

            // Calcular imposto industrial (25% do resultado operacional positivo)
            const impostoIndustrial = Math.max(0, dr.resultado_operacional * 0.25);
            const resultadoLiquido = dr.resultado_operacional - impostoIndustrial;

            // Atualizar com os valores calculados
            await client.query(
                `UPDATE demonstracao_resultados
                 SET imposto_industrial = $1, resultado_liquido = $2
                 WHERE id = $3`,
                [impostoIndustrial, resultadoLiquido, dr.id]
            );

            await client.query('COMMIT');

            res.json({
                message: 'Demonstração de Resultados guardada com sucesso',
                dr: {
                    ...dr,
                    imposto_industrial: impostoIndustrial,
                    resultado_liquido: resultadoLiquido
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao guardar DR:', error);
            res.status(500).json({
                error: 'Erro ao guardar Demonstração de Resultados',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            client.release();
        }
    }

    /**
     * Obter Demonstração de Resultados por exercício
     * GET /api/dr/:exercicio
     */
    async getDR(req, res) {
        try {
            const { exercicio } = req.params;
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                'SELECT * FROM demonstracao_resultados WHERE empresa_id = $1 AND exercicio = $2',
                [empresa_id, exercicio]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Demonstração de Resultados não encontrada'
                });
            }

            res.json({
                dr: result.rows[0]
            });

        } catch (error) {
            console.error('Erro ao obter DR:', error);
            res.status(500).json({
                error: 'Erro ao obter Demonstração de Resultados'
            });
        }
    }

    /**
     * Listar todas as DRs da empresa
     * GET /api/dr
     */
    async listDRs(req, res) {
        try {
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                `SELECT exercicio, total_proveitos, total_custos,
                        resultado_operacional, imposto_industrial, resultado_liquido,
                        created_at, updated_at
                 FROM demonstracao_resultados
                 WHERE empresa_id = $1
                 ORDER BY exercicio DESC`,
                [empresa_id]
            );

            res.json({
                drs: result.rows
            });

        } catch (error) {
            console.error('Erro ao listar DRs:', error);
            res.status(500).json({
                error: 'Erro ao listar Demonstrações de Resultados'
            });
        }
    }

    /**
     * Eliminar Demonstração de Resultados
     * DELETE /api/dr/:exercicio
     */
    async deleteDR(req, res) {
        try {
            const { exercicio } = req.params;
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                'DELETE FROM demonstracao_resultados WHERE empresa_id = $1 AND exercicio = $2 RETURNING *',
                [empresa_id, exercicio]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Demonstração de Resultados não encontrada'
                });
            }

            res.json({
                message: 'Demonstração de Resultados eliminada com sucesso'
            });

        } catch (error) {
            console.error('Erro ao eliminar DR:', error);
            res.status(500).json({
                error: 'Erro ao eliminar Demonstração de Resultados'
            });
        }
    }

    /**
     * Obter resumo comparativo de vários exercícios
     * GET /api/dr/comparativo/:anos
     */
    async getComparativo(req, res) {
        try {
            const { anos } = req.params; // Ex: "2023,2024,2025"
            const empresa_id = req.user.empresa_id;
            const anosArray = anos.split(',').map(a => parseInt(a));

            const result = await db.query(
                `SELECT exercicio, total_proveitos, total_custos,
                        resultado_operacional, resultado_liquido,
                        CASE
                            WHEN total_proveitos > 0
                            THEN ROUND((resultado_liquido / total_proveitos * 100), 2)
                            ELSE 0
                        END as margem_liquida_percentual
                 FROM demonstracao_resultados
                 WHERE empresa_id = $1 AND exercicio = ANY($2)
                 ORDER BY exercicio`,
                [empresa_id, anosArray]
            );

            res.json({
                comparativo: result.rows
            });

        } catch (error) {
            console.error('Erro ao obter comparativo:', error);
            res.status(500).json({
                error: 'Erro ao obter comparativo'
            });
        }
    }
}

module.exports = new DRController();
