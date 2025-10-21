-- =====================================================
-- ENDIAGRO - Sistema de Gestão Financeira
-- Schema da Base de Dados PostgreSQL
-- Versão: 1.0
-- =====================================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABELA 1: EMPRESAS
-- =====================================================
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    nif VARCHAR(50) UNIQUE NOT NULL,
    endereco TEXT,
    provincia VARCHAR(100),
    municipio VARCHAR(100),
    taxa_cambio DECIMAL(10,2) DEFAULT 830.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA 2: USERS (Utilizadores)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'gestor' CHECK (role IN ('admin', 'gestor', 'contador', 'consultor')),
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP,
    ativo BOOLEAN DEFAULT true
);

-- =====================================================
-- TABELA 3: DEMONSTRAÇÃO DE RESULTADOS
-- =====================================================
CREATE TABLE IF NOT EXISTS demonstracao_resultados (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    exercicio INTEGER NOT NULL CHECK (exercicio BETWEEN 2020 AND 2100),

    -- PROVEITOS (Classe 7) em Kwanzas
    vendas_oleo_sesamo DECIMAL(15,2) DEFAULT 0,
    vendas_torta_sesamo DECIMAL(15,2) DEFAULT 0,
    vendas_feijao_guandu DECIMAL(15,2) DEFAULT 0,
    vendas_carne_ovina DECIMAL(15,2) DEFAULT 0,
    vendas_carne_suina DECIMAL(15,2) DEFAULT 0,
    vendas_linguica_porco DECIMAL(15,2) DEFAULT 0,
    vendas_presunto_bacon DECIMAL(15,2) DEFAULT 0,
    vendas_linguica_cordeiro DECIMAL(15,2) DEFAULT 0,
    vendas_carne_ovina_proc DECIMAL(15,2) DEFAULT 0,
    vendas_leite_sesamo DECIMAL(15,2) DEFAULT 0,
    vendas_queijo_sesamo DECIMAL(15,2) DEFAULT 0,
    vendas_queijo_ovelha DECIMAL(15,2) DEFAULT 0,
    vendas_queijo_cordeiro DECIMAL(15,2) DEFAULT 0,
    vendas_mel DECIMAL(15,2) DEFAULT 0,
    servicos_agricolas DECIMAL(15,2) DEFAULT 0,
    servicos_tecnicos DECIMAL(15,2) DEFAULT 0,
    subsidios_agricultura DECIMAL(15,2) DEFAULT 0,
    subsidios_pecuaria DECIMAL(15,2) DEFAULT 0,
    juros_obtidos DECIMAL(15,2) DEFAULT 0,

    -- CUSTOS (Classe 6) em Kwanzas
    materias_primas DECIMAL(15,2) DEFAULT 0,
    combustiveis DECIMAL(15,2) DEFAULT 0,
    embalagens DECIMAL(15,2) DEFAULT 0,
    sal_mineral DECIMAL(15,2) DEFAULT 0,
    medicamentos DECIMAL(15,2) DEFAULT 0,
    condimentos DECIMAL(15,2) DEFAULT 0,
    materiais_diversos DECIMAL(15,2) DEFAULT 0,
    subcontratos DECIMAL(15,2) DEFAULT 0,
    servicos_especializados DECIMAL(15,2) DEFAULT 0,
    agua_fluidos DECIMAL(15,2) DEFAULT 0,
    deslocacoes DECIMAL(15,2) DEFAULT 0,
    seguros DECIMAL(15,2) DEFAULT 0,
    remuneracoes_pessoal DECIMAL(15,2) DEFAULT 0,
    encargos_remuneracoes DECIMAL(15,2) DEFAULT 0,
    amortizacoes DECIMAL(15,2) DEFAULT 0,
    juros_suportados DECIMAL(15,2) DEFAULT 0,

    -- CALCULADOS AUTOMATICAMENTE
    total_proveitos DECIMAL(15,2) GENERATED ALWAYS AS (
        vendas_oleo_sesamo + vendas_torta_sesamo + vendas_feijao_guandu +
        vendas_carne_ovina + vendas_carne_suina + vendas_linguica_porco +
        vendas_presunto_bacon + vendas_linguica_cordeiro + vendas_carne_ovina_proc +
        vendas_leite_sesamo + vendas_queijo_sesamo + vendas_queijo_ovelha +
        vendas_queijo_cordeiro + vendas_mel + servicos_agricolas + servicos_tecnicos +
        subsidios_agricultura + subsidios_pecuaria + juros_obtidos
    ) STORED,

    total_custos DECIMAL(15,2) GENERATED ALWAYS AS (
        materias_primas + combustiveis + embalagens + sal_mineral + medicamentos +
        condimentos + materiais_diversos + subcontratos + servicos_especializados +
        agua_fluidos + deslocacoes + seguros + remuneracoes_pessoal +
        encargos_remuneracoes + amortizacoes + juros_suportados
    ) STORED,

    resultado_operacional DECIMAL(15,2) GENERATED ALWAYS AS (
        (vendas_oleo_sesamo + vendas_torta_sesamo + vendas_feijao_guandu +
         vendas_carne_ovina + vendas_carne_suina + vendas_linguica_porco +
         vendas_presunto_bacon + vendas_linguica_cordeiro + vendas_carne_ovina_proc +
         vendas_leite_sesamo + vendas_queijo_sesamo + vendas_queijo_ovelha +
         vendas_queijo_cordeiro + vendas_mel + servicos_agricolas + servicos_tecnicos +
         subsidios_agricultura + subsidios_pecuaria + juros_obtidos) -
        (materias_primas + combustiveis + embalagens + sal_mineral + medicamentos +
         condimentos + materiais_diversos + subcontratos + servicos_especializados +
         agua_fluidos + deslocacoes + seguros + remuneracoes_pessoal +
         encargos_remuneracoes + amortizacoes + juros_suportados)
    ) STORED,

    imposto_industrial DECIMAL(15,2),
    resultado_liquido DECIMAL(15,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, exercicio)
);

