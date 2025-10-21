import { useState } from 'react';
import { agents } from '../services/api';
import { toast } from 'react-toastify';
import { Play, Loader, CheckCircle } from 'lucide-react';

const Orchestrator = () => {
  const [activeWorkflow, setActiveWorkflow] = useState('product_discovery');
  const [formData, setFormData] = useState({
    category: 'electronics',
    max_price: 100,
    min_margin: 30,
    auto_create_content: true,
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const payload = {
        workflow_type: activeWorkflow,
        ...formData,
        max_price: parseFloat(formData.max_price),
        min_margin: parseFloat(formData.min_margin),
      };

      const response = await agents.runOrchestrator(payload);
      setResult(response);
      toast.success('Workflow executado com sucesso!');
    } catch (error) {
      console.error('Error running workflow:', error);
      toast.error('Erro ao executar workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem', fontWeight: 700 }}>🤖 Orquestrador de Agentes</h1>

      <div className="grid grid-2">
        {/* Left: Configuration */}
        <div className="card">
          <h2 className="card-header">⚙️ Configuração do Workflow</h2>

          {/* Workflow Type Selection */}
          <div className="form-group">
            <label className="form-label">Tipo de Workflow</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="workflow"
                  value="product_discovery"
                  checked={activeWorkflow === 'product_discovery'}
                  onChange={(e) => setActiveWorkflow(e.target.value)}
                />
                <div>
                  <strong>Product Discovery</strong>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                    Market Research → Risk Analysis
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="workflow"
                  value="content_creation"
                  checked={activeWorkflow === 'content_creation'}
                  onChange={(e) => setActiveWorkflow(e.target.value)}
                />
                <div>
                  <strong>Content Creation</strong>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                    Copywriter (PT + EN + ES)
                  </div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="workflow"
                  value="full_automation"
                  checked={activeWorkflow === 'full_automation'}
                  onChange={(e) => setActiveWorkflow(e.target.value)}
                />
                <div>
                  <strong>Full Automation</strong>
                  <div style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>
                    Discovery → Content → Pronto para publicar
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {(activeWorkflow === 'product_discovery' || activeWorkflow === 'full_automation') && (
              <>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <select name="category" className="form-select" value={formData.category} onChange={handleChange}>
                    <option value="electronics">Eletrônicos</option>
                    <option value="home">Casa & Jardim</option>
                    <option value="sports">Esportes</option>
                    <option value="beauty">Beleza</option>
                    <option value="toys">Brinquedos</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Preço Máximo ($)</label>
                  <input
                    type="number"
                    name="max_price"
                    className="form-input"
                    value={formData.max_price}
                    onChange={handleChange}
                    min="1"
                    max="1000"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Margem Mínima (%)</label>
                  <input
                    type="number"
                    name="min_margin"
                    className="form-input"
                    value={formData.min_margin}
                    onChange={handleChange}
                    min="0"
                    max="100"
                  />
                </div>
              </>
            )}

            {activeWorkflow === 'full_automation' && (
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="auto_create_content"
                    checked={formData.auto_create_content}
                    onChange={handleChange}
                  />
                  Gerar copy automaticamente para produtos aprovados
                </label>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Loader size={16} className="spinner" />
                  Executando...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <Play size={16} />
                  Executar Workflow
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Right: Results */}
        <div className="card">
          <h2 className="card-header">📊 Resultados</h2>

          {loading && (
            <div className="loading">
              <div className="spinner"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>
                Aguarde, os agentes estão trabalhando...
              </p>
            </div>
          )}

          {!loading && !result && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-light)' }}>
              <Bot size={48} style={{ margin: '0 auto 1rem' }} />
              <p>Configure e execute um workflow para ver os resultados</p>
            </div>
          )}

          {!loading && result && (
            <div>
              <div className="alert alert-success">
                <CheckCircle size={20} style={{ marginRight: '0.5rem' }} />
                Workflow completado com sucesso!
              </div>

              {/* Product Discovery Results */}
              {result.workflow === 'product_discovery' && (
                <div>
                  <div className="stats">
                    <div className="stat-card">
                      <div className="stat-value">{result.total_found}</div>
                      <div className="stat-label">Produtos Encontrados</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{result.approved}</div>
                      <div className="stat-label">Produtos Aprovados</div>
                    </div>
                  </div>

                  {result.products && result.products.length > 0 && (
                    <div>
                      <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
                        ✅ Produtos Aprovados ({result.products.length})
                      </h3>
                      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {result.products.map((product, idx) => (
                          <div
                            key={idx}
                            className="card"
                            style={{ marginBottom: '1rem', background: 'var(--bg)' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div>
                                <strong>{product.title}</strong>
                                <div style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                                  Preço: ${product.price} | Custo: ${product.cost} | Margem: {product.margin_percent}%
                                </div>
                              </div>
                              <span className="badge badge-success">Score: {product.risk_score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Full Automation Results */}
              {result.workflow === 'full_automation' && (
                <div>
                  <div className="stats">
                    <div className="stat-card">
                      <div className="stat-value">{result.discovery?.total_found || 0}</div>
                      <div className="stat-label">Produtos Descobertos</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{result.discovery?.approved || 0}</div>
                      <div className="stat-label">Produtos Aprovados</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-value">{result.content_created || 0}</div>
                      <div className="stat-label">Conteúdos Criados</div>
                    </div>
                  </div>

                  <div className="alert alert-info" style={{ marginTop: '1rem' }}>
                    <strong>Status:</strong> {result.status}
                    <br />
                    Pipeline completo executado com sucesso!
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <details style={{ marginTop: '1.5rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 500 }}>
                  Ver JSON Completo
                </summary>
                <pre
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'var(--bg)',
                    borderRadius: '6px',
                    overflow: 'auto',
                    fontSize: '0.75rem',
                  }}
                >
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Orchestrator;
