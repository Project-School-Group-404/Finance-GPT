import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessage from '../components/ChatMessage';
import ModelSwitcher from '../components/ModelSwitcher';
import { saveChat, loadChats, createNewChat, getChatList, deleteChat } from '../services/ChatService';
import { useTheme } from '../contexts/ThemeContext';

const ChatPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [chatList, setChatList] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('default-model');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Load chat list on component mount
  useEffect(() => {
    const chats = getChatList();
    setChatList(chats);
    
    // If there are existing chats, load the most recent one
    if (chats.length > 0) {
      const latestChat = chats[0];
      setCurrentChatId(latestChat.id);
      setMessages(loadChats(latestChat.id));
    }
    // Don't create a new chat automatically - let user do it manually
  }, []);

  const handleNewChat = () => {
    const newChatId = createNewChat();
    setCurrentChatId(newChatId);
    setMessages([]);
    setInput('');
    
    // Immediately update chat list to show the new chat
    const updatedChats = getChatList();
    setChatList(updatedChats);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChatId(chatId);
    setMessages(loadChats(chatId));
  };

  const handleDeleteChat = (chatId, e) => {
    e.stopPropagation();
    deleteChat(chatId);
    const updatedChats = getChatList();
    setChatList(updatedChats);
    
    // If the deleted chat was the current one, create a new chat
    if (chatId === currentChatId) {
      if (updatedChats.length > 0) {
        const latestChat = updatedChats[0];
        setCurrentChatId(latestChat.id);
        setMessages(loadChats(latestChat.id));
      } else {
        handleNewChat();
      }
    }
  };

  const handleSend = () => {
    if (!input.trim() || !currentChatId) return;

    const userMsg = { sender: 'user', text: input };
    const botMsg = { sender: 'bot', text: `Response from ${model} (stub)` }; // placeholder

    const newMessages = [...messages, userMsg, botMsg];
    setMessages(newMessages);
    saveChat(currentChatId, newMessages);
    setInput('');
    
    // Update chat list to reflect the new message
    const updatedChats = getChatList();
    setChatList(updatedChats);
  };

  return (
    <div className="flex h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 overflow-hidden flex flex-col`}
        style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)' }}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={handleNewChat}
            className="w-full px-4 py-2 rounded flex items-center justify-center gap-2 hover:opacity-90 transition-all duration-200 font-medium"
            style={{ backgroundColor: 'var(--accent-primary)', color: 'var(--text-primary)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {chatList.map((chat) => (
            <div
              key={chat.id}
              className={`p-3 cursor-pointer transition-all duration-200 border-b group relative ${
                currentChatId === chat.id ? 'bg-opacity-20' : 'hover:bg-opacity-10'
              }`}
              style={{ 
                borderColor: 'var(--border-color)',
                backgroundColor: currentChatId === chat.id ? 'var(--accent-primary)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (currentChatId !== chat.id) {
                  e.target.style.backgroundColor = 'rgba(107, 114, 128, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (currentChatId !== chat.id) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
              onClick={() => handleSelectChat(chat.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-2">
                  <div 
                    className="text-sm font-medium truncate"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {chat.title}
                  </div>
                  <div 
                    className="text-xs mt-1"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded hover:bg-red-500 hover:bg-opacity-20"
                  style={{ color: 'var(--text-secondary)' }}
                  title="Delete chat"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty state for no chats */}
          {chatList.length === 0 && (
            <div className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
              <div className="text-sm">No chats yet</div>
              <div className="text-xs mt-1">Click "New Chat" to start</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 shadow" 
                style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              title="Go back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              title="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
              </svg>
            </button>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
              Chat
            </h1>
          </div>
          <ModelSwitcher model={model} onChange={setModel} />
        </header>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3" 
             style={{ backgroundColor: 'var(--bg-primary)' }}>
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center" style={{ color: 'var(--text-secondary)' }}>
                <div className="text-4xl mb-4">💬</div>
                <h2 className="text-xl font-semibold mb-2">Start a new conversation</h2>
                <p>Type a message below to begin chatting</p>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <ChatMessage key={idx} sender={msg.sender} text={msg.text} />
            ))
          )}
        </div>

        {/* Input Footer */}
        <footer className="p-4 border-t" 
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex gap-2">
            <input
              className="flex-1 p-3 border rounded-lg"
              style={{
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                borderColor: 'var(--border-color)'
              }}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button
              className="px-6 py-3 rounded-lg hover:opacity-80 transition-opacity"
              style={{
                backgroundColor: 'var(--accent-primary)',
                color: 'var(--text-primary)',
                border: 'none'
              }}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatPage;