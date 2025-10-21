import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { balancoExecucaoService } from '../../services/api';
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';
import {
    AlertTriangle, CheckCircle, TrendingUp, TrendingDown,
    Calendar, Activity, FileText, BarChart3, Target,
    AlertCircle, Info, RefreshCw, Download
} from 'lucide-react';

const MESES = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

const BalancoExecucao = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    const [exercicio, setExercicio] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('comparacao'); // 'comparacao', 'mensal', 'dashboard'

    const [comparacao, setComparacao] = useState(null);
    const [desviosMensais, setDesviosMensais] = useState(null);
    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {
        loadDados();
    }, [exercicio]);

    const loadDados = async () => {
        try {
            setLoading(true);
            setError('');

            const [compData, desviosData, dashData] = await Promise.all([
                balancoExecucaoService.getComparacao(exercicio),
                balancoExecucaoService.getDesviosMensais(exercicio),
                balancoExecucaoService.getDashboard(exercicio)
            ]);

            setComparacao(compData);
            setDesviosMensais(desviosData);
            setDashboard(dashData);
        } catch (err) {
            console.error('Erro ao carregar dados:', err);
            setError(err.response?.data?.error || 'Erro ao carregar dados de execução');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'AOA 0,00';
        const num = parseFloat(value);
        if (isNaN(num)) return 'AOA 0,00';
        return `AOA ${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusColor = (status) => {
        const colors = {
            ok: 'text-green-600 bg-green-100',
            atencao: 'text-yellow-600 bg-yellow-100',
            alerta: 'text-red-600 bg-red-100'
        };
        return colors[status] || colors.ok;
    };

    const getStatusIcon = (status) => {
        if (status === 'alerta') return <AlertTriangle className="h-4 w-4" />;
        if (status === 'atencao') return <AlertCircle className="h-4 w-4" />;
        return <CheckCircle className="h-4 w-4" />;
    };

    const getPerformanceColor = (performance) => {
        const colors = {
            acima_esperado: 'text-green-600 bg-green-100',
            dentro_esperado: 'text-blue-600 bg-blue-100',
            abaixo_esperado: 'text-red-600 bg-red-100'
        };
        return colors[performance] || colors.dentro_esperado;
    };

    const getPerformanceText = (performance) => {
        const texts = {
            acima_esperado: 'Acima do Esperado',
            dentro_esperado: 'Dentro do Esperado',
            abaixo_esperado: 'Abaixo do Esperado'
        };
        return texts[performance] || 'Não Avaliado';
    };

    if (loading && !comparacao) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">A carregar balanço de execução...</p>
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
                            Balanço de Execução
                        </h1>
                        <p className="text-gray-600">
                            Análise Previsto vs Realizado
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
                            onClick={loadDados}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </button>
                    </div>
                </div>

                {/* Modo de visualização */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('comparacao')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            viewMode === 'comparacao'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Por Categoria
                    </button>
                    <button
                        onClick={() => setViewMode('mensal')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            viewMode === 'mensal'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Evolução Mensal
                    </button>
                    <button
                        onClick={() => setViewMode('dashboard')}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            viewMode === 'dashboard'
                                ? 'bg-primary text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        Dashboard
                    </button>
                </div>
            </div>

            {/* Alertas */}
            {error && (
                <div className="alert alert-error mb-6">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {/* Análise Geral */}
            {comparacao?.analise && (
                <div className={`p-6 rounded-xl mb-6 ${getPerformanceColor(comparacao.analise.performance)}`}>
                    <div className="flex items-center gap-4">
                        <Activity className="h-12 w-12" />
                        <div className="flex-1">
                            <h2 className="text-xl font-bold mb-1">
                                Performance: {getPerformanceText(comparacao.analise.performance)}
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                                <div>
                                    <p className="text-sm opacity-90">Taxa de Execução</p>
                                    <p className="text-lg font-bold">{comparacao.analise.taxa_execucao}%</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-90">Desvio Total</p>
                                    <p className="text-lg font-bold">{comparacao.analise.desvio_percentual_total}%</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-90">Categorias Alerta</p>
                                    <p className="text-lg font-bold">{comparacao.analise.categorias_alerta}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-90">Categorias Atenção</p>
                                    <p className="text-lg font-bold">{comparacao.analise.categorias_atencao}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Conteúdo baseado no modo */}
            {viewMode === 'comparacao' && comparacao && (
                <div className="space-y-6">
                    {/* Gráfico de Comparação */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Comparação Previsto vs Realizado</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={comparacao.comparacao?.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="categoria" angle={-45} textAnchor="end" height={100} />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="previsto" fill="#3b82f6" name="Previsto" />
                                <Bar dataKey="realizado" fill="#10b981" name="Realizado" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabela Detalhada */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-600" />
                            Análise Detalhada por Categoria
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Categoria</th>
                                        <th>Tipo</th>
                                        <th>Previsto</th>
                                        <th>Realizado</th>
                                        <th>Desvio</th>
                                        <th>Desvio %</th>
                                        <th>Docs</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {comparacao.comparacao?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="font-medium">{item.categoria}</td>
                                            <td>
                                                <span className={`badge ${
                                                    item.tipo === 'receita' ? 'badge-success' : 'badge-error'
                                                }`}>
                                                    {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </td>
                                            <td>{formatCurrency(item.previsto)}</td>
                                            <td className="font-semibold">{formatCurrency(item.realizado)}</td>
                                            <td className={item.desvio >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {item.desvio >= 0 ? '+' : ''}{formatCurrency(item.desvio)}
                                            </td>
                                            <td className={`font-bold ${
                                                Math.abs(item.desvio_percentual) > 20 ? 'text-red-600' :
                                                Math.abs(item.desvio_percentual) > 10 ? 'text-yellow-600' :
                                                'text-green-600'
                                            }`}>
                                                {item.desvio_percentual >= 0 ? '+' : ''}{item.desvio_percentual}%
                                            </td>
                                            <td>{item.num_documentos}</td>
                                            <td>
                                                <span className={`badge ${getStatusColor(item.status)} flex items-center gap-1`}>
                                                    {getStatusIcon(item.status)}
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'mensal' && desviosMensais && (
                <div className="space-y-6">
                    {/* Gráfico de Evolução Mensal */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Evolução Mensal - Receitas vs Despesas</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={desviosMensais.comparacao_mensal?.map(m => ({
                                mes: MESES[m.mes - 1],
                                receitas_previstas: m.receitas_previstas,
                                receitas_realizadas: m.receitas_realizadas,
                                despesas_previstas: m.despesas_previstas,
                                despesas_realizadas: m.despesas_realizadas
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Line type="monotone" dataKey="receitas_previstas" stroke="#93c5fd" strokeDasharray="5 5" name="Receitas Previstas" />
                                <Line type="monotone" dataKey="receitas_realizadas" stroke="#3b82f6" strokeWidth={2} name="Receitas Realizadas" />
                                <Line type="monotone" dataKey="despesas_previstas" stroke="#fca5a5" strokeDasharray="5 5" name="Despesas Previstas" />
                                <Line type="monotone" dataKey="despesas_realizadas" stroke="#ef4444" strokeWidth={2} name="Despesas Realizadas" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Desvios */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Desvios Mensais (%)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={desviosMensais.comparacao_mensal?.map(m => ({
                                mes: MESES[m.mes - 1],
                                desvio_receitas: m.desvio_receitas_percentual,
                                desvio_despesas: m.desvio_despesas_percentual,
                                desvio_saldo: m.desvio_saldo_percentual
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="desvio_receitas" fill="#10b981" name="Desvio Receitas %" />
                                <Bar dataKey="desvio_despesas" fill="#ef4444" name="Desvio Despesas %" />
                                <Bar dataKey="desvio_saldo" fill="#8b5cf6" name="Desvio Saldo %" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabela Mensal */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            Comparação Mensal Detalhada
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mês</th>
                                        <th>Receitas Prev.</th>
                                        <th>Receitas Real.</th>
                                        <th>Desvio %</th>
                                        <th>Despesas Prev.</th>
                                        <th>Despesas Real.</th>
                                        <th>Desvio %</th>
                                        <th>Saldo Prev.</th>
                                        <th>Saldo Real.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {desviosMensais.comparacao_mensal?.map((mes) => (
                                        <tr key={mes.mes}>
                                            <td className="font-semibold">{MESES[mes.mes - 1]}</td>
                                            <td>{formatCurrency(mes.receitas_previstas)}</td>
                                            <td className="font-semibold text-green-600">{formatCurrency(mes.receitas_realizadas)}</td>
                                            <td className={mes.desvio_receitas_percentual >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                {mes.desvio_receitas_percentual >= 0 ? '+' : ''}{mes.desvio_receitas_percentual}%
                                            </td>
                                            <td>{formatCurrency(mes.despesas_previstas)}</td>
                                            <td className="font-semibold text-red-600">{formatCurrency(mes.despesas_realizadas)}</td>
                                            <td className={mes.desvio_despesas_percentual >= 0 ? 'text-red-600' : 'text-green-600'}>
                                                {mes.desvio_despesas_percentual >= 0 ? '+' : ''}{mes.desvio_despesas_percentual}%
                                            </td>
                                            <td>{formatCurrency(mes.saldo_previsto)}</td>
                                            <td className={`font-bold ${mes.saldo_realizado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(mes.saldo_realizado)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'dashboard' && dashboard && (
                <div className="space-y-6">
                    {/* Cards de Estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="card p-4 bg-blue-50 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Total Documentos</span>
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {dashboard.estatisticas_gerais?.total_documentos || 0}
                            </p>
                        </div>

                        <div className="card p-4 bg-green-50 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Validados</span>
                                <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {dashboard.estatisticas_gerais?.documentos_validados || 0}
                            </p>
                        </div>

                        <div className="card p-4 bg-yellow-50 border-l-4 border-yellow-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Pendentes</span>
                                <AlertCircle className="h-5 w-5 text-yellow-600" />
                            </div>
                            <p className="text-2xl font-bold text-yellow-600">
                                {dashboard.estatisticas_gerais?.documentos_pendentes || 0}
                            </p>
                        </div>

                        <div className="card p-4 bg-purple-50 border-l-4 border-purple-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Valor Total</span>
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                            </div>
                            <p className="text-xl font-bold text-purple-600">
                                {formatCurrency(dashboard.estatisticas_gerais?.valor_total)}
                            </p>
                        </div>
                    </div>

                    {/* Gráfico de Pizza - Distribuição por Categoria */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Distribuição por Categoria (Top 10)</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <PieChart>
                                <Pie
                                    data={dashboard.por_categoria?.slice(0, 10).map(cat => ({
                                        name: cat.categoria_pgc,
                                        value: parseFloat(cat.total_valor)
                                    }))}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${((entry.value / dashboard.estatisticas_gerais?.valor_total) * 100).toFixed(1)}%`}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {dashboard.por_categoria?.slice(0, 10).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'][index % 10]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabela de Categorias */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Detalhamento por Categoria</h3>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Categoria PGC-AO</th>
                                        <th>Nº Documentos</th>
                                        <th>Valor Total</th>
                                        <th>Valor Médio</th>
                                        <th>% do Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dashboard.por_categoria?.map((cat, index) => (
                                        <tr key={index}>
                                            <td className="font-medium">{cat.categoria_pgc}</td>
                                            <td>{cat.num_documentos}</td>
                                            <td className="font-semibold">{formatCurrency(cat.total_valor)}</td>
                                            <td>{formatCurrency(parseFloat(cat.total_valor) / parseInt(cat.num_documentos))}</td>
                                            <td>{((parseFloat(cat.total_valor) / parseFloat(dashboard.estatisticas_gerais?.valor_total)) * 100).toFixed(2)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Última atualização: {comparacao?.gerado_em ? new Date(comparacao.gerado_em).toLocaleString('pt-PT') : '-'}
                    </p>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar Relatório
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BalancoExecucao;
