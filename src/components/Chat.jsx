import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import "./OptionButton.css";

const Chat = ({ userName }) => {
  // --- STATE ---
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Olá, ${userName}! Eu sou o Teo Sena, o assistente virtual do NTI. Mas pode me chamar de Teo!`,
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

  // --- FUNÇÃO QUE BUSCA NA API ---
  const fetchOptions = async (parentId = null) => {
    setLoading(true);
    try {
      const url = parentId 
        ? `http://localhost:3000/api/options?parent_id=${parentId}`
        : `http://localhost:3000/api/options`;

      const response = await fetch(url);
      const data = await response.json();

      // --- A MÁGICA DO BOTÃO VOLTAR ---
      // Se parentId for diferente de null, significa que estamos dentro de um submenu.
      // Então, adicionamos o botão "Voltar" manualmente na lista que veio do banco.
      if (parentId !== null) {
          data.push({
              id: 'btn_voltar', // ID único
              option_text: '⬅ Voltar ao Início', // Texto do botão
              is_back_action: true // Marcador especial para sabermos que é ele
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

  // --- EFEITOS ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    fetchOptions(null);
  }, []);

  // --- HANDLER ---
  const handleOptionClick = (option) => {
    // 1. Mostra a mensagem do usuário (Ex: "Problemas de Hardware" ou "Voltar")
    const userResponse = { id: Date.now(), text: option.option_text, sender: "user" };
    setMessages((prev) => [...prev, userResponse]);

    // 2. VERIFICAÇÃO ESPECIAL: É o botão voltar?
    if (option.is_back_action) {
        // Se for voltar, chamamos a raiz (null) e paramos por aqui
        setTimeout(() => {
            fetchOptions(null);
        }, 500);
        return; 
    }

    // 3. Comportamento Normal (Botões do Banco)
    if (option.bot_response) {
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: option.bot_response,
                sender: "bot"
            }]);
        }, 500);
    }

    if (!option.is_solution) {
        fetchOptions(option.id);
    } else {
        setCurrentOptions([]); // Se for solução, limpa os botões
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div className="header-content">
          <div className="avatar-robot">
            <img src="/avatar-nti.png" alt="Avatar NTI" className="avatar-img" />
          </div>
          <div className="header-text-group">
            <img src="/logo-branca.png" alt="Logo NTI" className="header-logo" />
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: "10px" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem", lineHeight: "1.2" }}>Teo Sena</span>
              <small style={{ opacity: 0.8, fontSize: "0.8rem" }}>Assistente Virtual</small>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Body */}
      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
            {msg.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer com Botões */}
      <div className="chat-footer">
        <div className="option-btn-container">
          {currentOptions.map((option) => (
            <button
              key={option.id}
              // Se for o botão de voltar (tem is_back_action) ou tiver "Voltar" no texto, fica cinza
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