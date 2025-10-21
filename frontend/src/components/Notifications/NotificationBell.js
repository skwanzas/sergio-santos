import React, { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Trash2 } from 'lucide-react';
import { notificacoesService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notificacoes, setNotificacoes] = useState([]);
    const [naoLidas, setNaoLidas] = useState(0);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadNotifications();
        // Atualizar a cada 30 segundos
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificacoesService.listNotificacoes({ limit: 10 });
            setNotificacoes(data.notificacoes || []);
            setNaoLidas(data.nao_lidas || 0);
        } catch (error) {
            console.error('Erro ao carregar notificações:', error);
        }
    };

    const handleMarcarComoLida = async (id, e) => {
        e.stopPropagation();
        try {
            await notificacoesService.marcarComoLida(id);
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao marcar como lida:', error);
        }
    };

    const handleMarcarTodasComoLidas = async () => {
        try {
            setLoading(true);
            await notificacoesService.marcarTodasComoLidas();
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao marcar todas como lidas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        try {
            await notificacoesService.deleteNotificacao(id);
            await loadNotifications();
        } catch (error) {
            console.error('Erro ao deletar notificação:', error);
        }
    };

    const handleNotificationClick = async (notificacao) => {
        // Marcar como lida
        if (!notificacao.lida) {
            await notificacoesService.marcarComoLida(notificacao.id);
        }

        // Navegar se houver link
        if (notificacao.link_acao) {
            navigate(notificacao.link_acao);
        }

        setIsOpen(false);
        await loadNotifications();
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
        <div className="relative" ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                title="Notificações"
            >
                <Bell size={24} />
                {naoLidas > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                        {naoLidas > 9 ? '9+' : naoLidas}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                            {naoLidas > 0 && (
                                <p className="text-sm text-gray-500">{naoLidas} não lida{naoLidas > 1 ? 's' : ''}</p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {naoLidas > 0 && (
                                <button
                                    onClick={handleMarcarTodasComoLidas}
                                    disabled={loading}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    title="Marcar todas como lidas"
                                >
                                    <CheckCheck size={16} />
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {notificacoes.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={48} className="mx-auto mb-3 text-gray-300" />
                                <p>Nenhuma notificação</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notificacoes.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                                            !notif.lida ? 'bg-blue-50/50' : ''
                                        }`}
                                    >
                                        <div className="flex gap-3">
                                            <div className="text-2xl flex-shrink-0">
                                                {getIconByTipo(notif.tipo)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`text-sm font-medium text-gray-900 ${!notif.lida ? 'font-semibold' : ''}`}>
                                                        {notif.titulo}
                                                    </h4>
                                                    {!notif.lida && (
                                                        <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {notif.mensagem}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTimeAgo(notif.created_at)}
                                                    </span>
                                                    <div className="flex gap-1">
                                                        {!notif.lida && (
                                                            <button
                                                                onClick={(e) => handleMarcarComoLida(notif.id, e)}
                                                                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                                title="Marcar como lida"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(notif.id, e)}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                            title="Deletar"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {notificacoes.length > 0 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <button
                                onClick={() => {
                                    navigate('/notificacoes');
                                    setIsOpen(false);
                                }}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Ver todas as notificações
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
