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
            restoreUploadedFile()
        }
    }, [user])

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`https://backend-172789587838.asia-south1.run.app/api/chats/${user.id}`)
            const data = await response.json()

            if (response.ok && data.chats && data.chats.length > 0) {
                const chatMessages = []
                data.chats.forEach(chat => {
                    // Create file object if document exists
                    const documentFile = chat.documentName ? {
                        name: chat.documentName,
                        type: chat.documentType,
                        size: chat.documentSize,
                        path: chat.documentPath,
                        uploadedAt: chat.uploadedAt
                    } : null;

                    chatMessages.push({
                        id: `user-${chat.id}`,
                        text: chat.userMessage,
                        file: documentFile,
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
                const chatRequestBody = {
                    userId: user.id,
                    message: messageText,
                    history: messages.filter(m => m.type !== "system").map(m => m.text)
                };

                // Add document information if file exists
                if (file) {
                    chatRequestBody.documentName = file.name;
                    chatRequestBody.documentType = file.type || file.name.split('.').pop();
                    chatRequestBody.documentSize = file.size;
                    chatRequestBody.documentPath = `uploads/${file.name}`; // This should match your upload path
                }

                const response = await fetch("http://localhost:8000/chat", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(chatRequestBody)
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
                        text: "Error processing message.",
                        type: 'bot',
                        timestamp: new Date()
                    }]);
                }

            } catch (error) {
                console.error("Upload/chat error:", error);
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    text: "Failed to connect to backend.",
                    type: 'bot',
                    timestamp: new Date()
                }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Persist uploaded file to localStorage
    const persistUploadedFile = (file) => {
        if (file) {
            const fileData = {
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            }
            localStorage.setItem(`fgpt_uploaded_file_${user.id}`, JSON.stringify(fileData))
        } else {
            localStorage.removeItem(`fgpt_uploaded_file_${user.id}`)
        }
    }

    // Restore uploaded file from localStorage
    const restoreUploadedFile = () => {
        try {
            const storedFileData = localStorage.getItem(`fgpt_uploaded_file_${user.id}`)
            if (storedFileData) {
                const fileData = JSON.parse(storedFileData)
                // Create a mock file object for display purposes
                const mockFile = {
                    name: fileData.name,
                    type: fileData.type,
                    size: fileData.size,
                    lastModified: fileData.lastModified,
                    isPersisted: true // Flag to indicate this is from storage
                }
                setUploadedFile(mockFile)
            }
        } catch (error) {
            console.error('Error restoring uploaded file:', error)
            localStorage.removeItem(`fgpt_uploaded_file_${user.id}`)
        }
    }

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
                    onFileChange={persistUploadedFile}
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
