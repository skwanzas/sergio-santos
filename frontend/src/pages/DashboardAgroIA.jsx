import React from 'react';
import { useSelector } from 'react-redux';
import useDashboardData from '../hooks/useDashboardData';

const DashboardAgroIA = () => {
  const { user } = useSelector((state) => state.auth);

  // 1. Lógica complexa totalmente abstraída pelo hook
  const { data, loading, error } = useDashboardData();

  // 2. Componente focado apenas em renderizar
  if (loading) {
    return <div style={{ padding: '50px' }}>A carregar dashboard...</div>;
  }

  if (error) {
    return <div style={{ color: 'red', padding: '50px' }}>Erro: {error}</div>;
  }

  return (
    <div style={{ padding: '50px' }}>
      <h1>Dashboard AgroIA</h1>
      <h2>Bem-vindo, {user?.nome}!</h2>

      {data && (
        <>
          <div className="stats-container" style={{ marginTop: '30px' }}>
            <h3>Resumo de Talhões</h3>
            {data.stats && Array.isArray(data.stats) ? (
              <div>
                {data.stats.map((stat, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #ccc',
                      padding: '15px',
                      marginBottom: '10px',
                      borderRadius: '5px',
                    }}
                  >
                    <p>
                      <strong>Cultura:</strong> {stat._id}
                    </p>
                    <p>
                      <strong>Total de Talhões:</strong> {stat.totalTalhoes}
                    </p>
                    <p>
                      <strong>Área Total:</strong> {stat.areaTotal} ha
                    </p>
                    <p>
                      <strong>Área Média:</strong> {stat.areaMedia?.toFixed(2)} ha
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Nenhum dado disponível</p>
            )}
          </div>

          {/*
          <div className="recent-activity" style={{ marginTop: '30px' }}>
            <h3>Atividades Recentes</h3>
            {data.recentes && data.recentes.length > 0 ? (
              <ul>
                {data.recentes.map((atividade) => (
                  <li key={atividade.id}>{atividade.descricao}</li>
                ))}
              </ul>
            ) : (
              <p>Nenhuma atividade recente</p>
            )}
          </div>
          */}
        </>
      )}
    </div>
  );
};

export default DashboardAgroIA;
