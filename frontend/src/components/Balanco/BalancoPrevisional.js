import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { balancoService, drService } from '../../services/api';
import {
    Save, Calendar, TrendingUp, AlertTriangle, CheckCircle,
    Download, Upload, RefreshCw, BarChart3, Home, Building,
    Wallet, CreditCard, DollarSign, Scale
} from 'lucide-react';
import ExportButtons from '../common/ExportButtons';

const BalancoPrevisional = () => {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    const [exercicio, setExercicio] = useState(currentYear);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [balancos, setBalancos] = useState([]);

    // Estado do formulário
    const [formData, setFormData] = useState({
        // ATIVO IMOBILIZADO
        terrenos_edificios: '',
        equipamento_basico: '',
        equipamento_transporte: '',
        ferramentas_utensilios: '',
        equipamento_administrativo: '',
        outros_ativos_tangiveis: '',
        ativos_intangiveis: '',
        investimentos_financeiros: '',

        // ATIVO CIRCULANTE
        existencias: '',
        clientes: '',
        estado_outros_entes: '',
        outras_contas_receber: '',
        depositos_bancarios: '',
        caixa: '',
        outros_ativos_circulantes: '',

        // PASSIVO - LONGO PRAZO
        emprestimos_longo_prazo: '',
        outras_dividas_longo_prazo: '',

        // PASSIVO - CURTO PRAZO
        fornecedores: '',
        emprestimos_curto_prazo: '',
        estado_outros_entes_passivo: '',
        outras_contas_pagar: '',
        outros_passivos_circulantes: '',

        // CAPITAL PRÓPRIO
        capital_social: '',
        reservas: '',
        resultados_transitados: '',
        resultado_liquido_exercicio: ''
    });

    useEffect(() => {
        loadBalancos();
    }, [exercicio]);

    const loadBalancos = async () => {
        try {
            setLoading(true);
            const data = await balancoService.listBalancos();
            setBalancos(data.balancos || []);

            // Carregar balanço do exercício selecionado se existir
            const balancoExistente = data.balancos?.find(b => b.exercicio === exercicio);
            if (balancoExistente) {
                setFormData(balancoExistente);
            }
        } catch (err) {
            console.error('Erro ao carregar balanços:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const formatCurrency = (value) => {
        if (!value) return 'AOA 0,00';
        const num = parseFloat(value);
        if (isNaN(num)) return 'AOA 0,00';
        return `AOA ${num.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Cálculos automáticos
    const calcularTotais = () => {
        // ATIVO IMOBILIZADO
        const totalAtivoImobilizado = [
            'terrenos_edificios', 'equipamento_basico', 'equipamento_transporte',
            'ferramentas_utensilios', 'equipamento_administrativo', 'outros_ativos_tangiveis',
            'ativos_intangiveis', 'investimentos_financeiros'
        ].reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);

        // ATIVO CIRCULANTE
        const totalAtivoCirculante = [
            'existencias', 'clientes', 'estado_outros_entes', 'outras_contas_receber',
            'depositos_bancarios', 'caixa', 'outros_ativos_circulantes'
        ].reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);

        const totalAtivo = totalAtivoImobilizado + totalAtivoCirculante;

        // PASSIVO - LONGO PRAZO
        const totalPassivoLP = [
            'emprestimos_longo_prazo', 'outras_dividas_longo_prazo'
        ].reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);

        // PASSIVO - CURTO PRAZO
        const totalPassivoCP = [
            'fornecedores', 'emprestimos_curto_prazo', 'estado_outros_entes_passivo',
            'outras_contas_pagar', 'outros_passivos_circulantes'
        ].reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);

        const totalPassivo = totalPassivoLP + totalPassivoCP;

        // CAPITAL PRÓPRIO
        const totalCapitalProprio = [
            'capital_social', 'reservas', 'resultados_transitados', 'resultado_liquido_exercicio'
        ].reduce((sum, field) => sum + (parseFloat(formData[field]) || 0), 0);

        const totalPassivoCapitalProprio = totalPassivo + totalCapitalProprio;

        const equilibrado = Math.abs(totalAtivo - totalPassivoCapitalProprio) < 0.01;

        return {
            totalAtivoImobilizado,
            totalAtivoCirculante,
            totalAtivo,
            totalPassivoLP,
            totalPassivoCP,
            totalPassivo,
            totalCapitalProprio,
            totalPassivoCapitalProprio,
            equilibrado,
            diferenca: totalAtivo - totalPassivoCapitalProprio
        };
    };

    const totais = calcularTotais();

    const handleImportarResultado = async () => {
        try {
            setLoading(true);
            setError('');

            const drs = await drService.listDRs();
            const drExercicio = drs.demonstracoes?.find(dr => dr.exercicio === exercicio);

            if (!drExercicio) {
                setError(`Nenhuma DR encontrada para o exercício ${exercicio}`);
                return;
            }

            setFormData(prev => ({
                ...prev,
                resultado_liquido_exercicio: drExercicio.resultado_liquido || 0
            }));

            setSuccess(`Resultado líquido importado: ${formatCurrency(drExercicio.resultado_liquido)}`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            console.error('Erro ao importar resultado:', err);
            setError(err.response?.data?.error || 'Erro ao importar resultado da DR');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!totais.equilibrado) {
            setError('O Balanço não está equilibrado! Ativo deve ser igual a Passivo + Capital Próprio');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const data = await balancoService.saveBalanco({
                exercicio,
                ...formData
            });

            setSuccess('Balanço Previsional salvo com sucesso!');
            setTimeout(() => setSuccess(''), 5000);

            loadBalancos();
        } catch (err) {
            console.error('Erro ao salvar balanço:', err);
            setError(err.response?.data?.error || 'Erro ao salvar balanço');
        } finally {
            setLoading(false);
        }
    };

    const handleNovoBalanco = () => {
        setFormData({
            terrenos_edificios: '',
            equipamento_basico: '',
            equipamento_transporte: '',
            ferramentas_utensilios: '',
            equipamento_administrativo: '',
            outros_ativos_tangiveis: '',
            ativos_intangiveis: '',
            investimentos_financeiros: '',
            existencias: '',
            clientes: '',
            estado_outros_entes: '',
            outras_contas_receber: '',
            depositos_bancarios: '',
            caixa: '',
            outros_ativos_circulantes: '',
            emprestimos_longo_prazo: '',
            outras_dividas_longo_prazo: '',
            fornecedores: '',
            emprestimos_curto_prazo: '',
            estado_outros_entes_passivo: '',
            outras_contas_pagar: '',
            outros_passivos_circulantes: '',
            capital_social: '',
            reservas: '',
            resultados_transitados: '',
            resultado_liquido_exercicio: ''
        });
        setError('');
        setSuccess('');
    };

    const renderInput = (name, label, icon) => (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center gap-2">
                    {icon}
                    {label}
                </div>
            </label>
            <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0.00"
            />
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Balanço Previsional
                        </h1>
                        <p className="text-gray-600">
                            PGC-AO - Plano Geral de Contabilidade de Angola
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
                            onClick={handleNovoBalanco}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Novo
                        </button>
                        <ExportButtons exercicio={exercicio} tipo="balanco" />
                    </div>
                </div>

                {/* Status de Equilíbrio */}
                <div className={`p-4 rounded-lg border-2 ${
                    totais.equilibrado
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {totais.equilibrado ? (
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                                <p className="font-semibold">
                                    {totais.equilibrado ? 'Balanço Equilibrado' : 'Balanço Não Equilibrado'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    {totais.equilibrado
                                        ? 'Ativo = Passivo + Capital Próprio'
                                        : `Diferença: ${formatCurrency(Math.abs(totais.diferenca))}`
                                    }
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600">Total Ativo</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(totais.totalAtivo)}
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

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* ATIVO */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Building className="h-6 w-6 text-blue-600" />
                                ATIVO
                            </h2>

                            {/* Ativo Imobilizado */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Home className="h-5 w-5 text-gray-600" />
                                    Ativo Imobilizado
                                </h3>
                                {renderInput('terrenos_edificios', 'Terrenos e Edifícios', <Building className="h-4 w-4 text-gray-500" />)}
                                {renderInput('equipamento_basico', 'Equipamento Básico', <BarChart3 className="h-4 w-4 text-gray-500" />)}
                                {renderInput('equipamento_transporte', 'Equipamento de Transporte', <CreditCard className="h-4 w-4 text-gray-500" />)}
                                {renderInput('ferramentas_utensilios', 'Ferramentas e Utensílios', <Wallet className="h-4 w-4 text-gray-500" />)}
                                {renderInput('equipamento_administrativo', 'Equipamento Administrativo', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outros_ativos_tangiveis', 'Outros Ativos Tangíveis', <Building className="h-4 w-4 text-gray-500" />)}
                                {renderInput('ativos_intangiveis', 'Ativos Intangíveis', <TrendingUp className="h-4 w-4 text-gray-500" />)}
                                {renderInput('investimentos_financeiros', 'Investimentos Financeiros', <DollarSign className="h-4 w-4 text-gray-500" />)}

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Total Ativo Imobilizado</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {formatCurrency(totais.totalAtivoImobilizado)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Ativo Circulante */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-gray-600" />
                                    Ativo Circulante
                                </h3>
                                {renderInput('existencias', 'Existências', <BarChart3 className="h-4 w-4 text-gray-500" />)}
                                {renderInput('clientes', 'Clientes', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('estado_outros_entes', 'Estado e Outros Entes Públicos', <Building className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outras_contas_receber', 'Outras Contas a Receber', <CreditCard className="h-4 w-4 text-gray-500" />)}
                                {renderInput('depositos_bancarios', 'Depósitos Bancários', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('caixa', 'Caixa', <Wallet className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outros_ativos_circulantes', 'Outros Ativos Circulantes', <TrendingUp className="h-4 w-4 text-gray-500" />)}

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Total Ativo Circulante</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {formatCurrency(totais.totalAtivoCirculante)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t-2 border-blue-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">TOTAL ATIVO</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {formatCurrency(totais.totalAtivo)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PASSIVO + CAPITAL PRÓPRIO */}
                    <div className="space-y-6">
                        {/* PASSIVO */}
                        <div className="card p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="h-6 w-6 text-red-600" />
                                PASSIVO
                            </h2>

                            {/* Passivo Longo Prazo */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Passivo de Longo Prazo
                                </h3>
                                {renderInput('emprestimos_longo_prazo', 'Empréstimos de Longo Prazo', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outras_dividas_longo_prazo', 'Outras Dívidas de Longo Prazo', <CreditCard className="h-4 w-4 text-gray-500" />)}

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Total Passivo LP</span>
                                        <span className="text-lg font-bold text-red-600">
                                            {formatCurrency(totais.totalPassivoLP)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Passivo Curto Prazo */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Passivo de Curto Prazo
                                </h3>
                                {renderInput('fornecedores', 'Fornecedores', <Building className="h-4 w-4 text-gray-500" />)}
                                {renderInput('emprestimos_curto_prazo', 'Empréstimos de Curto Prazo', <DollarSign className="h-4 w-4 text-gray-500" />)}
                                {renderInput('estado_outros_entes_passivo', 'Estado e Outros Entes Públicos', <Building className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outras_contas_pagar', 'Outras Contas a Pagar', <CreditCard className="h-4 w-4 text-gray-500" />)}
                                {renderInput('outros_passivos_circulantes', 'Outros Passivos Circulantes', <Wallet className="h-4 w-4 text-gray-500" />)}

                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-700">Total Passivo CP</span>
                                        <span className="text-lg font-bold text-red-600">
                                            {formatCurrency(totais.totalPassivoCP)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t-2 border-red-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">TOTAL PASSIVO</span>
                                    <span className="text-2xl font-bold text-red-600">
                                        {formatCurrency(totais.totalPassivo)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CAPITAL PRÓPRIO */}
                        <div className="card p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Scale className="h-6 w-6 text-green-600" />
                                    CAPITAL PRÓPRIO
                                </h2>
                                <button
                                    type="button"
                                    onClick={handleImportarResultado}
                                    className="btn-secondary text-sm flex items-center gap-2"
                                    disabled={loading}
                                >
                                    <Upload className="h-4 w-4" />
                                    Importar Resultado
                                </button>
                            </div>

                            {renderInput('capital_social', 'Capital Social', <DollarSign className="h-4 w-4 text-gray-500" />)}
                            {renderInput('reservas', 'Reservas', <Wallet className="h-4 w-4 text-gray-500" />)}
                            {renderInput('resultados_transitados', 'Resultados Transitados', <TrendingUp className="h-4 w-4 text-gray-500" />)}
                            {renderInput('resultado_liquido_exercicio', 'Resultado Líquido do Exercício', <CheckCircle className="h-4 w-4 text-gray-500" />)}

                            <div className="mt-6 pt-6 border-t-2 border-green-300">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">TOTAL CAPITAL PRÓPRIO</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(totais.totalCapitalProprio)}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t-2 border-purple-300 bg-purple-50 -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-900">
                                        PASSIVO + CAPITAL PRÓPRIO
                                    </span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        {formatCurrency(totais.totalPassivoCapitalProprio)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botões de Ação */}
                <div className="mt-6 flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        <p>Exercício: {exercicio}</p>
                        <p>Última atualização: {new Date().toLocaleDateString('pt-PT')}</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Exportar
                        </button>
                        <button
                            type="submit"
                            className="btn-primary flex items-center gap-2"
                            disabled={loading || !totais.equilibrado}
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'A guardar...' : 'Guardar Balanço'}
                        </button>
                    </div>
                </div>
            </form>

            {/* Histórico de Balanços */}
            {balancos.length > 0 && (
                <div className="mt-8 card p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gray-600" />
                        Histórico de Balanços
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Exercício</th>
                                    <th>Total Ativo</th>
                                    <th>Total Passivo</th>
                                    <th>Capital Próprio</th>
                                    <th>Equilibrado</th>
                                    <th>Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {balancos.map((balanco) => {
                                    const totaisBalanco = {
                                        ativo: parseFloat(balanco.total_ativo) || 0,
                                        passivo: parseFloat(balanco.total_passivo) || 0,
                                        capitalProprio: parseFloat(balanco.total_capital_proprio) || 0
                                    };
                                    const equilibradoBalanco = Math.abs(
                                        totaisBalanco.ativo - (totaisBalanco.passivo + totaisBalanco.capitalProprio)
                                    ) < 0.01;

                                    return (
                                        <tr key={balanco.id}>
                                            <td className="font-semibold">{balanco.exercicio}</td>
                                            <td>{formatCurrency(totaisBalanco.ativo)}</td>
                                            <td>{formatCurrency(totaisBalanco.passivo)}</td>
                                            <td>{formatCurrency(totaisBalanco.capitalProprio)}</td>
                                            <td>
                                                {equilibradoBalanco ? (
                                                    <span className="badge badge-success">Sim</span>
                                                ) : (
                                                    <span className="badge badge-error">Não</span>
                                                )}
                                            </td>
                                            <td>{new Date(balanco.created_at).toLocaleDateString('pt-PT')}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BalancoPrevisional;
