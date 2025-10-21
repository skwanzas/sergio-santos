import React, { useState, useEffect } from 'react';
import { rentabilidadeService } from '../../services/api';
import Header from '../Layout/Header';
import {
    TrendingUp, TrendingDown, Plus, Edit2, Trash2, BarChart3,
    Award, DollarSign, Calculator, Target, AlertCircle, Check,
    X, FileText, Calendar, MapPin, Leaf, Sun, Search
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Rentabilidade = () => {
    const [view, setView] = useState('lista'); // lista, form, comparacao, ranking, consolidacao
    const [analises, setAnalises] = useState([]);
    const [analiseAtual, setAnaliseAtual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [exercicioFiltro, setExercicioFiltro] = useState(new Date().getFullYear());
    const [culturaFiltro, setCulturaFiltro] = useState('');
    const [comparacaoData, setComparacaoData] = useState(null);
    const [rankingData, setRankingData] = useState(null);
    const [consolidacaoData, setConsolidacaoData] = useState(null);

    // Formulário
    const [formData, setFormData] = useState({
        exercicio: new Date().getFullYear(),
        cultura: '',
        variedade: '',
        safra: '',
        area_hectares: '',
        producao_total_kg: '',
        rendimento_kg_ha: '',
        perdas_kg: '',
        preco_venda_kg: '',
        preco_mercado_kg: '',
        receita_venda_principal: '',
        receita_venda_secundaria: '',
        receita_subsidios: '',
        custo_sementes: '',
        custo_fertilizantes: '',
        custo_fitosanitarios: '',
        custo_irrigacao: '',
        custo_mao_obra_colheita: '',
        custo_transporte: '',
        custo_outros_variaveis: '',
        custo_arrendamento: '',
        custo_depreciacao: '',
        custo_mao_obra_fixa: '',
        custo_outros_fixos: '',
        data_plantio: '',
        data_colheita: '',
        observacoes: '',
        clima_condicoes: '',
        solo_tipo: ''
    });

    useEffect(() => {
        loadAnalises();
    }, [exercicioFiltro, culturaFiltro]);

    const loadAnalises = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (exercicioFiltro) filters.exercicio = exercicioFiltro;
            if (culturaFiltro) filters.cultura = culturaFiltro;

            const response = await rentabilidadeService.listRentabilidade(filters);
            setAnalises(response.analises || []);
        } catch (err) {
            setError('Erro ao carregar análises: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadComparacao = async () => {
        try {
            setLoading(true);
            const response = await rentabilidadeService.compararCulturas(exercicioFiltro);
            setComparacaoData(response.comparacao || []);
        } catch (err) {
            setError('Erro ao carregar comparação: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadRanking = async () => {
        try {
            setLoading(true);
            const response = await rentabilidadeService.getRanking(exercicioFiltro);
            setRankingData(response.ranking || []);
        } catch (err) {
            setError('Erro ao carregar ranking: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadConsolidacao = async () => {
        try {
            setLoading(true);
            const response = await rentabilidadeService.getConsolidacao(exercicioFiltro);
            setConsolidacaoData(response);
        } catch (err) {
            setError('Erro ao carregar consolidação: ' + err.message);
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
                id: analiseAtual?.id
            };

            const response = await rentabilidadeService.saveRentabilidade(dataToSend);

            setSuccess(response.message || 'Análise salva com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

            resetForm();
            setView('lista');
            loadAnalises();

        } catch (err) {
            setError('Erro ao salvar análise: ' + err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (analise) => {
        setAnaliseAtual(analise);
        setFormData({
            exercicio: analise.exercicio,
            cultura: analise.cultura || '',
            variedade: analise.variedade || '',
            safra: analise.safra || '',
            area_hectares: analise.area_hectares || '',
            producao_total_kg: analise.producao_total_kg || '',
            rendimento_kg_ha: analise.rendimento_kg_ha || '',
            perdas_kg: analise.perdas_kg || '',
            preco_venda_kg: analise.preco_venda_kg || '',
            preco_mercado_kg: analise.preco_mercado_kg || '',
            receita_venda_principal: analise.receita_venda_principal || '',
            receita_venda_secundaria: analise.receita_venda_secundaria || '',
            receita_subsidios: analise.receita_subsidios || '',
            custo_sementes: analise.custo_sementes || '',
            custo_fertilizantes: analise.custo_fertilizantes || '',
            custo_fitosanitarios: analise.custo_fitosanitarios || '',
            custo_irrigacao: analise.custo_irrigacao || '',
            custo_mao_obra_colheita: analise.custo_mao_obra_colheita || '',
            custo_transporte: analise.custo_transporte || '',
            custo_outros_variaveis: analise.custo_outros_variaveis || '',
            custo_arrendamento: analise.custo_arrendamento || '',
            custo_depreciacao: analise.custo_depreciacao || '',
            custo_mao_obra_fixa: analise.custo_mao_obra_fixa || '',
            custo_outros_fixos: analise.custo_outros_fixos || '',
            data_plantio: analise.data_plantio ? analise.data_plantio.split('T')[0] : '',
            data_colheita: analise.data_colheita ? analise.data_colheita.split('T')[0] : '',
            observacoes: analise.observacoes || '',
            clima_condicoes: analise.clima_condicoes || '',
            solo_tipo: analise.solo_tipo || ''
        });
        setView('form');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar esta análise?')) return;

        try {
            setLoading(true);
            await rentabilidadeService.deleteRentabilidade(id);
            setSuccess('Análise deletada com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            loadAnalises();
        } catch (err) {
            setError('Erro ao deletar análise: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setAnaliseAtual(null);
        setFormData({
            exercicio: new Date().getFullYear(),
            cultura: '',
            variedade: '',
            safra: '',
            area_hectares: '',
            producao_total_kg: '',
            rendimento_kg_ha: '',
            perdas_kg: '',
            preco_venda_kg: '',
            preco_mercado_kg: '',
            receita_venda_principal: '',
            receita_venda_secundaria: '',
            receita_subsidios: '',
            custo_sementes: '',
            custo_fertilizantes: '',
            custo_fitosanitarios: '',
            custo_irrigacao: '',
            custo_mao_obra_colheita: '',
            custo_transporte: '',
            custo_outros_variaveis: '',
            custo_arrendamento: '',
            custo_depreciacao: '',
            custo_mao_obra_fixa: '',
            custo_outros_fixos: '',
            data_plantio: '',
            data_colheita: '',
            observacoes: '',
            clima_condicoes: '',
            solo_tipo: ''
        });
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

    const handleViewChange = (newView) => {
        setView(newView);
        if (newView === 'comparacao') loadComparacao();
        if (newView === 'ranking') loadRanking();
        if (newView === 'consolidacao') loadConsolidacao();
    };

    // ==================== RENDER: LISTA ====================
    const renderLista = () => (
        <div className="space-y-4">
            {/* Filtros */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Exercício
                        </label>
                        <input
                            type="number"
                            value={exercicioFiltro}
                            onChange={(e) => setExercicioFiltro(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cultura
                        </label>
                        <input
                            type="text"
                            value={culturaFiltro}
                            onChange={(e) => setCulturaFiltro(e.target.value)}
                            placeholder="Filtrar por cultura..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={loadAnalises}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            <Search size={18} />
                            Filtrar
                        </button>
                    </div>
                </div>
            </div>

            {/* Cards de Análises */}
            {analises.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Leaf className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhuma análise encontrada</h3>
                    <p className="mt-1 text-gray-500">Comece criando uma nova análise de rentabilidade.</p>
                    <button
                        onClick={() => {
                            resetForm();
                            setView('form');
                        }}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        <Plus className="inline mr-2" size={18} />
                        Nova Análise
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analises.map((analise) => (
                        <div key={analise.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                            <div className="p-4">
                                {/* Cabeçalho */}
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{analise.cultura}</h3>
                                        {analise.variedade && (
                                            <p className="text-sm text-gray-600">{analise.variedade}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            {analise.safra || `Exercício ${analise.exercicio}`}
                                        </p>
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEdit(analise)}
                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(analise.id)}
                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Métricas Principais */}
                                <div className="space-y-2 border-t border-gray-100 pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Área:</span>
                                        <span className="text-sm font-semibold">{formatNumber(analise.area_hectares)} ha</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Rendimento:</span>
                                        <span className="text-sm font-semibold">{formatNumber(analise.rendimento_kg_ha)} kg/ha</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Margem Líquida:</span>
                                        <span className={`text-sm font-bold ${
                                            parseFloat(analise.margem_liquida_percentual) >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}>
                                            {formatNumber(analise.margem_liquida_percentual)}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Rentabilidade/ha:</span>
                                        <span className={`text-sm font-bold ${
                                            parseFloat(analise.rentabilidade_hectare) >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}>
                                            {formatCurrency(analise.rentabilidade_hectare)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">ROI:</span>
                                        <span className={`text-sm font-bold ${
                                            parseFloat(analise.roi_percentual) >= 0
                                                ? 'text-green-600'
                                                : 'text-red-600'
                                        }`}>
                                            {formatNumber(analise.roi_percentual)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // ==================== RENDER: FORMULÁRIO ====================
    const renderForm = () => (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {analiseAtual ? 'Editar Análise' : 'Nova Análise de Rentabilidade'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Seção 1: Identificação */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText size={20} />
                            Identificação
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Exercício *
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={formData.exercicio}
                                    onChange={(e) => setFormData({...formData, exercicio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Cultura *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.cultura}
                                    onChange={(e) => setFormData({...formData, cultura: e.target.value})}
                                    placeholder="Ex: Milho, Sésamo, Feijão..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Variedade
                                </label>
                                <input
                                    type="text"
                                    value={formData.variedade}
                                    onChange={(e) => setFormData({...formData, variedade: e.target.value})}
                                    placeholder="Ex: Híbrido ZM10..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Safra
                                </label>
                                <input
                                    type="text"
                                    value={formData.safra}
                                    onChange={(e) => setFormData({...formData, safra: e.target.value})}
                                    placeholder="Ex: 2024/2025"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 2: Área e Produção */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={20} />
                            Área e Produção
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Área (hectares) *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={formData.area_hectares}
                                    onChange={(e) => setFormData({...formData, area_hectares: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Produção Total (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.producao_total_kg}
                                    onChange={(e) => setFormData({...formData, producao_total_kg: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rendimento (kg/ha)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.rendimento_kg_ha}
                                    onChange={(e) => setFormData({...formData, rendimento_kg_ha: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Perdas (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.perdas_kg}
                                    onChange={(e) => setFormData({...formData, perdas_kg: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 3: Preços */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign size={20} />
                            Preços
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preço de Venda (AOA/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.preco_venda_kg}
                                    onChange={(e) => setFormData({...formData, preco_venda_kg: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Preço de Mercado (AOA/kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.preco_mercado_kg}
                                    onChange={(e) => setFormData({...formData, preco_mercado_kg: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 4: Receitas */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-600" />
                            Receitas (AOA)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Venda Principal
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.receita_venda_principal}
                                    onChange={(e) => setFormData({...formData, receita_venda_principal: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Venda Secundária
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.receita_venda_secundaria}
                                    onChange={(e) => setFormData({...formData, receita_venda_secundaria: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subsídios
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.receita_subsidios}
                                    onChange={(e) => setFormData({...formData, receita_subsidios: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 5: Custos Variáveis */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingDown size={20} className="text-orange-600" />
                            Custos Variáveis (AOA)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sementes
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_sementes}
                                    onChange={(e) => setFormData({...formData, custo_sementes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fertilizantes
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_fertilizantes}
                                    onChange={(e) => setFormData({...formData, custo_fertilizantes: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fitossanitários
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_fitosanitarios}
                                    onChange={(e) => setFormData({...formData, custo_fitosanitarios: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Irrigação
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_irrigacao}
                                    onChange={(e) => setFormData({...formData, custo_irrigacao: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mão de Obra (Colheita)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_mao_obra_colheita}
                                    onChange={(e) => setFormData({...formData, custo_mao_obra_colheita: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Transporte
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_transporte}
                                    onChange={(e) => setFormData({...formData, custo_transporte: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Outros Variáveis
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_outros_variaveis}
                                    onChange={(e) => setFormData({...formData, custo_outros_variaveis: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 6: Custos Fixos */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <TrendingDown size={20} className="text-red-600" />
                            Custos Fixos (AOA)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Arrendamento
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_arrendamento}
                                    onChange={(e) => setFormData({...formData, custo_arrendamento: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Depreciação
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_depreciacao}
                                    onChange={(e) => setFormData({...formData, custo_depreciacao: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mão de Obra Fixa
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_mao_obra_fixa}
                                    onChange={(e) => setFormData({...formData, custo_mao_obra_fixa: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Outros Fixos
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formData.custo_outros_fixos}
                                    onChange={(e) => setFormData({...formData, custo_outros_fixos: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Seção 7: Informações Adicionais */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar size={20} />
                            Informações Adicionais
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Plantio
                                </label>
                                <input
                                    type="date"
                                    value={formData.data_plantio}
                                    onChange={(e) => setFormData({...formData, data_plantio: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Data de Colheita
                                </label>
                                <input
                                    type="date"
                                    value={formData.data_colheita}
                                    onChange={(e) => setFormData({...formData, data_colheita: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Solo
                                </label>
                                <input
                                    type="text"
                                    value={formData.solo_tipo}
                                    onChange={(e) => setFormData({...formData, solo_tipo: e.target.value})}
                                    placeholder="Ex: Argiloso, Arenoso..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Condições Climáticas
                                </label>
                                <input
                                    type="text"
                                    value={formData.clima_condicoes}
                                    onChange={(e) => setFormData({...formData, clima_condicoes: e.target.value})}
                                    placeholder="Ex: Seca no início, chuvas abundantes na colheita..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                            <div className="md:col-span-2 lg:col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observações
                                </label>
                                <textarea
                                    value={formData.observacoes}
                                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                                    rows="3"
                                    placeholder="Notas adicionais sobre a safra..."
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
                            {loading ? 'A guardar...' : 'Guardar Análise'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // ==================== RENDER: COMPARAÇÃO ====================
    const renderComparacao = () => {
        if (!comparacaoData || comparacaoData.length === 0) {
            return (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Nenhuma cultura para comparar no exercício {exercicioFiltro}</p>
                </div>
            );
        }

        const chartData = comparacaoData.map(item => ({
            cultura: item.cultura,
            margem: parseFloat(item.margem_media || 0),
            rentabilidade: parseFloat(item.rentabilidade_media_ha || 0) / 1000, // em milhares
            rendimento: parseFloat(item.rendimento_medio || 0)
        }));

        return (
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Comparação de Culturas - Exercício {exercicioFiltro}
                    </h3>

                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="cultura" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" />
                            <Tooltip />
                            <Legend />
                            <Bar yAxisId="left" dataKey="margem" fill="#10b981" name="Margem Líquida (%)" />
                            <Bar yAxisId="right" dataKey="rentabilidade" fill="#3b82f6" name="Rentabilidade (mil AOA/ha)" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cultura</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Área Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rendimento Médio</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margem Média</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rentabilidade/ha</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {comparacaoData.map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{item.cultura}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">{formatNumber(item.area_total)} ha</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">{formatNumber(item.rendimento_medio)} kg/ha</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                                        {formatNumber(item.margem_media)}%
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">
                                        {formatCurrency(item.rentabilidade_media_ha)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ==================== RENDER: RANKING ====================
    const renderRanking = () => {
        if (!rankingData || rankingData.length === 0) {
            return (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Award className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Nenhum ranking disponível para o exercício {exercicioFiltro}</p>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Award size={20} className="text-yellow-500" />
                        Ranking de Rentabilidade - Exercício {exercicioFiltro}
                    </h3>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posição</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cultura</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margem Líquida</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Rentabilidade/ha</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">ROI</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rankingData.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {idx === 0 && <Award size={20} className="inline text-yellow-500" />}
                                    {idx === 1 && <Award size={20} className="inline text-gray-400" />}
                                    {idx === 2 && <Award size={20} className="inline text-orange-600" />}
                                    {idx > 2 && <span className="ml-6">{idx + 1}º</span>}
                                    {idx <= 2 && <span className="ml-1">{idx + 1}º</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                    {item.cultura}
                                    {item.safra && <span className="ml-2 text-sm text-gray-500">({item.safra})</span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                                    {formatCurrency(item.margem_liquida)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-blue-600">
                                    {formatCurrency(item.rentabilidade_hectare)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                                    {formatNumber(item.margem_liquida_percentual)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // ==================== RENDER: CONSOLIDAÇÃO ====================
    const renderConsolidacao = () => {
        if (!consolidacaoData || consolidacaoData.total_analises === 0) {
            return (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-gray-500">Nenhuma análise disponível para consolidação no exercício {exercicioFiltro}</p>
                </div>
            );
        }

        const { consolidacao } = consolidacaoData;

        return (
            <div className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Área Total</p>
                                <p className="text-2xl font-bold text-gray-900">{formatNumber(consolidacao.area_total)} ha</p>
                            </div>
                            <MapPin size={32} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Receita Total</p>
                                <p className="text-2xl font-bold text-green-600">{formatCurrency(consolidacao.receita_total)}</p>
                            </div>
                            <TrendingUp size={32} className="text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Custo Total</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(consolidacao.custo_total)}</p>
                            </div>
                            <TrendingDown size={32} className="text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Margem Líquida</p>
                                <p className={`text-2xl font-bold ${
                                    consolidacao.margem_liquida >= 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {formatCurrency(consolidacao.margem_liquida)}
                                </p>
                            </div>
                            <Target size={32} className="text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Detalhes da Consolidação */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Indicadores Consolidados</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Margem Percentual</p>
                            <p className={`text-xl font-bold ${
                                consolidacao.margem_percentual >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                                {formatNumber(consolidacao.margem_percentual)}%
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Receita por Hectare</p>
                            <p className="text-xl font-bold text-blue-600">
                                {formatCurrency(consolidacao.receita_por_hectare)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Custo por Hectare</p>
                            <p className="text-xl font-bold text-orange-600">
                                {formatCurrency(consolidacao.custo_por_hectare)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Número de Culturas</p>
                            <p className="text-xl font-bold text-gray-900">
                                {consolidacao.num_culturas}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Produção Total</p>
                            <p className="text-xl font-bold text-gray-900">
                                {formatNumber(consolidacao.producao_total, 0)} kg
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Total de Análises</p>
                            <p className="text-xl font-bold text-gray-900">
                                {consolidacaoData.total_analises}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Rentabilidade por Cultura"
                subtitle="Análise de rentabilidade de culturas agrícolas"
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
                            <Leaf size={18} />
                            Lista de Análises
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
                            Nova Análise
                        </button>

                        <button
                            onClick={() => handleViewChange('comparacao')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'comparacao'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <BarChart3 size={18} />
                            Comparação
                        </button>

                        <button
                            onClick={() => handleViewChange('ranking')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'ranking'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Award size={18} />
                            Ranking
                        </button>

                        <button
                            onClick={() => handleViewChange('consolidacao')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'consolidacao'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Calculator size={18} />
                            Consolidação
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                {loading && view !== 'lista' && view !== 'form' && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">A carregar...</p>
                    </div>
                )}

                {view === 'lista' && renderLista()}
                {view === 'form' && renderForm()}
                {view === 'comparacao' && !loading && renderComparacao()}
                {view === 'ranking' && !loading && renderRanking()}
                {view === 'consolidacao' && !loading && renderConsolidacao()}
            </div>
        </div>
    );
};

export default Rentabilidade;
