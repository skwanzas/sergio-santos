import React, { useState, useEffect } from 'react';
import { centroCustoService } from '../../services/api';
import Header from '../Layout/Header';
import {
    Plus, Edit2, Trash2, AlertCircle, Check, X, Search,
    BarChart3, PieChart, TrendingUp, TrendingDown, DollarSign,
    FileText, Calendar, Tag, Building2, Users, Target, Award,
    Layers, Share2
} from 'lucide-react';
import { BarChart, Bar, PieChart as RechartsPie, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const CentroCusto = () => {
    const [view, setView] = useState('dashboard'); // dashboard, centros, lancamentos, analises, rateios
    const [centros, setCentros] = useState([]);
    const [lancamentos, setLancamentos] = useState([]);
    const [centroAtual, setCentroAtual] = useState(null);
    const [lancamentoAtual, setLancamentoAtual] = useState(null);
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [exercicio, setExercicio] = useState(new Date().getFullYear());
    const [mes, setMes] = useState(new Date().getMonth() + 1);

    // Form states
    const [showCentroForm, setShowCentroForm] = useState(false);
    const [showLancamentoForm, setShowLancamentoForm] = useState(false);

    const [formCentro, setFormCentro] = useState({
        codigo: '',
        nome: '',
        descricao: '',
        tipo: 'departamento',
        classificacao: 'produtivo',
        responsavel: '',
        orcamento_anual: 0,
        exercicio: new Date().getFullYear(),
        ativo: true,
        data_inicio: '',
        data_fim: ''
    });

    const [formLancamento, setFormLancamento] = useState({
        centro_custo_id: '',
        data_lancamento: new Date().toISOString().split('T')[0],
        exercicio: new Date().getFullYear(),
        mes: new Date().getMonth() + 1,
        documento: '',
        descricao: '',
        tipo_custo: 'direto',
        categoria: '',
        subcategoria: '',
        valor: 0,
        quantidade: 0,
        unidade: '',
        valor_unitario: 0,
        fornecedor: '',
        conta_contabil: '',
        observacoes: ''
    });

    useEffect(() => {
        loadCentros();
        loadDashboard();
    }, [exercicio]);

    const loadCentros = async () => {
        try {
            setLoading(true);
            const response = await centroCustoService.listCentrosCusto({ exercicio, ativo: true });
            setCentros(response.centros || []);
        } catch (err) {
            setError('Erro ao carregar centros: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadLancamentos = async (filters = {}) => {
        try {
            setLoading(true);
            const response = await centroCustoService.listLancamentos({ exercicio, ...filters });
            setLancamentos(response.lancamentos || []);
        } catch (err) {
            setError('Erro ao carregar lançamentos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadDashboard = async () => {
        try {
            const response = await centroCustoService.getDashboard(exercicio);
            setDashboard(response);
        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
        }
    };

    const handleSaveCentro = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const dataToSend = {
                ...formCentro,
                id: centroAtual?.id
            };

            const response = await centroCustoService.saveCentroCusto(dataToSend);

            setSuccess(response.message || 'Centro de custo salvo com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

            resetFormCentro();
            setShowCentroForm(false);
            loadCentros();
            loadDashboard();

        } catch (err) {
            setError('Erro ao salvar centro: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSaveLancamento = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setError('');

            const dataToSend = {
                ...formLancamento,
                id: lancamentoAtual?.id
            };

            const response = await centroCustoService.saveLancamento(dataToSend);

            setSuccess(response.message || 'Lançamento salvo com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

            resetFormLancamento();
            setShowLancamentoForm(false);
            loadLancamentos();
            loadDashboard();

        } catch (err) {
            setError('Erro ao salvar lançamento: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleEditCentro = (centro) => {
        setCentroAtual(centro);
        setFormCentro({
            codigo: centro.codigo || '',
            nome: centro.nome || '',
            descricao: centro.descricao || '',
            tipo: centro.tipo || 'departamento',
            classificacao: centro.classificacao || 'produtivo',
            responsavel: centro.responsavel || '',
            orcamento_anual: centro.orcamento_anual || 0,
            exercicio: centro.exercicio || new Date().getFullYear(),
            ativo: centro.ativo !== undefined ? centro.ativo : true,
            data_inicio: centro.data_inicio ? centro.data_inicio.split('T')[0] : '',
            data_fim: centro.data_fim ? centro.data_fim.split('T')[0] : ''
        });
        setShowCentroForm(true);
    };

    const handleDeleteCentro = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este centro de custo?')) return;

        try {
            setLoading(true);
            await centroCustoService.deleteCentroCusto(id);
            setSuccess('Centro deletado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            loadCentros();
            loadDashboard();
        } catch (err) {
            setError('Erro ao deletar centro: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLancamento = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este lançamento?')) return;

        try {
            setLoading(true);
            await centroCustoService.deleteLancamento(id);
            setSuccess('Lançamento deletado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            loadLancamentos();
            loadDashboard();
        } catch (err) {
            setError('Erro ao deletar lançamento: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetFormCentro = () => {
        setCentroAtual(null);
        setFormCentro({
            codigo: '',
            nome: '',
            descricao: '',
            tipo: 'departamento',
            classificacao: 'produtivo',
            responsavel: '',
            orcamento_anual: 0,
            exercicio: new Date().getFullYear(),
            ativo: true,
            data_inicio: '',
            data_fim: ''
        });
    };

    const resetFormLancamento = () => {
        setLancamentoAtual(null);
        setFormLancamento({
            centro_custo_id: '',
            data_lancamento: new Date().toISOString().split('T')[0],
            exercicio: new Date().getFullYear(),
            mes: new Date().getMonth() + 1,
            documento: '',
            descricao: '',
            tipo_custo: 'direto',
            categoria: '',
            subcategoria: '',
            valor: 0,
            quantidade: 0,
            unidade: '',
            valor_unitario: 0,
            fornecedor: '',
            conta_contabil: '',
            observacoes: ''
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

    // ==================== RENDER: DASHBOARD ====================
    const renderDashboard = () => {
        if (!dashboard) {
            return (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    <p className="mt-4 text-gray-600">A carregar dashboard...</p>
                </div>
            );
        }

        const evolucaoData = dashboard.evolucao_mensal?.map(item => ({
            mes: `Mês ${item.mes}`,
            total: parseFloat(item.total || 0)
        })) || [];

        const custosPorTipoData = dashboard.custos_por_tipo?.map(item => ({
            name: item.tipo_custo,
            value: parseFloat(item.total || 0)
        })) || [];

        return (
            <div className="space-y-6">
                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Centros de Custo</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboard.total_centros}</p>
                            </div>
                            <Building2 size={32} className="text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total de Lançamentos</p>
                                <p className="text-2xl font-bold text-gray-900">{dashboard.total_lancamentos}</p>
                            </div>
                            <FileText size={32} className="text-green-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Custo Total</p>
                                <p className="text-2xl font-bold text-red-600">{formatCurrency(dashboard.total_custo)}</p>
                            </div>
                            <DollarSign size={32} className="text-red-500" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Média por Centro</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {formatCurrency(dashboard.total_centros > 0 ? dashboard.total_custo / dashboard.total_centros : 0)}
                                </p>
                            </div>
                            <Target size={32} className="text-purple-500" />
                        </div>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Evolução Mensal */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Evolução Mensal</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={evolucaoData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="mes" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#10b981" name="Custo Total" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Custos por Tipo */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Custos por Tipo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <RechartsPie>
                                <Pie
                                    data={custosPorTipoData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {custosPorTipoData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </RechartsPie>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top 5 Centros */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Award size={20} className="text-yellow-500" />
                            Top 5 Centros de Custo
                        </h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centro</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Custo Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dashboard.top5_centros?.map((centro, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{centro.codigo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{centro.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-red-600">
                                        {formatCurrency(centro.total_custo)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Top 5 Categorias */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Tag size={20} className="text-blue-500" />
                            Top 5 Categorias de Custo
                        </h3>
                    </div>
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {dashboard.top5_categorias?.map((cat, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap capitalize">{cat.categoria}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-red-600">
                                        {formatCurrency(cat.total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // ==================== RENDER: CENTROS ====================
    const renderCentros = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Centros de Custo</h2>
                <button
                    onClick={() => {
                        resetFormCentro();
                        setShowCentroForm(true);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Novo Centro
                </button>
            </div>

            {showCentroForm && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {centroAtual ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}
                    </h3>

                    <form onSubmit={handleSaveCentro} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código *</label>
                                <input
                                    type="text"
                                    required
                                    value={formCentro.codigo}
                                    onChange={(e) => setFormCentro({...formCentro, codigo: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                                <input
                                    type="text"
                                    required
                                    value={formCentro.nome}
                                    onChange={(e) => setFormCentro({...formCentro, nome: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                                <select
                                    value={formCentro.tipo}
                                    onChange={(e) => setFormCentro({...formCentro, tipo: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="departamento">Departamento</option>
                                    <option value="cultura">Cultura</option>
                                    <option value="projeto">Projeto</option>
                                    <option value="atividade">Atividade</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Classificação</label>
                                <select
                                    value={formCentro.classificacao}
                                    onChange={(e) => setFormCentro({...formCentro, classificacao: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="produtivo">Produtivo</option>
                                    <option value="administrativo">Administrativo</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="apoio">Apoio</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                                <input
                                    type="text"
                                    value={formCentro.responsavel}
                                    onChange={(e) => setFormCentro({...formCentro, responsavel: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento Anual (AOA)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={formCentro.orcamento_anual}
                                    onChange={(e) => setFormCentro({...formCentro, orcamento_anual: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                                <textarea
                                    value={formCentro.descricao}
                                    onChange={(e) => setFormCentro({...formCentro, descricao: e.target.value})}
                                    rows="2"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => {
                                    resetFormCentro();
                                    setShowCentroForm(false);
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
                                {loading ? 'A guardar...' : 'Guardar'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Lista de Centros */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {centros.map((centro) => (
                    <div key={centro.id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition">
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <p className="text-sm text-gray-600 font-mono">{centro.codigo}</p>
                                    <h3 className="text-lg font-bold text-gray-900">{centro.nome}</h3>
                                    <p className="text-sm text-gray-600 capitalize">{centro.tipo}</p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEditCentro(centro)}
                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCentro(centro.id)}
                                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 border-t border-gray-100 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Classificação:</span>
                                    <span className="text-sm font-semibold capitalize">{centro.classificacao}</span>
                                </div>
                                {centro.responsavel && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Responsável:</span>
                                        <span className="text-sm font-semibold">{centro.responsavel}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Orçamento:</span>
                                    <span className="text-sm font-semibold text-green-600">
                                        {formatCurrency(centro.orcamento_anual)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {centros.length === 0 && !showCentroForm && (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                    <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum centro cadastrado</h3>
                    <p className="mt-1 text-gray-500">Comece criando seu primeiro centro de custo.</p>
                </div>
            )}
        </div>
    );

    // ==================== RENDER: LANÇAMENTOS ====================
    const renderLancamentos = () => {
        useEffect(() => {
            if (view === 'lancamentos') {
                loadLancamentos();
            }
        }, [view, exercicio, mes]);

        return (
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Lançamentos de Custo</h2>
                    <button
                        onClick={() => {
                            resetFormLancamento();
                            setShowLancamentoForm(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Novo Lançamento
                    </button>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Exercício</label>
                            <input
                                type="number"
                                value={exercicio}
                                onChange={(e) => setExercicio(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
                            <select
                                value={mes}
                                onChange={(e) => setMes(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                            >
                                <option value="">Todos</option>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                                    <option key={m} value={m}>Mês {m}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => loadLancamentos({ mes })}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                <Search size={18} />
                                Filtrar
                            </button>
                        </div>
                    </div>
                </div>

                {showLancamentoForm && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {lancamentoAtual ? 'Editar Lançamento' : 'Novo Lançamento'}
                        </h3>

                        <form onSubmit={handleSaveLancamento} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Custo *</label>
                                    <select
                                        required
                                        value={formLancamento.centro_custo_id}
                                        onChange={(e) => setFormLancamento({...formLancamento, centro_custo_id: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Selecione...</option>
                                        {centros.map(c => (
                                            <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formLancamento.data_lancamento}
                                        onChange={(e) => setFormLancamento({...formLancamento, data_lancamento: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                                    <input
                                        type="text"
                                        value={formLancamento.documento}
                                        onChange={(e) => setFormLancamento({...formLancamento, documento: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formLancamento.descricao}
                                        onChange={(e) => setFormLancamento({...formLancamento, descricao: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Custo *</label>
                                    <select
                                        value={formLancamento.tipo_custo}
                                        onChange={(e) => setFormLancamento({...formLancamento, tipo_custo: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="direto">Direto</option>
                                        <option value="indireto">Indireto</option>
                                        <option value="fixo">Fixo</option>
                                        <option value="variavel">Variável</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                                    <input
                                        type="text"
                                        value={formLancamento.categoria}
                                        onChange={(e) => setFormLancamento({...formLancamento, categoria: e.target.value})}
                                        placeholder="Ex: mao_obra, insumos..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor (AOA) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        value={formLancamento.valor}
                                        onChange={(e) => setFormLancamento({...formLancamento, valor: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                                    <input
                                        type="text"
                                        value={formLancamento.fornecedor}
                                        onChange={(e) => setFormLancamento({...formLancamento, fornecedor: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetFormLancamento();
                                        setShowLancamentoForm(false);
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
                                    {loading ? 'A guardar...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabela de Lançamentos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Centro</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {lancamentos.map((lanc) => (
                                <tr key={lanc.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {new Date(lanc.data_lancamento).toLocaleDateString('pt-AO')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {lanc.centro_codigo} - {lanc.centro_nome}
                                    </td>
                                    <td className="px-6 py-4 text-sm">{lanc.descricao}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{lanc.tipo_custo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">{lanc.categoria || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-red-600">
                                        {formatCurrency(lanc.valor)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                        <button
                                            onClick={() => handleDeleteLancamento(lanc.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {lancamentos.length === 0 && !showLancamentoForm && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Nenhum lançamento encontrado</h3>
                        <p className="mt-1 text-gray-500">Adicione lançamentos de custo para este período.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                title="Gestão de Custos por Centro de Custo"
                subtitle="Controle e análise de custos por centro"
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

                {/* Navegação */}
                <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-2">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setView('dashboard')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'dashboard'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <BarChart3 size={18} />
                            Dashboard
                        </button>

                        <button
                            onClick={() => setView('centros')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'centros'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Building2 size={18} />
                            Centros de Custo
                        </button>

                        <button
                            onClick={() => setView('lancamentos')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                                view === 'lancamentos'
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <FileText size={18} />
                            Lançamentos
                        </button>
                    </div>
                </div>

                {/* Conteúdo */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                        <p className="mt-4 text-gray-600">A carregar...</p>
                    </div>
                )}

                {!loading && view === 'dashboard' && renderDashboard()}
                {!loading && view === 'centros' && renderCentros()}
                {!loading && view === 'lancamentos' && renderLancamentos()}
            </div>
        </div>
    );
};

export default CentroCusto;
