import React from "react";
import { Plus, X, LogOut } from "lucide-react";
import "./Sidebar.css";

function formatSessionDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const Sidebar = ({
  displayName,
  sessions = [],
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onClearHistory,
  onNewChat,
  onLogout,
}) => {
  return (
    <aside className="nti-sidebar">
      <div className="sidebar-brand">
        <img src="/logo-verde.png" alt="FAEB SENAR" className="sidebar-logo" />
        <div>
          <strong>NTI 2.0</strong>
          <span>Central de Atendimento</span>
        </div>
      </div>

      <div className="sidebar-navigation">
        <button type="button" className="sidebar-new-chat" onClick={onNewChat}>
          <Plus size={18} strokeWidth={2.2} aria-hidden="true" />
          Novo atendimento
        </button>

        <div className="sidebar-section-title">
          <span>Histórico</span>
          {sessions.length > 0 && (
            <button
              type="button"
              className="sidebar-clear"
              onClick={onClearHistory}
            >
              Limpar tudo
            </button>
          )}
        </div>

        <nav className="sidebar-history" aria-label="Atendimentos anteriores">
          {sessions.length === 0 && (
            <p className="sidebar-history-empty">
              Seus atendimentos aparecerão aqui.
            </p>
          )}

          {sessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                className={`sidebar-history-item ${isActive ? "active" : ""}`}
              >
                <button
                  type="button"
                  className="sidebar-history-open"
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onSelectSession(session)}
                  title={session.title}
                >
                  <span className="sidebar-history-title">{session.title}</span>
                  <span className="sidebar-history-meta">
                    {formatSessionDate(session.updated_at || session.created_at)}
                    {" · "}
                    {session.status === "finished" ? "Finalizado" : "Em aberto"}
                  </span>
                </button>

                <button
                  type="button"
                  className="sidebar-history-delete"
                  onClick={() => onDeleteSession(session)}
                  aria-label={`Excluir atendimento "${session.title}"`}
                  title="Excluir"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="sidebar-user-info">
            <strong>{displayName}</strong>
            <span>Colaborador</span>
          </div>
        </div>

        <button type="button" className="sidebar-logout" onClick={onLogout}>
          <LogOut size={17} aria-hidden="true" />
          Sair do sistema
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
