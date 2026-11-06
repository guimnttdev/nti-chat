import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { API_BASE, clearSession } from '../api';

const AuthGuard = ({ children }) => {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    const controller = new AbortController();

    const verificarAutenticacao = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setStatus('unauthorized');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Token inválido ou expirado.');
        }

        const data = await response.json();

        if (data.success === true && data.authenticated === true) {
          setStatus('authorized');
        } else {
          clearSession();
          setStatus('unauthorized');
        }
      } catch (error) {
        if (error.name === 'AbortError') return;

        console.error('Erro na verificação de autenticação:', error);
        clearSession();
        setStatus('unauthorized');
      }
    };

    verificarAutenticacao();

    return () => controller.abort();
  }, []);

  if (status === 'checking') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          color: '#006747'
        }}
      >
        Verificando autenticação...
      </div>
    );
  }

  if (status === 'unauthorized') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AuthGuard;
