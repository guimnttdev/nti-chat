import React, { useState, useEffect, useRef } from 'react' 
import './Chat.css'
import './OptionButton.css'
import { chatFlow } from '../data/flowData'

const Chat = ({ userName }) => {
  
  const [messages, setMessages] = useState([
    { id: 1, text: `Olá, ${userName}! Sou o Teo Sena. O assistente virtual do NTI. Mas pode me chamar de Teo`, sender: 'bot' }
  ])

  const [currentStep, setCurrentStep] = useState('start')
  const messagesEndRef = useRef(null)

  //Rola para baixo automaticamente
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  //Carrega pergunta do robô
  useEffect(() => {
    const stepData = chatFlow[currentStep]

    if (stepData) {
      const timer = setTimeout(() => {
        setMessages((prev) => [
          ...prev, 
          { id: Date.now(), text: stepData.botMessage, sender: 'bot' }
        ])
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // --- HANDLER ---
  const handleOptionClick = (option) => {
    const userResponse = { id: Date.now(), text: option.label, sender: 'user' }
    setMessages((prev) => [...prev, userResponse])

    if (option.nextStep) {
      setCurrentStep(option.nextStep)
    } else if (option.action === 'open_glpi') {
       alert("Redirecionando para GLPI... (Funcionalidade futura)")
    }
  }

  const currentOptions = chatFlow[currentStep]?.options || []

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
                <small>Assistente Virtual</small>
            </div>
        </div>
      </div>

      {/* Messages Body */}
      <div className="messages-area">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message-bubble ${msg.sender === 'user' ? 'user-msg' : 'bot-msg'}`}
          >
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
              className={`option-btn ${option.label.includes('Voltar') ? 'secondary' : ''}`}
              onClick={() => handleOptionClick(option)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Chat