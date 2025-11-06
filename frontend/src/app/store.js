import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
// ... (importar outros reducers/slices)

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // ... (outros slices: talhoes, atividades, etc.)
  },
});
