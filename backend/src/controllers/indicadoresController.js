const db = require('../config/database');

/**
 * Controller de Indicadores Financeiros
 * Calcula automaticamente 20+ indicadores Lead e Lag
 */
class IndicadoresController {
    /**
     * Obter todos os indicadores de um exercício
     * GET /api/indicadores/:exercicio
     */
    async getIndicadores(req, res) {
        try {
            const { exercicio } = req.params;
            const empresa_id = req.user.empresa_id;

            // Buscar dados necessários
            const dados = await this.buscarDadosFinanceiros(empresa_id, exercicio);

            if (!dados.dr && !dados.balanco) {
                return res.status(404).json({
                    error: 'Dados insuficientes para calcular indicadores',
                    details: 'É necessário ter pelo menos uma Demonstração de Resultados ou Balanço'
                });
            }

            // Calcular indicadores
            const leadIndicators = this.calcularLeadIndicators(dados);
            const lagIndicators = this.calcularLagIndicators(dados);
            const indicadoresOperacionais = this.calcularIndicadoresOperacionais(dados);

            res.json({
                exercicio: parseInt(exercicio),
                empresa_id,
                lead_indicators: leadIndicators,
                lag_indicators: lagIndicators,
                indicadores_operacionais: indicadoresOperacionais,
                resumo: this.gerarResumo(leadIndicators, lagIndicators, indicadoresOperacionais),
                alertas: this.gerarAlertas(leadIndicators, lagIndicators),
                calculado_em: new Date().toISOString()
            });

        } catch (error) {
            console.error('Erro ao calcular indicadores:', error);
            res.status(500).json({
                error: 'Erro ao calcular indicadores financeiros',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }

    /**
     * Buscar dados financeiros necessários
     */
    async buscarDadosFinanceiros(empresa_id, exercicio) {
        const dados = {};

        // Demonstração de Resultados
        const drResult = await db.query(
            'SELECT * FROM demonstracao_resultados WHERE empresa_id = $1 AND exercicio = $2',
            [empresa_id, exercicio]
        );
        dados.dr = drResult.rows[0] || null;

        // Balanço Previsional
        const balancoResult = await db.query(
            'SELECT * FROM balanco_previsional WHERE empresa_id = $1 AND exercicio = $2',
            [empresa_id, exercicio]
        );
        dados.balanco = balancoResult.rows[0] || null;

        // Cash Flow
        const cashFlowResult = await db.query(
            'SELECT * FROM cash_flow WHERE empresa_id = $1 AND exercicio = $2',
            [empresa_id, exercicio]
        );
        dados.cashFlow = cashFlowResult.rows[0] || null;

        // Dados do exercício anterior (para comparação)
        const drAnteriorResult = await db.query(
            'SELECT * FROM demonstracao_resultados WHERE empresa_id = $1 AND exercicio = $2',
            [empresa_id, exercicio - 1]
        );
        dados.drAnterior = drAnteriorResult.rows[0] || null;

        return dados;
    }

    /**
     * Calcular Lead Indicators (Preditivos)
     */
    calcularLeadIndicators(dados) {
        const { dr, balanco } = dados;
        const indicators = {};

        // 1. Prazo Médio de Recebimento (dias)
        if (dr && balanco && dr.total_proveitos > 0) {
            const clientes = parseFloat(balanco.clientes || 0);
            const vendasDiarias = parseFloat(dr.total_proveitos) / 365;
            indicators.prazo_medio_recebimento = vendasDiarias > 0
                ? Math.round(clientes / vendasDiarias)
                : 0;
        }

        // 2. Rotação de Existências
        if (dr && balanco) {
            const existencias = parseFloat(balanco.sesamo_grao || 0) +
                              parseFloat(balanco.forragens_seca || 0) +
                              parseFloat(balanco.produtos_acabados || 0);
            const custos = parseFloat(dr.total_custos || 0);
            indicators.rotacao_existencias = existencias > 0
                ? (custos / existencias).toFixed(2)
                : 0;
        }

        // 3. Dias de Existências
        if (indicators.rotacao_existencias > 0) {
            indicators.dias_existencias = Math.round(365 / indicators.rotacao_existencias);
        }

        // 4. Taxa de Crescimento de Vendas (%)
        if (dados.drAnterior && dr) {
            const vendasAtual = parseFloat(dr.total_proveitos || 0);
            const vendasAnterior = parseFloat(dados.drAnterior.total_proveitos || 0);
            indicators.taxa_crescimento_vendas = vendasAnterior > 0
                ? ((vendasAtual - vendasAnterior) / vendasAnterior * 100).toFixed(2)
                : 0;
        }

        // 5. Cobertura de Juros (EBITDA / Juros)
        if (dr) {
            const ebitda = parseFloat(dr.resultado_operacional || 0) +
                          parseFloat(dr.amortizacoes || 0);
            const juros = parseFloat(dr.juros_suportados || 0);
            indicators.cobertura_juros = juros > 0
                ? (ebitda / juros).toFixed(2)
                : null;
            indicators.ebitda = ebitda;
        }

        // 6. Ciclo Operacional (dias)
        if (indicators.prazo_medio_recebimento && indicators.dias_existencias) {
            indicators.ciclo_operacional =
                indicators.prazo_medio_recebimento + indicators.dias_existencias;
        }

        return indicators;
    }

    /**
     * Calcular Lag Indicators (Resultado)
     */
    calcularLagIndicators(dados) {
        const { dr, balanco } = dados;
        const indicators = {};

        if (dr) {
            // 1. Margem Líquida (%)
            const totalProveitos = parseFloat(dr.total_proveitos || 0);
            const resultadoLiquido = parseFloat(dr.resultado_liquido || 0);
            indicators.margem_liquida = totalProveitos > 0
                ? ((resultadoLiquido / totalProveitos) * 100).toFixed(2)
                : 0;

            // 2. Margem Operacional (%)
            const resultadoOperacional = parseFloat(dr.resultado_operacional || 0);
            indicators.margem_operacional = totalProveitos > 0
                ? ((resultadoOperacional / totalProveitos) * 100).toFixed(2)
                : 0;

            // 3. Margem Bruta (%)
            const custosDiretos = parseFloat(dr.materias_primas || 0) +
                                 parseFloat(dr.combustiveis || 0) +
                                 parseFloat(dr.embalagens || 0);
            const margemBruta = totalProveitos - custosDiretos;
            indicators.margem_bruta = totalProveitos > 0
                ? ((margemBruta / totalProveitos) * 100).toFixed(2)
                : 0;
        }

        if (balanco) {
            // 4. ROE - Return on Equity (%)
            const capitalProprio = parseFloat(balanco.capital_social || 0) +
                                  parseFloat(balanco.resultados_transitados || 0) +
                                  parseFloat(balanco.resultado_liquido || 0);
            const resultadoLiquido = parseFloat(balanco.resultado_liquido || 0);
            indicators.roe = capitalProprio > 0
                ? ((resultadoLiquido / capitalProprio) * 100).toFixed(2)
                : 0;

            // 5. ROA - Return on Assets (%)
            const totalAtivo = this.calcularTotalAtivo(balanco);
            indicators.roa = totalAtivo > 0 && dr
                ? ((parseFloat(dr.resultado_liquido || 0) / totalAtivo) * 100).toFixed(2)
                : 0;

            // 6. Liquidez Geral
            const ativoCorrente = this.calcularAtivoCorrente(balanco);
            const passivoCorrente = parseFloat(balanco.emprestimos_cp || 0) +
                                   parseFloat(balanco.fornecedores || 0) +
                                   parseFloat(balanco.estado_outros_entes || 0);
            indicators.liquidez_geral = passivoCorrente > 0
                ? (ativoCorrente / passivoCorrente).toFixed(2)
                : 0;

            // 7. Liquidez Reduzida
            const liquidezReduzida = ativoCorrente -
                                    parseFloat(balanco.sesamo_grao || 0) -
                                    parseFloat(balanco.forragens_seca || 0) -
                                    parseFloat(balanco.produtos_acabados || 0);
            indicators.liquidez_reduzida = passivoCorrente > 0
                ? (liquidezReduzida / passivoCorrente).toFixed(2)
                : 0;

            // 8. Liquidez Imediata
            const liquidezImediata = parseFloat(balanco.caixa || 0) +
                                    parseFloat(balanco.depositos_ordem || 0);
            indicators.liquidez_imediata = passivoCorrente > 0
                ? (liquidezImediata / passivoCorrente).toFixed(2)
                : 0;

            // 9. Autonomia Financeira (%)
            const capitalProprio2 = parseFloat(balanco.capital_social || 0) +
                                   parseFloat(balanco.resultados_transitados || 0) +
                                   parseFloat(balanco.resultado_liquido || 0);
            indicators.autonomia_financeira = totalAtivo > 0
                ? ((capitalProprio2 / totalAtivo) * 100).toFixed(2)
                : 0;

            // 10. Endividamento (%)
            const totalPassivo = parseFloat(balanco.emprestimos_cp || 0) +
                               parseFloat(balanco.emprestimos_lp || 0) +
                               parseFloat(balanco.fornecedores || 0) +
                               parseFloat(balanco.estado_outros_entes || 0);
            indicators.endividamento = totalAtivo > 0
                ? ((totalPassivo / totalAtivo) * 100).toFixed(2)
                : 0;

            // 11. Solvabilidade
            indicators.solvabilidade = totalPassivo > 0
                ? (capitalProprio / totalPassivo).toFixed(2)
                : 0;
        }

        return indicators;
    }

    /**
     * Calcular Indicadores Operacionais
     */
    calcularIndicadoresOperacionais(dados) {
        const { dr, balanco } = dados;
        const indicators = {};

        if (dr) {
            // 1. Produtividade por Colaborador
            const remuneracoes = parseFloat(dr.remuneracoes_pessoal || 0);
            const vendas = parseFloat(dr.total_proveitos || 0);
            indicators.vendas_por_kwanza_salario = remuneracoes > 0
                ? (vendas / remuneracoes).toFixed(2)
                : 0;

            // 2. Custos Operacionais sobre Vendas (%)
            const custosOperacionais = parseFloat(dr.total_custos || 0) -
                                      parseFloat(dr.materias_primas || 0);
            indicators.custos_operacionais_vendas = vendas > 0
                ? ((custosOperacionais / vendas) * 100).toFixed(2)
                : 0;

            // 3. Break-even Point (Ponto de Equilíbrio)
            const custosFixos = parseFloat(dr.remuneracoes_pessoal || 0) +
                               parseFloat(dr.amortizacoes || 0) +
                               parseFloat(dr.seguros || 0) +
                               parseFloat(dr.deslocacoes || 0);
            const custos Variav = parseFloat(dr.materias_primas || 0) +
                                  parseFloat(dr.combustiveis || 0);
            const margemContribuicao = vendas > 0
                ? ((vendas - custosVariaveis) / vendas)
                : 0;
            indicators.break_even = margemContribuicao > 0
                ? (custosFixos / margemContribuicao).toFixed(2)
                : 0;
        }

        if (balanco) {
            // 4. Working Capital (Fundo de Maneio)
            const ativoCorrente = this.calcularAtivoCorrente(balanco);
            const passivoCorrente = parseFloat(balanco.emprestimos_cp || 0) +
                                   parseFloat(balanco.fornecedores || 0);
            indicators.working_capital = ativoCorrente - passivoCorrente;

            // 5. Capital Permanente
            const capitalProprio = parseFloat(balanco.capital_social || 0) +
                                  parseFloat(balanco.resultados_transitados || 0);
            const passivoLP = parseFloat(balanco.emprestimos_lp || 0);
            indicators.capital_permanente = capitalProprio + passivoLP;
        }

        return indicators;
    }

    /**
     * Calcular Total Ativo
     */
    calcularTotalAtivo(balanco) {
        const ativoNaoCorrente =
            parseFloat(balanco.terrenos_recursos || 0) +
            parseFloat(balanco.edificios_construcoes || 0) +
            parseFloat(balanco.instalacoes_suinicolas || 0) +
            parseFloat(balanco.equipamento_basico || 0) +
            parseFloat(balanco.animais_reproducao || 0);

        const ativoCorrente = this.calcularAtivoCorrente(balanco);

        return ativoNaoCorrente + ativoCorrente;
    }

    /**
     * Calcular Ativo Corrente
     */
    calcularAtivoCorrente(balanco) {
        return parseFloat(balanco.sesamo_grao || 0) +
               parseFloat(balanco.forragens_seca || 0) +
               parseFloat(balanco.produtos_acabados || 0) +
               parseFloat(balanco.clientes || 0) +
               parseFloat(balanco.caixa || 0) +
               parseFloat(balanco.depositos_ordem || 0);
    }

    /**
     * Gerar Resumo dos Indicadores
     */
    gerarResumo(lead, lag, operacionais) {
        const resumo = {
            saude_financeira: 'boa', // boa, media, fraca
            pontos_fortes: [],
            pontos_fracos: [],
            recomendacoes: []
        };

        // Analisar Liquidez
        if (lag.liquidez_geral) {
            const liquidez = parseFloat(lag.liquidez_geral);
            if (liquidez >= 1.5) {
                resumo.pontos_fortes.push('Excelente liquidez geral');
            } else if (liquidez < 1) {
                resumo.pontos_fracos.push('Liquidez geral abaixo do recomendado');
                resumo.recomendacoes.push('Melhorar gestão de caixa e reduzir passivo corrente');
            }
        }

        // Analisar Rentabilidade
        if (lag.margem_liquida) {
            const margem = parseFloat(lag.margem_liquida);
            if (margem >= 15) {
                resumo.pontos_fortes.push('Margem líquida saudável');
            } else if (margem < 5) {
                resumo.pontos_fracos.push('Margem líquida baixa');
                resumo.recomendacoes.push('Rever estrutura de custos e estratégia de preços');
            }
        }

        // Analisar Autonomia Financeira
        if (lag.autonomia_financeira) {
            const autonomia = parseFloat(lag.autonomia_financeira);
            if (autonomia >= 50) {
                resumo.pontos_fortes.push('Boa autonomia financeira');
            } else if (autonomia < 30) {
                resumo.pontos_fracos.push('Dependência excessiva de capital alheio');
                resumo.recomendacoes.push('Reforçar capital próprio');
            }
        }

        // Analisar ROE
        if (lag.roe) {
            const roe = parseFloat(lag.roe);
            if (roe >= 15) {
                resumo.pontos_fortes.push('Excelente retorno sobre capital próprio');
            } else if (roe < 5) {
                resumo.pontos_fracos.push('Baixo retorno sobre capital investido');
            }
        }

        // Determinar saúde financeira geral
        if (resumo.pontos_fracos.length === 0) {
            resumo.saude_financeira = 'excelente';
        } else if (resumo.pontos_fracos.length <= 2) {
            resumo.saude_financeira = 'boa';
        } else if (resumo.pontos_fracos.length <= 4) {
            resumo.saude_financeira = 'media';
        } else {
            resumo.saude_financeira = 'fraca';
        }

        return resumo;
    }

    /**
     * Gerar Alertas
     */
    gerarAlertas(lead, lag) {
        const alertas = [];

        // Alerta de Liquidez
        if (lag.liquidez_geral && parseFloat(lag.liquidez_geral) < 1) {
            alertas.push({
                tipo: 'critico',
                categoria: 'liquidez',
                mensagem: 'Liquidez geral abaixo de 1. Risco de insolvência.',
                valor: lag.liquidez_geral
            });
        }

        // Alerta de Margem
        if (lag.margem_liquida && parseFloat(lag.margem_liquida) < 0) {
            alertas.push({
                tipo: 'critico',
                categoria: 'rentabilidade',
                mensagem: 'Margem líquida negativa. Empresa em prejuízo.',
                valor: lag.margem_liquida + '%'
            });
        }

        // Alerta de Endividamento
        if (lag.endividamento && parseFloat(lag.endividamento) > 70) {
            alertas.push({
                tipo: 'atencao',
                categoria: 'endividamento',
                mensagem: 'Nível de endividamento elevado.',
                valor: lag.endividamento + '%'
            });
        }

        // Alerta de Prazo de Recebimento
        if (lead.prazo_medio_recebimento && lead.prazo_medio_recebimento > 90) {
            alertas.push({
                tipo: 'atencao',
                categoria: 'recebimentos',
                mensagem: 'Prazo médio de recebimento muito elevado.',
                valor: lead.prazo_medio_recebimento + ' dias'
            });
        }

        return alertas;
    }

    /**
     * Obter evolução de indicadores ao longo de vários exercícios
     * GET /api/indicadores/evolucao/:anos
     */
    async getEvolucao(req, res) {
        try {
            const { anos } = req.params; // Ex: "2023,2024,2025"
            const empresa_id = req.user.empresa_id;
            const anosArray = anos.split(',').map(a => parseInt(a));

            const evolucao = [];

            for (const ano of anosArray) {
                const dados = await this.buscarDadosFinanceiros(empresa_id, ano);

                if (dados.dr || dados.balanco) {
                    const leadIndicators = this.calcularLeadIndicators(dados);
                    const lagIndicators = this.calcularLagIndicators(dados);

                    evolucao.push({
                        exercicio: ano,
                        margem_liquida: lagIndicators.margem_liquida,
                        roe: lagIndicators.roe,
                        liquidez_geral: lagIndicators.liquidez_geral,
                        autonomia_financeira: lagIndicators.autonomia_financeira,
                        ebitda: leadIndicators.ebitda
                    });
                }
            }

            res.json({
                evolucao,
                anos: anosArray
            });

        } catch (error) {
            console.error('Erro ao obter evolução:', error);
            res.status(500).json({
                error: 'Erro ao obter evolução de indicadores'
            });
        }
    }
}

module.exports = new IndicadoresController();
