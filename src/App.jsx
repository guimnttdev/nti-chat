import { useState } from 'react'
import './index.css'
import Login from './components/Login'
import Chat from './components/Chat'

function App() {
  
  // user começa null (ninguém logado).
  const[user, setUser] = useState(null)


  return (
    <div className="app-container">
     {user ? (
      //Se logado, mostra o chat
      <Chat />
     ) : (
      //Se não logado, mostra o Login
      <div className="login-wrapper">
        {/*Botão de teste temporário*/}
        <Login />
        <button
        onClick={() => setUser("Pessoa.Teste")}
        style={{marginTop: '10px', padding: '10px'}}
        >
          Simula Login (Clique para testar)
        </button>
      </div>
     )}
    </div>
  )
}

export default App