import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validações
        if (formData.password !== formData.confirmPassword) {
            setError('As passwords não coincidem');
            return;
        }

        if (formData.password.length < 6) {
            setError('A password deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            await register({
                nome: formData.nome,
                email: formData.email,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Erro ao registar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Card de Registo */}
                <div className="bg-white rounded-lg shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">E</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Criar Conta</h1>
                        <p className="text-gray-600 mt-2">Registe-se no sistema ENDIAGRO</p>
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

                        {/* Nome */}
                        <div>
                            <label htmlFor="nome" className="label-field">
                                Nome Completo
                            </label>
                            <input
                                id="nome"
                                name="nome"
                                type="text"
                                required
                                value={formData.nome}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="João Silva"
                                disabled={loading}
                            />
                        </div>

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
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="joao@endiagro.com"
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
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Mínimo de 6 caracteres
                            </p>
                        </div>

                        {/* Confirmar Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="label-field">
                                Confirmar Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="••••••••"
                                disabled={loading}
                            />
                        </div>

                        {/* Botão de Registo */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <div className="spinner h-5 w-5 mr-2"></div>
                                    A registar...
                                </span>
                            ) : (
                                'Criar Conta'
                            )}
                        </button>
                    </form>

                    {/* Link para Login */}
                    <p className="text-center text-gray-600 text-sm mt-6">
                        Já tem conta?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-primary-700">
                            Entrar
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

export default Register;
