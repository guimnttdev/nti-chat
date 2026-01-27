import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Chat from './components/Chat';

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Rota Raiz: Abre o Login */}
        <Route path="/" element={<Login />} />

        {/* Rota do Chat: Abre o Chat */}
        <Route path="/chat" element={<Chat />} />

        {/* Rota Coringa: Qualquer endereço errado volta para o Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;