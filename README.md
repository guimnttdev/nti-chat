# 🤖 Teo Sena - Interface do Assistente Virtual NTI

> **Versão:** 1.0.0 (MVP/Homologação)  
> **Tecnologia:** React + Vite

## 📋 Visão Geral do Projeto
Interface visual de Chatbot Suporte, do Núcleo de Tecnologia da Informação do Sistema FAEB/SENAR da Bahia. O objetivo é que haja uma primeira linha de atendimento para os colaboradores da sede do SENAR/BA, em Salvador. Buscando oferecer uma experiência amigável para triagem de problemas de TI que sejam corriqueiros e que possam ser resolvidos sem a presença física dos analistas e técnitos do setor.

O sistema simula uma conversa natural, guia o usuário através de um fluxo de diagnóstico e, caso não consiga resolver, redireciona automaticamente para a abertura de chamados no **GLPI**, garantindo que o suporte técnico receba demandas mais qualificadas.

### ✨ Principais Funcionalidades
- **Login Integrado:** Acesso seguro utilizando as mesmas credenciais de rede (Active Directory) do usuário.
- **Identidade Visual:** Design alinhado com a marca do SENAR (cores, logos e tipografia).
- **Chat Interativo:** Respostas rápidas e fluxo de decisão guiado.
- **Redirecionamento Inteligente:** Abre o GLPI automaticamente em nova aba quando necessário.
- **Feedback de Erro:** Avisos visuais claros caso o login falhe ou o servidor esteja indisponível.

---

## 🚀 Guia de Instalação e Uso (Passo a Passo)

Este guia foi desenhado para permitir que qualquer pessoa com acesso ao código consiga colocar o sistema no ar.

### 1. Pré-requisitos
Antes de começar, certifique-se de ter instalado no computador:
- **Node.js** (Versão 18 ou superior).
- Acesso à rede interna onde roda a API (Backend).

### 2. Instalação das Dependências
Abra o terminal na pasta do projeto e execute o comando abaixo para baixar as "peças" necessárias para o site funcionar:

```bash
npm install
```

### 3. Executando o Projeto
Para iniciar o site em modo de desenvolvimento, execute:
```bash
npm run dev
```
O terminal mostrará um endereço (geralmente http://localhost:5173). Abra este link no navegador para usar o chat.

🛠️ Estrutura para Desenvolvedores
src/pages/Login.jsx: Gerencia a autenticação e conexão inicial.

src/components/Chat.jsx: Lógica de exibir mensagens e botões.

src/App.jsx: Gerencia as rotas (troca de telas entre Login e Chat).

public/: Contém as imagens estáticas (Logos, ícones).
