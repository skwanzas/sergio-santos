import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

// 1. Schema de Validação com Yup
const schema = yup.object().shape({
  email: yup.string().email('Email inválido').required('O email é obrigatório'),
  password: yup.string().required('A senha é obrigatória'),
});

const LoginAgroIA = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  // 2. Configuração do react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // 3. Função de Submissão
  const onSubmit = (data) => {
    dispatch(loginUser(data))
      .unwrap() // .unwrap() permite usar .then() e .catch() no thunk
      .then(() => {
        navigate('/agroia/dashboard'); // Redireciona em caso de sucesso
      })
      .catch((err) => {
        // O erro já está a ser tratado no state 'error'
        console.error('Falha no login:', err);
      });
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: 'auto' }}>
      <h2>Login AgroIA</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Campo Email */}
        <div style={{ marginBottom: '15px' }}>
          <label>Email</label>
          <input
            type="email"
            {...register('email')}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        </div>

        {/* Campo Senha */}
        <div style={{ marginBottom: '15px' }}>
          <label>Senha</label>
          <input
            type="password"
            {...register('password')}
            style={{ width: '100%', padding: '8px' }}
          />
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>

        {/* Erros da API */}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Botão de Submissão */}
        <button type="submit" disabled={isLoading} style={{ padding: '10px 15px' }}>
          {isLoading ? 'A carregar...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default LoginAgroIA;
