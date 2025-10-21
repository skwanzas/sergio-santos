import React, { useState, useEffect } from 'react';
import { viabilidadeService } from '../../services/api';
import Header from '../Layout/Header';
import {
    TrendingUp, Plus, Edit2, Trash2, Calculator, Award, AlertCircle, Check, X,
    FileText, Calendar, DollarSign, Target, BarChart3, Activity, Percent,
    Building, Truck, Banknote, PiggyBank
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Viabilidade = () => {
    const [view, setView] = useState('lista'); // lista, form, fluxos, resultados, sensibilidade, ranking
    const [projetos, setProjetos] = useState([]);
    const [projetoAtual, setProjetoAtual] = useState(null);
    const [fluxosCaixa, setFluxosCaixa] = useState([]);
    const [resultados, setResultados] = useState(null);
    const [sensibilidade, setSensibilidade] = useState(null);
    const [ranking, setRanking] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        nome_projeto: '',
        descricao: '',
        tipo_projeto: 'nova_cultura',
        localizacao: '',
        responsavel: '',
        data_inicio: '',
        data_fim: '',
        periodo_construcao_anos: 0,
        periodo_operacao_anos: 5,
        vida_util_anos: 10,
        taxa_desconto_percentual: 12,
        inflacao_anual_percentual: 7,
        taxa_risco_percentual: 0,
        investimento_terreno: 0,
        investimento_construcao: 0,
        investimento_equipamentos: 0,
        investimento_veiculos: 0,
        investimento_capital_giro: 0,
        investimento_outros: 0,
        tem_financiamento: false,
        percentual_financiado: 0,
        taxa_juros_financiamento: 0,
        prazo_financiamento_anos: 0,
        carencia_anos: 0,
        receita_anual_media: 0,
        custo_operacional_anual_medio: 0,
        depreciacao_anual: 0,
        valor_residual: 0,
        premissas: '',
        riscos: '',
        observacoes: ''
    });

    useEffect(() => {
        loadProjetos();
    }, []);

    const loadProjetos = async () => {
        try {
            setLoading(true);
            const response = await viabilidadeService.listViabilidade();
            setProjetos(response.projetos || []);
        } catch (err) {
            setError('Erro ao carregar projetos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadRanking = async () => {
        try {
            setLoading(true);
            const response = await viabilidadeService.getRanking();
            setRanking(response.ranking || []);
        } catch (err) {
            setError('Erro ao carregar ranking: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const dataToSend = {
                ...formData,
                id: projetoAtual?.id
            };

            const response = await viabilidadeService.saveViabilidade(dataToSend);

            setSuccess(response.message || 'Projeto salvo com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

            setProjetoAtual(response.projeto);
            setView('fluxos'); // Ir para fluxos de caixa
            loadProjetos();

        } catch (err) {
            setError('Erro ao salvar projeto: ' + err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (projeto) => {
        setProjetoAtual(projeto);
        setFormData({
            nome_projeto: projeto.nome_projeto || '',
            descricao: projeto.descricao || '',
            tipo_projeto: projeto.tipo_projeto || 'nova_cultura',
            localizacao: projeto.localizacao || '',
            responsavel: projeto.responsavel || '',
            data_inicio: projeto.data_inicio ? projeto.data_inicio.split('T')[0] : '',
            data_fim: projeto.data_fim ? projeto.data_fim.split('T')[0] : '',
            periodo_construcao_anos: projeto.periodo_construcao_anos || 0,
            periodo_operacao_anos: projeto.periodo_operacao_anos || 5,
            vida_util_anos: projeto.vida_util_anos || 10,
            taxa_desconto_percentual: projeto.taxa_desconto_percentual || 12,
            inflacao_anual_percentual: projeto.inflacao_anual_percentual || 7,
            taxa_risco_percentual: projeto.taxa_risco_percentual || 0,
            investimento_terreno: projeto.investimento_terreno || 0,
            investimento_construcao: projeto.investimento_construcao || 0,
            investimento_equipamentos: projeto.investimento_equipamentos || 0,
            investimento_veiculos: projeto.investimento_veiculos || 0,
            investimento_capital_giro: projeto.investimento_capital_giro || 0,
            investimento_outros: projeto.investimento_outros || 0,
            tem_financiamento: projeto.tem_financiamento || false,
            percentual_financiado: projeto.percentual_financiado || 0,
            taxa_juros_financiamento: projeto.taxa_juros_financiamento || 0,
            prazo_financiamento_anos: projeto.prazo_financiamento_anos || 0,
            carencia_anos: projeto.carencia_anos || 0,
            receita_anual_media: projeto.receita_anual_media || 0,
            custo_operacional_anual_medio: projeto.custo_operacional_anual_medio || 0,
            depreciacao_anual: projeto.depreciacao_anual || 0,
            valor_residual: projeto.valor_residual || 0,
            premissas: projeto.premissas || '',
            riscos: projeto.riscos || '',
            observacoes: projeto.observacoes || ''
        });

        // Carregar fluxos de caixa
        try {
            const response = await viabilidadeService.getViabilidade(projeto.id);
            setFluxosCaixa(response.fluxos || []);
        } catch (err) {
            console.error('Erro ao carregar fluxos:', err);
        }

        setView('form');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este projeto?')) return;

        try {
            setLoading(true);
            await viabilidadeService.deleteViabilidade(id);
            setSuccess('Projeto deletado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            loadProjetos();
        } catch (err) {
            setError('Erro ao deletar projeto: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProjetoAtual(null);
        setFluxosCaixa([]);
        setFormData({
            nome_projeto: '',
            descricao: '',
            tipo_projeto: 'nova_cultura',
            localizacao: '',
            responsavel: '',
            data_inicio: '',
            data_fim: '',
            periodo_construcao_anos: 0,
            periodo_operacao_anos: 5,
            vida_util_anos: 10,
            taxa_desconto_percentual: 12,
            inflacao_anual_percentual: 7,
            taxa_risco_percentual: 0,
            investimento_terreno: 0,
            investimento_construcao: 0,
            investimento_equipamentos: 0,
            investimento_veiculos: 0,
            investimento_capital_giro: 0,
            investimento_outros: 0,
            tem_financiamento: false,
            percentual_financiado: 0,
            taxa_juros_financiamento: 0,
            prazo_financiamento_anos: 0,
            carencia_anos: 0,
            receita_anual_media: 0,
            custo_operacional_anual_medio: 0,
            depreciacao_anual: 0,
            valor_residual: 0,
            premissas: '',
            riscos: '',
            observacoes: ''
        });
    };

    const gerarFluxos = () => {
        const anos = parseInt(formData.vida_util_anos);
        const novosFluxos = [];

        for (let ano = 0; ano <= anos; ano++) {
            novosFluxos.push({
                ano,
                descricao: ano === 0 ? 'Investimento Inicial' : `Ano ${ano}`,
                receitas_operacionais: ano === 0 ? 0 : parseFloat(formData.receita_anual_media || 0),
                receitas_nao_operacionais: 0,
                valor_residual: ano === anos ? parseFloat(formData.valor_residual || 0) : 0,
                investimentos: ano === 0 ? (
                    parseFloat(formData.investimento_terreno || 0) +
                    parseFloat(formData.investimento_construcao || 0) +
                    parseFloat(formData.investimento_equipamentos || 0) +
                    parseFloat(formData.investimento_veiculos || 0) +
                    parseFloat(formData.investimento_capital_giro || 0) +
                    parseFloat(formData.investimento_outros || 0)
                ) : 0,
                custos_operacionais: ano === 0 ? 0 : parseFloat(formData.custo_operacional_anual_medio || 0),
                custos_fixos: 0,
                impostos: 0,
                pagamento_financiamento: 0
            });
        }

        setFluxosCaixa(novosFluxos);
    };

    const salvarFluxos = async () => {
        if (!projetoAtual) {
            setError('Salve o projeto primeiro antes de adicionar fluxos de caixa');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await viabilidadeService.saveFluxosCaixa({
                projeto_id: projetoAtual.id,
                fluxos: fluxosCaixa
            });

            setSuccess('Fluxos de caixa salvos com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            setError('Erro ao salvar fluxos: ' + err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const calcularIndicadores = async () => {
        if (!projetoAtual) {
            setError('Selecione um projeto primeiro');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await viabilidadeService.calcularIndicadores(projetoAtual.id);

            setResultados(response.indicadores);
            setSuccess('Indicadores calculados com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            setView('resultados');

        } catch (err) {
            setError('Erro ao calcular indicadores: ' + err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const realizarAnaliseSensibilidade = async () => {
        if (!projetoAtual) {
            setError('Selecione um projeto primeiro');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await viabilidadeService.analiseSensibilidade(projetoAtual.id, {
                variacao_receita: 10,
                variacao_custo: 10
            });

            setSensibilidade(response);
            setSuccess('Análise de sensibilidade concluída!');
            setTimeout(() => setSuccess(''), 3000);
            setView('sensibilidade');

        } catch (err) {
            setError('Erro na análise: ' + err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA'
        }).format(value);
    };

    const formatNumber = (value, decimals = 2) => {
        if (!value && value !== 0) return '-';
        return new Intl.NumberFormat('pt-AO', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(value);
    };

    const formatPercent = (value) => {
        if (!value && value !== 0) return '-';
        return formatNumber(value, 2) + '%';
    };

    // ==================== RENDER: LISTA ====================
    const renderLista = () => (
        <div className="space-y-4">
            {projetos.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum projeto encontrado</h3>
                    <p className="mt-1 text-gray-500">Comece criando uma análise de viabilidade.</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setView('form');
                        }}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Plus className="inline mr-2" size={18} />
                        Novo Projeto
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projetos.map((projeto) => {
                        const viavel = projeto.vpl > 0 && projeto.tir_percentual > projeto.taxa_desconto_percentual;

                        return (
                            <div key={projeto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{projeto.nome_projeto}</h3>
                                            <p className="text-sm text-gray-600 capitalize">{projeto.tipo_projeto?.replace('_', ' ')}</p>
                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded mt-2 ${
                                                projeto.status === 'aprovado' ? 'bg-green-100 text-green-800' :
                                                projeto.status === 'rejeitado' ? 'bg-red-100 text-red-800' :
                                                projeto.status === 'em_execucao' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {projeto.status}
                                            </span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleEdit(projeto)}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(projeto.id)}
                                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2 border-t border-gray-100 pt-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Investimento:</span>
                                            <span className="text-sm font-semibold">{formatCurrency(projeto.investimento_total)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">VPL:</span>
                                            <span className={`text-sm font-bold ${
                                                projeto.vpl >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatCurrency(projeto.vpl)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">TIR:</span>
                                            <span className={`text-sm font-bold ${
                                                projeto.tir_percentual > projeto.taxa_desconto_percentual
                                                    ? 'text-green-600'
                                                    : 'text-red-600'
                                            }`}>
                                                {formatPercent(projeto.tir_percentual)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Payback:</span>
                                            <span className="text-sm font-semibold">
                                                {formatNumber(projeto.payback_descontado_anos)} anos
                                            </span>
                                        </div>
                                        <div className={`mt-3 pt-3 border-t border-gray-100 text-center font-bold ${
                                            viavel ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {viavel ? '✓ VIÁVEL' : '✗ INVIÁVEL'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // ==================== RENDER: FORMULÁRIO ====================
    const renderForm = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {projetoAtual ? 'Editar Projeto' : 'Novo Projeto de Viabilidade'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Identificação */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={20} />
                            Identificação do Projeto
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome do Projeto *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nome_projeto}
                                    onChange={(e) => setFormData({...formData, nome_projeto: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Projeto *
                                </label>
                                <select
                                    value={formData.tipo_projeto}
                                    onChange={(e) => setFormData({...formData, tipo_projeto: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="nova_cultura">Nova Cultura</option>
                                    <option value="expansao">Expansão</option>
                                    <option value="modernizacao">Modernização</option>
                                    <option value="infraestrutura">Infraestrutura</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Localização
                                </label>
                                <input
                                    type="text"
                                    value={formData.localizacao}
                                    onChange={(e) => setFormData({...formData, localizacao: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Início *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.data_inicio}
                                    onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Término *
                                </label>
                                <input
                                    type="date"
                                    required
                                    value={formData.data_fim}
                                    onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descrição
                                </label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Períodos */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={20} />
                            Períodos de Análise
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Período de Construção (anos)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.periodo_construcao_anos}
                                    onChange={(e) => setFormData({...formData, periodo_construcao_anos: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Período de Operação (anos) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.periodo_operacao_anos}
                                    onChange={(e) => setFormData({...formData, periodo_operacao_anos: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vida Útil Total (anos) *
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    required
                                    value={formData.vida_util_anos}
                                    onChange={(e) => setFormData({...formData, vida_util_anos: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Parâmetros Financeiros */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Percent size={20} />
                            Parâmetros Financeiros
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Taxa de Desconto (%) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.taxa_desconto_percentual}
                                    onChange={(e) => setFormData({...formData, taxa_desconto_percentual: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Inflação Anual (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.inflacao_anual_percentual}
                                    onChange={(e) => setFormData({...formData, inflacao_anual_percentual: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Taxa de Risco (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.taxa_risco_percentual}
                                    onChange={(e) => setFormData({...formData, taxa_risco_percentual: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Investimento Inicial */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign size={20} />
                            Investimento Inicial (AOA)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Building className="inline" size={16} /> Terreno
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.investimento_terreno}
                                    onChange={(e) => setFormData({...formData, investimento_terreno: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Building className="inline" size={16} /> Construção
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.investimento_construcao}
                                    onChange={(e) => setFormData({...formData, investimento_construcao: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Activity className="inline" size={16} /> Equipamentos
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.investimento_equipamentos}
                                    onChange={(e) => setFormData({...formData, investimento_equipamentos: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Truck className="inline" size={16} /> Veículos
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.investimento_veiculos}
                                    onChange={(e) => setFormData({...formData, investimento_veiculos: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Banknote className="inline" size={16} /> Capital de Giro
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.investimento_capital_giro}
                                    onChange={(e) => setFormData({...formData, investimento_capital_giro: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Outros
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.investimento_outros}
                                    onChange={(e) => setFormData({...formData, investimento_outros: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-semibold text-gray-900">Investimento Total:</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {formatCurrency(
                                        parseFloat(formData.investimento_terreno || 0) +
                                        parseFloat(formData.investimento_construcao || 0) +
                                        parseFloat(formData.investimento_equipamentos || 0) +
                                        parseFloat(formData.investimento_veiculos || 0) +
                                        parseFloat(formData.investimento_capital_giro || 0) +
                                        parseFloat(formData.investimento_outros || 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Projeções Médias */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} />
                            Projeções Médias Anuais (AOA)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Receita Anual Média
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.receita_anual_media}
                                    onChange={(e) => setFormData({...formData, receita_anual_media: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Custo Operacional Médio
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_operacional_anual_medio}
                                    onChange={(e) => setFormData({...formData, custo_operacional_anual_medio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valor Residual (final)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.valor_residual}
                                    onChange={(e) => setFormData({...formData, valor_residual: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Observações */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Observações</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Premissas
                                </label>
                                <textarea
                                    value={formData.premissas}
                                    onChange={(e) => setFormData({...formData, premissas: e.target.value})}
                                    rows="3"
                                    placeholder="Descreva as premissas adotadas na análise..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Riscos
                                </label>
                                <textarea
                                    value={formData.riscos}
                                    onChange={(e) => setFormData({...formData, riscos: e.target.value})}
                                    rows="3"
                                    placeholder="Descreva os principais riscos do projeto..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setView('lista');
                            }}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            <X className="inline mr-2" size={18} />
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Check className="inline mr-2" size={18} />
                            {loading ? 'A guardar...' : 'Guardar e Continuar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // ==================== RENDER: FLUXOS DE CAIXA ====================
    const renderFluxos = () => {
        if (!projetoAtual) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <AlertCircle className="inline mr-2" size={20} />
                    Salve o projeto primeiro antes de adicionar fluxos de caixa.
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">
                            Fluxos de Caixa - {projetoAtual.nome_projeto}
                        </h2>
                        <div className="flex gap-2">
                            <button
                                onClick={gerarFluxos}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Gerar Fluxos Automáticos
                            </button>
                            <button
                                onClick={salvarFluxos}
                                disabled={loading || fluxosCaixa.length === 0}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                <Check className="inline mr-2" size={18} />
                                Salvar Fluxos
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ano</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Receitas Op.</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Investimentos</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custos Op.</th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Fluxo Líquido</th>
                                    <th className="px-4 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {fluxosCaixa.map((fluxo, idx) => {
                                    const fluxoLiquido = (
                                        parseFloat(fluxo.receitas_operacionais || 0) +
                                        parseFloat(fluxo.receitas_nao_operacionais || 0) +
                                        parseFloat(fluxo.valor_residual || 0) -
                                        parseFloat(fluxo.investimentos || 0) -
                                        parseFloat(fluxo.custos_operacionais || 0) -
                                        parseFloat(fluxo.custos_fixos || 0) -
                                        parseFloat(fluxo.impostos || 0) -
                                        parseFloat(fluxo.pagamento_financiamento || 0)
                                    );

                                    return (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                                Ano {fluxo.ano}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                <input
                                                    type="number"
                                                    value={fluxo.receitas_operacionais}
                                                    onChange={(e) => {
                                                        const novosFluxos = [...fluxosCaixa];
                                                        novosFluxos[idx].receitas_operacionais = e.target.value;
                                                        setFluxosCaixa(novosFluxos);
                                                    }}
                                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                <input
                                                    type="number"
                                                    value={fluxo.investimentos}
                                                    onChange={(e) => {
                                                        const novosFluxos = [...fluxosCaixa];
                                                        novosFluxos[idx].investimentos = e.target.value;
                                                        setFluxosCaixa(novosFluxos);
                                                    }}
                                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                                                />
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                <input
                                                    type="number"
                                                    value={fluxo.custos_operacionais}
                                                    onChange={(e) => {
                                                        const novosFluxos = [...fluxosCaixa];
                                                        novosFluxos[idx].custos_operacionais = e.target.value;
                                                        setFluxosCaixa(novosFluxos);
                                                    }}
                                                    className="w-32 px-2 py-1 border border-gray-300 rounded text-right"
                                                />
                                            </td>
                                            <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${
                                                fluxoLiquido >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {formatCurrency(fluxoLiquido)}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                                <button
                                                    onClick={() => {
                                                        const novosFluxos = fluxosCaixa.filter((_, i) => i !== idx);
                                                        setFluxosCaixa(novosFluxos);
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setView('form')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Voltar
                        </button>
                        <button
                            onClick={calcularIndicadores}
                            disabled={loading || fluxosCaixa.length === 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            <Calculator className="inline mr-2" size={18} />
                            Calcular Indicadores
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER: RESULTADOS ====================
    const renderResultados = () => {
        if (!resultados) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <AlertCircle className="inline mr-2" size={20} />
                    Calcule os indicadores primeiro.
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        Resultados da Análise - {projetoAtual?.nome_projeto}
                    </h2>

                    {/* Cards de Indicadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className={`p-6 rounded-lg border-2 ${
                            resultados.vpl >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                            <p className="text-sm font-medium text-gray-700 mb-1">VPL</p>
                            <p className={`text-2xl font-bold ${resultados.vpl >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {formatCurrency(resultados.vpl)}
                            </p>
                            <p className="text-xs mt-1 text-gray-600">Valor Presente Líquido</p>
                        </div>

                        <div className={`p-6 rounded-lg border-2 ${
                            resultados.tir_percentual > projetoAtual?.taxa_desconto_percentual
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                            <p className="text-sm font-medium text-gray-700 mb-1">TIR</p>
                            <p className={`text-2xl font-bold ${
                                resultados.tir_percentual > projetoAtual?.taxa_desconto_percentual
                                    ? 'text-green-700'
                                    : 'text-red-700'
                            }`}>
                                {formatPercent(resultados.tir_percentual)}
                            </p>
                            <p className="text-xs mt-1 text-gray-600">
                                Taxa Desconto: {formatPercent(projetoAtual?.taxa_desconto_percentual)}
                            </p>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 p-6 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Payback Descontado</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatNumber(resultados.payback_descontado_anos, 1)} anos
                            </p>
                            <p className="text-xs mt-1 text-gray-600">
                                Simples: {formatNumber(resultados.payback_simples_anos, 1)} anos
                            </p>
                        </div>

                        <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-lg">
                            <p className="text-sm font-medium text-gray-700 mb-1">Índice Rentabilidade</p>
                            <p className="text-2xl font-bold text-purple-700">
                                {formatNumber(resultados.indice_rentabilidade, 2)}
                            </p>
                            <p className="text-xs mt-1 text-gray-600">
                                B/C: {formatNumber(resultados.relacao_beneficio_custo, 2)}
                            </p>
                        </div>
                    </div>

                    {/* Decisão Final */}
                    <div className={`p-6 rounded-lg border-2 text-center ${
                        resultados.viavel
                            ? 'bg-green-100 border-green-300'
                            : 'bg-red-100 border-red-300'
                    }`}>
                        <h3 className={`text-3xl font-bold mb-2 ${
                            resultados.viavel ? 'text-green-700' : 'text-red-700'
                        }`}>
                            {resultados.viavel ? '✓ PROJETO VIÁVEL' : '✗ PROJETO INVIÁVEL'}
                        </h3>
                        <p className="text-sm text-gray-700">
                            {resultados.viavel
                                ? 'O projeto apresenta VPL positivo e TIR superior à taxa de desconto.'
                                : 'O projeto apresenta VPL negativo ou TIR inferior à taxa de desconto.'}
                        </p>
                    </div>

                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setView('fluxos')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Voltar aos Fluxos
                        </button>
                        <button
                            onClick={realizarAnaliseSensibilidade}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Activity className="inline mr-2" size={18} />
                            Análise de Sensibilidade
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ==================== RENDER: SENSIBILIDADE ====================
    const renderSensibilidade = () => {
        if (!sensibilidade) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <AlertCircle className="inline mr-2" size={20} />
                    Realize a análise de sensibilidade primeiro.
                </div>
            );
        }

        const chartData = [
            {
                cenario: 'Pessimista',
                vpl: parseFloat(sensibilidade.cenario_pessimista.vpl),
                tir: parseFloat(sensibilidade.cenario_pessimista.tir)
            },
            {
                cenario: 'Base',
                vpl: parseFloat(sensibilidade.cenario_base.vpl),
                tir: parseFloat(sensibilidade.cenario_base.tir)
            },
            {
                cenario: 'Otimista',
                vpl: parseFloat(sensibilidade.cenario_otimista.vpl),
                tir: parseFloat(sensibilidade.cenario_otimista.tir)
            }
        ];

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    Análise de Sensibilidade - {projetoAtual?.nome_projeto}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-red-800 mb-3">Cenário Pessimista</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-gray-600">VPL</p>
                                <p className="text-lg font-bold text-red-700">
                                    {formatCurrency(sensibilidade.cenario_pessimista.vpl)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">TIR</p>
                                <p className="text-lg font-bold text-red-700">
                                    {formatPercent(sensibilidade.cenario_pessimista.tir)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-blue-800 mb-3">Cenário Base</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-gray-600">VPL</p>
                                <p className="text-lg font-bold text-blue-700">
                                    {formatCurrency(sensibilidade.cenario_base.vpl)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">TIR</p>
                                <p className="text-lg font-bold text-blue-700">
                                    {formatPercent(sensibilidade.cenario_base.tir)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                        <h3 className="font-semibold text-green-800 mb-3">Cenário Otimista</h3>
                        <div className="space-y-2">
                            <div>
                                <p className="text-xs text-gray-600">VPL</p>
                                <p className="text-lg font-bold text-green-700">
                                    {formatCurrency(sensibilidade.cenario_otimista.vpl)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600">TIR</p>
                                <p className="text-lg font-bold text-green-700">
                                    {formatPercent(sensibilidade.cenario_otimista.tir)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="cenario" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="vpl" fill="#10b981" name="VPL (AOA)" />
                            <Bar yAxisId="right" dataKey="tir" fill="#3b82f6" name="TIR (%)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => setView('resultados')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                        Voltar aos Resultados
                    </button>
                </div>
            </div>
        );
    };

    // ==================== RENDER: RANKING ====================
    const renderRanking = () => {
        if (ranking.length === 0) {
            return (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Nenhum projeto com VPL calculado</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" />
                        Ranking de Projetos por VPL
                    </h3>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projeto</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Investimento</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">VPL</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">TIR</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">IR</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ranking.map((projeto) => (
                            <tr key={projeto.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {projeto.posicao === 1 && <Award size={20} className="inline text-yellow-500" />}
                                    {projeto.posicao === 2 && <Award size={20} className="inline text-gray-400" />}
                                    {projeto.posicao === 3 && <Award size={20} className="inline text-orange-600" />}
                                    {projeto.posicao > 3 && <span className="ml-6">{projeto.posicao}º</span>}
                                    {projeto.posicao <= 3 && <span className="ml-1">{projeto.posicao}º</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {projeto.nome_projeto}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {formatCurrency(projeto.investimento_total)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                                    {formatCurrency(projeto.vpl)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">
                                    {formatPercent(projeto.tir_percentual)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    {formatNumber(projeto.indice_rentabilidade, 2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Análise de Viabilidade de Projetos"
                subtitle="Avaliação econômica de projetos agrícolas (VPL, TIR, Payback)"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Mensagens */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-800">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
                        <Check size={20} />
                        {success}
                    </div>
                )}

                {/* Navegação de Abas */}
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setView('lista')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'lista'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Target size={18} />
                            Lista de Projetos
                        </button>

                        <button
                            onClick={() => {
                                resetForm();
                                setView('form');
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'form'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Plus size={18} />
                            Novo Projeto
                        </button>

                        {projetoAtual && (
                            <>
                                <button
                                    onClick={() => setView('fluxos')}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                        view === 'fluxos'
                                            ? 'bg-green-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <BarChart3 size={18} />
                                    Fluxos de Caixa
                                </button>

                                {resultados && (
                                    <>
                                        <button
                                            onClick={() => setView('resultados')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                                view === 'resultados'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Calculator size={18} />
                                            Resultados
                                        </button>

                                        {sensibilidade && (
                                            <button
                                                onClick={() => setView('sensibilidade')}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                                    view === 'sensibilidade'
                                                        ? 'bg-green-600 text-white'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                <Activity size={18} />
                                                Sensibilidade
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}

                        <button
                            onClick={() => {
                                loadRanking();
                                setView('ranking');
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'ranking'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Award size={18} />
                            Ranking
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                {loading && view !== 'lista' && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">A carregar...</p>
                    </div>
                )}

                {view === 'lista' && renderLista()}
                {view === 'form' && renderForm()}
                {view === 'fluxos' && renderFluxos()}
                {view === 'resultados' && !loading && renderResultados()}
                {view === 'sensibilidade' && !loading && renderSensibilidade()}
                {view === 'ranking' && !loading && renderRanking()}
            </div>
        </div>
    );
};

export default Viabilidade;
