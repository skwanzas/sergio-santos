import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Card de Login */}
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">E</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">ENDIAGRO</h1>
                        <p className="text-gray-600 mt-2">Sistema de Gestão Financeira</p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Mensagem de Erro */}
                        {error && (
                            <div className="alert-error flex items-start">
                                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="label-field">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="seu@email.com"
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="label-field">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        {/* Opções extras */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Lembrar-me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-primary hover:text-primary-700">
                                    Esqueceu a password?
                                </a>
                            </div>
                        </div>

                        {/* Botão de Login */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full relative"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="spinner h-5 w-5 mr-2"></div>
                                    A entrar...
                                </span>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    {/* Link para Registo */}
                    <p className="text-center text-gray-600 text-sm mt-6">
                        Não tem conta?{' '}
                        <Link to="/register" className="font-semibold text-primary hover:text-primary-700">
                            Registar
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 text-xs mt-4">
                    © 2025 ENDIAGRO. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
};

export default Login;
