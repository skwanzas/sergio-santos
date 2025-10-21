import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { drService } from '../../services/api';
import { ArrowLeft, Save, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import ExportButtons from '../common/ExportButtons';

const DemonstracaoResultados = () => {
    const navigate = useNavigate();
    const [exercicio, setExercicio] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Estado dos Proveitos (Classe 7)
    const [proveitos, setProveitos] = useState({
        vendasOleoSesamo: 0,
        vendasTortaSesamo: 0,
        vendasFeijaoGuandu: 0,
        vendasCarneOvina: 0,
        vendasCarneSuina: 0,
        vendasLinguicaPorco: 0,
        vendasPresuntoBacon: 0,
        vendasLinguicaCordeiro: 0,
        vendasCarneOvinaProc: 0,
        vendasLeiteSesamo: 0,
        vendasQueijoSesamo: 0,
        vendasQueijoOvelha: 0,
        vendasQueijoCordeiro: 0,
        vendasMel: 0,
        servicosAgricolas: 0,
        servicosTecnicos: 0,
        subsidiosAgricultura: 0,
        subsidiosPecuaria: 0,
        jurosObtidos: 0
    });

    // Estado dos Custos (Classe 6)
    const [custos, setCustos] = useState({
        materiasPrimas: 0,
        combustiveis: 0,
        embalagens: 0,
        salMineral: 0,
        medicamentos: 0,
        condimentos: 0,
        materiaisDiversos: 0,
        subcontratos: 0,
        servicosEspecializados: 0,
        aguaFluidos: 0,
        deslocacoes: 0,
        seguros: 0,
        remuneracoesPessoal: 0,
        encargosRemuneracoes: 0,
        amortizacoes: 0,
        jurosSuportados: 0
    });

    // Carregar DR existente ao mudar exercício
    useEffect(() => {
        if (exercicio) {
            loadDR();
        }
    }, [exercicio]);

    const loadDR = async () => {
        try {
            const data = await drService.getDR(exercicio);
            if (data.dr) {
                // Mapear campos da BD para o estado
                setProveitos({
                    vendasOleoSesamo: data.dr.vendas_oleo_sesamo || 0,
                    vendasTortaSesamo: data.dr.vendas_torta_sesamo || 0,
                    vendasFeijaoGuandu: data.dr.vendas_feijao_guandu || 0,
                    vendasCarneOvina: data.dr.vendas_carne_ovina || 0,
                    vendasCarneSuina: data.dr.vendas_carne_suina || 0,
                    vendasLinguicaPorco: data.dr.vendas_linguica_porco || 0,
                    vendasPresuntoBacon: data.dr.vendas_presunto_bacon || 0,
                    vendasLinguicaCordeiro: data.dr.vendas_linguica_cordeiro || 0,
                    vendasCarneOvinaProc: data.dr.vendas_carne_ovina_proc || 0,
                    vendasLeiteSesamo: data.dr.vendas_leite_sesamo || 0,
                    vendasQueijoSesamo: data.dr.vendas_queijo_sesamo || 0,
                    vendasQueijoOvelha: data.dr.vendas_queijo_ovelha || 0,
                    vendasQueijoCordeiro: data.dr.vendas_queijo_cordeiro || 0,
                    vendasMel: data.dr.vendas_mel || 0,
                    servicosAgricolas: data.dr.servicos_agricolas || 0,
                    servicosTecnicos: data.dr.servicos_tecnicos || 0,
                    subsidiosAgricultura: data.dr.subsidios_agricultura || 0,
                    subsidiosPecuaria: data.dr.subsidios_pecuaria || 0,
                    jurosObtidos: data.dr.juros_obtidos || 0
                });

                setCustos({
                    materiasPrimas: data.dr.materias_primas || 0,
                    combustiveis: data.dr.combustiveis || 0,
                    embalagens: data.dr.embalagens || 0,
                    salMineral: data.dr.sal_mineral || 0,
                    medicamentos: data.dr.medicamentos || 0,
                    condimentos: data.dr.condimentos || 0,
                    materiaisDiversos: data.dr.materiais_diversos || 0,
                    subcontratos: data.dr.subcontratos || 0,
                    servicosEspecializados: data.dr.servicos_especializados || 0,
                    aguaFluidos: data.dr.agua_fluidos || 0,
                    deslocacoes: data.dr.deslocacoes || 0,
                    seguros: data.dr.seguros || 0,
                    remuneracoesPessoal: data.dr.remuneracoes_pessoal || 0,
                    encargosRemuneracoes: data.dr.encargos_remuneracoes || 0,
                    amortizacoes: data.dr.amortizacoes || 0,
                    jurosSuportados: data.dr.juros_suportados || 0
                });
            }
        } catch (err) {
            // DR não existe ainda, manter valores zero
            if (err.response?.status !== 404) {
                console.error('Erro ao carregar DR:', err);
            }
        }
    };

    const handleProveitosChange = (field, value) => {
        setProveitos(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    const handleCustosChange = (field, value) => {
        setCustos(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    // Calcular totais
    const totalProveitos = Object.values(proveitos).reduce((sum, val) => sum + val, 0);
    const totalCustos = Object.values(custos).reduce((sum, val) => sum + val, 0);
    const resultadoOperacional = totalProveitos - totalCustos;
    const impostoIndustrial = Math.max(0, resultadoOperacional * 0.25);
    const resultadoLiquido = resultadoOperacional - impostoIndustrial;
    const margemLiquida = totalProveitos > 0 ? (resultadoLiquido / totalProveitos) * 100 : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await drService.saveDR(exercicio, proveitos, custos);
            setSuccess('Demonstração de Resultados guardada com sucesso!');

            // Scroll para o topo
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao guardar Demonstração de Resultados');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-AO', {
            style: 'currency',
            currency: 'AOA',
            minimumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">
                                    Demonstração de Resultados
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Proveitos e Custos do Exercício
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">
                                Exercício:
                            </label>
                            <select
                                value={exercicio}
                                onChange={(e) => setExercicio(parseInt(e.target.value))}
                                className="input-field w-32"
                            >
                                {[2024, 2025, 2026, 2027, 2028].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <ExportButtons exercicio={exercicio} tipo="dr" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Mensagens */}
                {error && (
                    <div className="alert-error mb-6 flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="alert-success mb-6">
                        {success}
                    </div>
                )}

                {/* Resumo Financeiro */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-800 mb-1">
                                    Total Proveitos
                                </p>
                                <p className="text-xl font-bold text-green-900">
                                    {formatCurrency(totalProveitos)}
                                </p>
                            </div>
                            <TrendingUp className="w-8 h-8 text-green-600" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-800 mb-1">
                                    Total Custos
                                </p>
                                <p className="text-xl font-bold text-red-900">
                                    {formatCurrency(totalCustos)}
                                </p>
                            </div>
                            <TrendingDown className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className={`card bg-gradient-to-br ${
                        resultadoLiquido >= 0
                            ? 'from-blue-50 to-blue-100 border-blue-200'
                            : 'from-orange-50 to-orange-100 border-orange-200'
                    }`}>
                        <div>
                            <p className={`text-sm font-medium mb-1 ${
                                resultadoLiquido >= 0 ? 'text-blue-800' : 'text-orange-800'
                            }`}>
                                Resultado Líquido
                            </p>
                            <p className={`text-xl font-bold ${
                                resultadoLiquido >= 0 ? 'text-blue-900' : 'text-orange-900'
                            }`}>
                                {formatCurrency(resultadoLiquido)}
                            </p>
                            <p className={`text-xs mt-1 ${
                                resultadoLiquido >= 0 ? 'text-blue-700' : 'text-orange-700'
                            }`}>
                                Imposto: {formatCurrency(impostoIndustrial)}
                            </p>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                        <div>
                            <p className="text-sm font-medium text-purple-800 mb-1">
                                Margem Líquida
                            </p>
                            <p className="text-xl font-bold text-purple-900">
                                {margemLiquida.toFixed(2)}%
                            </p>
                            <p className="text-xs text-purple-700 mt-1">
                                Objetivo: 50%
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* PROVEITOS (Classe 7) */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title text-green-700 flex items-center">
                                    <DollarSign className="w-6 h-6 mr-2" />
                                    Proveitos (Classe 7)
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* Vendas de Produtos */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Vendas de Produtos Agrícolas
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Óleo de Sésamo (712)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasOleoSesamo}
                                                onChange={(e) => handleProveitosChange('vendasOleoSesamo', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Torta de Sésamo (712)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasTortaSesamo}
                                                onChange={(e) => handleProveitosChange('vendasTortaSesamo', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Feijão Guandu (714)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasFeijaoGuandu}
                                                onChange={(e) => handleProveitosChange('vendasFeijaoGuandu', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Mel (718)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasMel}
                                                onChange={(e) => handleProveitosChange('vendasMel', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Vendas de Produtos Pecuários */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Vendas de Produtos Pecuários
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Carne Ovina (715)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasCarneOvina}
                                                onChange={(e) => handleProveitosChange('vendasCarneOvina', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Carne Suína (715)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasCarneSuina}
                                                onChange={(e) => handleProveitosChange('vendasCarneSuina', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Linguiça de Porco (7151)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasLinguicaPorco}
                                                onChange={(e) => handleProveitosChange('vendasLinguicaPorco', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Presunto e Bacon (7152)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasPresuntoBacon}
                                                onChange={(e) => handleProveitosChange('vendasPresuntoBacon', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Linguiça de Cordeiro (7153)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasLinguicaCordeiro}
                                                onChange={(e) => handleProveitosChange('vendasLinguicaCordeiro', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Laticínios */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Laticínios
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Leite de Sésamo (716)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasLeiteSesamo}
                                                onChange={(e) => handleProveitosChange('vendasLeiteSesamo', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Queijo de Sésamo (7171)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasQueijoSesamo}
                                                onChange={(e) => handleProveitosChange('vendasQueijoSesamo', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Queijo de Ovelha (7172)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasQueijoOvelha}
                                                onChange={(e) => handleProveitosChange('vendasQueijoOvelha', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Queijo de Cordeiro (7172)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.vendasQueijoCordeiro}
                                                onChange={(e) => handleProveitosChange('vendasQueijoCordeiro', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Outros Proveitos */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Serviços e Outros
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Serviços Agrícolas (721)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.servicosAgricolas}
                                                onChange={(e) => handleProveitosChange('servicosAgricolas', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Serviços Técnicos (722)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.servicosTecnicos}
                                                onChange={(e) => handleProveitosChange('servicosTecnicos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Subsídios à Agricultura (741)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.subsidiosAgricultura}
                                                onChange={(e) => handleProveitosChange('subsidiosAgricultura', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Subsídios à Pecuária (742)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.subsidiosPecuaria}
                                                onChange={(e) => handleProveitosChange('subsidiosPecuaria', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Juros Obtidos (781)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={proveitos.jurosObtidos}
                                                onChange={(e) => handleProveitosChange('jurosObtidos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Proveitos */}
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-green-800">
                                            TOTAL PROVEITOS
                                        </span>
                                        <span className="text-xl font-bold text-green-900">
                                            {formatCurrency(totalProveitos)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* CUSTOS (Classe 6) */}
                        <div className="card">
                            <div className="card-header">
                                <h2 className="card-title text-red-700 flex items-center">
                                    <TrendingDown className="w-6 h-6 mr-2" />
                                    Custos (Classe 6)
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* Custos com Materiais */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Custos com Materiais
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Matérias-Primas (611)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.materiasPrimas}
                                                onChange={(e) => handleCustosChange('materiasPrimas', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Combustíveis (613)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.combustiveis}
                                                onChange={(e) => handleCustosChange('combustiveis', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Embalagens (614)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.embalagens}
                                                onChange={(e) => handleCustosChange('embalagens', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Sal Mineral (615)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.salMineral}
                                                onChange={(e) => handleCustosChange('salMineral', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Medicamentos (616)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.medicamentos}
                                                onChange={(e) => handleCustosChange('medicamentos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Condimentos (617)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.condimentos}
                                                onChange={(e) => handleCustosChange('condimentos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Materiais Diversos (618)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.materiaisDiversos}
                                                onChange={(e) => handleCustosChange('materiaisDiversos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custos com Serviços */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Custos com Serviços
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Subcontratos (621)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.subcontratos}
                                                onChange={(e) => handleCustosChange('subcontratos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Serviços Especializados (622)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.servicosEspecializados}
                                                onChange={(e) => handleCustosChange('servicosEspecializados', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Água e Fluidos (624)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.aguaFluidos}
                                                onChange={(e) => handleCustosChange('aguaFluidos', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Deslocações (625)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.deslocacoes}
                                                onChange={(e) => handleCustosChange('deslocacoes', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Seguros (628)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.seguros}
                                                onChange={(e) => handleCustosChange('seguros', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Custos com Pessoal */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Custos com Pessoal
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Remunerações do Pessoal (632)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.remuneracoesPessoal}
                                                onChange={(e) => handleCustosChange('remuneracoesPessoal', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Encargos sobre Remunerações (635)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.encargosRemuneracoes}
                                                onChange={(e) => handleCustosChange('encargosRemuneracoes', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Outros Custos */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                                        Outros Custos
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="label-field text-xs">
                                                Amortizações (642)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.amortizacoes}
                                                onChange={(e) => handleCustosChange('amortizacoes', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="label-field text-xs">
                                                Juros Suportados (681)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={custos.jurosSuportados}
                                                onChange={(e) => handleCustosChange('jurosSuportados', e.target.value)}
                                                className="input-field text-sm"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Total Custos */}
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-red-800">
                                            TOTAL CUSTOS
                                        </span>
                                        <span className="text-xl font-bold text-red-900">
                                            {formatCurrency(totalCustos)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resumo de Resultados */}
                    <div className="card mt-6 bg-gradient-to-br from-blue-50 to-purple-50">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">
                            Resumo de Resultados
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <span className="font-medium text-gray-700">
                                    Resultado Operacional
                                </span>
                                <span className={`text-lg font-bold ${
                                    resultadoOperacional >= 0 ? 'text-green-700' : 'text-red-700'
                                }`}>
                                    {formatCurrency(resultadoOperacional)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                                <span className="font-medium text-gray-700">
                                    Imposto Industrial (25%)
                                </span>
                                <span className="text-lg font-bold text-gray-700">
                                    {formatCurrency(impostoIndustrial)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border-2 border-blue-300">
                                <span className="font-bold text-blue-900">
                                    RESULTADO LÍQUIDO
                                </span>
                                <span className={`text-2xl font-bold ${
                                    resultadoLiquido >= 0 ? 'text-blue-900' : 'text-red-900'
                                }`}>
                                    {formatCurrency(resultadoLiquido)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Botão Guardar */}
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="btn-outline"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="spinner h-5 w-5 mr-2"></div>
                                    A guardar...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-2" />
                                    Guardar Demonstração de Resultados
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default DemonstracaoResultados;
