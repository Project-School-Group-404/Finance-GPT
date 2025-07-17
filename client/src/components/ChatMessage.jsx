import React from 'react';

const ChatMessage = ({ sender, text }) => {
  const isUser = sender === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className="max-w-xs px-4 py-2 rounded-lg shadow"
        style={{
          backgroundColor: isUser ? 'var(--chat-user-bg)' : 'var(--bg-secondary)',
          color: isUser ? 'var(--chat-user-text)' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border-color)'
        }}
      >
        {text}
      </div>
    </div>
  );
};

export default ChatMessage;