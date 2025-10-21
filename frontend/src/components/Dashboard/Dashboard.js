import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
    BarChart3,
    FileText,
    TrendingUp,
    Wallet,
    Upload,
    Settings,
    LogOut
} from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems = [
        {
            icon: <FileText className="w-6 h-6" />,
            title: 'Demonstração de Resultados',
            description: 'Gestão de proveitos e custos',
            path: '/dr',
            color: 'bg-blue-500'
        },
        {
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Balanço Previsional',
            description: 'Ativo, Passivo e Capital Próprio',
            path: '/balanco',
            color: 'bg-green-500'
        },
        {
            icon: <Wallet className="w-6 h-6" />,
            title: 'Plano de Tesouraria',
            description: 'Gestão mensal de tesouraria',
            path: '/tesouraria',
            color: 'bg-purple-500'
        },
        {
            icon: <TrendingUp className="w-6 h-6" />,
            title: 'Indicadores',
            description: 'Lead e Lag Indicators',
            path: '/indicadores',
            color: 'bg-orange-500'
        },
        {
            icon: <Upload className="w-6 h-6" />,
            title: 'Documentos',
            description: 'Upload e classificação automática',
            path: '/documentos',
            color: 'bg-pink-500'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">ENDIAGRO</h1>
                            <p className="text-sm text-gray-600">Sistema de Gestão Financeira</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-800">{user?.nome}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                title="Sair"
                            >
                                <LogOut className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        Bem-vindo, {user?.nome?.split(' ')[0]}!
                    </h2>
                    <p className="text-gray-600">
                        Selecione um módulo para começar a trabalhar
                    </p>
                </div>

                {/* Módulos Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {menuItems.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(item.path)}
                            className="card cursor-pointer transform transition-all duration-200 hover:scale-105"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`${item.color} p-3 rounded-lg text-white`}>
                                    {item.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 mb-1">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                        <h4 className="text-sm font-medium text-green-800 mb-2">
                            Resultado Líquido 2025
                        </h4>
                        <p className="text-2xl font-bold text-green-900">
                            Kz 3.105.750.000
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                            ↑ 15% vs. ano anterior
                        </p>
                    </div>

                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                        <h4 className="text-sm font-medium text-blue-800 mb-2">
                            Margem Líquida
                        </h4>
                        <p className="text-2xl font-bold text-blue-900">
                            58.15%
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                            Objetivo: 50%
                        </p>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                        <h4 className="text-sm font-medium text-purple-800 mb-2">
                            Saldo de Tesouraria
                        </h4>
                        <p className="text-2xl font-bold text-purple-900">
                            Kz 445.000.000
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                            Próximo mês
                        </p>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-8 card bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200">
                    <h3 className="font-semibold text-gray-800 mb-2">
                        📌 Informação Importante
                    </h3>
                    <p className="text-sm text-gray-700">
                        Este é um sistema em desenvolvimento. Todos os módulos estão a ser implementados
                        conforme o manual técnico. Para mais informações, consulte a documentação.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
