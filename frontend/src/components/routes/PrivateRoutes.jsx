import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
  const { token } = useSelector((state) => state.auth);

  // Se o token existir, permite o acesso (renderiza <Outlet />)
  // Caso contrário, redireciona para /login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoutes;
