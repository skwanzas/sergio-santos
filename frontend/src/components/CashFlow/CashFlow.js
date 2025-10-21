import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cashFlowService } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import {
    Save, Calendar, TrendingUp, TrendingDown, AlertTriangle,
    CheckCircle, Download, RefreshCw, DollarSign, Activity,
    ArrowUpCircle, ArrowDownCircle, Zap, Info
} from 'lucide-react';
import ExportButtons from '../common/ExportButtons';

const CashFlow = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    const [exercicio, setExercicio] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [analise, setAnalise] = useState(null);
    const [cashFlows, setCashFlows] = useState([]);

    const [formData, setFormData] = useState({
        // Atividades Operacionais
        recebimentos_clientes: 0,
        pagamentos_fornecedores: 0,
        pagamentos_pessoal: 0,
        pagamentos_impostos: 0,
        outros_recebimentos_operacionais: 0,
        outros_pagamentos_operacionais: 0,
        // Atividades de Investimento
        recebimentos_venda_ativos: 0,
        pagamentos_aquisicao_ativos: 0,
        recebimentos_juros_dividendos: 0,
        outros_recebimentos_investimento: 0,
        outros_pagamentos_investimento: 0,
        // Atividades de Financiamento
        recebimentos_emprestimos: 0,
        pagamentos_emprestimos: 0,
        pagamentos_juros: 0,
        pagamentos_dividendos: 0,
        outros_recebimentos_financiamento: 0,
        outros_pagamentos_financiamento: 0,
        // Saldos
        saldo_inicial: 0,
        saldo_final: 0
    });

    useEffect(() => {
        loadCashFlows();
    }, [exercicio]);

    const loadCashFlows = async () => {
        try {
            setLoading(true);
            const data = await cashFlowService.listCashFlows();
            setCashFlows(data.cash_flows || []);

            const cfExistente = data.cash_flows?.find(cf => cf.exercicio === exercicio);
            if (cfExistente) {
                setFormData(cfExistente);
                loadAnalise();
            }
        } catch (err) {
            console.error('Erro ao carregar cash flows:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAnalise = async () => {
        try {
            const data = await cashFlowService.getAnalise(exercicio);
            setAnalise(data.analise);
        } catch (err) {
            console.error('Erro ao carregar análise:', err);
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

    const calcularTotais = () => {
        // Fluxo Operacional
        const totalRecebimentosOp =
            parseFloat(formData.recebimentos_clientes || 0) +
            parseFloat(formData.outros_recebimentos_operacionais || 0);

        const totalPagamentosOp =
            parseFloat(formData.pagamentos_fornecedores || 0) +
            parseFloat(formData.pagamentos_pessoal || 0) +
            parseFloat(formData.pagamentos_impostos || 0) +
            parseFloat(formData.outros_pagamentos_operacionais || 0);

        const fluxoOperacional = totalRecebimentosOp - totalPagamentosOp;

        // Fluxo Investimento
        const totalRecebimentosInv =
            parseFloat(formData.recebimentos_venda_ativos || 0) +
            parseFloat(formData.recebimentos_juros_dividendos || 0) +
            parseFloat(formData.outros_recebimentos_investimento || 0);

        const totalPagamentosInv =
            parseFloat(formData.pagamentos_aquisicao_ativos || 0) +
            parseFloat(formData.outros_pagamentos_investimento || 0);

        const fluxoInvestimento = totalRecebimentosInv - totalPagamentosInv;

        // Fluxo Financiamento
        const totalRecebimentosFin =
            parseFloat(formData.recebimentos_emprestimos || 0) +
            parseFloat(formData.outros_recebimentos_financiamento || 0);

        const totalPagamentosFin =
            parseFloat(formData.pagamentos_emprestimos || 0) +
            parseFloat(formData.pagamentos_juros || 0) +
            parseFloat(formData.pagamentos_dividendos || 0) +
            parseFloat(formData.outros_pagamentos_financiamento || 0);

        const fluxoFinanciamento = totalRecebimentosFin - totalPagamentosFin;

        // Totais
        const variacaoCaixa = fluxoOperacional + fluxoInvestimento + fluxoFinanciamento;
        const saldoInicial = parseFloat(formData.saldo_inicial || 0);
        const saldoFinalCalculado = saldoInicial + variacaoCaixa;
        const saldoFinalRegistrado = parseFloat(formData.saldo_final || 0);
        const reconciliado = Math.abs(saldoFinalCalculado - saldoFinalRegistrado) < 0.01;

        return {
            // Operacional
            totalRecebimentosOp,
            totalPagamentosOp,
            fluxoOperacional,
            // Investimento
            totalRecebimentosInv,
            totalPagamentosInv,
            fluxoInvestimento,
            // Financiamento
            totalRecebimentosFin,
            totalPagamentosFin,
            fluxoFinanciamento,
            // Gerais
            variacaoCaixa,
            saldoInicial,
            saldoFinalCalculado,
            saldoFinalRegistrado,
            reconciliado,
            diferenca: saldoFinalCalculado - saldoFinalRegistrado
        };
    };

    const totais = calcularTotais();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!totais.reconciliado) {
            setError('Cash Flow não reconciliado! Por favor, ajuste o saldo final.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            await cashFlowService.saveCashFlow({
                exercicio,
                ...formData,
                saldo_final: totais.saldoFinalCalculado
            });

            setSuccess('Cash Flow salvo com sucesso!');
            setTimeout(() => setSuccess(''), 5000);

            await loadCashFlows();
            await loadAnalise();
        } catch (err) {
            console.error('Erro ao salvar cash flow:', err);
            setError(err.response?.data?.error || 'Erro ao salvar cash flow');
        } finally {
            setLoading(false);
        }
    };

    const handleGerarAutomatico = async () => {
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const data = await cashFlowService.gerarAutomatico(exercicio);

            setSuccess('Cash Flow gerado automaticamente a partir da Tesouraria!');
            setTimeout(() => setSuccess(''), 5000);

            await loadCashFlows();
        } catch (err) {
            console.error('Erro ao gerar automático:', err);
            setError(err.response?.data?.error || err.response?.data?.message || 'Erro ao gerar cash flow automático');
        } finally {
            setLoading(false);
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

    // Dados para gráficos
    const dadosGrafico = [
        { nome: 'Operacional', valor: totais.fluxoOperacional },
        { nome: 'Investimento', valor: totais.fluxoInvestimento },
        { nome: 'Financiamento', valor: totais.fluxoFinanciamento }
    ];

    const COLORS = ['#10b981', '#ef4444', '#3b82f6'];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Cash Flow (Demonstração de Fluxo de Caixa)
                        </h1>
                        <p className="text-gray-600">
                            Método Direto - Classificação por Atividades
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
                            onClick={handleGerarAutomatico}
                            className="btn-secondary flex items-center gap-2"
                            disabled={loading}
                        >
                            <Zap className="h-4 w-4" />
                            Gerar Automático
                        </button>
                        <ExportButtons exercicio={exercicio} tipo="cash-flow" />
                    </div>
                </div>

                {/* Status de Reconciliação */}
                <div className={`p-4 rounded-lg border-2 ${
                    totais.reconciliado
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {totais.reconciliado ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                                <p className="font-semibold">
                                    {totais.reconciliado ? 'Cash Flow Reconciliado' : 'Cash Flow Não Reconciliado'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {totais.reconciliado
                                        ? 'Saldo Inicial + Variação = Saldo Final'
                                        : `Diferença: ${formatCurrency(Math.abs(totais.diferenca))}`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Variação de Caixa</p>
                            <p className={`text-2xl font-bold ${
                                totais.variacaoCaixa >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {totais.variacaoCaixa >= 0 ? '+' : ''}{formatCurrency(totais.variacaoCaixa)}
                            </p>
                        </div>
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

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="card p-4 bg-green-50 border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Fluxo Operacional</span>
                        <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <p className={`text-2xl font-bold ${totais.fluxoOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totais.fluxoOperacional)}
                    </p>
                </div>

                <div className="card p-4 bg-red-50 border-l-4 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Fluxo Investimento</span>
                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className={`text-2xl font-bold ${totais.fluxoInvestimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totais.fluxoInvestimento)}
                    </p>
                </div>

                <div className="card p-4 bg-blue-50 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Fluxo Financiamento</span>
                        <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className={`text-2xl font-bold ${totais.fluxoFinanciamento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totais.fluxoFinanciamento)}
                    </p>
                </div>

                <div className="card p-4 bg-purple-50 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Saldo Final</span>
                        {totais.saldoFinalCalculado >= 0 ? (
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                        ) : (
                            <TrendingDown className="h-5 w-5 text-purple-600" />
                        )}
                    </div>
                    <p className={`text-2xl font-bold ${totais.saldoFinalCalculado >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                        {formatCurrency(totais.saldoFinalCalculado)}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* ATIVIDADES OPERACIONAIS */}
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Activity className="h-6 w-6 text-green-600" />
                            ATIVIDADES OPERACIONAIS
                        </h3>

                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recebimentos</h4>
                            {renderInput('recebimentos_clientes', 'Recebimentos de Clientes', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}
                            {renderInput('outros_recebimentos_operacionais', 'Outros Recebimentos', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">Total Recebimentos</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(totais.totalRecebimentosOp)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Pagamentos</h4>
                            {renderInput('pagamentos_fornecedores', 'Pagamentos a Fornecedores', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('pagamentos_pessoal', 'Pagamentos a Pessoal', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('pagamentos_impostos', 'Pagamentos de Impostos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('outros_pagamentos_operacionais', 'Outros Pagamentos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">Total Pagamentos</span>
                                    <span className="font-bold text-red-600">
                                        {formatCurrency(totais.totalPagamentosOp)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-green-300 bg-green-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Fluxo Operacional</span>
                                <span className={`text-xl font-bold ${totais.fluxoOperacional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totais.fluxoOperacional)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ATIVIDADES DE INVESTIMENTO */}
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ArrowDownCircle className="h-6 w-6 text-red-600" />
                            ATIVIDADES DE INVESTIMENTO
                        </h3>

                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recebimentos</h4>
                            {renderInput('recebimentos_venda_ativos', 'Venda de Ativos', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}
                            {renderInput('recebimentos_juros_dividendos', 'Juros e Dividendos', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}
                            {renderInput('outros_recebimentos_investimento', 'Outros Recebimentos', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">Total Recebimentos</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(totais.totalRecebimentosInv)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Pagamentos</h4>
                            {renderInput('pagamentos_aquisicao_ativos', 'Aquisição de Ativos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('outros_pagamentos_investimento', 'Outros Pagamentos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">Total Pagamentos</span>
                                    <span className="font-bold text-red-600">
                                        {formatCurrency(totais.totalPagamentosInv)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-red-300 bg-red-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Fluxo Investimento</span>
                                <span className={`text-xl font-bold ${totais.fluxoInvestimento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totais.fluxoInvestimento)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ATIVIDADES DE FINANCIAMENTO */}
                    <div className="card p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="h-6 w-6 text-blue-600" />
                            ATIVIDADES DE FINANCIAMENTO
                        </h3>

                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Recebimentos</h4>
                            {renderInput('recebimentos_emprestimos', 'Obtenção de Empréstimos', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}
                            {renderInput('outros_recebimentos_financiamento', 'Outros Recebimentos', <ArrowUpCircle className="h-4 w-4 text-green-500" />)}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">Total Recebimentos</span>
                                    <span className="font-bold text-green-600">
                                        {formatCurrency(totais.totalRecebimentosFin)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3">Pagamentos</h4>
                            {renderInput('pagamentos_emprestimos', 'Amortização de Empréstimos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('pagamentos_juros', 'Pagamento de Juros', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('pagamentos_dividendos', 'Pagamento de Dividendos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}
                            {renderInput('outros_pagamentos_financiamento', 'Outros Pagamentos', <ArrowDownCircle className="h-4 w-4 text-red-500" />)}

                            <div className="pt-3 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-gray-600">Total Pagamentos</span>
                                    <span className="font-bold text-red-600">
                                        {formatCurrency(totais.totalPagamentosFin)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t-2 border-blue-300 bg-blue-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Fluxo Financiamento</span>
                                <span className={`text-xl font-bold ${totais.fluxoFinanciamento >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatCurrency(totais.fluxoFinanciamento)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reconciliação */}
                <div className="card p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4">Reconciliação de Caixa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Saldo Inicial</p>
                            <input
                                type="number"
                                name="saldo_inicial"
                                value={formData.saldo_inicial}
                                onChange={handleChange}
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-400">+</span>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Variação de Caixa</p>
                            <p className={`text-xl font-bold ${totais.variacaoCaixa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totais.variacaoCaixa)}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-400">=</span>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Saldo Final Calculado</p>
                            <p className={`text-xl font-bold ${totais.saldoFinalCalculado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {formatCurrency(totais.saldoFinalCalculado)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={loadCashFlows}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Recarregar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex items-center gap-2"
                        disabled={loading || !totais.reconciliado}
                    >
                        <Save className="h-4 w-4" />
                        {loading ? 'A guardar...' : 'Guardar Cash Flow'}
                    </button>
                </div>
            </form>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Fluxos por Atividade</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dadosGrafico}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="nome" />
                            <YAxis />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Bar dataKey="valor">
                                {dadosGrafico.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card p-6">
                    <h3 className="text-lg font-bold mb-4">Composição da Variação de Caixa</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={dadosGrafico.filter(d => Math.abs(d.valor) > 0)}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={(entry) => `${entry.nome}: ${formatCurrency(entry.valor)}`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="valor"
                            >
                                {dadosGrafico.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Análise */}
            {analise && analise.recomendacoes && analise.recomendacoes.length > 0 && (
                <div className="card p-6 mt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Info className="h-5 w-5 text-blue-600" />
                        Análise e Recomendações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Saúde Operacional</p>
                            <p className={`text-lg font-bold ${analise.saude_operacional === 'positivo' ? 'text-green-600' : 'text-red-600'}`}>
                                {analise.saude_operacional === 'positivo' ? 'Positivo ✓' : 'Negativo ✗'}
                            </p>
                        </div>
                        <div className="p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Dependência Financiamento</p>
                            <p className={`text-lg font-bold ${analise.dependencia_financiamento === 'baixa' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {analise.dependencia_financiamento === 'baixa' ? 'Baixa' : 'Alta'}
                            </p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Atividade Investimento</p>
                            <p className="text-lg font-bold text-purple-600">
                                {analise.atividade_investimento === 'expansao' ? 'Expansão' : 'Desinvestimento'}
                            </p>
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2">Recomendações:</h4>
                        <ul className="space-y-2">
                            {analise.recomendacoes.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                        Exercício: {exercicio} | Última atualização: {new Date().toLocaleDateString('pt-PT')}
                    </p>
                    <button className="btn-secondary flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Exportar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CashFlow;
