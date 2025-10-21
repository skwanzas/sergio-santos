import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentoService } from '../../services/api';
import {
    ArrowLeft,
    Upload,
    FileText,
    CheckCircle,
    XCircle,
    AlertCircle,
    Eye,
    Trash2,
    RefreshCw,
    Download
} from 'lucide-react';

const UploadDocumentos = () => {
    const navigate = useNavigate();
    const [documentos, setDocumentos] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [viewDocument, setViewDocument] = useState(null);

    useEffect(() => {
        loadDocumentos();
    }, []);

    const loadDocumentos = async () => {
        try {
            const data = await documentoService.list();
            setDocumentos(data.documentos);
        } catch (err) {
            console.error('Erro ao carregar documentos:', err);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (file) => {
        // Validar tipo de ficheiro
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
        if (!allowedTypes.includes(file.type)) {
            setError('Tipo de ficheiro não permitido. Use PDF, JPG ou PNG.');
            return;
        }

        // Validar tamanho (10MB)
        if (file.size > 10485760) {
            setError('Ficheiro muito grande. Máximo: 10MB');
            return;
        }

        setSelectedFile(file);
        setError('');
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const data = await documentoService.upload(selectedFile);
            setSuccess('Documento carregado com sucesso!');
            setSelectedFile(null);

            // Processar OCR automaticamente
            await handleProcessOCR(data.documento.id);

            // Recarregar lista
            await loadDocumentos();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao carregar documento');
        } finally {
            setUploading(false);
        }
    };

    const handleProcessOCR = async (documentoId) => {
        setProcessing(true);
        try {
            const data = await documentoService.processOCR(documentoId);
            setSuccess('Documento processado e classificado com sucesso!');
            await loadDocumentos();
            return data;
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao processar OCR');
        } finally {
            setProcessing(false);
        }
    };

    const handleApplyDocument = async (documentoId) => {
        try {
            await documentoService.apply(documentoId);
            setSuccess('Documento aplicado ao Balanço de Execução!');
            await loadDocumentos();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao aplicar documento');
        }
    };

    const handleDeleteDocument = async (documentoId) => {
        if (!window.confirm('Tem certeza que deseja eliminar este documento?')) {
            return;
        }

        try {
            await documentoService.deleteDocumento(documentoId);
            setSuccess('Documento eliminado com sucesso!');
            await loadDocumentos();
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao eliminar documento');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pendente: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, text: 'Pendente' },
            processado: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, text: 'Processado' },
            validado: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Validado' },
            rejeitado: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejeitado' }
        };

        const badge = badges[status] || badges.pendente;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                <Icon className="w-4 h-4 mr-1" />
                {badge.text}
            </span>
        );
    };

    const getConfiancaBadge = (confianca) => {
        const badges = {
            alta: 'bg-green-100 text-green-800',
            media: 'bg-yellow-100 text-yellow-800',
            baixa: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${badges[confianca] || badges.baixa}`}>
                {confianca ? confianca.toUpperCase() : 'N/A'}
            </span>
        );
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
                                    Gestão de Documentos
                                </h1>
                                <p className="text-sm text-gray-600">
                                    Upload e classificação automática com OCR e IA
                                </p>
                            </div>
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

                {/* Upload Area */}
                <div className="card mb-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                        Carregar Novo Documento
                    </h2>

                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            dragActive
                                ? 'border-primary bg-primary-50'
                                : 'border-gray-300 hover:border-primary'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />

                        {!selectedFile ? (
                            <>
                                <p className="text-lg font-medium text-gray-700 mb-2">
                                    Arraste o ficheiro aqui ou clique para selecionar
                                </p>
                                <p className="text-sm text-gray-500 mb-4">
                                    Formatos aceites: PDF, JPG, PNG (máx. 10MB)
                                </p>
                                <label className="btn-primary cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                                    />
                                    Selecionar Ficheiro
                                </label>
                            </>
                        ) : (
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <FileText className="w-8 h-8 text-primary" />
                                        <div className="text-left">
                                            <p className="font-medium text-gray-800">
                                                {selectedFile.name}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="btn-primary"
                                        >
                                            {uploading ? (
                                                <>
                                                    <div className="spinner h-4 w-4 mr-2"></div>
                                                    A carregar...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Carregar
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => setSelectedFile(null)}
                                            className="btn-outline"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {processing && (
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <div className="spinner h-5 w-5 mr-3 border-blue-600"></div>
                                <div>
                                    <p className="font-medium text-blue-900">
                                        A processar documento...
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        A extrair texto (OCR) e a classificar com IA
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Lista de Documentos */}
                <div className="card">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            Documentos Processados
                        </h2>
                        <button
                            onClick={loadDocumentos}
                            className="btn-outline flex items-center"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Actualizar
                        </button>
                    </div>

                    {documentos.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">
                                Nenhum documento carregado ainda
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead className="table-header">
                                    <tr>
                                        <th className="table-header-cell">Documento</th>
                                        <th className="table-header-cell">Status</th>
                                        <th className="table-header-cell">Tipo</th>
                                        <th className="table-header-cell">Categoria</th>
                                        <th className="table-header-cell">Valor</th>
                                        <th className="table-header-cell">Confiança</th>
                                        <th className="table-header-cell">Data</th>
                                        <th className="table-header-cell">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="table-body">
                                    {documentos.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-gray-50">
                                            <td className="table-cell">
                                                <div className="flex items-center">
                                                    <FileText className="w-5 h-5 text-gray-400 mr-2" />
                                                    <div>
                                                        <p className="font-medium text-gray-800 text-sm">
                                                            {doc.nome_ficheiro}
                                                        </p>
                                                        {doc.fornecedor_cliente && (
                                                            <p className="text-xs text-gray-500">
                                                                {doc.fornecedor_cliente}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                {getStatusBadge(doc.status)}
                                            </td>
                                            <td className="table-cell">
                                                <span className="text-sm text-gray-600 capitalize">
                                                    {doc.tipo_documento || '-'}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <span className="badge badge-info">
                                                    {doc.categoria_sugerida || '-'}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                {doc.valor_total ? (
                                                    <span className="font-medium text-gray-800">
                                                        {new Intl.NumberFormat('pt-AO', {
                                                            style: 'currency',
                                                            currency: 'AOA'
                                                        }).format(doc.valor_total)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="table-cell">
                                                {getConfiancaBadge(doc.confianca)}
                                            </td>
                                            <td className="table-cell">
                                                <span className="text-sm text-gray-600">
                                                    {new Date(doc.created_at).toLocaleDateString('pt-PT')}
                                                </span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="flex space-x-2">
                                                    {doc.status === 'processado' && !doc.aplicado && (
                                                        <button
                                                            onClick={() => handleApplyDocument(doc.id)}
                                                            className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Aplicar ao Balanço"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {doc.status === 'pendente' && (
                                                        <button
                                                            onClick={() => handleProcessOCR(doc.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="Processar OCR"
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => setViewDocument(doc)}
                                                        className="p-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                                        title="Ver Detalhes"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal de Detalhes */}
                {viewDocument && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Detalhes do Documento
                                    </h3>
                                    <button
                                        onClick={() => setViewDocument(null)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Nome do Ficheiro
                                        </label>
                                        <p className="text-gray-900">{viewDocument.nome_ficheiro}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Status
                                            </label>
                                            <div className="mt-1">
                                                {getStatusBadge(viewDocument.status)}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Tipo de Documento
                                            </label>
                                            <p className="text-gray-900 capitalize">
                                                {viewDocument.tipo_documento || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {viewDocument.numero_documento && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Número do Documento
                                            </label>
                                            <p className="text-gray-900">{viewDocument.numero_documento}</p>
                                        </div>
                                    )}

                                    {viewDocument.fornecedor_cliente && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Fornecedor/Cliente
                                            </label>
                                            <p className="text-gray-900">{viewDocument.fornecedor_cliente}</p>
                                        </div>
                                    )}

                                    {viewDocument.descricao && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Descrição
                                            </label>
                                            <p className="text-gray-900">{viewDocument.descricao}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Categoria PGC-AO
                                            </label>
                                            <p className="text-gray-900">
                                                {viewDocument.categoria_sugerida || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Tipo de Movimento
                                            </label>
                                            <p className="text-gray-900 capitalize">
                                                {viewDocument.tipo_movimento || '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {viewDocument.valor_total && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Valor Total
                                            </label>
                                            <p className="text-gray-900 text-lg font-semibold">
                                                {new Intl.NumberFormat('pt-AO', {
                                                    style: 'currency',
                                                    currency: 'AOA'
                                                }).format(viewDocument.valor_total)}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-medium text-gray-700">
                                            Confiança da Classificação
                                        </label>
                                        <div className="mt-1">
                                            {getConfiancaBadge(viewDocument.confianca)}
                                        </div>
                                    </div>

                                    {viewDocument.observacoes && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-700">
                                                Observações
                                            </label>
                                            <p className="text-gray-900 text-sm bg-gray-50 p-3 rounded">
                                                {viewDocument.observacoes}
                                            </p>
                                        </div>
                                    )}

                                    <div className="pt-4 border-t">
                                        <p className="text-xs text-gray-500">
                                            Carregado em {new Date(viewDocument.created_at).toLocaleString('pt-PT')}
                                            {viewDocument.user_nome && ` por ${viewDocument.user_nome}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UploadDocumentos;
