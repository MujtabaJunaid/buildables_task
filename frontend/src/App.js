import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (userInput.trim() !== '') {
      const newMessage = { text: userInput, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setUserInput('');

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });
      const data = await response.json();
      const botMessage = { text: data.response, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
      scrollToBottom();
    }
  };

  useEffect(() => {
    const greetingMessage = { text: 'Hello! How can I assist you today?', sender: 'bot' };
    setMessages([greetingMessage]);
  }, []);

  return (
    <div className="chatbot-container">
      <div className="chatbox">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
          >
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage} disabled={!userInput.trim()}>
          Send
        </button>
      </div>
    </div>
  );
};

export default App;
