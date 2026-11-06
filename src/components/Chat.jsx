import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  Monitor,
  AppWindow,
  Wifi,
  ShieldUser,
  Phone,
  Printer,
  Keyboard,
  Laptop,
  TriangleAlert,
  CircleCheck,
  MessageCircle,
  ArrowLeft,
  RotateCcw,
  ExternalLink,
} from "lucide-react";

import Sidebar from "./Sidebar";
import {
  apiFetch,
  logout,
  SessionExpiredError,
  SISU_URL,
  INACTIVITY_MINUTES,
  fillPlaceholders,
} from "../api";
import "./Chat.css";
import "./OptionButton.css";

// Cria uma mensagem com identificador e horário
function createMessage(text, sender, extra = {}) {
  return {
    id: crypto.randomUUID(),
    text,
    sender,
    timestamp: Date.now(),
    ...extra,
  };
}

// Formata o horário para o padrão brasileiro
function formatMessageTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Recupera o nome do colaborador
function getDisplayName() {
  try {
    const stored = localStorage.getItem("chat_user");

    if (stored) {
      const user = JSON.parse(stored);
      return user.name || user.nome || user.username || "Colaborador";
    }
  } catch (error) {
    console.error("Erro ao recuperar usuário:", error);
  }

  return "Colaborador";
}

// Mensagens iniciais do Téo NTI
function initialMessages(displayName) {
  return [
    createMessage(
      `Olá, ${displayName}! Eu sou o Téo NTI, o assistente virtual do NTI, mas pode me chamar só de Téo!`,
      "bot"
    ),
    createMessage("Por favor, selecione a categoria do seu problema:", "bot"),
  ];
}

const RESTART_OPTION = {
  id: "restart",
  option_text: "Começar outro atendimento",
  is_back_action: true,
};

// Ícones configuráveis pela coluna "icon" da tabela chat_flow
const ICONS_BY_NAME = {
  monitor: Monitor,
  "app-window": AppWindow,
  wifi: Wifi,
  "shield-user": ShieldUser,
  phone: Phone,
  printer: Printer,
  keyboard: Keyboard,
  laptop: Laptop,
  "triangle-alert": TriangleAlert,
  "circle-check": CircleCheck,
  "message-circle": MessageCircle,
  "external-link": ExternalLink,
};

// Fallback por palavras-chave quando a opção não tem ícone definido
const ICON_KEYWORDS = [
  [["hardware", "equipamento"], Monitor],
  [["software", "programa"], AppWindow],
  [["rede", "internet", "wi-fi"], Wifi],
  [["acesso", "senha", "usuário", "usuario"], ShieldUser],
  [["telefonia", "telefone", "ramal"], Phone],
  [["impressora", "impressão", "impressao"], Printer],
  [["mouse", "teclado", "monitor"], Keyboard],
  [["computador", "notebook"], Laptop],
  [["sisu", "glpi"], ExternalLink],
  [["erro", "falha"], TriangleAlert],
];

function getOptionIcon(option) {
  if (option.id === "restart") return RotateCcw;
  if (option.is_back_action) return ArrowLeft;

  if (option.icon && ICONS_BY_NAME[option.icon]) {
    return ICONS_BY_NAME[option.icon];
  }

  const text = (option.option_text || "").toLowerCase();
  const match = ICON_KEYWORDS.find(([words]) =>
    words.some((word) => text.includes(word))
  );

  if (match) return match[1];
  if (option.is_solution) return CircleCheck;

  return MessageCircle;
}

const isTicketOption = (text) => /SISU|GLPI/i.test(text);

// Converte linhas "1. ...", "2. ..." em lista numerada; o restante vira parágrafo
function FormattedText({ text }) {
  const blocks = [];
  let paragraph = [];
  let steps = [];

  const flushParagraph = () => {
    const content = paragraph.join("\n").trim();
    if (content) blocks.push({ type: "p", content });
    paragraph = [];
  };

  const flushSteps = () => {
    if (steps.length) blocks.push({ type: "ol", items: steps });
    steps = [];
  };

  (text || "").split("\n").forEach((line) => {
    const step = line.match(/^\s*\d+[.)]\s+(.*)$/);

    if (step) {
      flushParagraph();
      steps.push(step[1]);
    } else if (!line.trim()) {
      flushSteps();
      flushParagraph();
    } else {
      flushSteps();
      paragraph.push(line);
    }
  });

  flushSteps();
  flushParagraph();

  return blocks.map((block, index) =>
    block.type === "ol" ? (
      <ol key={index} className="message-steps">
        {block.items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ol>
    ) : (
      <p key={index}>{block.content}</p>
    )
  );
}

