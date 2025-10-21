-- =====================================================
-- MIGRATION 009: ANÁLISE DE VIABILIDADE DE PROJETOS
-- =====================================================
-- Sistema de análise de viabilidade econômica de projetos agrícolas
-- Inclui cálculos de VPL, TIR, Payback, IR e B/C
-- =====================================================

-- Tabela principal de projetos
CREATE TABLE IF NOT EXISTS viabilidade_projetos (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Identificação do Projeto
    nome_projeto VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo_projeto VARCHAR(50) NOT NULL, -- nova_cultura, expansao, modernizacao, infraestrutura, outro
    localizacao VARCHAR(255),
    responsavel VARCHAR(255),

    -- Períodos de Análise
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    periodo_construcao_anos DECIMAL(10,2) DEFAULT 0, -- Período de implementação
    periodo_operacao_anos DECIMAL(10,2) NOT NULL, -- Período de operação
    vida_util_anos DECIMAL(10,2) NOT NULL, -- Vida útil total

    -- Parâmetros Financeiros
    taxa_desconto_percentual DECIMAL(10,4) NOT NULL, -- Taxa de desconto (WACC ou custo de oportunidade)
    inflacao_anual_percentual DECIMAL(10,4) DEFAULT 0,
    taxa_risco_percentual DECIMAL(10,4) DEFAULT 0,

    -- Investimento Inicial
    investimento_terreno DECIMAL(15,2) DEFAULT 0,
    investimento_construcao DECIMAL(15,2) DEFAULT 0,
    investimento_equipamentos DECIMAL(15,2) DEFAULT 0,
    investimento_veiculos DECIMAL(15,2) DEFAULT 0,
    investimento_capital_giro DECIMAL(15,2) DEFAULT 0,
    investimento_outros DECIMAL(15,2) DEFAULT 0,

    -- Total de Investimento (calculado)
    investimento_total DECIMAL(15,2) GENERATED ALWAYS AS (
        COALESCE(investimento_terreno, 0) +
        COALESCE(investimento_construcao, 0) +
        COALESCE(investimento_equipamentos, 0) +
        COALESCE(investimento_veiculos, 0) +
        COALESCE(investimento_capital_giro, 0) +
        COALESCE(investimento_outros, 0)
    ) STORED,

    -- Financiamento
    tem_financiamento BOOLEAN DEFAULT FALSE,
    percentual_financiado DECIMAL(5,2) DEFAULT 0, -- % do investimento financiado
    taxa_juros_financiamento DECIMAL(10,4) DEFAULT 0,
    prazo_financiamento_anos DECIMAL(10,2) DEFAULT 0,
    carencia_anos DECIMAL(10,2) DEFAULT 0,

    -- Projeções Anuais Médias (para cálculo simplificado)
    receita_anual_media DECIMAL(15,2) DEFAULT 0,
    custo_operacional_anual_medio DECIMAL(15,2) DEFAULT 0,
    depreciacao_anual DECIMAL(15,2) DEFAULT 0,

    -- Indicadores Calculados (armazenados após cálculo)
    vpl DECIMAL(15,2), -- Valor Presente Líquido
    tir_percentual DECIMAL(10,4), -- Taxa Interna de Retorno
    payback_simples_anos DECIMAL(10,2), -- Payback Simples
    payback_descontado_anos DECIMAL(10,2), -- Payback Descontado
    indice_rentabilidade DECIMAL(10,4), -- IR = VPL / Investimento Inicial
    relacao_beneficio_custo DECIMAL(10,4), -- B/C
    valor_residual DECIMAL(15,2), -- Valor residual ao final do projeto

    -- Análise de Sensibilidade
    cenario_otimista JSONB, -- VPL, TIR em cenário otimista
    cenario_pessimista JSONB, -- VPL, TIR em cenário pessimista
    analise_sensibilidade JSONB, -- Variação de receitas/custos vs VPL/TIR

    -- Status e Decisão
    status VARCHAR(50) DEFAULT 'em_analise', -- em_analise, aprovado, rejeitado, em_execucao, concluido
    decisao TEXT, -- Justificativa da decisão
    data_decisao DATE,
    aprovado_por VARCHAR(255),

    -- Observações
    premissas TEXT, -- Premissas utilizadas na análise
    riscos TEXT, -- Riscos identificados
    observacoes TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Fluxos de Caixa Projetados (ano a ano)
CREATE TABLE IF NOT EXISTS viabilidade_fluxos_caixa (
    id SERIAL PRIMARY KEY,
    projeto_id INTEGER NOT NULL REFERENCES viabilidade_projetos(id) ON DELETE CASCADE,

    -- Identificação do Período
    ano INTEGER NOT NULL, -- Ano 0, 1, 2, 3... (0 = investimento inicial)
    descricao VARCHAR(255),

    -- Entradas
    receitas_operacionais DECIMAL(15,2) DEFAULT 0,
    receitas_nao_operacionais DECIMAL(15,2) DEFAULT 0,
    valor_residual DECIMAL(15,2) DEFAULT 0, -- No último ano

    -- Saídas
    investimentos DECIMAL(15,2) DEFAULT 0,
    custos_operacionais DECIMAL(15,2) DEFAULT 0,
    custos_fixos DECIMAL(15,2) DEFAULT 0,
    impostos DECIMAL(15,2) DEFAULT 0,
    pagamento_financiamento DECIMAL(15,2) DEFAULT 0,

    -- Totais Calculados
    total_entradas DECIMAL(15,2) GENERATED ALWAYS AS (
        COALESCE(receitas_operacionais, 0) +
        COALESCE(receitas_nao_operacionais, 0) +
        COALESCE(valor_residual, 0)
    ) STORED,

    total_saidas DECIMAL(15,2) GENERATED ALWAYS AS (
        COALESCE(investimentos, 0) +
        COALESCE(custos_operacionais, 0) +
        COALESCE(custos_fixos, 0) +
        COALESCE(impostos, 0) +
        COALESCE(pagamento_financiamento, 0)
    ) STORED,

    fluxo_caixa_liquido DECIMAL(15,2) GENERATED ALWAYS AS (
        COALESCE(receitas_operacionais, 0) +
        COALESCE(receitas_nao_operacionais, 0) +
        COALESCE(valor_residual, 0) -
        COALESCE(investimentos, 0) -
        COALESCE(custos_operacionais, 0) -
        COALESCE(custos_fixos, 0) -
        COALESCE(impostos, 0) -
        COALESCE(pagamento_financiamento, 0)
    ) STORED,

    -- Valores Descontados (calculados e armazenados)
    fator_desconto DECIMAL(10,6),
    vp_fluxo_caixa DECIMAL(15,2), -- Valor presente do fluxo de caixa

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(projeto_id, ano)
);

-- Índices para performance
CREATE INDEX idx_viabilidade_projetos_user ON viabilidade_projetos(user_id);
CREATE INDEX idx_viabilidade_projetos_status ON viabilidade_projetos(status);
CREATE INDEX idx_viabilidade_projetos_tipo ON viabilidade_projetos(tipo_projeto);
CREATE INDEX idx_viabilidade_projetos_data_inicio ON viabilidade_projetos(data_inicio);
CREATE INDEX idx_viabilidade_fluxos_projeto ON viabilidade_fluxos_caixa(projeto_id);
CREATE INDEX idx_viabilidade_fluxos_ano ON viabilidade_fluxos_caixa(ano);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_viabilidade_projetos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_viabilidade_projetos
    BEFORE UPDATE ON viabilidade_projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_viabilidade_projetos_updated_at();

CREATE TRIGGER trigger_update_viabilidade_fluxos
    BEFORE UPDATE ON viabilidade_fluxos_caixa
    FOR EACH ROW
    EXECUTE FUNCTION update_viabilidade_projetos_updated_at();

-- View para resumo de projetos
CREATE OR REPLACE VIEW vw_resumo_viabilidade AS
SELECT
    p.id,
    p.user_id,
    p.nome_projeto,
    p.tipo_projeto,
    p.status,
    p.data_inicio,
    p.vida_util_anos,
    p.investimento_total,
    p.vpl,
    p.tir_percentual,
    p.payback_simples_anos,
    p.indice_rentabilidade,
    CASE
        WHEN p.vpl > 0 AND p.tir_percentual > p.taxa_desconto_percentual THEN 'Viável'
        WHEN p.vpl < 0 OR p.tir_percentual < p.taxa_desconto_percentual THEN 'Inviável'
        ELSE 'Análise Pendente'
    END AS viabilidade,
    p.created_at
FROM viabilidade_projetos p
ORDER BY p.created_at DESC;

-- View para ranking de projetos por VPL
CREATE OR REPLACE VIEW vw_ranking_projetos_vpl AS
SELECT
    ROW_NUMBER() OVER (ORDER BY vpl DESC NULLS LAST) AS posicao,
    id,
    user_id,
    nome_projeto,
    tipo_projeto,
    investimento_total,
    vpl,
    tir_percentual,
    indice_rentabilidade,
    status
FROM viabilidade_projetos
WHERE vpl IS NOT NULL
ORDER BY vpl DESC;

-- Comentários nas tabelas
COMMENT ON TABLE viabilidade_projetos IS 'Análise de viabilidade econômica de projetos agrícolas';
COMMENT ON TABLE viabilidade_fluxos_caixa IS 'Fluxos de caixa projetados ano a ano para cada projeto';
COMMENT ON COLUMN viabilidade_projetos.vpl IS 'Valor Presente Líquido - soma dos fluxos de caixa descontados';
COMMENT ON COLUMN viabilidade_projetos.tir_percentual IS 'Taxa Interna de Retorno - taxa que zera o VPL';
COMMENT ON COLUMN viabilidade_projetos.payback_simples_anos IS 'Tempo para recuperar o investimento (sem desconto)';
COMMENT ON COLUMN viabilidade_projetos.payback_descontado_anos IS 'Tempo para recuperar o investimento (com desconto)';
COMMENT ON COLUMN viabilidade_projetos.indice_rentabilidade IS 'IR = VPL / Investimento Inicial';
COMMENT ON COLUMN viabilidade_projetos.relacao_beneficio_custo IS 'B/C = VP Benefícios / VP Custos';
