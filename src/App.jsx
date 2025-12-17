import { useState } from 'react'
import './index.css'
import Login from './components/Login'
import Chat from './components/Chat'

function App() {
  // --- STATE ---
  const [user, setUser] = useState(null)

  // --- HANDLERS ---
  const handleLoginSuccess = (userCredential) => {
    setUser(userCredential)
  }

  return (
    <div className="app-container">
      {/* Se está logado -> Mostra Chat
         Senão -> Mostra Login
      */}
      {user ? (
        <Chat userName={user} />
      ) : (
        <Login onLogin={handleLoginSuccess} />
      )}
    </div>
  )
}

export default App