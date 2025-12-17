// Simulação da resposta que virá de AP
// Estrutura: Chave (ID do passo) -> Objeto com Mensagem e Opções.

export const chatFlow = {
  // Passo Inicial (Obrigatório ter o nome 'start')
  start: {
    botMessage: "Por favor, selecione a categoria do seu problema:",
    options: [
      { id: 1, label: "Problemas de Hardware", nextStep: "hardware" },
      { id: 2, label: "Problemas de Software", nextStep: "software" },
      { id: 3, label: "Acesso e Redes", nextStep: "network" },
    ]
  },
  
  // Caminho Hardware
  hardware: {
    botMessage: "Entendido. Qual equipamento está apresentando falha?",
    options: [
      { id: 4, label: "Impressora / Scanner", nextStep: "printer" },
      { id: 5, label: "Monitor / Tela", nextStep: "monitor" },
      { id: 6, label: "Computador / Notebook", nextStep: "computer" },
      { id: 0, label: "Voltar ao início", nextStep: "start" }
    ]
  },

  // Caminho Software
  software: {
    botMessage: "Certo. Qual software está com problemas?",
    options: [
      { id: 7, label: "Windows / Sistema Operacional", nextStep: "os_issue" },
      { id: 8, label: "Pacote Office (Word, Excel)", nextStep: "office" },
      { id: 9, label: "Sistema Interno (ERP)", nextStep: "erp" },
      { id: 0, label: "Voltar ao início", nextStep: "start" }
    ]
  },
  
  // Caminho Redes
  network: {
    botMessage: "Problemas de conexão: O que está acontecendo?",
    options: [
      { id: 10, label: "Sem Internet", nextStep: "no_internet" },
      { id: 11, label: "Pasta de Rede não abre", nextStep: "network_folder" },
      { id: 0, label: "Voltar ao início", nextStep: "start" }
    ]
  },

  // Exemplo de "Fim da Linha"
  printer: {
    botMessage: "Para problemas de impressora: verifique se há papel, se está ligada, se está selecionando a impressora correta ao imprimir um documento e se o documento está com configuração de impressão correta. Se o erro persistir, abriremos um chamado no GLPI.",
    options: [
      { id: 12, label: "Abrir chamado GLPI", action: "open_glpi" }, // Ação futura
      { id: 0, label: "Voltar ao início", nextStep: "start" }
    ]
  }
  
}