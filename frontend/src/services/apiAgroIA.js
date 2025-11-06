import axios from 'axios';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';

// Cria a instância centralizada do Axios para o módulo AgroIA
const apiAgroIA = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1',
});

// Interceptor de Request (Injeta o Token)
apiAgroIA.interceptors.request.use(
  (config) => {
    // Obtém o token do estado Redux (ou localStorage)
    const token = store.getState().auth.token;

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Response (Trata Erros 401)
apiAgroIA.interceptors.response.use(
  (response) => {
    // Qualquer status code 2xx cai aqui
    return response;
  },
  (error) => {
    // Qualquer status code fora do range 2xx cai aqui
    if (error.response && error.response.status === 401) {
      // Se for 401 (Não Autorizado), desloga o utilizador
      console.warn('Sessão expirada ou token inválido. Deslogando...');
      store.dispatch(logout());
      // O redirecionamento será tratado pelo PrivateRoutes
    }
    return Promise.reject(error);
  }
);

export default apiAgroIA;
