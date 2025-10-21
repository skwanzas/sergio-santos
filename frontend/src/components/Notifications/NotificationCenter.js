import React, { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, Filter, X, AlertCircle } from 'lucide-react';
import { notificacoesService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationCenter = () => {
    const [notificacoes, setNotificacoes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState('');
    const [filtroLida, setFiltroLida] = useState('');
    const [naoLidas, setNaoLidas] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
    }, [filtroTipo, filtroLida]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const filters = { limit: 100 };
            if (filtroTipo) filters.tipo = filtroTipo;
            if (filtroLida !== '') filters.lida = filtroLida;

            const data = await notificacoesService.listNotificacoes(filters);
            setNotificacoes(data.notificacoes || []);
            setNaoLidas(data.nao_lidas || 0);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarcarComoLida = async (id) => {
        try {
            await notificacoesService.marcarComoLida(id);
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const handleMarcarTodasComoLidas = async () => {
        try {
            await notificacoesService.marcarTodasComoLidas();
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificacoesService.deleteNotificacao(id);
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
        }
    };

    const handleDeletarTodasLidas = async () => {
        if (!window.confirm('Deletar todas as notificações lidas?')) return;
        try {
            await notificacoesService.deletarTodasLidas();
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao deletar todas lidas:', error);
        }
    };

    const handleNotificationClick = async (notificacao) => {
        if (!notificacao.lida) {
            await notificacoesService.marcarComoLida(notificacao.id);
        }
        if (notificacao.link_acao) {
            navigate(notificacao.link_acao);
        }
    };

    const getIconByTipo = (tipo) => {
        const icons = {
            info: '💬',
            warning: '⚠️',
            success: '✅',
            error: '❌',
            alert: '🔔'
        };
        return icons[tipo] || '📬';
    };

    const getColorByTipo = (tipo) => {
        const colors = {
            info: 'bg-blue-50 border-blue-200',
            warning: 'bg-yellow-50 border-yellow-200',
            success: 'bg-green-50 border-green-200',
            error: 'bg-red-50 border-red-200',
            alert: 'bg-purple-50 border-purple-200'
        };
        return colors[tipo] || 'bg-gray-50 border-gray-200';
    };

    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        if (seconds < 60) return 'Agora mesmo';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} min atrás`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atrás`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d atrás`;
        return new Date(date).toLocaleDateString('pt-PT');
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Notificações</h1>
                        <p className="text-gray-600">{naoLidas} não lida{naoLidas !== 1 ? 's' : ''} de {notificacoes.length} total</p>
                    </div>
                    <div className="flex gap-3">
                        {naoLidas > 0 && (
                            <button onClick={handleMarcarTodasComoLidas} className="btn-secondary flex items-center gap-2">
                                <CheckCheck size={20} />
                                Marcar Todas Lidas
                            </button>
                        )}
                        <button onClick={handleDeletarTodasLidas} className="btn-secondary flex items-center gap-2">
                            <Trash2 size={20} />
                            Limpar Lidas
                        </button>
                    </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-4 mb-4 p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-gray-500" />
                        <select
                            value={filtroTipo}
                            onChange={(e) => setFiltroTipo(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Todos os tipos</option>
                            <option value="info">Informação</option>
                            <option value="warning">Aviso</option>
                            <option value="success">Sucesso</option>
                            <option value="error">Erro</option>
                            <option value="alert">Alerta</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={filtroLida}
                            onChange={(e) => setFiltroLida(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">Todas</option>
                            <option value="false">Não lidas</option>
                            <option value="true">Lidas</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="spinner h-12 w-12 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando notificações...</p>
                    </div>
                ) : notificacoes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma notificação</h3>
                        <p className="text-gray-500">Você está em dia!</p>
                    </div>
                ) : (
                    notificacoes.map((notif) => (
                        <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`p-5 rounded-lg border-2 cursor-pointer hover:shadow-md transition ${
                                getColorByTipo(notif.tipo)
                            } ${!notif.lida ? 'border-l-4 border-l-blue-500' : ''}`}
                        >
                            <div className="flex gap-4">
                                <div className="text-3xl flex-shrink-0">{getIconByTipo(notif.tipo)}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className={`text-lg font-medium text-gray-900 ${!notif.lida ? 'font-bold' : ''}`}>
                                            {notif.titulo}
                                        </h3>
                                        {!notif.lida && <span className="flex-shrink-0 w-3 h-3 bg-blue-500 rounded-full"></span>}
                                    </div>
                                    <p className="text-gray-700 mb-3">{notif.mensagem}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>{formatTimeAgo(notif.created_at)}</span>
                                            {notif.categoria && (
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">{notif.categoria}</span>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            {!notif.lida && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMarcarComoLida(notif.id); }}
                                                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded transition flex items-center gap-1"
                                                >
                                                    <Check size={16} />
                                                    Marcar lida
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDelete(notif.id); }}
                                                className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition flex items-center gap-1"
                                            >
                                                <Trash2 size={16} />
                                                Deletar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