-- =====================================================
-- TABELA 4: BALANÇO PREVISIONAL
-- =====================================================
CREATE TABLE IF NOT EXISTS balanco_previsional (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    exercicio INTEGER NOT NULL CHECK (exercicio BETWEEN 2020 AND 2100),

    -- ATIVO (em Kwanzas)
    -- Ativo Não Corrente
    terrenos_recursos DECIMAL(15,2) DEFAULT 0,
    edificios_construcoes DECIMAL(15,2) DEFAULT 0,
    instalacoes_suinicolas DECIMAL(15,2) DEFAULT 0,
    salas_processamento DECIMAL(15,2) DEFAULT 0,
    equipamento_basico DECIMAL(15,2) DEFAULT 0,
    equipamento_proc_carne DECIMAL(15,2) DEFAULT 0,
    equipamento_queijaria DECIMAL(15,2) DEFAULT 0,
    equipamento_ordenha DECIMAL(15,2) DEFAULT 0,
    sistema_solar DECIMAL(15,2) DEFAULT 0,
    geradores DECIMAL(15,2) DEFAULT 0,
    biodigestor DECIMAL(15,2) DEFAULT 0,
    equipamento_transporte DECIMAL(15,2) DEFAULT 0,
    animais_reproducao DECIMAL(15,2) DEFAULT 0,
    matrizes_suinos DECIMAL(15,2) DEFAULT 0,
    matrizes_ovinas DECIMAL(15,2) DEFAULT 0,

    -- Ativo Corrente
    sesamo_grao DECIMAL(15,2) DEFAULT 0,
    forragens_seca DECIMAL(15,2) DEFAULT 0,
    sal_mineral_stock DECIMAL(15,2) DEFAULT 0,
    produtos_acabados DECIMAL(15,2) DEFAULT 0,
    clientes DECIMAL(15,2) DEFAULT 0,
    caixa DECIMAL(15,2) DEFAULT 0,
    depositos_ordem DECIMAL(15,2) DEFAULT 0,

    -- PASSIVO E CAPITAL PRÓPRIO (em Kwanzas)
    capital_social DECIMAL(15,2) DEFAULT 0,
    resultados_transitados DECIMAL(15,2) DEFAULT 0,
    resultado_liquido DECIMAL(15,2) DEFAULT 0,
    emprestimos_cp DECIMAL(15,2) DEFAULT 0,
    emprestimos_lp DECIMAL(15,2) DEFAULT 0,
    fornecedores DECIMAL(15,2) DEFAULT 0,
    estado_outros_entes DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, exercicio)
);

