// Configuração e acesso centralizado à API

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const SISU_URL =
  import.meta.env.VITE_SISU_URL || 'https://sisu.senarbahia.org.br/ServiceCatalog';

// Contato do NTI exibido em casos urgentes e na tela de login (opcional)
export const NTI_CONTATO = (import.meta.env.VITE_NTI_CONTATO || '').trim();

// Substitui o marcador {contato_nti} dos textos do banco.
// Sem contato configurado, "fale com o NTI: {contato_nti}." vira "fale com o NTI."
export const fillPlaceholders = (text) => {
  const value = text || '';
  if (NTI_CONTATO) return value.replaceAll('{contato_nti}', NTI_CONTATO);
  return value.replace(/:\s*\{contato_nti\}/g, '').replaceAll('{contato_nti}', 'a equipe do NTI');
};

export const INACTIVITY_MINUTES =
  Number(import.meta.env.VITE_INACTIVITY_MINUTES) || 15;

export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada.');
    this.name = 'SessionExpiredError';
  }
}

export function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('chat_user');
  localStorage.removeItem('user');
}

// Encerra a sessão e volta para o login (motivo opcional exibido na tela de login)
export function logout(reason) {
  clearSession();
  window.location.href = reason ? `/?motivo=${encodeURIComponent(reason)}` : '/';
}

// fetch com token, JSON e tratamento de sessão expirada
export async function apiFetch(path, { method = 'GET', body, signal } = {}) {
  const token = localStorage.getItem('token');
  const headers = {};

  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal
  });

  if (response.status === 401) {
    logout('expirado');
    throw new SessionExpiredError();
  }

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return response.json();
}
