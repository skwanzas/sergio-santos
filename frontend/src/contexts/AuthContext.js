import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

// Criar o Context
const AuthContext = createContext({});

/**
 * Provider de Autenticação
 * Gere o estado global de autenticação da aplicação
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Carregar utilizador ao iniciar a aplicação
     */
    useEffect(() => {
        loadUser();
    }, []);

    /**
     * Carregar dados do utilizador autenticado
     */
    const loadUser = async () => {
        try {
            const token = localStorage.getItem('token');

            if (token) {
                const data = await authService.getProfile();
                setUser(data.user);
            }
        } catch (error) {
            console.error('Erro ao carregar utilizador:', error);
            // Se o token for inválido, remover
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    /**
     * Login
     */
    const login = async (email, password) => {
        try {
            setError(null);
            const data = await authService.login(email, password);
            setUser(data.user);
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    /**
     * Registar novo utilizador
     */
    const register = async (userData) => {
        try {
            setError(null);
            const data = await authService.register(userData);
            setUser(data.user);
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao registar';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    /**
     * Logout
     */
    const logout = () => {
        authService.logout();
        setUser(null);
    };

    /**
     * Atualizar perfil do utilizador
     */
    const updateProfile = async (userData) => {
        try {
            setError(null);
            const data = await authService.updateProfile(userData);
            setUser(data.user);
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    /**
     * Alterar password
     */
    const changePassword = async (currentPassword, newPassword) => {
        try {
            setError(null);
            const data = await authService.changePassword(currentPassword, newPassword);
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Erro ao alterar password';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    /**
     * Verificar se utilizador tem permissão
     */
    const hasRole = (...roles) => {
        if (!user) return false;
        return roles.includes(user.role);
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        hasRole,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isGestor: user?.role === 'gestor' || user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook para usar o AuthContext
 */
export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }

    return context;
};

export default AuthContext;
