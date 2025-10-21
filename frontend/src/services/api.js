import axios from 'axios';

// Configuração da URL base da API
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Criar instância do axios com configurações padrão
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 30000 // 30 segundos
});

// Interceptor de requisições - Adicionar token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respostas - Tratar erros globalmente
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Token expirado ou inválido
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }

        // Erro de servidor
        if (error.response?.status === 500) {
            console.error('Erro do servidor:', error.response.data);
        }

        return Promise.reject(error);
    }
);

// =====================================================
// SERVIÇOS DE AUTENTICAÇÃO
// =====================================================

export const authService = {
    /**
     * Registar novo utilizador
     */
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    /**
     * Login de utilizador
     */
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response.data;
    },

    /**
     * Obter perfil do utilizador autenticado
     */
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },

    /**
     * Atualizar perfil
     */
    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },

    /**
     * Alterar password
     */
    changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/change-password', {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    /**
     * Logout
     */
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

// =====================================================
// SERVIÇOS DE DEMONSTRAÇÃO DE RESULTADOS
// =====================================================

export const drService = {
    /**
     * Criar/Atualizar Demonstração de Resultados
     */
    saveDR: async (exercicio, proveitos, custos) => {
        const response = await api.post('/dr', {
            exercicio,
            proveitos,
            custos
        });
        return response.data;
    },

    /**
     * Obter DR de um exercício específico
     */
    getDR: async (exercicio) => {
        const response = await api.get(`/dr/${exercicio}`);
        return response.data;
    },

    /**
     * Listar todas as DRs
     */
    listDRs: async () => {
        const response = await api.get('/dr');
        return response.data;
    },

    /**
     * Obter comparativo de vários exercícios
     */
    getComparativo: async (anos) => {
        const response = await api.get(`/dr/comparativo/${anos.join(',')}`);
        return response.data;
    },

    /**
     * Eliminar DR
     */
    deleteDR: async (exercicio) => {
        const response = await api.delete(`/dr/${exercicio}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE BALANÇO
// =====================================================

export const balancoService = {
    /**
     * Criar/Atualizar Balanço
     */
    saveBalanco: async (exercicio, ativo, passivo) => {
        const response = await api.post('/balanco', {
            exercicio,
            ativo,
            passivo
        });
        return response.data;
    },

    /**
     * Obter Balanço de um exercício
     */
    getBalanco: async (exercicio) => {
        const response = await api.get(`/balanco/${exercicio}`);
        return response.data;
    },

    /**
     * Listar todos os Balanços
     */
    listBalancos: async () => {
        const response = await api.get('/balanco');
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE TESOURARIA
// =====================================================

export const tesourariaService = {
    /**
     * Criar/Atualizar Tesouraria Mensal
     */
    saveTesouraria: async (tesourariaData) => {
        const response = await api.post('/tesouraria', tesourariaData);
        return response.data;
    },

    /**
     * Obter Tesouraria de um mês específico
     */
    getTesouraria: async (exercicio, mes) => {
        const response = await api.get(`/tesouraria/${exercicio}/${mes}`);
        return response.data;
    },

    /**
     * Listar todas as tesourarias de um exercício (12 meses)
     */
    listTesouraria: async (exercicio) => {
        const response = await api.get(`/tesouraria/${exercicio}`);
        return response.data;
    },

    /**
     * Obter resumo anual
     */
    getResumoAnual: async (exercicio) => {
        const response = await api.get(`/tesouraria/${exercicio}/resumo`);
        return response.data;
    },

    /**
     * Deletar tesouraria de um mês
     */
    deleteTesouraria: async (exercicio, mes) => {
        const response = await api.delete(`/tesouraria/${exercicio}/${mes}`);
        return response.data;
    },

    /**
     * Obter evolução de indicadores ao longo dos meses
     */
    getEvolucao: async (exercicio) => {
        const response = await api.get(`/tesouraria/${exercicio}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE DOCUMENTOS (OCR + IA)
// =====================================================

export const documentoService = {
    /**
     * Upload de documento
     */
    upload: async (file) => {
        const formData = new FormData();
        formData.append('documento', file);

        const response = await api.post('/documentos/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    /**
     * Processar OCR de um documento
     */
    processOCR: async (documentoId) => {
        const response = await api.post(`/documentos/${documentoId}/ocr`);
        return response.data;
    },

    /**
     * Aplicar documento ao Balanço de Execução
     */
    apply: async (documentoId) => {
        const response = await api.post(`/documentos/${documentoId}/apply`);
        return response.data;
    },

    /**
     * Listar documentos
     */
    list: async () => {
        const response = await api.get('/documentos');
        return response.data;
    },

    /**
     * Obter detalhes de um documento
     */
    getDocumento: async (documentoId) => {
        const response = await api.get(`/documentos/${documentoId}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE INDICADORES
// =====================================================

export const indicadoresService = {
    /**
     * Obter todos os indicadores de um exercício
     */
    getIndicadores: async (exercicio) => {
        const response = await api.get(`/indicadores/${exercicio}`);
        return response.data;
    },

    /**
     * Obter indicadores Lead (preditivos)
     */
    getLeadIndicators: async (exercicio) => {
        const response = await api.get(`/indicadores/${exercicio}/lead`);
        return response.data;
    },

    /**
     * Obter indicadores Lag (resultado)
     */
    getLagIndicators: async (exercicio) => {
        const response = await api.get(`/indicadores/${exercicio}/lag`);
        return response.data;
    },

    /**
     * Obter evolução de indicadores ao longo de vários anos
     */
    getEvolucao: async (anos) => {
        const response = await api.get(`/indicadores/evolucao/${anos}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE BALANÇO DE EXECUÇÃO
// =====================================================

export const balancoExecucaoService = {
    /**
     * Obter comparação previsto vs realizado
     */
    getComparacao: async (exercicio) => {
        const response = await api.get(`/balanco-execucao/${exercicio}/comparacao`);
        return response.data;
    },

    /**
     * Obter desvios mensais
     */
    getDesviosMensais: async (exercicio) => {
        const response = await api.get(`/balanco-execucao/${exercicio}/desvios-mensais`);
        return response.data;
    },

    /**
     * Obter análise de variações
     */
    getAnaliseVariacoes: async (exercicio) => {
        const response = await api.get(`/balanco-execucao/${exercicio}/analise-variacoes`);
        return response.data;
    },

    /**
     * Obter dashboard de execução
     */
    getDashboard: async (exercicio) => {
        const response = await api.get(`/balanco-execucao/${exercicio}/dashboard`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE DASHBOARD EXECUTIVO
// =====================================================

export const dashboardService = {
    /**
     * Obter dashboard consolidado completo
     */
    getDashboardConsolidado: async (exercicio) => {
        const response = await api.get(`/dashboard/${exercicio}`);
        return response.data;
    },

    /**
     * Obter evolução de KPIs ao longo dos anos
     */
    getEvolucaoKPIs: async (anos) => {
        // anos formato: "2023,2024,2025"
        const response = await api.get(`/dashboard/evolucao/${anos}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE CASH FLOW
// =====================================================

export const cashFlowService = {
    /**
     * Salvar/Atualizar Cash Flow
     */
    saveCashFlow: async (cashFlowData) => {
        const response = await api.post('/cash-flow', cashFlowData);
        return response.data;
    },

    /**
     * Obter Cash Flow de um exercício
     */
    getCashFlow: async (exercicio) => {
        const response = await api.get(`/cash-flow/${exercicio}`);
        return response.data;
    },

    /**
     * Listar todos os Cash Flows
     */
    listCashFlows: async () => {
        const response = await api.get('/cash-flow');
        return response.data;
    },

    /**
     * Gerar Cash Flow automaticamente a partir da Tesouraria
     */
    gerarAutomatico: async (exercicio) => {
        const response = await api.post(`/cash-flow/${exercicio}/gerar-automatico`);
        return response.data;
    },

    /**
     * Obter análise do Cash Flow
     */
    getAnalise: async (exercicio) => {
        const response = await api.get(`/cash-flow/${exercicio}/analise`);
        return response.data;
    },

    /**
     * Deletar Cash Flow
     */
    deleteCashFlow: async (exercicio) => {
        const response = await api.delete(`/cash-flow/${exercicio}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE NOTIFICAÇÕES
// =====================================================

export const notificacoesService = {
    /**
     * Criar Notificação
     */
    createNotificacao: async (notificacaoData) => {
        const response = await api.post('/notificacoes', notificacaoData);
        return response.data;
    },

    /**
     * Listar Notificações
     */
    listNotificacoes: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/notificacoes${params ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Obter Notificação específica
     */
    getNotificacao: async (id) => {
        const response = await api.get(`/notificacoes/${id}`);
        return response.data;
    },

    /**
     * Deletar Notificação
     */
    deleteNotificacao: async (id) => {
        const response = await api.delete(`/notificacoes/${id}`);
        return response.data;
    },

    /**
     * Marcar como Lida
     */
    marcarComoLida: async (id) => {
        const response = await api.patch(`/notificacoes/${id}/marcar-lida`);
        return response.data;
    },

    /**
     * Marcar Todas como Lidas
     */
    marcarTodasComoLidas: async () => {
        const response = await api.post('/notificacoes/marcar-todas-lidas');
        return response.data;
    },

    /**
     * Deletar Todas Lidas
     */
    deletarTodasLidas: async () => {
        const response = await api.delete('/notificacoes/deletar-todas-lidas/bulk');
        return response.data;
    },

    /**
     * Contar Não Lidas
     */
    contarNaoLidas: async () => {
        const response = await api.get('/notificacoes/contar/nao-lidas');
        return response.data;
    },

    /**
     * Limpar Expiradas
     */
    limparExpiradas: async () => {
        const response = await api.post('/notificacoes/limpar-expiradas');
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE ORÇAMENTOS PARCIAIS
// =====================================================

export const orcamentosParciaisService = {
    /**
     * Salvar/Atualizar Orçamento Parcial
     */
    saveOrcamento: async (orcamentoData) => {
        const response = await api.post('/orcamentos-parciais', orcamentoData);
        return response.data;
    },

    /**
     * Listar Orçamentos
     */
    listOrcamentos: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/orcamentos-parciais${params ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Obter Orçamento específico
     */
    getOrcamento: async (id) => {
        const response = await api.get(`/orcamentos-parciais/${id}`);
        return response.data;
    },

    /**
     * Deletar Orçamento
     */
    deleteOrcamento: async (id) => {
        const response = await api.delete(`/orcamentos-parciais/${id}`);
        return response.data;
    },

    /**
     * Aprovar Orçamento
     */
    aprovarOrcamento: async (id) => {
        const response = await api.post(`/orcamentos-parciais/${id}/aprovar`);
        return response.data;
    },

    /**
     * Atualizar Status
     */
    updateStatus: async (id, status) => {
        const response = await api.patch(`/orcamentos-parciais/${id}/status`, { status });
        return response.data;
    },

    /**
     * Comparar Múltiplos Orçamentos
     */
    compararOrcamentos: async (ids) => {
        const idsString = Array.isArray(ids) ? ids.join(',') : ids;
        const response = await api.get(`/orcamentos-parciais/comparar/multiplos?ids=${idsString}`);
        return response.data;
    },

    /**
     * Obter Consolidação por Exercício
     */
    getConsolidacao: async (exercicio) => {
        const response = await api.get(`/orcamentos-parciais/consolidacao/${exercicio}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE RENTABILIDADE POR CULTURA
// =====================================================

export const rentabilidadeService = {
    /**
     * Salvar/Atualizar Análise de Rentabilidade
     */
    saveRentabilidade: async (rentabilidadeData) => {
        const response = await api.post('/rentabilidade', rentabilidadeData);
        return response.data;
    },

    /**
     * Listar Análises de Rentabilidade
     */
    listRentabilidade: async (filters = {}) => {
        const params = new URLSearchParams(filters).toString();
        const response = await api.get(`/rentabilidade${params ? `?${params}` : ''}`);
        return response.data;
    },

    /**
     * Obter Análise específica
     */
    getRentabilidade: async (id) => {
        const response = await api.get(`/rentabilidade/${id}`);
        return response.data;
    },

    /**
     * Deletar Análise
     */
    deleteRentabilidade: async (id) => {
        const response = await api.delete(`/rentabilidade/${id}`);
        return response.data;
    },

    /**
     * Comparar Culturas por Exercício
     */
    compararCulturas: async (exercicio) => {
        const response = await api.get(`/rentabilidade/comparar/${exercicio}`);
        return response.data;
    },

    /**
     * Obter Ranking de Rentabilidade
     */
    getRanking: async (exercicio) => {
        const response = await api.get(`/rentabilidade/ranking/${exercicio}`);
        return response.data;
    },

    /**
     * Obter Consolidação por Exercício
     */
    getConsolidacao: async (exercicio) => {
        const response = await api.get(`/rentabilidade/consolidacao/${exercicio}`);
        return response.data;
    }
};

// =====================================================
// SERVIÇOS DE RELATÓRIOS (PDF/Excel)
// =====================================================

export const relatoriosService = {
    /**
     * Exportar DR em PDF
     */
    exportarDRPDF: async (exercicio) => {
        const response = await api.get(`/relatorios/dr/${exercicio}/pdf`, {
            responseType: 'blob'
        });

        // Criar link de download
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `DR-${exercicio}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'PDF exportado com sucesso' };
    },

    /**
     * Exportar DR em Excel
     */
    exportarDRExcel: async (exercicio) => {
        const response = await api.get(`/relatorios/dr/${exercicio}/excel`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `DR-${exercicio}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Excel exportado com sucesso' };
    },

    /**
     * Exportar Balanço em PDF
     */
    exportarBalancoPDF: async (exercicio) => {
        const response = await api.get(`/relatorios/balanco/${exercicio}/pdf`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Balanco-${exercicio}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'PDF exportado com sucesso' };
    },

    /**
     * Exportar Balanço em Excel
     */
    exportarBalancoExcel: async (exercicio) => {
        const response = await api.get(`/relatorios/balanco/${exercicio}/excel`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Balanco-${exercicio}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Excel exportado com sucesso' };
    },

    /**
     * Exportar Tesouraria em PDF
     */
    exportarTesourariaPDF: async (exercicio) => {
        const response = await api.get(`/relatorios/tesouraria/${exercicio}/pdf`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Tesouraria-${exercicio}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'PDF exportado com sucesso' };
    },

    /**
     * Exportar Tesouraria em Excel
     */
    exportarTesourariaExcel: async (exercicio) => {
        const response = await api.get(`/relatorios/tesouraria/${exercicio}/excel`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Tesouraria-${exercicio}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Excel exportado com sucesso' };
    },

    /**
     * Exportar Cash Flow em PDF
     */
    exportarCashFlowPDF: async (exercicio) => {
        const response = await api.get(`/relatorios/cash-flow/${exercicio}/pdf`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CashFlow-${exercicio}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'PDF exportado com sucesso' };
    },

    /**
     * Exportar Cash Flow em Excel
     */
    exportarCashFlowExcel: async (exercicio) => {
        const response = await api.get(`/relatorios/cash-flow/${exercicio}/excel`, {
            responseType: 'blob'
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `CashFlow-${exercicio}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return { success: true, message: 'Excel exportado com sucesso' };
    }
};

// Exportar instância da API também
export default api;
