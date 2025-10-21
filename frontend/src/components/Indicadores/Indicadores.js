import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { indicadoresService } from '../../services/api';
import {
    LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
    TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Activity, DollarSign, PieChart, Calendar, Filter,
    Download, RefreshCw, Info
} from 'lucide-react';

const Indicadores = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [indicadores, setIndicadores] = useState(null);
    const [evolucao, setEvolucao] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [filterType, setFilterType] = useState('all'); // all, lead, lag, operational
    const [error, setError] = useState('');

    const currentYear = new Date().getFullYear();
    const availableYears = [currentYear - 2, currentYear - 1, currentYear];

    useEffect(() => {
        loadIndicadores();
        loadEvolucao();
    }, [selectedYear]);

    const loadIndicadores = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await indicadoresService.getIndicadores(selectedYear);
            setIndicadores(data.indicadores);
        } catch (err) {
            console.error('Erro ao carregar indicadores:', err);
            setError(err.response?.data?.error || 'Erro ao carregar indicadores');
        } finally {
            setLoading(false);
        }
    };

    const loadEvolucao = async () => {
        try {
            const anos = availableYears.join(',');
            const data = await indicadoresService.getEvolucao(anos);
            setEvolucao(data.evolucao || []);
        } catch (err) {
            console.error('Erro ao carregar evolução:', err);
        }
    };

    const getHealthColor = (saude) => {
        const colors = {
            excelente: 'text-green-600 bg-green-100',
            boa: 'text-blue-600 bg-blue-100',
            media: 'text-yellow-600 bg-yellow-100',
            fraca: 'text-red-600 bg-red-100'
        };
        return colors[saude] || colors.media;
    };

    const getAlertIcon = (nivel) => {
        if (nivel === 'crítico') return <AlertTriangle className="h-5 w-5 text-red-600" />;
        if (nivel === 'atenção') return <Info className="h-5 w-5 text-yellow-600" />;
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    };

    const formatValue = (value, suffix = '') => {
        if (value === null || value === undefined || value === 'N/A') return 'N/A';
        const num = parseFloat(value);
        if (isNaN(num)) return 'N/A';
        return `${num.toFixed(2)}${suffix}`;
    };

    const renderIndicatorCard = (title, value, suffix, target, description, trend) => {
        const numValue = parseFloat(value);
        const numTarget = parseFloat(target);
        const isGood = !isNaN(numValue) && !isNaN(numTarget) && numValue >= numTarget;

        return (
            <div className="card p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
                    {trend && (
                        trend > 0 ?
                            <TrendingUp className="h-4 w-4 text-green-600" /> :
                            <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                        {formatValue(value, suffix)}
                    </span>
                    {target && (
                        <span className="text-sm text-gray-500">
                            Meta: {formatValue(target, suffix)}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-xs text-gray-500">{description}</p>
                )}
                {target && (
                    <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Progresso</span>
                            <span className={isGood ? 'text-green-600' : 'text-red-600'}>
                                {isGood ? 'Atingido' : 'Abaixo da meta'}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full ${isGood ? 'bg-green-600' : 'bg-red-600'}`}
                                style={{ width: `${Math.min((numValue / numTarget) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">A carregar indicadores...</p>
                </div>
            </div>
        );
    }

    if (error && !indicadores) {
        return (
            <div className="p-6">
                <div className="alert alert-error">
                    <AlertTriangle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (!indicadores) {
        return (
            <div className="p-6">
                <div className="alert alert-info">
                    <Info className="h-5 w-5" />
                    <span>Nenhum dado disponível para o exercício {selectedYear}. Por favor, preencha a Demonstração de Resultados primeiro.</span>
                </div>
            </div>
        );
    }

    const { lead, lag, operational, analise } = indicadores;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Indicadores Financeiros
                        </h1>
                        <p className="text-gray-600">
                            Análise de performance e saúde financeira
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <button
                            onClick={loadIndicadores}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </button>
                    </div>
                </div>

                {/* Saúde Financeira */}
                {analise && (
                    <div className={`p-6 rounded-xl ${getHealthColor(analise.saude_financeira)} mb-6`}>
                        <div className="flex items-center gap-4">
                            <Activity className="h-12 w-12" />
                            <div className="flex-1">
                                <h2 className="text-xl font-bold mb-1">
                                    Saúde Financeira: {analise.saude_financeira.toUpperCase()}
                                </h2>
                                <p className="text-sm opacity-90">{analise.mensagem}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Alertas */}
            {analise?.alertas && analise.alertas.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        Alertas e Atenções
                    </h3>
                    <div className="grid gap-3">
                        {analise.alertas.map((alerta, index) => (
                            <div
                                key={index}
                                className={`p-4 rounded-lg border-l-4 ${
                                    alerta.nivel === 'crítico'
                                        ? 'bg-red-50 border-red-600'
                                        : 'bg-yellow-50 border-yellow-600'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {getAlertIcon(alerta.nivel)}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{alerta.indicador}</p>
                                        <p className="text-sm text-gray-700 mt-1">{alerta.mensagem}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recomendações */}
            {analise?.recomendacoes && analise.recomendacoes.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        Recomendações
                    </h3>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <ul className="space-y-2">
                            {analise.recomendacoes.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2 text-gray-700">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="mb-6 flex items-center gap-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <div className="flex gap-2">
                    {['all', 'lead', 'lag', 'operational'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                filterType === type
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {type === 'all' && 'Todos'}
                            {type === 'lead' && 'Lead (Preditivos)'}
                            {type === 'lag' && 'Lag (Resultados)'}
                            {type === 'operational' && 'Operacionais'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Lead Indicators (Preditivos) */}
            {(filterType === 'all' || filterType === 'lead') && lead && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                        Indicadores Lead (Preditivos)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderIndicatorCard(
                            'Prazo Médio de Recebimento',
                            lead.prazo_medio_recebimento,
                            ' dias',
                            30,
                            'Tempo médio para receber vendas'
                        )}
                        {renderIndicatorCard(
                            'Rotação de Existências',
                            lead.rotacao_existencias,
                            'x',
                            4,
                            'Velocidade de rotação do inventário'
                        )}
                        {renderIndicatorCard(
                            'Dias de Existências',
                            lead.dias_existencias,
                            ' dias',
                            90,
                            'Duração média das existências em stock'
                        )}
                        {renderIndicatorCard(
                            'Taxa de Crescimento de Vendas',
                            lead.taxa_crescimento_vendas,
                            '%',
                            5,
                            'Crescimento das vendas vs ano anterior'
                        )}
                        {renderIndicatorCard(
                            'Cobertura de Juros',
                            lead.cobertura_juros,
                            'x',
                            3,
                            'Capacidade de pagamento de juros'
                        )}
                        {renderIndicatorCard(
                            'Ciclo Operacional',
                            lead.ciclo_operacional,
                            ' dias',
                            120,
                            'Duração total do ciclo operacional'
                        )}
                    </div>
                </div>
            )}

            {/* Lag Indicators (Resultados) */}
            {(filterType === 'all' || filterType === 'lag') && lag && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Activity className="h-6 w-6 text-green-600" />
                        Indicadores Lag (Resultados)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderIndicatorCard(
                            'Margem Líquida',
                            lag.margem_liquida,
                            '%',
                            10,
                            'Rentabilidade líquida das vendas'
                        )}
                        {renderIndicatorCard(
                            'Margem Operacional',
                            lag.margem_operacional,
                            '%',
                            15,
                            'Rentabilidade operacional'
                        )}
                        {renderIndicatorCard(
                            'Margem Bruta',
                            lag.margem_bruta,
                            '%',
                            30,
                            'Margem antes de custos operacionais'
                        )}
                        {renderIndicatorCard(
                            'ROE - Retorno sobre Capital Próprio',
                            lag.roe,
                            '%',
                            15,
                            'Rentabilidade do capital investido'
                        )}
                        {renderIndicatorCard(
                            'ROA - Retorno sobre Ativos',
                            lag.roa,
                            '%',
                            10,
                            'Eficiência na utilização de ativos'
                        )}
                        {renderIndicatorCard(
                            'Liquidez Geral',
                            lag.liquidez_geral,
                            '',
                            1.5,
                            'Capacidade de pagamento total'
                        )}
                        {renderIndicatorCard(
                            'Liquidez Reduzida',
                            lag.liquidez_reduzida,
                            '',
                            1,
                            'Liquidez sem considerar existências'
                        )}
                        {renderIndicatorCard(
                            'Liquidez Imediata',
                            lag.liquidez_imediata,
                            '',
                            0.5,
                            'Capacidade de pagamento imediato'
                        )}
                        {renderIndicatorCard(
                            'Autonomia Financeira',
                            lag.autonomia_financeira,
                            '%',
                            30,
                            'Independência financeira da empresa'
                        )}
                        {renderIndicatorCard(
                            'Endividamento',
                            lag.endividamento,
                            '%',
                            70,
                            'Nível de dívida total'
                        )}
                        {renderIndicatorCard(
                            'Solvabilidade',
                            lag.solvabilidade,
                            '',
                            1,
                            'Capacidade de honrar compromissos'
                        )}
                    </div>
                </div>
            )}

            {/* Operational Indicators */}
            {(filterType === 'all' || filterType === 'operational') && operational && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <DollarSign className="h-6 w-6 text-purple-600" />
                        Indicadores Operacionais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {renderIndicatorCard(
                            'Vendas por Kwanza de Salário',
                            operational.vendas_por_kwanza_salario,
                            'x',
                            5,
                            'Produtividade da mão-de-obra'
                        )}
                        {renderIndicatorCard(
                            'Custos Operacionais / Vendas',
                            operational.custos_operacionais_vendas,
                            '%',
                            30,
                            'Eficiência operacional'
                        )}
                        {renderIndicatorCard(
                            'Break-Even',
                            operational.break_even,
                            ' AOA',
                            null,
                            'Ponto de equilíbrio operacional'
                        )}
                        {renderIndicatorCard(
                            'Working Capital',
                            operational.working_capital,
                            ' AOA',
                            null,
                            'Capital de giro disponível'
                        )}
                        {renderIndicatorCard(
                            'Capital Permanente',
                            operational.capital_permanente,
                            ' AOA',
                            null,
                            'Recursos permanentes da empresa'
                        )}
                    </div>
                </div>
            )}

            {/* Gráficos de Evolução */}
            {evolucao && evolucao.length > 1 && (
                <div className="mb-8">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <PieChart className="h-6 w-6 text-indigo-600" />
                        Evolução Temporal
                    </h3>

                    {/* Gráfico de Margens */}
                    <div className="card p-6 mb-6">
                        <h4 className="text-lg font-semibold mb-4">Evolução das Margens (%)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={evolucao}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="exercicio" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="margem_bruta"
                                    stackId="1"
                                    stroke="#10b981"
                                    fill="#10b981"
                                    fillOpacity={0.6}
                                    name="Margem Bruta"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="margem_operacional"
                                    stackId="2"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.6}
                                    name="Margem Operacional"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="margem_liquida"
                                    stackId="3"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.6}
                                    name="Margem Líquida"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Liquidez */}
                    <div className="card p-6 mb-6">
                        <h4 className="text-lg font-semibold mb-4">Evolução da Liquidez</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={evolucao}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="exercicio" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="liquidez_geral"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    name="Liquidez Geral"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="liquidez_reduzida"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name="Liquidez Reduzida"
                                />
                                <Line
                                    type="monotone"
                                    dataKey="liquidez_imediata"
                                    stroke="#8b5cf6"
                                    strokeWidth={2}
                                    name="Liquidez Imediata"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Rentabilidade */}
                    <div className="card p-6 mb-6">
                        <h4 className="text-lg font-semibold mb-4">Evolução da Rentabilidade (%)</h4>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={evolucao}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="exercicio" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="roe" fill="#10b981" name="ROE" />
                                <Bar dataKey="roa" fill="#3b82f6" name="ROA" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico Radar - Visão Geral */}
                    <div className="card p-6">
                        <h4 className="text-lg font-semibold mb-4">Análise Multidimensional (Ano {selectedYear})</h4>
                        <ResponsiveContainer width="100%" height={400}>
                            <RadarChart data={[
                                { subject: 'Liquidez Geral', value: parseFloat(lag?.liquidez_geral) || 0, fullMark: 2 },
                                { subject: 'Margem Líquida', value: parseFloat(lag?.margem_liquida) || 0, fullMark: 20 },
                                { subject: 'ROE', value: parseFloat(lag?.roe) || 0, fullMark: 30 },
                                { subject: 'Autonomia Financeira', value: parseFloat(lag?.autonomia_financeira) || 0, fullMark: 50 },
                                { subject: 'Rotação Existências', value: parseFloat(lead?.rotacao_existencias) || 0, fullMark: 6 },
                                { subject: 'Margem Operacional', value: parseFloat(lag?.margem_operacional) || 0, fullMark: 25 }
                            ]}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                                <Radar
                                    name="Performance"
                                    dataKey="value"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.6}
                                />
                                <Tooltip />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Última atualização: {new Date().toLocaleDateString('pt-PT')}
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

export default Indicadores;
