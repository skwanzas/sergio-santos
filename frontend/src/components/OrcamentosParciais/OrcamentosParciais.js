import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orcamentosParciaisService } from '../../services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import {
    Save, Calendar, Plus, Edit2, Trash2, CheckCircle, X,
    TrendingUp, TrendingDown, AlertCircle, Filter, Eye,
    DollarSign, Leaf, Briefcase, Building, ArrowRight
} from 'lucide-react';

const TIPOS_ORCAMENTO = [
    { value: 'cultura', label: 'Cultura', icon: Leaf, color: '#10b981' },
    { value: 'projeto', label: 'Projeto', icon: Briefcase, color: '#3b82f6' },
    { value: 'centro_custo', label: 'Centro de Custo', icon: Building, color: '#8b5cf6' }
];

const STATUS_OPTIONS = [
    { value: 'planejamento', label: 'Planejamento', color: 'gray' },
    { value: 'aprovado', label: 'Aprovado', color: 'blue' },
    { value: 'em_execucao', label: 'Em Execução', color: 'yellow' },
    { value: 'concluido', label: 'Concluído', color: 'green' },
    { value: 'cancelado', label: 'Cancelado', color: 'red' }
];

const OrcamentosParciais = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    const [exercicio, setExercicio] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [orcamentos, setOrcamentos] = useState([]);
    const [viewMode, setViewMode] = useState('lista'); // 'lista', 'form', 'detalhes', 'consolidacao'
    const [selectedOrcamento, setSelectedOrcamento] = useState(null);
    const [consolidacao, setConsolidacao] = useState(null);

    // Filtros
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');

    const [formData, setFormData] = useState({
        nome: '',
        tipo: 'cultura',
        descricao: '',
        area_hectares: '',
        data_inicio: '',
        data_fim: '',
        // Receitas
        receita_venda_principal: 0,
        receita_venda_secundaria: 0,
        receita_subsidios: 0,
        receita_outras: 0,
        // Custos Variáveis
        custo_sementes: 0,
        custo_fertilizantes: 0,
        custo_fitosanitarios: 0,
        custo_combustivel: 0,
        custo_mao_obra_temporaria: 0,
        custo_agua_irrigacao: 0,
        custo_embalagens: 0,
        custo_transporte: 0,
        custo_outros_variaveis: 0,
        // Custos Fixos
        custo_mao_obra_permanente: 0,
        custo_arrendamento: 0,
        custo_depreciacao_equipamento: 0,
        custo_seguros: 0,
        custo_manutencao: 0,
        custo_administrativos: 0,
        custo_outros_fixos: 0,
        // Investimentos
        investimento_equipamento: 0,
        investimento_infraestrutura: 0,
        investimento_outros: 0,
        // Realizados
        realizado_receitas: 0,
        realizado_custos_variaveis: 0,
        realizado_custos_fixos: 0,
        realizado_investimentos: 0,
        // Análise
        rendimento_esperado_kg: '',
        preco_venda_kg: '',
        status: 'planejamento',
        observacoes: ''
    });

    useEffect(() => {
        loadOrcamentos();
    }, [exercicio, filtroTipo, filtroStatus]);

    useEffect(() => {
        if (viewMode === 'consolidacao') {
            loadConsolidacao();
        }
    }, [viewMode, exercicio]);

    const loadOrcamentos = async () => {
        try {
            setLoading(true);
            const filters = { exercicio };
            if (filtroTipo) filters.tipo = filtroTipo;
            if (filtroStatus) filters.status = filtroStatus;

            const data = await orcamentosParciaisService.listOrcamentos(filters);
            setOrcamentos(data.orcamentos || []);
        } catch (err) {
            console.error('Erro ao carregar orçamentos:', err);
            setError('Erro ao carregar orçamentos');
        } finally {
            setLoading(false);
        }
    };

    const loadConsolidacao = async () => {
        try {
            const data = await orcamentosParciaisService.getConsolidacao(exercicio);
            setConsolidacao(data);
        } catch (err) {
            console.error('Erro ao carregar consolidação:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const dataToSend = {
                ...formData,
                exercicio
            };

            if (selectedOrcamento) {
                dataToSend.id = selectedOrcamento.id;
            }

            await orcamentosParciaisService.saveOrcamento(dataToSend);

            setSuccess(selectedOrcamento ? 'Orçamento atualizado com sucesso!' : 'Orçamento criado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);

            resetForm();
            setViewMode('lista');
            await loadOrcamentos();

        } catch (err) {
            console.error('Erro ao salvar orçamento:', err);
            setError(err.response?.data?.error || 'Erro ao salvar orçamento');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (orcamento) => {
        setSelectedOrcamento(orcamento);
        setFormData({
            nome: orcamento.nome || '',
            tipo: orcamento.tipo || 'cultura',
            descricao: orcamento.descricao || '',
            area_hectares: orcamento.area_hectares || '',
            data_inicio: orcamento.data_inicio ? orcamento.data_inicio.split('T')[0] : '',
            data_fim: orcamento.data_fim ? orcamento.data_fim.split('T')[0] : '',
            receita_venda_principal: orcamento.receita_venda_principal || 0,
            receita_venda_secundaria: orcamento.receita_venda_secundaria || 0,
            receita_subsidios: orcamento.receita_subsidios || 0,
            receita_outras: orcamento.receita_outras || 0,
            custo_sementes: orcamento.custo_sementes || 0,
            custo_fertilizantes: orcamento.custo_fertilizantes || 0,
            custo_fitosanitarios: orcamento.custo_fitosanitarios || 0,
            custo_combustivel: orcamento.custo_combustivel || 0,
            custo_mao_obra_temporaria: orcamento.custo_mao_obra_temporaria || 0,
            custo_agua_irrigacao: orcamento.custo_agua_irrigacao || 0,
            custo_embalagens: orcamento.custo_embalagens || 0,
            custo_transporte: orcamento.custo_transporte || 0,
            custo_outros_variaveis: orcamento.custo_outros_variaveis || 0,
            custo_mao_obra_permanente: orcamento.custo_mao_obra_permanente || 0,
            custo_arrendamento: orcamento.custo_arrendamento || 0,
            custo_depreciacao_equipamento: orcamento.custo_depreciacao_equipamento || 0,
            custo_seguros: orcamento.custo_seguros || 0,
            custo_manutencao: orcamento.custo_manutencao || 0,
            custo_administrativos: orcamento.custo_administrativos || 0,
            custo_outros_fixos: orcamento.custo_outros_fixos || 0,
            investimento_equipamento: orcamento.investimento_equipamento || 0,
            investimento_infraestrutura: orcamento.investimento_infraestrutura || 0,
            investimento_outros: orcamento.investimento_outros || 0,
            realizado_receitas: orcamento.realizado_receitas || 0,
            realizado_custos_variaveis: orcamento.realizado_custos_variaveis || 0,
            realizado_custos_fixos: orcamento.realizado_custos_fixos || 0,
            realizado_investimentos: orcamento.realizado_investimentos || 0,
            rendimento_esperado_kg: orcamento.rendimento_esperado_kg || '',
            preco_venda_kg: orcamento.preco_venda_kg || '',
            status: orcamento.status || 'planejamento',
            observacoes: orcamento.observacoes || ''
        });
        setViewMode('form');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar este orçamento?')) {
            return;
        }

        try {
            await orcamentosParciaisService.deleteOrcamento(id);
            setSuccess('Orçamento deletado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            await loadOrcamentos();
        } catch (err) {
            console.error('Erro ao deletar:', err);
            setError('Erro ao deletar orçamento');
        }
    };

    const handleAprovar = async (id) => {
        try {
            await orcamentosParciaisService.aprovarOrcamento(id);
            setSuccess('Orçamento aprovado com sucesso!');
            setTimeout(() => setSuccess(''), 3000);
            await loadOrcamentos();
        } catch (err) {
            console.error('Erro ao aprovar:', err);
            setError('Erro ao aprovar orçamento');
        }
    };

    const resetForm = () => {
        setSelectedOrcamento(null);
        setFormData({
            nome: '',
            tipo: 'cultura',
            descricao: '',
            area_hectares: '',
            data_inicio: '',
            data_fim: '',
            receita_venda_principal: 0,
            receita_venda_secundaria: 0,
            receita_subsidios: 0,
            receita_outras: 0,
            custo_sementes: 0,
            custo_fertilizantes: 0,
            custo_fitosanitarios: 0,
            custo_combustivel: 0,
            custo_mao_obra_temporaria: 0,
            custo_agua_irrigacao: 0,
            custo_embalagens: 0,
            custo_transporte: 0,
            custo_outros_variaveis: 0,
            custo_mao_obra_permanente: 0,
            custo_arrendamento: 0,
            custo_depreciacao_equipamento: 0,
            custo_seguros: 0,
            custo_manutencao: 0,
            custo_administrativos: 0,
            custo_outros_fixos: 0,
            investimento_equipamento: 0,
            investimento_infraestrutura: 0,
            investimento_outros: 0,
            realizado_receitas: 0,
            realizado_custos_variaveis: 0,
            realizado_custos_fixos: 0,
            realizado_investimentos: 0,
            rendimento_esperado_kg: '',
            preco_venda_kg: '',
            status: 'planejamento',
            observacoes: ''
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCurrency = (value) => {
        if (!value && value !== 0) return 'AOA 0,00';
        const num = parseFloat(value);
        if (isNaN(num)) return 'AOA 0,00';
        return `AOA ${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderInput = (name, label, type = 'number') => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                step={type === 'number' ? '0.01' : undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={type === 'number' ? '0.00' : ''}
            />
        </div>
    );

    const getStatusBadge = (status) => {
        const statusObj = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
        const colors = {
            gray: 'bg-gray-100 text-gray-800',
            blue: 'bg-blue-100 text-blue-800',
            yellow: 'bg-yellow-100 text-yellow-800',
            green: 'bg-green-100 text-green-800',
            red: 'bg-red-100 text-red-800'
        };
        return (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[statusObj.color]}`}>
                {statusObj.label}
            </span>
        );
    };

    const getTipoIcon = (tipo) => {
        const tipoObj = TIPOS_ORCAMENTO.find(t => t.value === tipo);
        if (!tipoObj) return null;
        const Icon = tipoObj.icon;
        return <Icon size={20} style={{ color: tipoObj.color }} />;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Orçamentos Parciais
                        </h1>
                        <p className="text-gray-600">
                            Orçamentos por cultura, projeto ou centro de custo
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

                        {viewMode === 'lista' && (
                            <>
                                <button
                                    onClick={() => setViewMode('consolidacao')}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    Consolidação
                                </button>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setViewMode('form');
                                    }}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Novo Orçamento
                                </button>
                            </>
                        )}

                        {(viewMode === 'form' || viewMode === 'consolidacao') && (
                            <button
                                onClick={() => {
                                    resetForm();
                                    setViewMode('lista');
                                }}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <X className="h-4 w-4" />
                                Voltar à Lista
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Alertas */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                        <p className="font-semibold">Erro</p>
                        <p className="text-sm">{error}</p>
                    </div>
                    <button onClick={() => setError('')} className="ml-auto">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                    <div>
                        <p className="font-semibold">Sucesso</p>
                        <p className="text-sm">{success}</p>
                    </div>
                    <button onClick={() => setSuccess('')} className="ml-auto">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            {/* Conteúdo Principal */}
            {viewMode === 'lista' && (
                <div>
                    {/* Filtros */}
                    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center gap-4">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mr-2">Tipo:</label>
                                <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Todos</option>
                                    {TIPOS_ORCAMENTO.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
                                <select
                                    value={filtroStatus}
                                    onChange={(e) => setFiltroStatus(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Todos</option>
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Orçamentos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orcamentos.map((orc) => (
                            <div key={orc.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        {getTipoIcon(orc.tipo)}
                                        <h3 className="font-semibold text-lg text-gray-900">{orc.nome}</h3>
                                    </div>
                                    {getStatusBadge(orc.status)}
                                </div>

                                {orc.descricao && (
                                    <p className="text-sm text-gray-600 mb-3">{orc.descricao}</p>
                                )}

                                {orc.area_hectares && (
                                    <p className="text-sm text-gray-600 mb-2">
                                        Área: {parseFloat(orc.area_hectares).toFixed(2)} ha
                                    </p>
                                )}

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Receitas:</span>
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(orc.analise?.total_receitas)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Custos:</span>
                                        <span className="font-semibold text-red-600">
                                            {formatCurrency(orc.analise?.total_custos)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2">
                                        <span className="font-medium text-gray-700">Resultado:</span>
                                        <span className={`font-bold ${orc.analise?.resultado_liquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {formatCurrency(orc.analise?.resultado_liquido)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Margem Líquida:</span>
                                        <span className="font-medium">
                                            {orc.analise?.margem_liquida_percentual?.toFixed(2)}%
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(orc)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                                    >
                                        <Edit2 size={16} />
                                        Editar
                                    </button>
                                    {orc.status === 'planejamento' && (
                                        <button
                                            onClick={() => handleAprovar(orc.id)}
                                            className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} />
                                            Aprovar
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(orc.id)}
                                        className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {orcamentos.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Nenhum orçamento encontrado
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Crie um novo orçamento parcial para começar.
                            </p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setViewMode('form');
                                }}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Criar Primeiro Orçamento
                            </button>
                        </div>
                    )}
                </div>
            )}

            {viewMode === 'form' && (
                <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-2xl font-bold mb-6">
                        {selectedOrcamento ? 'Editar Orçamento' : 'Novo Orçamento'}
                    </h2>

                    {/* Identificação */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-4">Identificação</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput('nome', 'Nome do Orçamento', 'text')}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                                <select
                                    name="tipo"
                                    value={formData.tipo}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {TIPOS_ORCAMENTO.map(tipo => (
                                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                                    ))}
                                </select>
                            </div>

                            {formData.tipo === 'cultura' && (
                                <>
                                    {renderInput('area_hectares', 'Área (hectares)')}
                                    {renderInput('rendimento_esperado_kg', 'Rendimento Esperado (kg/ha)')}
                                    {renderInput('preco_venda_kg', 'Preço de Venda (AOA/kg)')}
                                </>
                            )}

                            {renderInput('data_inicio', 'Data de Início', 'date')}
                            {renderInput('data_fim', 'Data de Fim', 'date')}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Descrição do orçamento..."
                            />
                        </div>
                    </div>

                    {/* Receitas */}
                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            Receitas Previstas
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {renderInput('receita_venda_principal', 'Venda Principal')}
                            {renderInput('receita_venda_secundaria', 'Venda Secundária')}
                            {renderInput('receita_subsidios', 'Subsídios')}
                            {renderInput('receita_outras', 'Outras Receitas')}
                        </div>
                    </div>

                    {/* Custos Variáveis */}
                    <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-yellow-600" />
                            Custos Variáveis
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {renderInput('custo_sementes', 'Sementes')}
                            {renderInput('custo_fertilizantes', 'Fertilizantes')}
                            {renderInput('custo_fitosanitarios', 'Fitossanitários')}
                            {renderInput('custo_combustivel', 'Combustível')}
                            {renderInput('custo_mao_obra_temporaria', 'Mão-de-Obra Temporária')}
                            {renderInput('custo_agua_irrigacao', 'Água/Irrigação')}
                            {renderInput('custo_embalagens', 'Embalagens')}
                            {renderInput('custo_transporte', 'Transporte')}
                            {renderInput('custo_outros_variaveis', 'Outros Variáveis')}
                        </div>
                    </div>

                    {/* Custos Fixos */}
                    <div className="mb-6 p-4 bg-red-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Building className="h-5 w-5 text-red-600" />
                            Custos Fixos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {renderInput('custo_mao_obra_permanente', 'Mão-de-Obra Permanente')}
                            {renderInput('custo_arrendamento', 'Arrendamento')}
                            {renderInput('custo_depreciacao_equipamento', 'Depreciação Equipamento')}
                            {renderInput('custo_seguros', 'Seguros')}
                            {renderInput('custo_manutencao', 'Manutenção')}
                            {renderInput('custo_administrativos', 'Custos Administrativos')}
                            {renderInput('custo_outros_fixos', 'Outros Fixos')}
                        </div>
                    </div>

                    {/* Investimentos */}
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-purple-600" />
                            Investimentos
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {renderInput('investimento_equipamento', 'Equipamento')}
                            {renderInput('investimento_infraestrutura', 'Infraestrutura')}
                            {renderInput('investimento_outros', 'Outros Investimentos')}
                        </div>
                    </div>

                    {/* Valores Realizados (se em execução ou concluído) */}
                    {selectedOrcamento && ['em_execucao', 'concluido'].includes(formData.status) && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-blue-600" />
                                Valores Realizados
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {renderInput('realizado_receitas', 'Receitas Realizadas')}
                                {renderInput('realizado_custos_variaveis', 'Custos Variáveis Realizados')}
                                {renderInput('realizado_custos_fixos', 'Custos Fixos Realizados')}
                                {renderInput('realizado_investimentos', 'Investimentos Realizados')}
                            </div>
                        </div>
                    )}

                    {/* Status e Observações */}
                    <div className="mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    {STATUS_OPTIONS.map(status => (
                                        <option key={status.value} value={status.value}>{status.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                            <textarea
                                name="observacoes"
                                value={formData.observacoes}
                                onChange={handleChange}
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Observações adicionais..."
                            />
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                setViewMode('lista');
                            }}
                            className="btn-secondary"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Save size={20} />
                            {loading ? 'Salvando...' : 'Salvar Orçamento'}
                        </button>
                    </div>
                </form>
            )}

            {viewMode === 'consolidacao' && consolidacao && (
                <div>
                    <h2 className="text-2xl font-bold mb-6">Consolidação - Exercício {exercicio}</h2>

                    {/* Cards Resumo */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <p className="text-sm text-gray-600 mb-1">Total Orçamentos</p>
                            <p className="text-3xl font-bold text-gray-900">{consolidacao.total_orcamentos}</p>
                        </div>

                        <div className="bg-green-50 rounded-lg border border-green-200 p-5">
                            <p className="text-sm text-green-700 mb-1">Receitas Previstas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(consolidacao.consolidacao.receitas_previstas)}
                            </p>
                        </div>

                        <div className="bg-red-50 rounded-lg border border-red-200 p-5">
                            <p className="text-sm text-red-700 mb-1">Custos Previstos</p>
                            <p className="text-2xl font-bold text-red-600">
                                {formatCurrency(consolidacao.consolidacao.custos_previstos)}
                            </p>
                        </div>

                        <div className={`${consolidacao.consolidacao.resultado_previsto >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} rounded-lg border p-5`}>
                            <p className={`text-sm mb-1 ${consolidacao.consolidacao.resultado_previsto >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                                Resultado Previsto
                            </p>
                            <p className={`text-2xl font-bold ${consolidacao.consolidacao.resultado_previsto >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {formatCurrency(consolidacao.consolidacao.resultado_previsto)}
                            </p>
                        </div>
                    </div>

                    {/* Gráfico por Tipo */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Distribuição por Tipo</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={Object.keys(consolidacao.por_tipo).map(tipo => ({
                                tipo: TIPOS_ORCAMENTO.find(t => t.value === tipo)?.label || tipo,
                                receitas: consolidacao.por_tipo[tipo].receitas,
                                custos: consolidacao.por_tipo[tipo].custos,
                                resultado: consolidacao.por_tipo[tipo].resultado
                            }))}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="tipo" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
                                <Bar dataKey="custos" fill="#ef4444" name="Custos" />
                                <Bar dataKey="resultado" fill="#3b82f6" name="Resultado" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Tabela Detalhada */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nome</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Receitas</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Custos</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Resultado</th>
                                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Margem %</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {consolidacao.detalhes.map((det) => (
                                    <tr key={det.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{det.nome}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getTipoIcon(det.tipo)}
                                                <span className="text-sm text-gray-600">
                                                    {TIPOS_ORCAMENTO.find(t => t.value === det.tipo)?.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(det.status)}</td>
                                        <td className="px-6 py-4 text-right text-green-600 font-medium">
                                            {formatCurrency(det.analise.total_receitas)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-red-600 font-medium">
                                            {formatCurrency(det.analise.total_custos)}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-bold ${det.analise.resultado_liquido >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {formatCurrency(det.analise.resultado_liquido)}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700">
                                            {det.analise.margem_liquida_percentual?.toFixed(2)}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrcamentosParciais;
