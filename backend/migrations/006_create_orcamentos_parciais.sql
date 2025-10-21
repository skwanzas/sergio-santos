-- Criação da tabela de Orçamentos Parciais
-- Permite criar orçamentos específicos por cultura, projeto ou centro de custo

CREATE TABLE IF NOT EXISTS orcamentos_parciais (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercicio INTEGER NOT NULL,

    -- Identificação do orçamento
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('cultura', 'projeto', 'centro_custo')),
    descricao TEXT,
    area_hectares DECIMAL(10, 2), -- Para culturas
    data_inicio DATE,
    data_fim DATE,

    -- RECEITAS PREVISTAS
    receita_venda_principal DECIMAL(15, 2) DEFAULT 0,
    receita_venda_secundaria DECIMAL(15, 2) DEFAULT 0,
    receita_subsidios DECIMAL(15, 2) DEFAULT 0,
    receita_outras DECIMAL(15, 2) DEFAULT 0,

    -- CUSTOS VARIÁVEIS
    custo_sementes DECIMAL(15, 2) DEFAULT 0,
    custo_fertilizantes DECIMAL(15, 2) DEFAULT 0,
    custo_fitosanitarios DECIMAL(15, 2) DEFAULT 0,
    custo_combustivel DECIMAL(15, 2) DEFAULT 0,
    custo_mao_obra_temporaria DECIMAL(15, 2) DEFAULT 0,
    custo_agua_irrigacao DECIMAL(15, 2) DEFAULT 0,
    custo_embalagens DECIMAL(15, 2) DEFAULT 0,
    custo_transporte DECIMAL(15, 2) DEFAULT 0,
    custo_outros_variaveis DECIMAL(15, 2) DEFAULT 0,

    -- CUSTOS FIXOS
    custo_mao_obra_permanente DECIMAL(15, 2) DEFAULT 0,
    custo_arrendamento DECIMAL(15, 2) DEFAULT 0,
    custo_depreciacao_equipamento DECIMAL(15, 2) DEFAULT 0,
    custo_seguros DECIMAL(15, 2) DEFAULT 0,
    custo_manutencao DECIMAL(15, 2) DEFAULT 0,
    custo_administrativos DECIMAL(15, 2) DEFAULT 0,
    custo_outros_fixos DECIMAL(15, 2) DEFAULT 0,

    -- INVESTIMENTOS (se aplicável)
    investimento_equipamento DECIMAL(15, 2) DEFAULT 0,
    investimento_infraestrutura DECIMAL(15, 2) DEFAULT 0,
    investimento_outros DECIMAL(15, 2) DEFAULT 0,

    -- VALORES REALIZADOS (para acompanhamento)
    realizado_receitas DECIMAL(15, 2) DEFAULT 0,
    realizado_custos_variaveis DECIMAL(15, 2) DEFAULT 0,
    realizado_custos_fixos DECIMAL(15, 2) DEFAULT 0,
    realizado_investimentos DECIMAL(15, 2) DEFAULT 0,

    -- CAMPOS DE ANÁLISE
    rendimento_esperado_kg DECIMAL(10, 2), -- Para culturas
    preco_venda_kg DECIMAL(10, 2), -- Para culturas

    -- STATUS E METADATA
    status VARCHAR(50) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'aprovado', 'em_execucao', 'concluido', 'cancelado')),
    aprovado_por INTEGER REFERENCES users(id),
    data_aprovacao TIMESTAMP,
    observacoes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, exercicio, nome)
);

-- Índices para melhorar performance
CREATE INDEX idx_orcamentos_parciais_user ON orcamentos_parciais(user_id);
CREATE INDEX idx_orcamentos_parciais_exercicio ON orcamentos_parciais(exercicio);
CREATE INDEX idx_orcamentos_parciais_tipo ON orcamentos_parciais(tipo);
CREATE INDEX idx_orcamentos_parciais_status ON orcamentos_parciais(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_orcamentos_parciais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orcamentos_parciais_updated_at
    BEFORE UPDATE ON orcamentos_parciais
    FOR EACH ROW
    EXECUTE FUNCTION update_orcamentos_parciais_updated_at();

-- Comentários nas tabelas
COMMENT ON TABLE orcamentos_parciais IS 'Orçamentos parciais por cultura, projeto ou centro de custo';
COMMENT ON COLUMN orcamentos_parciais.tipo IS 'Tipo de orçamento: cultura (milho, sesamo, etc), projeto (expansão, investimento) ou centro_custo';
COMMENT ON COLUMN orcamentos_parciais.area_hectares IS 'Área em hectares para orçamentos de cultura';
COMMENT ON COLUMN orcamentos_parciais.rendimento_esperado_kg IS 'Rendimento esperado em kg para culturas';
COMMENT ON COLUMN orcamentos_parciais.status IS 'Status: planejamento, aprovado, em_execucao, concluido, cancelado';
