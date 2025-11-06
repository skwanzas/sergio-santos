import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/apiAgroIA'; // Usamos a API centralizada

// Este hook busca dados para o dashboard
const useDashboardData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtém o user do Redux (exemplo, caso precise do ID do user)
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return; // Não busca se não houver utilizador

      setLoading(true);
      try {
        // Exemplo: buscar resumo de talhões e atividades
        // (Estas rotas teriam que existir no backend)
        const [talhoesRes] = await Promise.all([
          api.get('/talhoes/stats'),
          // api.get('/atividades/recentes'), // Caso exista
        ]);

        setData({
          stats: talhoesRes.data.data,
          // recentes: atividadesRes.data.data,
        });
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Erro ao buscar dados do dashboard');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Re-executa se o utilizador mudar

  return { data, loading, error };
};

export default useDashboardData;
