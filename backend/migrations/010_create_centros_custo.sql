-- =====================================================
-- MIGRATION 010: GESTÃO DE CUSTOS POR CENTRO DE CUSTO
-- =====================================================
-- Sistema de controle e análise de custos por centro de custo
-- Permite alocar custos, fazer rateios e análises comparativas
-- =====================================================

-- Tabela de Centros de Custo
CREATE TABLE IF NOT EXISTS centros_custo (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Identificação
    codigo VARCHAR(50) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) NOT NULL, -- departamento, cultura, projeto, atividade, outro

    -- Hierarquia
    centro_pai_id INTEGER REFERENCES centros_custo(id) ON DELETE SET NULL,
    nivel_hierarquia INTEGER DEFAULT 1,
    caminho_hierarquia TEXT, -- Ex: "1.2.3" para navegação

    -- Classificação
    classificacao VARCHAR(50), -- produtivo, administrativo, comercial, apoio
    responsavel VARCHAR(255),

    -- Orçamento
    orcamento_anual DECIMAL(15,2) DEFAULT 0,
    exercicio INTEGER NOT NULL,

    -- Status
    ativo BOOLEAN DEFAULT TRUE,
    data_inicio DATE,
    data_fim DATE,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(user_id, codigo, exercicio)
);

-- Tabela de Lançamentos de Custo
CREATE TABLE IF NOT EXISTS lancamentos_custo (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    centro_custo_id INTEGER NOT NULL REFERENCES centros_custo(id) ON DELETE CASCADE,

    -- Identificação do Lançamento
    data_lancamento DATE NOT NULL,
    exercicio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    documento VARCHAR(100),
    descricao TEXT NOT NULL,

    -- Classificação do Custo
    tipo_custo VARCHAR(50) NOT NULL, -- direto, indireto, fixo, variavel
    categoria VARCHAR(100), -- mao_obra, insumos, combustivel, manutencao, depreciacao, etc
    subcategoria VARCHAR(100),

    -- Valores
    valor DECIMAL(15,2) NOT NULL,
    quantidade DECIMAL(15,4),
    unidade VARCHAR(20), -- kg, litro, hora, unidade, etc
    valor_unitario DECIMAL(15,4),

    -- Relacionamentos
    fornecedor VARCHAR(255),
    projeto_id INTEGER, -- Referência a projetos (se houver tabela de projetos)
    conta_contabil VARCHAR(50), -- Código da conta do PGC-AO

    -- Rateio
    percentual_rateio DECIMAL(5,2) DEFAULT 100, -- Se o custo foi rateado
    lancamento_original_id INTEGER REFERENCES lancamentos_custo(id), -- Se veio de rateio

    -- Observações
    observacoes TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Rateios de Custo
CREATE TABLE IF NOT EXISTS rateios_custo (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Identificação do Rateio
    descricao VARCHAR(255) NOT NULL,
    exercicio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    data_rateio DATE NOT NULL,

    -- Custo a ser Rateado
    valor_total DECIMAL(15,2) NOT NULL,
    tipo_custo VARCHAR(100) NOT NULL, -- Ex: energia, agua, aluguel, depreciacao
    categoria VARCHAR(100),

    -- Critério de Rateio
    criterio_rateio VARCHAR(50) NOT NULL, -- proporcional, igualitario, area, producao, receita, manual
    base_calculo VARCHAR(100), -- Ex: "área plantada", "volume produzido", "receita gerada"

    -- Status
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, aplicado, cancelado

    -- Metadata
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Detalhes do Rateio (itens rateados por centro)
CREATE TABLE IF NOT EXISTS rateios_custo_detalhes (
    id SERIAL PRIMARY KEY,
    rateio_id INTEGER NOT NULL REFERENCES rateios_custo(id) ON DELETE CASCADE,
    centro_custo_id INTEGER NOT NULL REFERENCES centros_custo(id) ON DELETE CASCADE,

    -- Distribuição
    percentual DECIMAL(5,2) NOT NULL,
    valor_rateado DECIMAL(15,2) NOT NULL,
    base_calculo_valor DECIMAL(15,4), -- Valor da base (ex: 100 hectares, 5000 kg)

    -- Lançamento Gerado
    lancamento_id INTEGER REFERENCES lancamentos_custo(id) ON DELETE SET NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_centros_custo_user ON centros_custo(user_id);
CREATE INDEX idx_centros_custo_tipo ON centros_custo(tipo);
CREATE INDEX idx_centros_custo_exercicio ON centros_custo(exercicio);
CREATE INDEX idx_centros_custo_ativo ON centros_custo(ativo);
CREATE INDEX idx_centros_custo_pai ON centros_custo(centro_pai_id);

CREATE INDEX idx_lancamentos_custo_user ON lancamentos_custo(user_id);
CREATE INDEX idx_lancamentos_custo_centro ON lancamentos_custo(centro_custo_id);
CREATE INDEX idx_lancamentos_custo_data ON lancamentos_custo(data_lancamento);
CREATE INDEX idx_lancamentos_custo_exercicio ON lancamentos_custo(exercicio);
CREATE INDEX idx_lancamentos_custo_mes ON lancamentos_custo(mes);
CREATE INDEX idx_lancamentos_custo_tipo ON lancamentos_custo(tipo_custo);
CREATE INDEX idx_lancamentos_custo_categoria ON lancamentos_custo(categoria);

CREATE INDEX idx_rateios_custo_user ON rateios_custo(user_id);
CREATE INDEX idx_rateios_custo_exercicio ON rateios_custo(exercicio);
CREATE INDEX idx_rateios_custo_status ON rateios_custo(status);

CREATE INDEX idx_rateios_detalhes_rateio ON rateios_custo_detalhes(rateio_id);
CREATE INDEX idx_rateios_detalhes_centro ON rateios_custo_detalhes(centro_custo_id);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_centro_custo_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_centros_custo
    BEFORE UPDATE ON centros_custo
    FOR EACH ROW
    EXECUTE FUNCTION update_centro_custo_updated_at();

CREATE TRIGGER trigger_update_lancamentos_custo
    BEFORE UPDATE ON lancamentos_custo
    FOR EACH ROW
    EXECUTE FUNCTION update_centro_custo_updated_at();

CREATE TRIGGER trigger_update_rateios_custo
    BEFORE UPDATE ON rateios_custo
    FOR EACH ROW
    EXECUTE FUNCTION update_centro_custo_updated_at();

-- View: Custos por Centro de Custo (resumo mensal)
CREATE OR REPLACE VIEW vw_custos_por_centro_mes AS
SELECT
    cc.id AS centro_custo_id,
    cc.codigo,
    cc.nome AS centro_custo,
    cc.tipo,
    cc.classificacao,
    lc.exercicio,
    lc.mes,
    COUNT(lc.id) AS total_lancamentos,
    SUM(lc.valor) AS total_custo,
    SUM(CASE WHEN lc.tipo_custo = 'direto' THEN lc.valor ELSE 0 END) AS custo_direto,
    SUM(CASE WHEN lc.tipo_custo = 'indireto' THEN lc.valor ELSE 0 END) AS custo_indireto,
    SUM(CASE WHEN lc.tipo_custo = 'fixo' THEN lc.valor ELSE 0 END) AS custo_fixo,
    SUM(CASE WHEN lc.tipo_custo = 'variavel' THEN lc.valor ELSE 0 END) AS custo_variavel,
    cc.orcamento_anual,
    CASE
        WHEN cc.orcamento_anual > 0
        THEN ROUND(((SUM(lc.valor) / (cc.orcamento_anual / 12.0)) - 1) * 100, 2)
        ELSE NULL
    END AS desvio_orcamento_percentual
FROM centros_custo cc
LEFT JOIN lancamentos_custo lc ON cc.id = lc.centro_custo_id
WHERE cc.ativo = TRUE
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.classificacao, lc.exercicio, lc.mes, cc.orcamento_anual
ORDER BY lc.exercicio DESC, lc.mes DESC, cc.codigo;

-- View: Custos por Centro de Custo (resumo anual)
CREATE OR REPLACE VIEW vw_custos_por_centro_ano AS
SELECT
    cc.id AS centro_custo_id,
    cc.codigo,
    cc.nome AS centro_custo,
    cc.tipo,
    cc.classificacao,
    cc.responsavel,
    lc.exercicio,
    COUNT(lc.id) AS total_lancamentos,
    SUM(lc.valor) AS total_custo,
    SUM(CASE WHEN lc.tipo_custo = 'direto' THEN lc.valor ELSE 0 END) AS custo_direto,
    SUM(CASE WHEN lc.tipo_custo = 'indireto' THEN lc.valor ELSE 0 END) AS custo_indireto,
    SUM(CASE WHEN lc.tipo_custo = 'fixo' THEN lc.valor ELSE 0 END) AS custo_fixo,
    SUM(CASE WHEN lc.tipo_custo = 'variavel' THEN lc.valor ELSE 0 END) AS custo_variavel,
    cc.orcamento_anual,
    CASE
        WHEN cc.orcamento_anual > 0
        THEN ROUND(((SUM(lc.valor) / cc.orcamento_anual) - 1) * 100, 2)
        ELSE NULL
    END AS desvio_orcamento_percentual
FROM centros_custo cc
LEFT JOIN lancamentos_custo lc ON cc.id = lc.centro_custo_id
WHERE cc.ativo = TRUE
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, cc.classificacao, cc.responsavel, lc.exercicio, cc.orcamento_anual
ORDER BY lc.exercicio DESC, SUM(lc.valor) DESC;

-- View: Custos por Categoria
CREATE OR REPLACE VIEW vw_custos_por_categoria AS
SELECT
    lc.exercicio,
    lc.mes,
    lc.categoria,
    lc.tipo_custo,
    COUNT(lc.id) AS total_lancamentos,
    SUM(lc.valor) AS total_custo,
    AVG(lc.valor) AS custo_medio,
    MIN(lc.valor) AS custo_minimo,
    MAX(lc.valor) AS custo_maximo
FROM lancamentos_custo lc
GROUP BY lc.exercicio, lc.mes, lc.categoria, lc.tipo_custo
ORDER BY lc.exercicio DESC, lc.mes DESC, SUM(lc.valor) DESC;

-- View: Ranking de Centros de Custo por Custo Total
CREATE OR REPLACE VIEW vw_ranking_centros_custo AS
SELECT
    ROW_NUMBER() OVER (PARTITION BY lc.exercicio ORDER BY SUM(lc.valor) DESC) AS posicao,
    cc.id AS centro_custo_id,
    cc.codigo,
    cc.nome AS centro_custo,
    cc.tipo,
    lc.exercicio,
    COUNT(lc.id) AS total_lancamentos,
    SUM(lc.valor) AS total_custo,
    cc.orcamento_anual,
    CASE
        WHEN cc.orcamento_anual > 0
        THEN ROUND((SUM(lc.valor) / cc.orcamento_anual) * 100, 2)
        ELSE NULL
    END AS percentual_orcamento_utilizado
FROM centros_custo cc
INNER JOIN lancamentos_custo lc ON cc.id = lc.centro_custo_id
WHERE cc.ativo = TRUE
GROUP BY cc.id, cc.codigo, cc.nome, cc.tipo, lc.exercicio, cc.orcamento_anual
ORDER BY lc.exercicio DESC, SUM(lc.valor) DESC;

-- Comentários
COMMENT ON TABLE centros_custo IS 'Cadastro de centros de custo da empresa';
COMMENT ON TABLE lancamentos_custo IS 'Lançamentos de custos alocados aos centros de custo';
COMMENT ON TABLE rateios_custo IS 'Rateios de custos comuns entre centros de custo';
COMMENT ON TABLE rateios_custo_detalhes IS 'Detalhes da distribuição dos rateios por centro';

COMMENT ON COLUMN centros_custo.tipo IS 'departamento, cultura, projeto, atividade, outro';
COMMENT ON COLUMN centros_custo.classificacao IS 'produtivo, administrativo, comercial, apoio';
COMMENT ON COLUMN lancamentos_custo.tipo_custo IS 'direto, indireto, fixo, variavel';
COMMENT ON COLUMN rateios_custo.criterio_rateio IS 'proporcional, igualitario, area, producao, receita, manual';
