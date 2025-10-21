import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { tesourariaService } from '../../services/api';
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';
import {
    Save, Calendar, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle, Download, RefreshCw, DollarSign, Wallet,
    ArrowUpCircle, ArrowDownCircle, Activity
} from 'lucide-react';
import ExportButtons from '../common/ExportButtons';

const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const TesourariaMensal = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    const [exercicio, setExercicio] = useState(currentYear);
    const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dadosAnuais, setDadosAnuais] = useState([]);
    const [viewMode, setViewMode] = useState('mensal'); // 'mensal' ou 'anual'

    const [formData, setFormData] = useState({
        saldo_inicial: 0,
        // Receitas
        vendas_recebimentos: 0,
        emprestimos_obtidos: 0,
        subsidios_recebidos: 0,
        outras_receitas: 0,
        // Despesas
        fornecedores_pagamentos: 0,
        salarios_encargos: 0,
        impostos_taxas: 0,
        emprestimos_pagamentos: 0,
        investimentos: 0,
        outras_despesas: 0
    });

    useEffect(() => {
        loadDadosAnuais();
    }, [exercicio]);

    useEffect(() => {
        if (dadosAnuais.length > 0) {
            loadMesData();
        }
    }, [selectedMes, dadosAnuais]);

    const loadDadosAnuais = async () => {
        try {
            setLoading(true);
            const data = await tesourariaService.listTesouraria(exercicio);
            setDadosAnuais(data.meses || []);
        } catch (err) {
            console.error('Erro ao carregar tesouraria:', err);
            setError('Erro ao carregar dados da tesouraria');
        } finally {
            setLoading(false);
        }
    };

    const loadMesData = () => {
        const mesData = dadosAnuais.find(m => m.mes === selectedMes);
        if (mesData && mesData.id) {
            setFormData({
                saldo_inicial: mesData.saldo_inicial || 0,
                vendas_recebimentos: mesData.vendas_recebimentos || 0,
                emprestimos_obtidos: mesData.emprestimos_obtidos || 0,
                subsidios_recebidos: mesData.subsidios_recebidos || 0,
                outras_receitas: mesData.outras_receitas || 0,
                fornecedores_pagamentos: mesData.fornecedores_pagamentos || 0,
                salarios_encargos: mesData.salarios_encargos || 0,
                impostos_taxas: mesData.impostos_taxas || 0,
                emprestimos_pagamentos: mesData.emprestimos_pagamentos || 0,
                investimentos: mesData.investimentos || 0,
                outras_despesas: mesData.outras_despesas || 0
            });
        } else {
            // Calcular saldo inicial com base no saldo final do mês anterior
            const mesAnterior = dadosAnuais.find(m => m.mes === selectedMes - 1);
            const saldoInicial = mesAnterior?.saldo_final || 0;

            setFormData({
                saldo_inicial: saldoInicial,
                vendas_recebimentos: 0,
                emprestimos_obtidos: 0,
                subsidios_recebidos: 0,
                outras_receitas: 0,
                fornecedores_pagamentos: 0,
                salarios_encargos: 0,
                impostos_taxas: 0,
                emprestimos_pagamentos: 0,
                investimentos: 0,
                outras_despesas: 0
            });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'AOA 0,00';
        const num = parseFloat(value);
        if (isNaN(num)) return 'AOA 0,00';
        return `AOA ${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Cálculos
    const calcularTotais = () => {
        const totalReceitas =
            parseFloat(formData.vendas_recebimentos || 0) +
            parseFloat(formData.emprestimos_obtidos || 0) +
            parseFloat(formData.subsidios_recebidos || 0) +
            parseFloat(formData.outras_receitas || 0);

        const totalDespesas =
            parseFloat(formData.fornecedores_pagamentos || 0) +
            parseFloat(formData.salarios_encargos || 0) +
            parseFloat(formData.impostos_taxas || 0) +
            parseFloat(formData.emprestimos_pagamentos || 0) +
            parseFloat(formData.investimentos || 0) +
            parseFloat(formData.outras_despesas || 0);

        const saldoInicial = parseFloat(formData.saldo_inicial || 0);
        const saldoFinal = saldoInicial + totalReceitas - totalDespesas;
        const variacao = totalReceitas - totalDespesas;

        return {
            totalReceitas,
            totalDespesas,
            saldoInicial,
            saldoFinal,
            variacao,
            positivoFluxo: variacao >= 0
        };
    };

    const totais = calcularTotais();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await tesourariaService.saveTesouraria({
                exercicio,
                mes: selectedMes,
                ...formData
            });

            setSuccess(`Tesouraria de ${MESES[selectedMes - 1]} salva com sucesso!`);
            setTimeout(() => setSuccess(''), 5000);

            // Recarregar dados
            await loadDadosAnuais();
        } catch (err) {
            console.error('Erro ao salvar tesouraria:', err);
            setError(err.response?.data?.error || 'Erro ao salvar tesouraria');
        } finally {
            setLoading(false);
        }
    };

    const handleProximoMes = () => {
        if (selectedMes < 12) {
            setSelectedMes(selectedMes + 1);
        }
    };

    const handleMesAnterior = () => {
        if (selectedMes > 1) {
            setSelectedMes(selectedMes - 1);
        }
    };

    const renderInput = (name, label, icon) => (
        <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 w-2/3">
                {icon}
                <label className="text-sm font-medium text-gray-700">{label}</label>
            </div>
            <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                step="0.01"
                className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
            />
        </div>
    );

    // Preparar dados para gráficos
    const dadosGrafico = dadosAnuais.map(mes => ({
        mes: MESES[mes.mes - 1].substring(0, 3),
        receitas: parseFloat(mes.total_receitas) || 0,
        despesas: parseFloat(mes.total_despesas) || 0,
        saldo: parseFloat(mes.saldo_final) || 0
    }));

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Plano de Tesouraria Mensal
                        </h1>
                        <p className="text-gray-600">
                            Planeamento e controlo de fluxo de caixa
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={exercicio}
                            onChange={(e) => setExercicio(parseInt(e.target.value))}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            {[currentYear - 1, currentYear, currentYear + 1, currentYear + 2].map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('mensal')}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    viewMode === 'mensal'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Mensal
                            </button>
                            <button
                                onClick={() => setViewMode('anual')}
                                className={`px-4 py-2 rounded-lg font-medium ${
                                    viewMode === 'anual'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Visão Anual
                            </button>
                        </div>
                        <ExportButtons exercicio={exercicio} tipo="tesouraria" />
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

            {success && (
                <div className="alert alert-success mb-6">
                    <CheckCircle className="h-5 w-5" />
                    <span>{success}</span>
                </div>
            )}

            {viewMode === 'mensal' ? (
                <>
                    {/* Seletor de Mês */}
                    <div className="card p-4 mb-6">
                        <div className="flex items-center justify-between">
                            <button
                                onClick={handleMesAnterior}
                                disabled={selectedMes === 1}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Anterior
                            </button>
                            <div className="text-center">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {MESES[selectedMes - 1]} {exercicio}
                                </h2>
                                <p className="text-sm text-gray-600">Mês {selectedMes} de 12</p>
                            </div>
                            <button
                                onClick={handleProximoMes}
                                disabled={selectedMes === 12}
                                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Próximo →
                            </button>
                        </div>
                    </div>

                    {/* Cards de Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="card p-4 bg-blue-50 border-l-4 border-blue-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Saldo Inicial</span>
                                <Wallet className="h-5 w-5 text-blue-600" />
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {formatCurrency(totais.saldoInicial)}
                            </p>
                        </div>

                        <div className="card p-4 bg-green-50 border-l-4 border-green-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Total Receitas</span>
                                <ArrowUpCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(totais.totalReceitas)}
                            </p>
                        </div>

                        <div className="card p-4 bg-red-50 border-l-4 border-red-500">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Total Despesas</span>
                                <ArrowDownCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(totais.totalDespesas)}
                            </p>
                        </div>

                        <div className={`card p-4 border-l-4 ${
                            totais.saldoFinal >= 0 ? 'bg-purple-50 border-purple-500' : 'bg-orange-50 border-orange-500'
                        }`}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">Saldo Final</span>
                                {totais.saldoFinal >= 0 ? (
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-orange-600" />
                                )}
                            </div>
                            <p className={`text-2xl font-bold ${
                                totais.saldoFinal >= 0 ? 'text-purple-600' : 'text-orange-600'
                            }`}>
                                {formatCurrency(totais.saldoFinal)}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* RECEITAS */}
                            <div className="card p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ArrowUpCircle className="h-6 w-6 text-green-600" />
                                    RECEITAS
                                </h3>

                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium text-gray-700">Saldo Inicial</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {formatCurrency(formData.saldo_inicial)}
                                        </span>
                                    </div>
                                </div>

                                {renderInput('vendas_recebimentos', 'Recebimentos de Vendas', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('emprestimos_obtidos', 'Empréstimos Obtidos', <Wallet className="h-4 w-4 text-gray-500" />)}
                                {renderInput('subsidios_recebidos', 'Subsídios Recebidos', <TrendingUp className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outras_receitas', 'Outras Receitas', <Activity className="h-4 w-4 text-gray-500" />)}

                                <div className="mt-6 pt-4 border-t-2 border-green-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">TOTAL RECEITAS</span>
                                        <span className="text-xl font-bold text-green-600">
                                            {formatCurrency(totais.totalReceitas)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* DESPESAS */}
                            <div className="card p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <ArrowDownCircle className="h-6 w-6 text-red-600" />
                                    DESPESAS
                                </h3>

                                {renderInput('fornecedores_pagamentos', 'Pagamentos a Fornecedores', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('salarios_encargos', 'Salários e Encargos', <Wallet className="h-4 w-4 text-gray-500" />)}
                                {renderInput('impostos_taxas', 'Impostos e Taxas', <TrendingDown className="h-4 w-4 text-gray-500" />)}
                                {renderInput('emprestimos_pagamentos', 'Pagamentos de Empréstimos', <Activity className="h-4 w-4 text-gray-500" />)}
                                {renderInput('investimentos', 'Investimentos', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outras_despesas', 'Outras Despesas', <Wallet className="h-4 w-4 text-gray-500" />)}

                                <div className="mt-6 pt-4 border-t-2 border-red-300">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-bold text-gray-900">TOTAL DESPESAS</span>
                                        <span className="text-xl font-bold text-red-600">
                                            {formatCurrency(totais.totalDespesas)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Resumo Final */}
                        <div className="card p-6 mt-6 bg-gradient-to-r from-blue-50 to-purple-50">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="font-semibold text-gray-700">Variação do Mês:</span>
                                    <span className={`font-bold text-xl ${
                                        totais.positivoFluxo ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {totais.positivoFluxo ? '+' : ''} {formatCurrency(totais.variacao)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-xl pt-3 border-t border-gray-300">
                                    <span className="font-bold text-gray-900">Saldo Final Previsto:</span>
                                    <span className={`font-bold text-2xl ${
                                        totais.saldoFinal >= 0 ? 'text-purple-600' : 'text-orange-600'
                                    }`}>
                                        {formatCurrency(totais.saldoFinal)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Botões de Ação */}
                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={loadMesData}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Recarregar
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex items-center gap-2"
                                disabled={loading}
                            >
                                <Save className="h-4 w-4" />
                                {loading ? 'A guardar...' : 'Guardar Tesouraria'}
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                /* Visão Anual */
                <div className="space-y-6">
                    {/* Gráfico de Receitas vs Despesas */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Receitas vs Despesas (Anual)</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dadosGrafico}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                                <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Gráfico de Evolução do Saldo */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Evolução do Saldo Final</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={dadosGrafico}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area
                                    type="monotone"
                                    dataKey="saldo"
                                    stroke="#8b5cf6"
                                    fill="#8b5cf6"
                                    fillOpacity={0.6}
                                    name="Saldo Final"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabela Resumo Anual */}
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            Resumo Anual {exercicio}
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Mês</th>
                                        <th>Saldo Inicial</th>
                                        <th>Receitas</th>
                                        <th>Despesas</th>
                                        <th>Variação</th>
                                        <th>Saldo Final</th>
                                        <th>Ação</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dadosAnuais.map((mes) => {
                                        const variacao = (parseFloat(mes.total_receitas) || 0) - (parseFloat(mes.total_despesas) || 0);
                                        return (
                                            <tr key={mes.mes}>
                                                <td className="font-semibold">{MESES[mes.mes - 1]}</td>
                                                <td>{formatCurrency(mes.saldo_inicial)}</td>
                                                <td className="text-green-600 font-semibold">
                                                    {formatCurrency(mes.total_receitas)}
                                                </td>
                                                <td className="text-red-600 font-semibold">
                                                    {formatCurrency(mes.total_despesas)}
                                                </td>
                                                <td className={variacao >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                                                    {variacao >= 0 ? '+' : ''}{formatCurrency(variacao)}
                                                </td>
                                                <td className={`font-bold ${
                                                    parseFloat(mes.saldo_final) >= 0 ? 'text-purple-600' : 'text-orange-600'
                                                }`}>
                                                    {formatCurrency(mes.saldo_final)}
                                                </td>
                                                <td>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedMes(mes.mes);
                                                            setViewMode('mensal');
                                                        }}
                                                        className="text-primary hover:underline text-sm"
                                                    >
                                                        Editar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr className="font-bold">
                                        <td>TOTAL</td>
                                        <td>-</td>
                                        <td className="text-green-600">
                                            {formatCurrency(dadosAnuais.reduce((sum, m) => sum + (parseFloat(m.total_receitas) || 0), 0))}
                                        </td>
                                        <td className="text-red-600">
                                            {formatCurrency(dadosAnuais.reduce((sum, m) => sum + (parseFloat(m.total_despesas) || 0), 0))}
                                        </td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TesourariaMensal;
