import React, { useState, useEffect, useRef } from "react";
import "./Chat.css";
import "./OptionButton.css";

const Chat = () => { 
  // --- CORREÇÃO DO NOME (Lendo do Login) ---
  // 1. Tenta ler os dados salvos no navegador
  const savedUser = localStorage.getItem('chat_user');
  let displayName = "Colaborador"; // Nome padrão se algo der errado

  if (savedUser) {
    const userObj = JSON.parse(savedUser);
    // Tenta pegar 'name' (inglês) ou 'nome' (português) ou 'username'
    displayName = userObj.name || userObj.nome || userObj.username || "Colaborador";
  }

  // 2. Inicia o chat já com o nome correto
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
      // Pega a URL do arquivo .env ou usa localhost
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const url = parentId 
        ? `${API_BASE}/api/options?parent_id=${parentId}`
        : `${API_BASE}/api/options`;

      const response = await fetch(url);
      const data = await response.json();

      // - Botão voltar
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
          text: "Ops! Tive um problema de conexão com o servidor. Tente novamente.", 
          sender: "bot" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // --- EFEITOS ---
  // Rola para baixo sempre que chega mensagem nova
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Carrega as opções iniciais ao abrir a tela
  useEffect(() => {
    fetchOptions(null);
  }, []);

  
  const handleOptionClick = (option) => {
    // 1. Mostra a mensagem do usuário na tela
    const userResponse = { id: Date.now(), text: option.option_text, sender: "user" };
    setMessages((prev) => [...prev, userResponse]);

    // 2. VERIFICAÇÃO: É o botão voltar?
    if (option.is_back_action) {
        // Simula um "pensando..." rápido e volta ao início
        setLoading(true);
        setTimeout(() => {
            fetchOptions(null);
        }, 400);
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
            
            // Se for o botão do GLPI, abre o link
            if (option.option_text.includes("GLPI") || option.bot_response.includes("GLPI")) {
              setTimeout(() => {
                window.open("https://sisu.senarbahia.org.br/index.php?noAUTO=1", "_blank");
              }, 2000);
            }
        }, 500);
    }

    // 4. Carrega as próximas opções (se não for solução final)
    if (!option.is_solution) {
        fetchOptions(option.id);
    } else {
        setCurrentOptions([]); // Se for solução, limpa os botões
        
        // Opcional: Adicionar botão de "Começar de novo" no final de tudo
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
      
      {/* CABEÇALHO */}
      <div className="chat-header">
        <div className="header-content">
          <div className="avatar-robot">
            {/* Certifique-se que a imagem está na pasta public */}
            <img src="/avatar-nti.png" alt="Avatar NTI" className="avatar-img" />
          </div>
          <div className="header-text-group">
            {/* Se não tiver logo-branca.png, comente a linha abaixo */}
            {/* <img src="/logo-branca.png" alt="Logo NTI" className="header-logo" /> */}
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginLeft: "10px" }}>
              <span style={{ fontWeight: "bold", fontSize: "1.1rem", lineHeight: "1.2", color: "white" }}>Teo Sena</span>
              <small style={{ opacity: 0.9, fontSize: "0.8rem", color: "#e0e0e0" }}>Assistente Virtual</small>
            </div>
          </div>
        </div>
      </div>

      {/* ÁREA DE MENSAGENS */}
      <div className="messages-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}>
            {msg.text}
          </div>
        ))}
        {/* Elemento invisível para rolagem automática */}
        <div ref={messagesEndRef} />
      </div>

      {/* RODAPÉ (BOTÕES) */}
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