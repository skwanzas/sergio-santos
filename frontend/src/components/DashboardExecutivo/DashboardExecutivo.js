import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
    AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
    DollarSign, FileText, Calendar, Activity, Target,
    BarChart3, PieChart, Wallet, AlertCircle, Info,
    RefreshCw, Download, ArrowRight, Award
} from 'lucide-react';

const DashboardExecutivo = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const currentYear = new Date().getFullYear();

    const [exercicio, setExercicio] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dashboard, setDashboard] = useState(null);
    const [evolucao, setEvolucao] = useState(null);

    useEffect(() => {
        loadDashboard();
        loadEvolucao();
    }, [exercicio]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await dashboardService.getDashboardConsolidado(exercicio);
            setDashboard(data);
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
            setError(err.response?.data?.error || 'Erro ao carregar dashboard');
        } finally {
            setLoading(false);
        }
    };

    const loadEvolucao = async () => {
        try {
            const anos = [exercicio - 2, exercicio - 1, exercicio].join(',');
            const data = await dashboardService.getEvolucaoKPIs(anos);
            setEvolucao(data);
        } catch (err) {
            console.error('Erro ao carregar evolução:', err);
        }
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'AOA 0,00';
        const num = parseFloat(value);
        if (isNaN(num)) return 'AOA 0,00';
        return `AOA ${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getSaudeColor = (classificacao) => {
        const colors = {
            excelente: 'from-green-500 to-green-600',
            boa: 'from-blue-500 to-blue-600',
            media: 'from-yellow-500 to-yellow-600',
            fraca: 'from-red-500 to-red-600'
        };
        return colors[classificacao] || colors.media;
    };

    const getPerformanceColor = (performance) => {
        const colors = {
            acima_esperado: 'text-green-600 bg-green-100',
            dentro_esperado: 'text-blue-600 bg-blue-100',
            abaixo_esperado: 'text-red-600 bg-red-100',
            sem_dados: 'text-gray-600 bg-gray-100'
        };
        return colors[performance] || colors.sem_dados;
    };

    const getPerformanceText = (performance) => {
        const texts = {
            acima_esperado: 'Acima do Esperado',
            dentro_esperado: 'Dentro do Esperado',
            abaixo_esperado: 'Abaixo do Esperado',
            sem_dados: 'Sem Dados'
        };
        return texts[performance] || 'Não Avaliado';
    };

    if (loading && !dashboard) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">A carregar dashboard executivo...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Dashboard Executivo
                        </h1>
                        <p className="text-gray-600">
                            Visão consolidada de todos os módulos do sistema
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={exercicio}
                            onChange={(e) => setExercicio(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={loadDashboard}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </button>
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {error && (
                <div className="alert alert-error mb-6">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {dashboard && (
                <>
                    {/* Saúde Financeira Geral */}
                    {dashboard.saude_financeira && (
                        <div className={`bg-gradient-to-r ${getSaudeColor(dashboard.saude_financeira.classificacao)} text-white p-8 rounded-2xl mb-6 shadow-xl`}>
                            <div className="flex items-center gap-6">
                                <div className="bg-white bg-opacity-20 p-6 rounded-full">
                                    <Award className="h-16 w-16" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold mb-2">
                                        Saúde Financeira: {dashboard.saude_financeira.classificacao.toUpperCase()}
                                    </h2>
                                    <p className="text-xl opacity-90 mb-4">
                                        Score Geral: {dashboard.saude_financeira.score}/100
                                    </p>
                                    <div className="grid grid-cols-5 gap-4">
                                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                            <p className="text-sm opacity-80">Resultado</p>
                                            <p className="text-xl font-bold">{dashboard.saude_financeira.componentes.resultado}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                            <p className="text-sm opacity-80">Balanço</p>
                                            <p className="text-xl font-bold">{dashboard.saude_financeira.componentes.balanco}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                            <p className="text-sm opacity-80">Documentos</p>
                                            <p className="text-xl font-bold">{dashboard.saude_financeira.componentes.documentos}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                            <p className="text-sm opacity-80">Autonomia</p>
                                            <p className="text-xl font-bold">{dashboard.saude_financeira.componentes.autonomia}</p>
                                        </div>
                                        <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                                            <p className="text-sm opacity-80">Execução</p>
                                            <p className="text-xl font-bold">{dashboard.saude_financeira.componentes.execucao}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* KPIs Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Resultado Líquido */}
                        {dashboard.demonstracao_resultados && (
                            <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 cursor-pointer hover:shadow-lg transition-shadow"
                                 onClick={() => navigate('/dr')}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Resultado Líquido</span>
                                    <DollarSign className="h-6 w-6 text-blue-600" />
                                </div>
                                <p className={`text-2xl font-bold mb-1 ${
                                    parseFloat(dashboard.demonstracao_resultados.resultado_liquido) >= 0
                                        ? 'text-green-600'
                                        : 'text-red-600'
                                }`}>
                                    {formatCurrency(dashboard.demonstracao_resultados.resultado_liquido)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    Margem: {dashboard.demonstracao_resultados.margem_liquida}%
                                </p>
                                <div className="mt-2 flex items-center text-xs text-blue-600">
                                    <span>Ver DR</span>
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </div>
                            </div>
                        )}

                        {/* Total Ativo */}
                        {dashboard.balanco_previsional && (
                            <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
                                 onClick={() => navigate('/balanco')}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Total Ativo</span>
                                    <BarChart3 className="h-6 w-6 text-green-600" />
                                </div>
                                <p className="text-2xl font-bold text-green-600 mb-1">
                                    {formatCurrency(dashboard.balanco_previsional.total_ativo)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {dashboard.balanco_previsional.equilibrado ? (
                                        <span className="text-green-600">✓ Equilibrado</span>
                                    ) : (
                                        <span className="text-red-600">✗ Não Equilibrado</span>
                                    )}
                                </p>
                                <div className="mt-2 flex items-center text-xs text-green-600">
                                    <span>Ver Balanço</span>
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </div>
                            </div>
                        )}

                        {/* Tesouraria */}
                        {dashboard.tesouraria && (
                            <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
                                 onClick={() => navigate('/tesouraria')}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Saldo Médio</span>
                                    <Wallet className="h-6 w-6 text-purple-600" />
                                </div>
                                <p className={`text-2xl font-bold mb-1 ${
                                    parseFloat(dashboard.tesouraria.saldo_medio) >= 0
                                        ? 'text-purple-600'
                                        : 'text-red-600'
                                }`}>
                                    {formatCurrency(dashboard.tesouraria.saldo_medio)}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {dashboard.tesouraria.meses_planejados} meses planejados
                                </p>
                                <div className="mt-2 flex items-center text-xs text-purple-600">
                                    <span>Ver Tesouraria</span>
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </div>
                            </div>
                        )}

                        {/* Documentos */}
                        {dashboard.documentos && (
                            <div className="card p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition-shadow"
                                 onClick={() => navigate('/documentos')}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Documentos</span>
                                    <FileText className="h-6 w-6 text-yellow-600" />
                                </div>
                                <p className="text-2xl font-bold text-yellow-600 mb-1">
                                    {dashboard.documentos.total_documentos}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {dashboard.documentos.validados} validados ({dashboard.documentos.taxa_validacao}%)
                                </p>
                                <div className="mt-2 flex items-center text-xs text-yellow-600">
                                    <span>Ver Documentos</span>
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Execução Orçamental */}
                    {dashboard.execucao && (
                        <div className={`card p-6 mb-6 ${getPerformanceColor(dashboard.execucao.performance)}`}>
                            <div className="flex items-center gap-4">
                                <Target className="h-10 w-10" />
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold mb-2">
                                        Execução Orçamental: {getPerformanceText(dashboard.execucao.performance)}
                                    </h3>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-sm opacity-90">Previsto</p>
                                            <p className="text-lg font-bold">{formatCurrency(dashboard.execucao.previsto)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Realizado</p>
                                            <p className="text-lg font-bold">{formatCurrency(dashboard.execucao.realizado)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Taxa de Execução</p>
                                            <p className="text-lg font-bold">{dashboard.execucao.taxa_execucao}%</p>
                                        </div>
                                        <div>
                                            <p className="text-sm opacity-90">Desvio</p>
                                            <p className="text-lg font-bold">{dashboard.execucao.desvio_percentual}%</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/execucao')}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    Detalhes
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        {/* Alertas */}
                        {dashboard.alertas && dashboard.alertas.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    Alertas ({dashboard.alertas.length})
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {dashboard.alertas.map((alerta, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border-l-4 ${
                                                alerta.nivel === 'critico'
                                                    ? 'bg-red-50 border-red-600'
                                                    : 'bg-yellow-50 border-yellow-600'
                                            }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {alerta.nivel === 'critico' ? (
                                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm text-gray-700">{alerta.modulo}</p>
                                                    <p className="text-sm text-gray-800 mt-1">{alerta.mensagem}</p>
                                                    {alerta.valor !== null && (
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            Valor: {typeof alerta.valor === 'number' && alerta.valor > 1000
                                                                ? formatCurrency(alerta.valor)
                                                                : alerta.valor
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recomendações */}
                        {dashboard.recomendacoes && dashboard.recomendacoes.length > 0 && (
                            <div className="card p-6">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    Recomendações ({dashboard.recomendacoes.length})
                                </h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {dashboard.recomendacoes.map((rec, index) => (
                                        <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                            <p className="text-sm text-gray-700">{rec}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Indicadores Chave */}
                    {dashboard.indicadores_chave && (
                        <div className="card p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-gray-600" />
                                Indicadores Chave de Performance (KPIs)
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Margem Líquida</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {dashboard.indicadores_chave.margem_liquida}%
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">ROE</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {dashboard.indicadores_chave.roe}%
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-purple-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">ROA</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {dashboard.indicadores_chave.roa}%
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Autonomia</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {dashboard.indicadores_chave.autonomia_financeira}%
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Endividamento</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {dashboard.indicadores_chave.endividamento}%
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-indigo-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                                     onClick={() => navigate('/indicadores')}>
                                    <p className="text-sm text-gray-600 mb-1">Ver Todos</p>
                                    <ArrowRight className="h-6 w-6 text-indigo-600 mx-auto" />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Gráfico de Evolução */}
                    {evolucao && evolucao.evolucao && evolucao.evolucao.length > 0 && (
                        <div className="card p-6 mb-6">
                            <h3 className="text-lg font-bold mb-4">Evolução de KPIs (últimos 3 anos)</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={evolucao.evolucao}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="ano" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="resultado_liquido" stroke="#3b82f6" strokeWidth={2} name="Resultado Líquido" />
                                    <Line type="monotone" dataKey="total_proveitos" stroke="#10b981" strokeWidth={2} name="Proveitos" />
                                    <Line type="monotone" dataKey="total_ativo" stroke="#8b5cf6" strokeWidth={2} name="Ativo" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Resumo Executivo */}
                    {dashboard.resumo_executivo && (
                        <div className="card p-6">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Info className="h-5 w-5 text-gray-600" />
                                Resumo Executivo
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Completude</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboard.resumo_executivo.completude}%
                                    </p>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{ width: `${dashboard.resumo_executivo.completude}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Módulos Ativos</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {dashboard.resumo_executivo.modulos_configurados.length}/4
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {dashboard.resumo_executivo.modulos_configurados.join(', ')}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Alertas Críticos</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {dashboard.resumo_executivo.alertas_criticos}
                                    </p>
                                </div>
                                <div className="text-center p-4 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Atenção</p>
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {dashboard.resumo_executivo.alertas_atencao}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Última atualização: {dashboard?.gerado_em ? new Date(dashboard.gerado_em).toLocaleString('pt-PT') : '-'}
                    </p>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar Relatório Executivo
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DashboardExecutivo;
