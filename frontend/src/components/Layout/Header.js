import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../Notifications/NotificationBell';
import { LogOut, User } from 'lucide-react';

const Header = ({ title, subtitle }) => {
    const { user, logout } = useAuth();

    return (
        <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
            <div className="flex justify-between items-center">
                <div>
                    {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
                    {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{user?.nome || 'Utilizador'}</p>
                            <p className="text-xs text-gray-500">{user?.empresa || 'ENDIAGRO'}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Sair"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header;
