-- Criação da tabela de Notificações
-- Sistema de alertas e avisos para os utilizadores

CREATE TABLE IF NOT EXISTS notificacoes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Conteúdo da notificação
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('info', 'warning', 'success', 'error', 'alert')),
    categoria VARCHAR(50) CHECK (categoria IN ('orcamento', 'cash_flow', 'indicador', 'aprovacao', 'desvio', 'prazo', 'sistema', 'outro')),

    -- Dados relacionados (opcional)
    entidade_tipo VARCHAR(50), -- 'orcamento_parcial', 'cash_flow', 'balanco', etc.
    entidade_id INTEGER, -- ID da entidade relacionada

    -- Link para ação (opcional)
    link_acao VARCHAR(255), -- URL para onde a notificação deve levar

    -- Status
    lida BOOLEAN DEFAULT FALSE,
    data_leitura TIMESTAMP,

    -- Metadata
    prioridade INTEGER DEFAULT 0 CHECK (prioridade BETWEEN 0 AND 5), -- 0=baixa, 5=crítica
    expira_em TIMESTAMP, -- Notificações podem expirar
    dados_extras JSONB, -- Dados adicionais em JSON

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhorar performance
CREATE INDEX idx_notificacoes_user ON notificacoes(user_id);
CREATE INDEX idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX idx_notificacoes_tipo ON notificacoes(tipo);
CREATE INDEX idx_notificacoes_categoria ON notificacoes(categoria);
CREATE INDEX idx_notificacoes_created ON notificacoes(created_at DESC);
CREATE INDEX idx_notificacoes_user_lida ON notificacoes(user_id, lida);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notificacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notificacoes_updated_at
    BEFORE UPDATE ON notificacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_notificacoes_updated_at();

-- Função para limpar notificações expiradas
CREATE OR REPLACE FUNCTION limpar_notificacoes_expiradas()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notificacoes
    WHERE expira_em IS NOT NULL AND expira_em < CURRENT_TIMESTAMP;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE notificacoes IS 'Sistema de notificações e alertas para utilizadores';
COMMENT ON COLUMN notificacoes.tipo IS 'Tipo: info, warning, success, error, alert';
COMMENT ON COLUMN notificacoes.categoria IS 'Categoria: orcamento, cash_flow, indicador, aprovacao, desvio, prazo, sistema, outro';
COMMENT ON COLUMN notificacoes.prioridade IS 'Prioridade: 0=baixa, 1=normal, 2=média, 3=alta, 4=urgente, 5=crítica';
COMMENT ON COLUMN notificacoes.entidade_tipo IS 'Tipo da entidade relacionada: orcamento_parcial, cash_flow, balanco, etc.';
COMMENT ON COLUMN notificacoes.dados_extras IS 'Dados adicionais em formato JSON';