// Orientação exibida antes de abrir o chamado
const TICKET_GUIDE = [
  "Para agilizar seu atendimento, informe no chamado:",
  "1. O que está acontecendo",
  "2. Desde quando começou",
  "3. Se aparece alguma mensagem de erro (um print ajuda muito)",
  "4. Seu setor, ramal e o patrimônio do equipamento (se houver)",
].join("\n");

export default function Chat() {
  const [displayName] = useState(getDisplayName);
  const [messages, setMessages] = useState(() => initialMessages(displayName));
  const [currentOptions, setCurrentOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [historyStack, setHistoryStack] = useState([]);
  const [currentParentId, setCurrentParentId] = useState(null);

  // Histórico
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [viewingSession, setViewingSession] = useState(null);

  const messagesEndRef = useRef(null);
  const requestIdRef = useRef(0);
  const timersRef = useRef([]);
  const messagesRef = useRef(messages);
  const sessionPromiseRef = useRef(null);
  const saveChainRef = useRef(Promise.resolve());

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Agenda ações com atraso
  const schedule = (callback, delay) => {
    const timer = setTimeout(callback, delay);
    timersRef.current.push(timer);
  };

  // Cancela ações pendentes
  const clearScheduled = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  // ===== Histórico =====

  const loadSessions = useCallback(async () => {
    try {
      const data = await apiFetch("/api/history/sessions");
      if (Array.isArray(data)) setSessions(data);
    } catch (error) {
      if (!(error instanceof SessionExpiredError)) {
        console.error("Erro ao carregar histórico:", error);
      }
    }
  }, []);

  // Cria o atendimento no servidor somente na primeira interação
  const ensureSession = () => {
    if (!sessionPromiseRef.current) {
      sessionPromiseRef.current = apiFetch("/api/history/sessions", {
        method: "POST",
      })
        .then((session) => {
          setActiveSessionId(session.id);
          return session.id;
        })
        .catch((error) => {
          console.error("Erro ao criar atendimento:", error);
          return null;
        });
    }

    return sessionPromiseRef.current;
  };

  // Salva mensagens em ordem, sem bloquear a interface
  const persist = (msgs, { finish = false } = {}) => {
    const sessionPromise = ensureSession();

    saveChainRef.current = saveChainRef.current
      .then(async () => {
        const sessionId = await sessionPromise;
        if (!sessionId) return;

        for (const msg of msgs) {
          await apiFetch(`/api/history/sessions/${sessionId}/messages`, {
            method: "POST",
            body: { sender: msg.sender, message_text: msg.text },
          });
        }

        if (finish) {
          await apiFetch(`/api/history/sessions/${sessionId}/finish`, {
            method: "PATCH",
          });
        }
      })
      .catch((error) => {
        if (!(error instanceof SessionExpiredError)) {
          console.error("Erro ao salvar histórico:", error);
        }
      })
      .finally(loadSessions);
  };

  // ===== Sessão do usuário =====

  const handleLogout = useCallback((reason) => {
    logout(typeof reason === "string" ? reason : undefined);
  }, []);

  // Logout por inatividade
  useEffect(() => {
    const inactivityLimit = INACTIVITY_MINUTES * 60 * 1000;
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => handleLogout("inatividade"), inactivityLimit);
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [handleLogout]);

  // ===== Fluxo do chatbot =====

  const fetchOptions = async (parentId = null) => {
    const requestId = ++requestIdRef.current;

    setLoading(true);

    try {
      const path =
        parentId === null
          ? "/api/options"
          : `/api/options?parent_id=${encodeURIComponent(parentId)}`;

      let options = await apiFetch(path);

      if (!Array.isArray(options)) {
        throw new Error("Resposta inválida da API.");
      }

      if (requestId !== requestIdRef.current) return;

      // Remove botões antigos de voltar vindos do banco
      options = options.filter(
        (item) =>
          item.id !== "btn_voltar" &&
          !(item.option_text || "").includes("Voltar")
      );

      if (parentId !== null) {
        options.push({
          id: "btn_voltar",
          option_text: "Voltar",
          is_back_action: true,
        });
      }

      setCurrentOptions(options);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      if (error instanceof SessionExpiredError) return;

      console.error("Erro ao buscar opções:", error);
      setCurrentOptions([]);
      setMessages((prev) => [
        ...prev,
        createMessage("Ops! Tive um problema de conexão. Tente novamente.", "bot"),
      ]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  };

  // Carrega as categorias e o histórico ao abrir o chat
  useEffect(() => {
    fetchOptions(null);
    loadSessions();

    return () => {
      requestIdRef.current += 1;
      clearScheduled();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rola para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reinicia o atendimento
  const handleNewChat = () => {
    clearScheduled();
    requestIdRef.current += 1;
    sessionPromiseRef.current = null;

    setIsTyping(false);
    setViewingSession(null);
    setActiveSessionId(null);
    setMessages(initialMessages(displayName));
    setHistoryStack([]);
    setCurrentParentId(null);
    setCurrentOptions([]);

    fetchOptions(null);
  };

  // Exclui um atendimento do histórico
  const handleDeleteSession = async (session) => {
    const isOnScreen =
      viewingSession?.id === session.id || activeSessionId === session.id;

    // Remove da lista na hora; restaura se a API falhar
    setSessions((prev) => prev.filter((s) => s.id !== session.id));
    if (isOnScreen) handleNewChat();

    try {
      await apiFetch(`/api/history/sessions/${session.id}`, { method: "DELETE" });
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      console.error("Erro ao excluir atendimento:", error);
      loadSessions();
    }
  };

  // Apaga todo o histórico do colaborador
  const handleClearHistory = async () => {
    const confirmed = window.confirm(
      "Apagar todo o seu histórico de atendimentos? Essa ação não pode ser desfeita."
    );
    if (!confirmed) return;

    setSessions([]);
    if (viewingSession || activeSessionId) handleNewChat();

    try {
      await apiFetch("/api/history/sessions", { method: "DELETE" });
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      console.error("Erro ao limpar histórico:", error);
      loadSessions();
    }
  };

  // Abre um atendimento anterior (somente leitura)
  const handleSelectSession = async (session) => {
    if (session.id === activeSessionId && !viewingSession) return;

    clearScheduled();
    requestIdRef.current += 1;
    sessionPromiseRef.current = null;

    setIsTyping(false);
    setActiveSessionId(null);
    setViewingSession(session);
    setCurrentOptions([]);
    setLoading(true);

    try {
      const data = await apiFetch(`/api/history/sessions/${session.id}/messages`);

      setMessages(
        data.map((msg) => ({
          id: `h-${msg.id}`,
          text: msg.message_text,
          sender: msg.sender,
          timestamp: new Date(msg.created_at).getTime(),
        }))
      );
    } catch (error) {
      if (error instanceof SessionExpiredError) return;
      console.error("Erro ao abrir atendimento:", error);
      setMessages([
        createMessage("Não foi possível carregar este atendimento.", "bot"),
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Processa as opções escolhidas
  const handleOptionClick = (option) => {
    // Espera o Téo terminar de responder para manter a ordem das mensagens
    if (loading || isTyping) return;

    const text = option.option_text || "";

    if (option.id === "restart") {
      handleNewChat();
      return;
    }

    // Voltar para a etapa anterior
    if (option.is_back_action) {
      const previous = [...historyStack];
      const parentId = previous.pop() ?? null;

      const userMsg = createMessage("Voltar", "user");
      const botMsg = createMessage(
        "Sem problemas, voltamos para a etapa anterior. Escolha uma opção:",
        "bot"
      );

      setMessages((prev) => [...prev, userMsg, botMsg]);
      persist([userMsg, botMsg]);

      setHistoryStack(previous);
      setCurrentParentId(parentId);
      fetchOptions(parentId);
      return;
    }

    const userMsg = createMessage(text, "user");
    const toSave = [];

    // Na primeira escolha, salva também as mensagens de boas-vindas
    if (!sessionPromiseRef.current) {
      toSave.push(...messagesRef.current);
    }
    toSave.push(userMsg);

    setMessages((prev) => [...prev, userMsg]);

    // Chamado: orienta o que informar e mostra o link do SISU
    if (isTicketOption(text)) {
      const ticketMsg = createMessage(TICKET_GUIDE, "bot", { link: SISU_URL });

      setIsTyping(true);
      schedule(() => {
        setMessages((prev) => [...prev, ticketMsg]);
        setIsTyping(false);
      }, 800);

      toSave.push(ticketMsg);
    }

    // Resposta do bot, com indicador de digitação
    if (option.bot_response) {
      const botMsg = createMessage(fillPlaceholders(option.bot_response), "bot");
      toSave.push(botMsg);
      setIsTyping(true);

      schedule(() => {
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, 1200);
    }

    persist(toSave, { finish: Boolean(option.is_solution) });

    // Continua o fluxo ou encerra o atendimento
    if (!option.is_solution) {
      setHistoryStack((prev) => [...prev, currentParentId]);
      setCurrentParentId(option.id);
      fetchOptions(option.id);
    } else {
      setCurrentOptions([]);
      schedule(() => setCurrentOptions([RESTART_OPTION]), 2000);
    }
  };

  const visibleOptions = viewingSession ? [RESTART_OPTION] : currentOptions;

  return (
    <div className="chat-container">
      <Sidebar
        displayName={displayName}
        sessions={sessions}
        activeSessionId={viewingSession ? viewingSession.id : activeSessionId}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
        onClearHistory={handleClearHistory}
        onNewChat={handleNewChat}
        onLogout={handleLogout}
      />

      <main className="chat-main">
        {/* CABEÇALHO */}
        <header className="chat-header">
          <div className="header-content">
            <div className="avatar-robot">
              <img
                src="/avatar-nti.png"
                alt="Avatar do Téo NTI"
                className="avatar-img"
              />
            </div>

            <div className="header-text-group">
              <span className="chat-assistant-name">Téo NTI</span>
              <small>Seu assistente de TI</small>
            </div>

            <span className="chat-status">
              <span className="chat-status-dot" />
              {viewingSession ? "Histórico" : "Atendimento"}
            </span>
          </div>
        </header>

        {/* ÁREA DE MENSAGENS */}
        <section className="messages-area" aria-label="Conversa com o Téo NTI">
          {viewingSession && (
            <p className="history-banner" role="note">
              Você está vendo um atendimento anterior: “{viewingSession.title}”
            </p>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-bubble ${
                message.sender === "user" ? "user-msg" : "bot-msg"
              }`}
            >
              <div className="message-text">
                <FormattedText text={message.text} />
                {message.link && (
                  <div className="message-actions">
                    <a
                      className="message-link"
                      href={message.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={16} aria-hidden="true" />
                      Abrir SISU
                    </a>
                  </div>
                )}
              </div>

              <time
                className="message-time"
                dateTime={new Date(message.timestamp).toISOString()}
              >
                {formatMessageTime(message.timestamp)}
              </time>
            </div>
          ))}

          {/* TÉO DIGITANDO */}
          {isTyping && (
            <div
              className="message-bubble bot-msg typing-indicator"
              role="status"
              aria-label="Téo NTI está digitando"
            >
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}

          <div ref={messagesEndRef} />
        </section>

        {/* OPÇÕES DE ATENDIMENTO */}
        <footer className="chat-footer">
          <div className="option-btn-container">
            {visibleOptions.map((option) => {
              const Icon = getOptionIcon(option);

              return (
                <button
                  key={option.id}
                  type="button"
                  className={`option-btn ${
                    option.is_back_action ? "secondary" : ""
                  }`}
                  onClick={() => handleOptionClick(option)}
                  disabled={loading || isTyping}
                >
                  <span className="option-icon" aria-hidden="true">
                    <Icon size={21} strokeWidth={1.9} />
                  </span>

                  <span className="option-label">{option.option_text}</span>
                </button>
              );
            })}

            {loading && (
              <p className="chat-loading" role="status">
                Carregando...
              </p>
            )}
          </div>
        </footer>
      </main>
    </div>
  );
}