-- =====================================================
-- TABELA 5: CASH FLOW
-- =====================================================
CREATE TABLE IF NOT EXISTS cash_flow (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    exercicio INTEGER NOT NULL CHECK (exercicio BETWEEN 2020 AND 2100),

    -- Fluxos Operacionais (Kwanzas)
    recebimentos_clientes DECIMAL(15,2) DEFAULT 0,
    recebimentos_subsidios DECIMAL(15,2) DEFAULT 0,
    pagamentos_fornecedores DECIMAL(15,2) DEFAULT 0,
    pagamentos_pessoal DECIMAL(15,2) DEFAULT 0,
    pagamentos_estado DECIMAL(15,2) DEFAULT 0,

    -- Fluxos de Investimento (Kwanzas)
    aquisicoes_imobilizado DECIMAL(15,2) DEFAULT 0,
    juros_recebidos DECIMAL(15,2) DEFAULT 0,

    -- Fluxos de Financiamento (Kwanzas)
    emprestimos_obtidos DECIMAL(15,2) DEFAULT 0,
    aumento_capital DECIMAL(15,2) DEFAULT 0,
    juros_emprestimos DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, exercicio)
);

-- =====================================================
-- TABELA 6: TESOURARIA MENSAL
-- =====================================================
CREATE TABLE IF NOT EXISTS tesouraria_mensal (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    exercicio INTEGER NOT NULL CHECK (exercicio BETWEEN 2020 AND 2100),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('previsto', 'realizado')),

    saldo_inicial DECIMAL(15,2) DEFAULT 0,

    -- ENTRADAS (Classe 7) em Kwanzas
    vendas_711 DECIMAL(15,2) DEFAULT 0,
    vendas_712 DECIMAL(15,2) DEFAULT 0,
    vendas_713 DECIMAL(15,2) DEFAULT 0,
    vendas_714 DECIMAL(15,2) DEFAULT 0,
    vendas_715 DECIMAL(15,2) DEFAULT 0,
    vendas_7151 DECIMAL(15,2) DEFAULT 0,
    vendas_7152 DECIMAL(15,2) DEFAULT 0,
    vendas_7153 DECIMAL(15,2) DEFAULT 0,
    vendas_7154 DECIMAL(15,2) DEFAULT 0,
    vendas_7155 DECIMAL(15,2) DEFAULT 0,
    vendas_716 DECIMAL(15,2) DEFAULT 0,
    vendas_717 DECIMAL(15,2) DEFAULT 0,
    vendas_7171 DECIMAL(15,2) DEFAULT 0,
    vendas_7172 DECIMAL(15,2) DEFAULT 0,
    vendas_718 DECIMAL(15,2) DEFAULT 0,
    vendas_719 DECIMAL(15,2) DEFAULT 0,
    servicos_721 DECIMAL(15,2) DEFAULT 0,
    servicos_722 DECIMAL(15,2) DEFAULT 0,
    descontos_731 DECIMAL(15,2) DEFAULT 0,
    rendas_732 DECIMAL(15,2) DEFAULT 0,
    subsidios_741 DECIMAL(15,2) DEFAULT 0,
    subsidios_742 DECIMAL(15,2) DEFAULT 0,
    juros_781 DECIMAL(15,2) DEFAULT 0,
    outras_entradas DECIMAL(15,2) DEFAULT 0,

    -- SAÍDAS (Classe 6) em Kwanzas
    materias_primas_611 DECIMAL(15,2) DEFAULT 0,
    combustiveis_613 DECIMAL(15,2) DEFAULT 0,
    embalagens_614 DECIMAL(15,2) DEFAULT 0,
    sal_mineral_615 DECIMAL(15,2) DEFAULT 0,
    sal_processamento_6151 DECIMAL(15,2) DEFAULT 0,
    medicamentos_616 DECIMAL(15,2) DEFAULT 0,
    condimentos_617 DECIMAL(15,2) DEFAULT 0,
    materiais_diversos_618 DECIMAL(15,2) DEFAULT 0,
    subcontratos_621 DECIMAL(15,2) DEFAULT 0,
    servicos_espec_622 DECIMAL(15,2) DEFAULT 0,
    materiais_pe_623 DECIMAL(15,2) DEFAULT 0,
    agua_fluidos_624 DECIMAL(15,2) DEFAULT 0,
    manutencao_energia_6241 DECIMAL(15,2) DEFAULT 0,
    deslocacoes_625 DECIMAL(15,2) DEFAULT 0,
    servicos_diversos_626 DECIMAL(15,2) DEFAULT 0,
    publicidade_627 DECIMAL(15,2) DEFAULT 0,
    seguros_628 DECIMAL(15,2) DEFAULT 0,
    remun_orgaos_631 DECIMAL(15,2) DEFAULT 0,
    remun_pessoal_632 DECIMAL(15,2) DEFAULT 0,
    alimentacao_pessoal_633 DECIMAL(15,2) DEFAULT 0,
    transportes_pessoal_634 DECIMAL(15,2) DEFAULT 0,
    encargos_inss_635 DECIMAL(15,2) DEFAULT 0,
    seguros_acidentes_636 DECIMAL(15,2) DEFAULT 0,
    gastos_accao_social_637 DECIMAL(15,2) DEFAULT 0,
    impostos_651 DECIMAL(15,2) DEFAULT 0,
    descontos_concedidos_652 DECIMAL(15,2) DEFAULT 0,
    juros_emprestimos_681 DECIMAL(15,2) DEFAULT 0,
    amortizacoes_emprestimos DECIMAL(15,2) DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, exercicio, mes, tipo)
);

-- =====================================================
-- TABELA 7: DOCUMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS documentos (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

    nome_ficheiro VARCHAR(255) NOT NULL,
    caminho_ficheiro TEXT NOT NULL,
    tipo_documento VARCHAR(50),
    numero_documento VARCHAR(100),
    data_documento DATE,
    fornecedor_cliente VARCHAR(255),
    descricao TEXT,
    valor_total DECIMAL(15,2),
    moeda VARCHAR(10),

    -- Classificação IA
    categoria_sugerida VARCHAR(10),
    tipo_movimento VARCHAR(20) CHECK (tipo_movimento IN ('entrada', 'saida')),
    confianca VARCHAR(20) CHECK (confianca IN ('alta', 'media', 'baixa')),
    observacoes TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'processado', 'validado', 'rejeitado')),
    aplicado BOOLEAN DEFAULT false,
    data_aplicacao TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA 8: ORÇAMENTOS PARCIAIS (26 Actividades)
-- =====================================================
CREATE TABLE IF NOT EXISTS orcamentos_parciais (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    exercicio INTEGER NOT NULL CHECK (exercicio BETWEEN 2020 AND 2100),
    actividade VARCHAR(100) NOT NULL,

    -- Dados específicos por actividade
    area DECIMAL(10,2),
    producao DECIMAL(15,2),
    unidade VARCHAR(50),
    preco_venda DECIMAL(10,2),

    -- Proveitos
    vendas_previstas DECIMAL(15,2) DEFAULT 0,
    subsidios DECIMAL(15,2) DEFAULT 0,
    outros_proveitos DECIMAL(15,2) DEFAULT 0,

    -- Custos Variáveis
    materias_primas DECIMAL(15,2) DEFAULT 0,
    sementes DECIMAL(15,2) DEFAULT 0,
    adubos DECIMAL(15,2) DEFAULT 0,
    racao DECIMAL(15,2) DEFAULT 0,
    medicamentos DECIMAL(15,2) DEFAULT 0,
    embalagens DECIMAL(15,2) DEFAULT 0,

    -- Mão-de-Obra
    mao_de_obra DECIMAL(15,2) DEFAULT 0,

    -- Indicadores Calculados
    margem_bruta DECIMAL(15,2),
    margem_contribuicao DECIMAL(15,2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(empresa_id, exercicio, actividade)
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX idx_dr_empresa_exercicio ON demonstracao_resultados(empresa_id, exercicio);
CREATE INDEX idx_balanco_empresa_exercicio ON balanco_previsional(empresa_id, exercicio);
CREATE INDEX idx_tesouraria_empresa_mes ON tesouraria_mensal(empresa_id, exercicio, mes);
CREATE INDEX idx_documentos_empresa ON documentos(empresa_id, created_at DESC);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_empresa ON users(empresa_id);
CREATE INDEX idx_cashflow_empresa_exercicio ON cash_flow(empresa_id, exercicio);
CREATE INDEX idx_orcamentos_empresa_exercicio ON orcamentos_parciais(empresa_id, exercicio);

-- =====================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar a todas as tabelas relevantes
CREATE TRIGGER update_dr_updated_at BEFORE UPDATE ON demonstracao_resultados
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_balanco_updated_at BEFORE UPDATE ON balanco_previsional
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tesouraria_updated_at BEFORE UPDATE ON tesouraria_mensal
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cashflow_updated_at BEFORE UPDATE ON cash_flow
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON orcamentos_parciais
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DADOS INICIAIS (SEED DATA)
-- =====================================================

-- Inserir empresa exemplo
INSERT INTO empresas (nome, nif, endereco, provincia, municipio, taxa_cambio)
VALUES (
    'ENDIAGRO - Empresa Nacional de Desenvolvimento Integrado Agro-Pecuário',
    '5000000000',
    'Luanda',
    'Luanda',
    'Luanda',
    830.00
) ON CONFLICT DO NOTHING;

-- Inserir utilizador admin (password: admin123)
-- Hash gerado com bcrypt para 'admin123'
INSERT INTO users (nome, email, password_hash, role, empresa_id, ativo)
VALUES (
    'Administrador',
    'admin@endiagro.com',
    '$2b$10$YourHashHere',  -- Precisa ser gerado com bcrypt
    'admin',
    1,
    true
) ON CONFLICT DO NOTHING;

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para resumo financeiro por exercício
CREATE OR REPLACE VIEW v_resumo_financeiro AS
SELECT
    e.nome AS empresa,
    dr.exercicio,
    dr.total_proveitos,
    dr.total_custos,
    dr.resultado_operacional,
    dr.imposto_industrial,
    dr.resultado_liquido,
    CASE
        WHEN dr.total_proveitos > 0
        THEN ROUND((dr.resultado_liquido / dr.total_proveitos * 100), 2)
        ELSE 0
    END AS margem_liquida_percentual
FROM demonstracao_resultados dr
JOIN empresas e ON dr.empresa_id = e.id
ORDER BY dr.exercicio DESC;

-- View para saldos de tesouraria
CREATE OR REPLACE VIEW v_saldos_tesouraria AS
SELECT
    e.nome AS empresa,
    t.exercicio,
    t.mes,
    t.tipo,
    t.saldo_inicial,
    (vendas_711 + vendas_712 + vendas_713 + vendas_714 + vendas_715 +
     servicos_721 + servicos_722 + subsidios_741 + subsidios_742 + juros_781) AS total_entradas,
    (materias_primas_611 + combustiveis_613 + remun_pessoal_632 +
     encargos_inss_635 + juros_emprestimos_681) AS total_saidas,
    t.saldo_inicial +
    (vendas_711 + vendas_712 + vendas_713 + vendas_714 + vendas_715 +
     servicos_721 + servicos_722 + subsidios_741 + subsidios_742 + juros_781) -
    (materias_primas_611 + combustiveis_613 + remun_pessoal_632 +
     encargos_inss_635 + juros_emprestimos_681) AS saldo_final
FROM tesouraria_mensal t
JOIN empresas e ON t.empresa_id = e.id
ORDER BY t.exercicio, t.mes;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON TABLE demonstracao_resultados IS 'Demonstração de Resultados previsionais por exercício';
COMMENT ON TABLE balanco_previsional IS 'Balanço Previsional com Ativo, Passivo e Capital Próprio';
COMMENT ON TABLE tesouraria_mensal IS 'Plano de Tesouraria mensal com previsões e realizações';
COMMENT ON TABLE documentos IS 'Documentos carregados (facturas, recibos) com classificação IA';
COMMENT ON TABLE orcamentos_parciais IS 'Orçamentos das 26 actividades agropecuárias';

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
