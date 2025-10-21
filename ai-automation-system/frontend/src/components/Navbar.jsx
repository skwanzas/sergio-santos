import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LogOut, LayoutDashboard, Bot, Package, ListTodo } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div className="navbar-brand">🤖 AI Automation</div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            <Link to="/orchestrator" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              <Bot size={18} />
              Agentes
            </Link>
            <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              <Package size={18} />
              Produtos
            </Link>
            <Link to="/tasks" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              <ListTodo size={18} />
              Tasks
            </Link>
          </div>
        </div>

        <div className="navbar-menu">
          <span style={{ color: 'var(--text-light)' }}>👤 {user?.username}</span>
          <button onClick={handleLogout} className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
