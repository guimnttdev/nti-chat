import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Chat from './components/Chat';
import AuthGuard from './components/AuthGuard';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Rota Raiz, do Login */}
        <Route path="/" element={<Login />} />

        {/* Rota do Chat */}
        <Route path="/chat" element={
    <AuthGuard>
        <Chat />
    </AuthGuard>
} />

        {/* Rota Coringa: Qualquer endereço errado volta para o Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;