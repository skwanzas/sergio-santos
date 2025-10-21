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
     * Criar/Atualizar Plano de Tesouraria
     */
    saveTesouraria: async (exercicio, mes, tipo, dados) => {
        const response = await api.post('/tesouraria', {
            exercicio,
            mes,
            tipo,
            dados
        });
        return response.data;
    },

    /**
     * Obter Tesouraria de um mês específico
     */
    getTesouraria: async (exercicio, mes, tipo) => {
        const response = await api.get(`/tesouraria/${exercicio}/${mes}/${tipo}`);
        return response.data;
    },

    /**
     * Obter todos os meses de um exercício
     */
    getTesourariaAnual: async (exercicio, tipo) => {
        const response = await api.get(`/tesouraria/${exercicio}/${tipo}`);
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
    }
};

// Exportar instância da API também
export default api;
