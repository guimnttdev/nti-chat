import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE, NTI_CONTATO } from '../api';
import './Login.css';

const MOTIVOS = {
  expirado: 'Sua sessão expirou. Entre novamente.',
  inatividade: 'Você foi desconectado por inatividade.'
};

const Login = () => {
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(() => MOTIVOS[searchParams.get('motivo')] || '');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        // Exige um token JWT real retornado pela API
        if (typeof data.token !== 'string' || !data.token.trim()) {
          setError('O servidor não retornou um token de autenticação.');
          return;
        }

        // Salva o token recebido após autenticação no AD
        localStorage.setItem('token', data.token);

        // Salva os dados do colaborador
        const usuarioDados = {
          name: data.nome,
          nome: data.nome,
          username: data.user
        };

        localStorage.setItem('chat_user', JSON.stringify(usuarioDados));

        // Limpa a senha da memória do componente
        setPassword('');

        // Redireciona para o chatbot
        navigate('/chat');
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('chat_user');

        setError(data.message || 'Credenciais inválidas.');
      }
    } catch (err) {
      console.error('Erro ao realizar login:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img
            src="/logo-verde.png"
            alt="Logo FAEB SENAR"
            style={{
              width: '150px',
              marginBottom: '0.5rem'
            }}
          />

          <h2>Acesso NTI</h2>

          <p>Utilize suas credenciais de rede para entrar</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="username">Usuário</label>

            <input
              type="text"
              id="username"
              placeholder="Ex.: nome.sobrenome"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
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
              autoComplete="current-password"
              required
            />
          </div>

          {notice && !error && (
            <p className="info-msg" role="status">{notice}</p>
          )}
          {error && <p className="error-msg" role="alert">{error}</p>}

          <button
            type="submit"
            className="btn-login"
            disabled={loading}
          >
            {loading ? 'Validando...' : 'Entrar'}
          </button>
        </form>

        <details className="login-help">
          <summary>Problemas para entrar?</summary>
          <ul>
            <li>Confira se o <strong>Caps Lock</strong> está desativado.</li>
            <li>Use o mesmo usuário e senha do computador (ex.: nome.sobrenome).</li>
            <li>
              Se a senha expirou ou a conta foi bloqueada, fale com a equipe do NTI
              {NTI_CONTATO && <>: <strong>{NTI_CONTATO}</strong></>}.
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
};

export default Login;