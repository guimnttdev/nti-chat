import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Pega URL da API
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ SUCESSO!
        // Salva com redundância para garantir que o chat encontre o nome
        const usuarioDados = {
            name: data.nome, // "Bruno Fernandes"
            nome: data.nome, // "Bruno Fernandes" (redundância)
            username: data.user
        };
        
        localStorage.setItem('chat_user', JSON.stringify(usuarioDados));
        navigate('/chat');
      } else {
        setError(data.message || 'Credenciais inválidas.');
      }

    } catch (err) {
      console.error('Erro:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
           {/* Se tiver a logo, descomente abaixo */}
           <img src="/logo-colorida.png" alt="Logo" style={{ width: '150px', marginBottom: '0.5rem' }} />
          <h2>Acesso NTI</h2>
          <p>Utilize suas credenciais de rede para entrar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Usuário</label>
            <input
              type="text"
              id="username"
              placeholder="Ex: nome.sobrenome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              placeholder="Sua senha de rede"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;