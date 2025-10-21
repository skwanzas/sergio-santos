import { useState, useEffect } from 'react';
import { agents } from '../services/api';
import { ListTodo, RefreshCw } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await agents.listTasks({ limit: 50 });
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      SUCCESS: <span className="badge badge-success">✓ Sucesso</span>,
      PENDING: <span className="badge badge-warning">⏳ Pendente</span>,
      RUNNING: <span className="badge badge-info">🔄 Executando</span>,
      FAILED: <span className="badge badge-danger">✗ Falhou</span>,
    };
    return badges[status] || <span className="badge">{status}</span>;
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>📋 Tasks</h1>
        <button onClick={loadTasks} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} />
          Atualizar
        </button>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{tasks.length}</div>
          <div className="stat-label">Total de Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter((t) => t.status === 'SUCCESS').length}</div>
          <div className="stat-label">Completadas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter((t) => t.status === 'RUNNING').length}</div>
          <div className="stat-label">Em Execução</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tasks.filter((t) => t.status === 'FAILED').length}</div>
          <div className="stat-label">Falharam</div>
        </div>
      </div>

      {/* Tasks Table */}
      {tasks.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <ListTodo size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
          <p style={{ color: 'var(--text-light)' }}>Nenhuma task executada ainda</p>
        </div>
      ) : (
        <div className="grid grid-2">
          <div className="card">
            <h2 className="card-header">Lista de Tasks</h2>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Status</th>
                    <th>Criado</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      style={{ cursor: 'pointer' }}
                      className={selectedTask?.id === task.id ? 'selected' : ''}
                    >
                      <td>
                        <strong>{task.agent_name}</strong>
                        <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                          {task.celery_task_id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td>{getStatusBadge(task.status)}</td>
                      <td style={{ fontSize: '0.875rem' }}>
                        {new Date(task.created_at).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <h2 className="card-header">Detalhes da Task</h2>
            {!selectedTask ? (
              <p style={{ color: 'var(--text-light)', padding: '2rem', textAlign: 'center' }}>
                Selecione uma task para ver os detalhes
              </p>
            ) : (
              <div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Agent:</strong> {selectedTask.agent_name}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Status:</strong> {getStatusBadge(selectedTask.status)}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Task ID:</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                    {selectedTask.celery_task_id}
                  </div>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <strong>Criado em:</strong> {new Date(selectedTask.created_at).toLocaleString('pt-BR')}
                </div>
                {selectedTask.started_at && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Iniciado em:</strong> {new Date(selectedTask.started_at).toLocaleString('pt-BR')}
                  </div>
                )}
                {selectedTask.completed_at && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Completado em:</strong>{' '}
                    {new Date(selectedTask.completed_at).toLocaleString('pt-BR')}
                  </div>
                )}
                {selectedTask.duration && (
                  <div style={{ marginBottom: '1rem' }}>
                    <strong>Duração:</strong> {selectedTask.duration.toFixed(2)}s
                  </div>
                )}

                {/* Input */}
                {selectedTask.input && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <strong>Input:</strong>
                    <pre
                      style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'var(--bg)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.75rem',
                      }}
                    >
                      {JSON.stringify(selectedTask.input, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Result */}
                {selectedTask.result && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <strong>Resultado:</strong>
                    <pre
                      style={{
                        marginTop: '0.5rem',
                        padding: '1rem',
                        background: 'var(--bg)',
                        borderRadius: '6px',
                        overflow: 'auto',
                        fontSize: '0.75rem',
                        maxHeight: '300px',
                      }}
                    >
                      {JSON.stringify(selectedTask.result, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error */}
                {selectedTask.error && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <div className="alert alert-danger">
                      <strong>Erro:</strong>
                      <div style={{ marginTop: '0.5rem' }}>{selectedTask.error}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
