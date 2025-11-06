import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';

// Importação de Páginas e Componentes
import LoginAgroIA from './pages/LoginAgroIA';
import DashboardAgroIA from './pages/DashboardAgroIA';
import PrivateRoutes from './components/routes/PrivateRoutes';

function AppAgroIA() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/agroia/login" element={<LoginAgroIA />} />

          {/* Rotas Privadas */}
          <Route element={<PrivateRoutes />}>
            <Route path="/agroia" element={<DashboardAgroIA />} />
            <Route path="/agroia/dashboard" element={<DashboardAgroIA />} />
            {/* ... (outras rotas privadas do módulo AgroIA) */}
          </Route>

          {/* Rota 404 (Opcional) */}
          <Route path="/agroia/*" element={<h1>404 - Página não encontrada</h1>} />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}

export default AppAgroIA;
