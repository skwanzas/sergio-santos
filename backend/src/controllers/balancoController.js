const db = require('../config/database');

class BalancoController {
    /**
     * Criar/Atualizar Balanço Previsional
     * POST /api/balanco
     */
    async saveBalanco(req, res) {
        const client = await db.getClient();

        try {
            await client.query('BEGIN');

            const { exercicio, ativo, passivo } = req.body;
            const empresa_id = req.user.empresa_id;

            // Validação
            if (!exercicio || exercicio < 2020 || exercicio > 2100) {
                return res.status(400).json({
                    error: 'Exercício inválido (deve estar entre 2020 e 2100)'
                });
            }

            // Calcular totais
            const totalAtivoNaoCorrente = (
                (ativo?.terrenosRecursos || 0) +
                (ativo?.edificiosConstrucoes || 0) +
                (ativo?.instalacoesSuinicolas || 0) +
                (ativo?.salasProcessamento || 0) +
                (ativo?.equipamentoBasico || 0) +
                (ativo?.equipamentoProcCarne || 0) +
                (ativo?.equipamentoQueijaria || 0) +
                (ativo?.equipamentoOrdenha || 0) +
                (ativo?.sistemaSolar || 0) +
                (ativo?.geradores || 0) +
                (ativo?.biodigestor || 0) +
                (ativo?.equipamentoTransporte || 0) +
                (ativo?.animaisReproducao || 0) +
                (ativo?.matrizesSuinos || 0) +
                (ativo?.matrizesOvinas || 0)
            );

            const totalAtivoCorrente = (
                (ativo?.sesamoGrao || 0) +
                (ativo?.forragensSeca || 0) +
                (ativo?.salMineralStock || 0) +
                (ativo?.produtosAcabados || 0) +
                (ativo?.clientes || 0) +
                (ativo?.caixa || 0) +
                (ativo?.depositosOrdem || 0)
            );

            const totalAtivo = totalAtivoNaoCorrente + totalAtivoCorrente;

            const capitalProprio = (
                (passivo?.capitalSocial || 0) +
                (passivo?.resultadosTransitados || 0) +
                (passivo?.resultadoLiquido || 0)
            );

            const totalPassivo = (
                capitalProprio +
                (passivo?.emprestimosCP || 0) +
                (passivo?.emprestimosLP || 0) +
                (passivo?.fornecedores || 0) +
                (passivo?.estadoOutrosEntes || 0)
            );

            // Verificar equilíbrio do balanço
            const desequilibrio = Math.abs(totalAtivo - totalPassivo);
            const tolerancia = 0.01; // Tolerância de 1 cêntimo

            if (desequilibrio > tolerancia) {
                return res.status(400).json({
                    error: 'Balanço desequilibrado',
                    details: {
                        totalAtivo,
                        totalPassivo,
                        diferenca: totalAtivo - totalPassivo,
                        message: 'O Ativo deve ser igual ao Passivo + Capital Próprio'
                    }
                });
            }

            // Verificar se já existe balanço para este exercício
            const existingBalanco = await client.query(
                'SELECT id FROM balanco_previsional WHERE empresa_id = $1 AND exercicio = $2',
                [empresa_id, exercicio]
            );

            let query, params;

            if (existingBalanco.rows.length > 0) {
                // Atualizar balanço existente
                query = `
                    UPDATE balanco_previsional
                    SET terrenos_recursos = $3,
                        edificios_construcoes = $4,
                        instalacoes_suinicolas = $5,
                        salas_processamento = $6,
                        equipamento_basico = $7,
                        equipamento_proc_carne = $8,
                        equipamento_queijaria = $9,
                        equipamento_ordenha = $10,
                        sistema_solar = $11,
                        geradores = $12,
                        biodigestor = $13,
                        equipamento_transporte = $14,
                        animais_reproducao = $15,
                        matrizes_suinos = $16,
                        matrizes_ovinas = $17,
                        sesamo_grao = $18,
                        forragens_seca = $19,
                        sal_mineral_stock = $20,
                        produtos_acabados = $21,
                        clientes = $22,
                        caixa = $23,
                        depositos_ordem = $24,
                        capital_social = $25,
                        resultados_transitados = $26,
                        resultado_liquido = $27,
                        emprestimos_cp = $28,
                        emprestimos_lp = $29,
                        fornecedores = $30,
                        estado_outros_entes = $31,
                        updated_at = CURRENT_TIMESTAMP
                    WHERE empresa_id = $1 AND exercicio = $2
                    RETURNING *`;
            } else {
                // Inserir novo balanço
                query = `
                    INSERT INTO balanco_previsional (
                        empresa_id, exercicio,
                        terrenos_recursos, edificios_construcoes, instalacoes_suinicolas,
                        salas_processamento, equipamento_basico, equipamento_proc_carne,
                        equipamento_queijaria, equipamento_ordenha, sistema_solar,
                        geradores, biodigestor, equipamento_transporte,
                        animais_reproducao, matrizes_suinos, matrizes_ovinas,
                        sesamo_grao, forragens_seca, sal_mineral_stock,
                        produtos_acabados, clientes, caixa, depositos_ordem,
                        capital_social, resultados_transitados, resultado_liquido,
                        emprestimos_cp, emprestimos_lp, fornecedores, estado_outros_entes
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                        $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26,
                        $27, $28, $29, $30, $31
                    )
                    RETURNING *`;
            }

            params = [
                empresa_id, exercicio,
                ativo?.terrenosRecursos || 0,
                ativo?.edificiosConstrucoes || 0,
                ativo?.instalacoesSuinicolas || 0,
                ativo?.salasProcessamento || 0,
                ativo?.equipamentoBasico || 0,
                ativo?.equipamentoProcCarne || 0,
                ativo?.equipamentoQueijaria || 0,
                ativo?.equipamentoOrdenha || 0,
                ativo?.sistemaSolar || 0,
                ativo?.geradores || 0,
                ativo?.biodigestor || 0,
                ativo?.equipamentoTransporte || 0,
                ativo?.animaisReproducao || 0,
                ativo?.matrizesSuinos || 0,
                ativo?.matrizesOvinas || 0,
                ativo?.sesamoGrao || 0,
                ativo?.forragensSeca || 0,
                ativo?.salMineralStock || 0,
                ativo?.produtosAcabados || 0,
                ativo?.clientes || 0,
                ativo?.caixa || 0,
                ativo?.depositosOrdem || 0,
                passivo?.capitalSocial || 0,
                passivo?.resultadosTransitados || 0,
                passivo?.resultadoLiquido || 0,
                passivo?.emprestimosCP || 0,
                passivo?.emprestimosLP || 0,
                passivo?.fornecedores || 0,
                passivo?.estadoOutrosEntes || 0
            ];

            const result = await client.query(query, params);
            const balanco = result.rows[0];

            await client.query('COMMIT');

            res.json({
                message: 'Balanço Previsional guardado com sucesso',
                balanco,
                totais: {
                    totalAtivo,
                    totalAtivoNaoCorrente,
                    totalAtivoCorrente,
                    totalPassivo,
                    capitalProprio,
                    equilibrado: true
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Erro ao guardar Balanço:', error);
            res.status(500).json({
                error: 'Erro ao guardar Balanço Previsional',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        } finally {
            client.release();
        }
    }

    /**
     * Obter Balanço Previsional por exercício
     * GET /api/balanco/:exercicio
     */
    async getBalanco(req, res) {
        try {
            const { exercicio } = req.params;
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                'SELECT * FROM balanco_previsional WHERE empresa_id = $1 AND exercicio = $2',
                [empresa_id, exercicio]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Balanço Previsional não encontrado'
                });
            }

            const balanco = result.rows[0];

            // Calcular totais
            const totalAtivoNaoCorrente = (
                parseFloat(balanco.terrenos_recursos || 0) +
                parseFloat(balanco.edificios_construcoes || 0) +
                parseFloat(balanco.instalacoes_suinicolas || 0) +
                parseFloat(balanco.salas_processamento || 0) +
                parseFloat(balanco.equipamento_basico || 0) +
                parseFloat(balanco.equipamento_proc_carne || 0) +
                parseFloat(balanco.equipamento_queijaria || 0) +
                parseFloat(balanco.equipamento_ordenha || 0) +
                parseFloat(balanco.sistema_solar || 0) +
                parseFloat(balanco.geradores || 0) +
                parseFloat(balanco.biodigestor || 0) +
                parseFloat(balanco.equipamento_transporte || 0) +
                parseFloat(balanco.animais_reproducao || 0) +
                parseFloat(balanco.matrizes_suinos || 0) +
                parseFloat(balanco.matrizes_ovinas || 0)
            );

            const totalAtivoCorrente = (
                parseFloat(balanco.sesamo_grao || 0) +
                parseFloat(balanco.forragens_seca || 0) +
                parseFloat(balanco.sal_mineral_stock || 0) +
                parseFloat(balanco.produtos_acabados || 0) +
                parseFloat(balanco.clientes || 0) +
                parseFloat(balanco.caixa || 0) +
                parseFloat(balanco.depositos_ordem || 0)
            );

            const capitalProprio = (
                parseFloat(balanco.capital_social || 0) +
                parseFloat(balanco.resultados_transitados || 0) +
                parseFloat(balanco.resultado_liquido || 0)
            );

            const totalPassivoCP = (
                parseFloat(balanco.emprestimos_cp || 0) +
                parseFloat(balanco.fornecedores || 0) +
                parseFloat(balanco.estado_outros_entes || 0)
            );

            const totalPassivoLP = parseFloat(balanco.emprestimos_lp || 0);

            res.json({
                balanco,
                totais: {
                    totalAtivoNaoCorrente,
                    totalAtivoCorrente,
                    totalAtivo: totalAtivoNaoCorrente + totalAtivoCorrente,
                    capitalProprio,
                    totalPassivoCP,
                    totalPassivoLP,
                    totalPassivo: capitalProprio + totalPassivoCP + totalPassivoLP
                }
            });

        } catch (error) {
            console.error('Erro ao obter Balanço:', error);
            res.status(500).json({
                error: 'Erro ao obter Balanço Previsional'
            });
        }
    }

    /**
     * Listar todos os Balanços da empresa
     * GET /api/balanco
     */
    async listBalancos(req, res) {
        try {
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                `SELECT exercicio, capital_social, resultado_liquido, created_at, updated_at
                 FROM balanco_previsional
                 WHERE empresa_id = $1
                 ORDER BY exercicio DESC`,
                [empresa_id]
            );

            res.json({
                balancos: result.rows
            });

        } catch (error) {
            console.error('Erro ao listar Balanços:', error);
            res.status(500).json({
                error: 'Erro ao listar Balanços Previsionais'
            });
        }
    }

    /**
     * Eliminar Balanço Previsional
     * DELETE /api/balanco/:exercicio
     */
    async deleteBalanco(req, res) {
        try {
            const { exercicio } = req.params;
            const empresa_id = req.user.empresa_id;

            const result = await db.query(
                'DELETE FROM balanco_previsional WHERE empresa_id = $1 AND exercicio = $2 RETURNING *',
                [empresa_id, exercicio]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Balanço Previsional não encontrado'
                });
            }

            res.json({
                message: 'Balanço Previsional eliminado com sucesso'
            });

        } catch (error) {
            console.error('Erro ao eliminar Balanço:', error);
            res.status(500).json({
                error: 'Erro ao eliminar Balanço Previsional'
            });
        }
    }

    /**
     * Importar Resultado Líquido da DR
     * POST /api/balanco/:exercicio/importar-resultado
     */
    async importarResultadoDR(req, res) {
        try {
            const { exercicio } = req.params;
            const empresa_id = req.user.empresa_id;

            // Buscar DR do exercício
            const drResult = await db.query(
                'SELECT resultado_liquido FROM demonstracao_resultados WHERE empresa_id = $1 AND exercicio = $2',
                [empresa_id, exercicio]
            );

            if (drResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Demonstração de Resultados não encontrada para este exercício'
                });
            }

            const resultadoLiquido = drResult.rows[0].resultado_liquido;

            // Atualizar balanço
            const balancoResult = await db.query(
                `UPDATE balanco_previsional
                 SET resultado_liquido = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE empresa_id = $2 AND exercicio = $3
                 RETURNING *`,
                [resultadoLiquido, empresa_id, exercicio]
            );

            if (balancoResult.rows.length === 0) {
                return res.status(404).json({
                    error: 'Balanço Previsional não encontrado para este exercício'
                });
            }

            res.json({
                message: 'Resultado Líquido importado com sucesso',
                resultadoLiquido
            });

        } catch (error) {
            console.error('Erro ao importar resultado:', error);
            res.status(500).json({
                error: 'Erro ao importar Resultado Líquido da DR'
            });
        }
    }
}

module.exports = new BalancoController();
