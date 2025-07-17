import React, { useState, useEffect } from 'react';
import { getChatList, loadChats, saveChat, createNewChat } from '../services/ChatService';

const UnifiedChatInterface = () => {
    const [chatList, setChatList] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        const chats = getChatList();
        setChatList(chats);
        if (chats.length > 0) {
            const firstChat = chats[0];
            setActiveChatId(firstChat.id);
            setMessages(loadChats(firstChat.id));
        }
        // Don't create a new chat automatically - let user do it manually
    }, []);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        const updatedMessages = [...messages, { text: newMessage, sender: 'user' }];
        setMessages(updatedMessages);
        saveChat(activeChatId, updatedMessages);
        setNewMessage('');
    };

    const handleSelectChat = (chatId) => {
        setActiveChatId(chatId);
        const msgs = loadChats(chatId);
        setMessages(msgs);
    };

    return (
        <div className="chat-interface flex h-screen">
            <aside className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto">
                <h2 className="text-lg font-bold mb-4 text-gray-700 dark:text-white">Chat History</h2>
                {chatList.map(chat => (
                    <div 
                        key={chat.id} 
                        className={`cursor-pointer p-2 mb-2 rounded hover:bg-gray-300 dark:hover:bg-gray-700 ${chat.id === activeChatId ? 'bg-gray-300 dark:bg-gray-700' : ''}`}
                        onClick={() => handleSelectChat(chat.id)}
                    >
                        {chat.title}
                    </div>
                ))}
            </aside>

            <main className="flex-1 p-4 flex flex-col bg-white dark:bg-gray-900">
                <div className="flex-1 overflow-y-auto mb-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`mb-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            <span className="inline-block px-3 py-2 rounded bg-blue-200 dark:bg-blue-600 text-gray-900 dark:text-white">
                                {msg.text}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex">
                    <input 
                        className="flex-1 border p-2 rounded mr-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                    />
                    <button 
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={handleSendMessage}
                    >
                        Send
                    </button>
                </div>
            </main>
        </div>
    );
};

export default UnifiedChatInterface;