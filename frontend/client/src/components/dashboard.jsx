import { useState, useEffect } from 'react'
import Header from './Header'
import ChatInput from './ChatInput'
import ChatArea from './ChatArea'
import SettingsModal from './SettingsModal'
import useUserData from '../hooks/useUserData'

function Dashboard({ user, onLogout }) {
    const [inputValue, setInputValue] = useState('')
    const [uploadedFile, setUploadedFile] = useState(null)
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasLoadedHistory, setHasLoadedHistory] = useState(false)
    const { userName } = useUserData(user)

    // Load chat history from Node.js
    useEffect(() => {
        if (user?.id) {
            loadChatHistory()
        }
    }, [user])

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/chats/${user.id}`)
            const data = await response.json()

            if (response.ok && data.chats && data.chats.length > 0) {
                const chatMessages = []
                data.chats.forEach(chat => {
                    chatMessages.push({
                        id: `user-${chat.id}`,
                        text: chat.userMessage,
                        file: null,
                        type: 'user',
                        timestamp: new Date()
                    })
                    chatMessages.push({
                        id: `bot-${chat.id}`,
                        text: chat.assistantReply,
                        file: null,
                        type: 'bot',
                        timestamp: new Date()
                    })
                })
                setMessages(chatMessages)
                setHasLoadedHistory(true)
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
        }
    }

    const handleSettingsClick = () => setShowSettingsModal(true)
    const handleCloseSettings = () => setShowSettingsModal(false)

    const handleSendMessage = async (messageText, file, type = 'user') => {
        if (type === 'user') {
            // Show user message immediately
            const userMessage = {
                id: Date.now(),
                text: messageText,
                file: file,
                type: 'user',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

            try {
                // ✅ Upload file first if present
                if (file) {
                    const formData = new FormData();
                    formData.append("file", file);

                    const uploadResponse = await fetch("http://localhost:8000/upload", {
                        method: "POST",
                        body: formData
                    });

                    const uploadResult = await uploadResponse.json();
                    console.log("Upload result:", uploadResult);
                }

                // ✅ Then send message to chat endpoint
                const response = await fetch("http://localhost:8000/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        userId: user.id,
                        message: messageText,
                        history: messages.filter(m => m.type !== "system").map(m => m.text)
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    const botResponse = {
                        id: Date.now() + 1,
                        text: data.reply,
                        file: null,
                        type: 'bot',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, botResponse]);
                } else {
                    setMessages(prev => [...prev, {
                        id: Date.now() + 1,
                        text: "❌ Error processing message.",
                        type: 'bot',
                        timestamp: new Date()
                    }]);
                }

            } catch (error) {
                console.error("Upload/chat error:", error);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "❌ Failed to connect to backend.",
                    type: 'bot',
                    timestamp: new Date()
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const hasMessages = messages.length > 0

    return (
        <div className="h-screen text-white flex flex-col" style={{backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="flex-shrink-0">
                <Header 
                    userName={userName}
                    onLogout={onLogout}
                    onSettingsClick={handleSettingsClick}
                />
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                {!hasMessages ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="text-center mb-8">
                            <div className="text-lg" style={{color: 'var(--text-secondary)'}}>Start a conversation with Finance GPT</div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 min-h-0 chat-container">
                        <ChatArea messages={messages} />
                    </div>
                )}
            </div>

            <div className="flex-shrink-0">
                <ChatInput 
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    uploadedFile={uploadedFile}
                    setUploadedFile={setUploadedFile}
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                />
            </div>

            <SettingsModal 
                showSettingsModal={showSettingsModal}
                onClose={handleCloseSettings}
                user={user}
                userName={userName}
            />
        </div>
    )
}

export default Dashboard
