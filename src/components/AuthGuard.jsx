import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthGuard = ({ children }) => {
    // Verifica se existe o token no armazenamento
    const token = localStorage.getItem('token');

    // Se não tiver, manda de volta pro Login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Se tiver, libera passagem para o Chat
    return children;
};

export default AuthGuard;