import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/apiAgroIA';

// Tenta obter o token do localStorage
const token = localStorage.getItem('authToken');

const initialState = {
  user: null,
  token: token || null,
  isLoading: false,
  error: null,
};

// Async Thunk para Login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      // Salva o token no localStorage
      localStorage.setItem('authToken', data.token);
      return data; // Retorna { status, token, data: { user } }
    } catch (error) {
      // Retorna a mensagem de erro da API
      return rejectWithValue(error.response?.data?.message || 'Erro de login');
    }
  }
);

// Async Thunk para Signup
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ nome, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/auth/signup', { nome, email, password });
      // Salva o token no localStorage
      localStorage.setItem('authToken', data.token);
      return data; // Retorna { status, token, data: { user } }
    } catch (error) {
      // Retorna a mensagem de erro da API
      return rejectWithValue(error.response?.data?.message || 'Erro de registo');
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('authToken');
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload; // Mensagem de erro do rejectWithValue
        state.user = null;
        state.token = null;
      })
      // Signup
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
