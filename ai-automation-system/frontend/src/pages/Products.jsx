import { useState, useEffect } from 'react';
import { products as productsApi } from '../services/api';
import { Package, Filter } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, approved, rejected

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await productsApi.list({ limit: 100 });
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    if (filter === 'approved') return product.risk_score < 50;
    if (filter === 'rejected') return product.risk_score >= 50;
    return true;
  });

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
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>📦 Produtos</h1>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={18} />
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todos ({products.length})</option>
            <option value="approved">
              Aprovados ({products.filter((p) => p.risk_score < 50).length})
            </option>
            <option value="rejected">
              Rejeitados ({products.filter((p) => p.risk_score >= 50).length})
            </option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="stats">
        <div className="stat-card">
          <div className="stat-value">{products.length}</div>
          <div className="stat-label">Total de Produtos</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{products.filter((p) => p.risk_score < 50).length}</div>
          <div className="stat-label">Produtos Aprovados</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            $
            {products
              .reduce((sum, p) => sum + (p.margin || 0), 0)
              .toFixed(2)}
          </div>
          <div className="stat-label">Margem Total Potencial</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {products.length > 0
              ? (
                  (products.reduce((sum, p) => sum + (p.margin_percent || 0), 0) / products.length)
                ).toFixed(1)
              : 0}
            %
          </div>
          <div className="stat-label">Margem Média</div>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Package size={48} style={{ margin: '0 auto 1rem', color: 'var(--text-light)' }} />
          <p style={{ color: 'var(--text-light)' }}>
            {products.length === 0
              ? 'Nenhum produto encontrado. Execute o workflow de Product Discovery para descobrir produtos.'
              : 'Nenhum produto encontrado com o filtro selecionado.'}
          </p>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Plataforma</th>
                <th>Preço</th>
                <th>Custo</th>
                <th>Margem</th>
                <th>Risco</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.title}</strong>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                      {product.external_id}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{product.platform || 'amazon'}</span>
                  </td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td>${product.cost?.toFixed(2)}</td>
                  <td>
                    <strong style={{ color: 'var(--secondary)' }}>
                      ${product.margin?.toFixed(2)}
                    </strong>
                    <div style={{ color: 'var(--text-light)', fontSize: '0.75rem' }}>
                      {product.margin_percent?.toFixed(1)}%
                    </div>
                  </td>
                  <td>
                    <span
                      className={`badge ${
                        product.risk_score < 30
                          ? 'badge-success'
                          : product.risk_score < 50
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {product.risk_score}
                    </span>
                  </td>
                  <td>
                    {product.risk_score < 50 ? (
                      <span className="badge badge-success">✓ Aprovado</span>
                    ) : (
                      <span className="badge badge-danger">✗ Rejeitado</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Products;
