import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login'; // Verifique se o caminho está certo
import Chat from './components/Chat';   // Verifique se o caminho está certo

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