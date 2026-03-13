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

  // --- ESTADOS ---
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
  
  // Controle do Botão Voltar
  const [historyStack, setHistoryStack] = useState([]); 
  const [currentParentId, setCurrentParentId] = useState(null);

  const messagesEndRef = useRef(null);

  // --- 1. FUNÇÃO DE LOGOUT (Limpa tudo e chuta pro Login) ---
  const handleLogout = () => {
    console.log("🚪 Logout acionado!");
    localStorage.removeItem('token');
    localStorage.removeItem('chat_user');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  // --- 2. VIGIA DE INATIVIDADE (Logout Automático) ---
  useEffect(() => {
    // console.log("🕒 Vigia de Inatividade iniciado!"); // Pode comentar ou remover

    // ✅ 5 Minutos (300.000 ms)
    const INACTIVITY_LIMIT = 3 * 60 * 1000; 

    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        console.log("💤 Tempo esgotado! Realizando logout...");
        handleLogout();
      }, INACTIVITY_LIMIT);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    resetTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, []);

  // --- BUSCA NA API ---
  const fetchOptions = async (parentId = null) => {
    setLoading(true);
    try {
      const effectiveParentId = (parentId === undefined) ? null : parentId;
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const url = effectiveParentId 
        ? `${API_BASE}/api/options?parent_id=${effectiveParentId}`
        : `${API_BASE}/api/options`;

      const response = await fetch(url);
      let data = await response.json();

      // Limpa duplicatas
      data = data.filter(item => item.id !== 'btn_voltar' && !item.option_text.includes("Voltar"));

      // Adiciona botão voltar se não for raiz
      if (effectiveParentId !== null) {
          data.push({
              id: 'btn_voltar',
              option_text: '⬅ Voltar',
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
    if (!option.is_back_action) {
        const userResponse = { id: Date.now(), text: option.option_text, sender: "user" };
        setMessages((prev) => [...prev, userResponse]);
    }

    if (option.option_text.includes("SISU") || option.option_text.includes("GLPI")) {
        setTimeout(() => {
            window.open("https://sisu.senarbahia.org.br/index.php?noAUTO=1", "_blank");
        }, 1000); 
    }

    // Lógica do Voltar
    if (option.is_back_action) {
        setLoading(true);
        if (option.id === 'restart') {
            setHistoryStack([]);
            setCurrentParentId(null);
            setTimeout(() => fetchOptions(null), 400);
        } else {
            setHistoryStack(prevStack => {
                const newStack = [...prevStack];
                const prevId = newStack.pop() || null;
                setCurrentParentId(prevId); 
                setTimeout(() => fetchOptions(prevId), 400);
                return newStack;
            });
        }
        return; 
    }

    // Avançar
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
        setHistoryStack(prev => [...prev, currentParentId]);
        setCurrentParentId(option.id);
        fetchOptions(option.id);
    } else {
        setCurrentOptions([]); 
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
          <button onClick={handleLogout} className="logout-btn">
             Sair ❌
          </button>
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