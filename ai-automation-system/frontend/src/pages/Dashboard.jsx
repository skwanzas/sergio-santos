import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { agents, products } from '../services/api';
import { Bot, Package, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    approvedProducts: 0,
    totalTasks: 0,
    completedTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Carregar produtos
      const productsData = await products.list({ limit: 100 });
      const approved = productsData.filter((p) => p.risk_score < 50);

      // Carregar tasks
      const tasksData = await agents.listTasks({ limit: 10 });
      const completed = tasksData.filter((t) => t.status === 'SUCCESS');

      setStats({
        totalProducts: productsData.length,
        approvedProducts: approved.length,
        totalTasks: tasksData.length,
        completedTasks: completed.length,
      });

      setRecentTasks(tasksData.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>Dashboard</h1>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div className="stat-value">{stats.totalProducts}</div>
              <div className="stat-label">Produtos Totais</div>
            </div>
            <Package size={32} color="var(--primary)" />
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div className="stat-value">{stats.approvedProducts}</div>
              <div className="stat-label">Produtos Aprovados</div>
            </div>
            <CheckCircle size={32} color="var(--secondary)" />
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div className="stat-value">{stats.totalTasks}</div>
              <div className="stat-label">Tasks Executadas</div>
            </div>
            <Clock size={32} color="var(--warning)" />
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <div className="stat-value">{stats.completedTasks}</div>
              <div className="stat-label">Tasks Completadas</div>
            </div>
            <TrendingUp size={32} color="var(--secondary)" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="card-header">⚡ Ações Rápidas</h2>
        <div className="grid grid-3">
          <Link to="/orchestrator" style={{ textDecoration: 'none' }}>
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <Bot size={32} style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Executar Agentes</h3>
              <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                Descobrir produtos, analisar riscos e gerar copy automaticamente
              </p>
            </div>
          </Link>

          <Link to="/products" style={{ textDecoration: 'none' }}>
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <Package size={32} style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Ver Produtos</h3>
              <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                Visualizar produtos descobertos e gerenciar catálogo
              </p>
            </div>
          </Link>

          <a href="http://localhost:5555" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div
              className="card"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <Clock size={32} style={{ marginBottom: '1rem' }} />
              <h3 style={{ marginBottom: '0.5rem' }}>Monitor Flower</h3>
              <p style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                Acompanhar workers e tasks em tempo real
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="card">
        <h2 className="card-header">📋 Tasks Recentes</h2>
        {recentTasks.length === 0 ? (
          <p style={{ color: 'var(--text-light)' }}>Nenhuma task executada ainda</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Status</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {recentTasks.map((task) => (
                <tr key={task.id}>
                  <td>{task.agent_name}</td>
                  <td>
                    {task.status === 'SUCCESS' && <span className="badge badge-success">✓ Sucesso</span>}
                    {task.status === 'PENDING' && <span className="badge badge-warning">⏳ Pendente</span>}
                    {task.status === 'RUNNING' && <span className="badge badge-info">🔄 Executando</span>}
                    {task.status === 'FAILED' && <span className="badge badge-danger">✗ Falhou</span>}
                  </td>
                  <td>{new Date(task.created_at).toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Link to="/tasks">
          <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Ver Todas as Tasks
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
