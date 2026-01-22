import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import "./OptionButton.css";

const Chat = () => { 
  // --- IDENTIFICAÇÃO DO USUÁRIO ---
  const savedUser = localStorage.getItem('chat_user');
  let displayName = "Colaborador";

  if (savedUser) {
    const userObj = JSON.parse(savedUser);
    displayName = userObj.name || userObj.nome || userObj.username || "Colaborador";
  }

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Olá, ${displayName}! Eu sou o Teo Sena, o assistente virtual do NTI. Mas pode me chamar de Teo!`,
      sender: "bot",
    },
    {
      id: 2,
      text: "Por favor, selecione a categoria do seu problema:",
      sender: "bot",
    }
  ]);

  const [currentOptions, setCurrentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // - Busca na API -
  const fetchOptions = async (parentId = null) => {
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const url = parentId 
        ? `${API_BASE}/api/options?parent_id=${parentId}`
        : `${API_BASE}/api/options`;

      const response = await fetch(url);
      const data = await response.json();

      if (parentId !== null) {
          data.push({
              id: 'btn_voltar',
              option_text: '⬅ Voltar ao Início',
              is_back_action: true
          });
      }

      setCurrentOptions(data);
      
    } catch (error) {
      console.error("Erro ao buscar opções:", error);
      setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: "Ops! Tive um problema de conexão. Tente novamente.", 
          sender: "bot" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchOptions(null);
  }, []);

  
  const handleOptionClick = (option) => {
    // 1. Mostra a escolha do usuário na tela
    const userResponse = { id: Date.now(), text: option.option_text, sender: "user" };
    setMessages((prev) => [...prev, userResponse]);

    // 2. LÓGICA DO GLPI (CORRIGIDA)
    // Agora verificamos isso ANTES de ver se tem resposta do bot
    if (option.option_text.includes("GLPI")) {
        setTimeout(() => {
            // Abre o GLPI em nova aba
            window.open("https://sisu.senarbahia.org.br/index.php?noAUTO=1", "_blank");
        }, 1000); // Pequeno delay para dar tempo do usuário ver o clique
    }

    // 3. Verifica se é botão de voltar
    if (option.is_back_action) {
        setLoading(true);
        setTimeout(() => {
            fetchOptions(null);
        }, 400);
        return; 
    }

    // 4. Se tiver resposta de texto do bot, mostra ela
    if (option.bot_response) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: option.bot_response,
                sender: "bot"
            }]);
        }, 500);
    }

    // 5. Carrega próximos botões ou encerra
    if (!option.is_solution) {
        fetchOptions(option.id);
    } else {
        setCurrentOptions([]); 
        
        // Botão de reiniciar
        setTimeout(() => {
             setCurrentOptions([{
                 id: 'restart',
                 option_text: '🔄 Começar outro atendimento',
                 is_back_action: true 
             }]);
        }, 2000);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="header-content">
          <div className="avatar-robot">
            <img src="/avatar-nti.png" alt="Avatar NTI" className="avatar-img" />
          </div>
          <div className="header-text-group">
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: "10px" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem", lineHeight: "1.2", color: "white" }}>Teo Sena</span>
              <small style={{ opacity: 0.9, fontSize: "0.8rem", color: "#e0e0e0" }}>Assistente Virtual</small>
            </div>
          </div>
        </div>
      </div>

      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <div className="option-btn-container">
          {currentOptions.map((option) => (
            <button
              key={option.id}
              className={`option-btn ${option.is_back_action || option.option_text.includes("Voltar") ? "secondary" : ""}`}
              onClick={() => handleOptionClick(option)}
              disabled={loading}
            >
              {option.option_text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Chat;