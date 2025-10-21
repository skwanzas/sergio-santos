-- Criação da tabela de Análise de Rentabilidade por Cultura
-- Análise detalhada de rentabilidade de diferentes culturas agrícolas

CREATE TABLE IF NOT EXISTS rentabilidade_culturas (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Identificação
    exercicio INTEGER NOT NULL,
    cultura VARCHAR(100) NOT NULL, -- Nome da cultura (milho, sesamo, feijão, etc.)
    variedade VARCHAR(100), -- Variedade específica da cultura
    safra VARCHAR(50), -- Safra/campanha (2024/2025, Verão 2024, etc.)

    -- Área e Produção
    area_hectares DECIMAL(10, 2) NOT NULL,
    producao_total_kg DECIMAL(15, 2), -- Produção total em kg
    rendimento_kg_ha DECIMAL(10, 2), -- Rendimento por hectare
    perdas_kg DECIMAL(15, 2) DEFAULT 0, -- Perdas de produção

    -- Preços
    preco_venda_kg DECIMAL(10, 2), -- Preço médio de venda por kg
    preco_mercado_kg DECIMAL(10, 2), -- Preço de mercado para comparação

    -- Receitas
    receita_venda_principal DECIMAL(15, 2) DEFAULT 0, -- Venda da produção principal
    receita_venda_secundaria DECIMAL(15, 2) DEFAULT 0, -- Subprodutos
    receita_subsidios DECIMAL(15, 2) DEFAULT 0,
    receita_total DECIMAL(15, 2) GENERATED ALWAYS AS (
        receita_venda_principal + receita_venda_secundaria + receita_subsidios
    ) STORED,

    -- Custos Variáveis (por hectare ou total)
    custo_sementes DECIMAL(15, 2) DEFAULT 0,
    custo_fertilizantes DECIMAL(15, 2) DEFAULT 0,
    custo_fitosanitarios DECIMAL(15, 2) DEFAULT 0,
    custo_irrigacao DECIMAL(15, 2) DEFAULT 0,
    custo_mao_obra_colheita DECIMAL(15, 2) DEFAULT 0,
    custo_transporte DECIMAL(15, 2) DEFAULT 0,
    custo_outros_variaveis DECIMAL(15, 2) DEFAULT 0,
    custo_variaveis_total DECIMAL(15, 2) GENERATED ALWAYS AS (
        custo_sementes + custo_fertilizantes + custo_fitosanitarios +
        custo_irrigacao + custo_mao_obra_colheita + custo_transporte + custo_outros_variaveis
    ) STORED,

    -- Custos Fixos
    custo_arrendamento DECIMAL(15, 2) DEFAULT 0,
    custo_depreciacao DECIMAL(15, 2) DEFAULT 0,
    custo_mao_obra_fixa DECIMAL(15, 2) DEFAULT 0,
    custo_outros_fixos DECIMAL(15, 2) DEFAULT 0,
    custo_fixos_total DECIMAL(15, 2) GENERATED ALWAYS AS (
        custo_arrendamento + custo_depreciacao + custo_mao_obra_fixa + custo_outros_fixos
    ) STORED,

    -- Custos Totais
    custo_total DECIMAL(15, 2) GENERATED ALWAYS AS (
        custo_variaveis_total + custo_fixos_total
    ) STORED,

    -- Indicadores Calculados (serão calculados pelo backend)
    margem_bruta DECIMAL(15, 2),
    margem_liquida DECIMAL(15, 2),
    margem_bruta_percentual DECIMAL(5, 2),
    margem_liquida_percentual DECIMAL(5, 2),
    rentabilidade_hectare DECIMAL(15, 2),
    custo_producao_kg DECIMAL(10, 2),
    ponto_equilibrio_kg DECIMAL(15, 2),
    roi_percentual DECIMAL(5, 2),

    -- Período de cultivo
    data_plantio DATE,
    data_colheita DATE,
    dias_ciclo INTEGER,

    -- Observações e notas
    observacoes TEXT,
    clima_condicoes VARCHAR(255), -- Condições climáticas da safra
    solo_tipo VARCHAR(100), -- Tipo de solo

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, exercicio, cultura, safra)
);

-- Índices para melhorar performance
CREATE INDEX idx_rentabilidade_culturas_user ON rentabilidade_culturas(user_id);
CREATE INDEX idx_rentabilidade_culturas_exercicio ON rentabilidade_culturas(exercicio);
CREATE INDEX idx_rentabilidade_culturas_cultura ON rentabilidade_culturas(cultura);
CREATE INDEX idx_rentabilidade_culturas_safra ON rentabilidade_culturas(safra);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_rentabilidade_culturas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rentabilidade_culturas_updated_at
    BEFORE UPDATE ON rentabilidade_culturas
    FOR EACH ROW
    EXECUTE FUNCTION update_rentabilidade_culturas_updated_at();

-- View para ranking de rentabilidade
CREATE OR REPLACE VIEW vw_ranking_rentabilidade AS
SELECT
    user_id,
    exercicio,
    cultura,
    safra,
    area_hectares,
    receita_total,
    custo_total,
    margem_liquida,
    margem_liquida_percentual,
    rentabilidade_hectare,
    RANK() OVER (PARTITION BY user_id, exercicio ORDER BY margem_liquida_percentual DESC) as ranking_margem,
    RANK() OVER (PARTITION BY user_id, exercicio ORDER BY rentabilidade_hectare DESC) as ranking_hectare
FROM rentabilidade_culturas
WHERE margem_liquida IS NOT NULL;

-- Comentários
COMMENT ON TABLE rentabilidade_culturas IS 'Análise de rentabilidade por cultura agrícola';
COMMENT ON COLUMN rentabilidade_culturas.rendimento_kg_ha IS 'Rendimento em kg por hectare';
COMMENT ON COLUMN rentabilidade_culturas.margem_bruta IS 'Margem Bruta = Receita - Custos Variáveis';
COMMENT ON COLUMN rentabilidade_culturas.margem_liquida IS 'Margem Líquida = Receita - Custos Totais';
COMMENT ON COLUMN rentabilidade_culturas.ponto_equilibrio_kg IS 'Quantidade em kg necessária para cobrir custos';
COMMENT ON COLUMN rentabilidade_culturas.roi_percentual IS 'Return on Investment em percentual';
