
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';
import Chat from './components/Chat';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Tela de login */}
        <Route path="/" element={<Login />} />

        {/* Chat protegido por autenticação */}
        <Route
          path="/chat"
          element={
            <AuthGuard>
              <Chat />
            </AuthGuard>
          }
        />

        {/* Visualização exclusiva de desenvolvimento */}
        {import.meta.env.DEV && (
          <Route path="/dev/chat" element={<Chat />} />
        )}

        {/* Rotas desconhecidas voltam para o login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
