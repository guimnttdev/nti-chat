import React, { useState } from "react";
import "./Login.css";

const Login = ({ onLogin }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    //validação - campos vazios
    if (!userName || !password) {
      setError("Por favor, preencha todos os campos");
      return;
    }
    //validação de formato
    if (!userName.includes(".")) {
      setError('Utilize o mesmo usuário de rede')
      return
    }

    //Lógica de pegar o nome com base no login
    const firstName = userName.split('.')[0]
    const nameToShow = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase()
    onLogin(nameToShow)
  };

  return (
   <div className="login-card">
    
    <div className="login-header">
      <h2>Acesso ao chat de suporte do NTI</h2>
      <p>Urilize suas credenciais de rede</p>
    </div>

    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      <div className="input-group">
        <label htmlFor="user">Login</label>
        <input
        type="text"
        id="user"
        placeholder="usuário"
        value={userName}
        onChange={(e) => {setUserName(e.target.value)
          setError('')
        }}
        />
      </div>

      <div className="input-group">
        <label htmlFor="pass">Senha</label>
        <input
        type="password"
        id="pass"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      
      {error && <span className="error-msg">{error}</span>}

      <button type="submit" className="btn-login">
        Login
      </button>
    </form>
   </div>
  );
};

export default Login;
