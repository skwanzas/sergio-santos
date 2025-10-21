import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Componentes
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import DemonstracaoResultados from './components/DR/DemonstracaoResultados';
import UploadDocumentos from './components/Documentos/UploadDocumentos';
import Indicadores from './components/Indicadores/Indicadores';
import BalancoPrevisional from './components/Balanco/BalancoPrevisional';
import TesourariaMensal from './components/Tesouraria/TesourariaMensal';
import BalancoExecucao from './components/BalancoExecucao/BalancoExecucao';
import DashboardExecutivo from './components/DashboardExecutivo/DashboardExecutivo';
import CashFlow from './components/CashFlow/CashFlow';
import OrcamentosParciais from './components/OrcamentosParciais/OrcamentosParciais';
import NotificationCenter from './components/Notifications/NotificationCenter';
import Rentabilidade from './components/Rentabilidade/Rentabilidade';

/**
 * Componente de Rota Privada
 * Redireciona para login se não estiver autenticado
 */
const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner h-12 w-12 mx-auto mb-4"></div>
                    <p className="text-gray-600">A carregar...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Componente de Rota Pública
 * Redireciona para dashboard se já estiver autenticado
 */
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="spinner h-12 w-12 mx-auto mb-4"></div>
                    <p className="text-gray-600">A carregar...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

/**
 * Componente Principal da Aplicação
 */
function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Routes>
                        {/* Rotas Públicas */}
                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />

                        {/* Rotas Privadas */}
                        <Route
                            path="/dashboard"
                            element={
                                <PrivateRoute>
                                    <Dashboard />
                                </PrivateRoute>
                            }
                        />

                        {/* Demonstração de Resultados */}
                        <Route
                            path="/dr"
                            element={
                                <PrivateRoute>
                                    <DemonstracaoResultados />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/balanco"
                            element={
                                <PrivateRoute>
                                    <BalancoPrevisional />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/tesouraria"
                            element={
                                <PrivateRoute>
                                    <TesourariaMensal />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/indicadores"
                            element={
                                <PrivateRoute>
                                    <Indicadores />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/documentos"
                            element={
                                <PrivateRoute>
                                    <UploadDocumentos />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/execucao"
                            element={
                                <PrivateRoute>
                                    <BalancoExecucao />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/dashboard-executivo"
                            element={
                                <PrivateRoute>
                                    <DashboardExecutivo />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/cash-flow"
                            element={
                                <PrivateRoute>
                                    <CashFlow />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/orcamentos-parciais"
                            element={
                                <PrivateRoute>
                                    <OrcamentosParciais />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/notificacoes"
                            element={
                                <PrivateRoute>
                                    <NotificationCenter />
                                </PrivateRoute>
                            }
                        />

                        <Route
                            path="/rentabilidade"
                            element={
                                <PrivateRoute>
                                    <Rentabilidade />
                                </PrivateRoute>
                            }
                        />

                        {/* Rota Padrão */}
                        <Route path="/" element={<Navigate to="/dashboard" />} />

                        {/* 404 - Not Found */}
                        <Route
                            path="*"
                            element={
                                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                                    <div className="text-center">
                                        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
                                        <p className="text-xl text-gray-600 mb-8">Página não encontrada</p>
                                        <a href="/dashboard" className="btn-primary">
                                            Voltar ao Dashboard
                                        </a>
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
