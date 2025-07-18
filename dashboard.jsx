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

    // Get time-based greeting
    const getTimeBasedGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) {
            return 'Good Morning'
        } else if (hour < 17) {
            return 'Good Afternoon'
        } else {
            return 'Good Evening'
        }
    }

    // Load chat history from Node.js
    useEffect(() => {
        if (user?.id) {
            loadChatHistory()
            restoreUploadedFile()
        }
    }, [user])

    const loadChatHistory = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/chat/${user.id}`)
            const data = await response.json()

            if (response.ok && data.chats && data.chats.length > 0) {
                const chatMessages = []
                data.chats.forEach(chat => {
                    // Handle documents - prioritize new documents JSON field over legacy fields
                    let documentFiles = null;
                    
                    if (chat.documents && Array.isArray(chat.documents)) {
                        // Use new documents JSON array
                        documentFiles = chat.documents.map(doc => ({
                            name: doc.name,
                            type: doc.type,
                            size: doc.size,
                            path: doc.path,
                            uploadedAt: doc.uploadedAt
                        }));
                    } else if (chat.documentName) {
                        // Fallback to legacy single document format
                        documentFiles = {
                            name: chat.documentName,
                            type: chat.documentType,
                            size: chat.documentSize,
                            path: chat.documentPath,
                            uploadedAt: chat.uploadedAt
                        };
                    }

                    chatMessages.push({
                        id: `user-${chat.id}`,
                        text: chat.userMessage,
                        file: documentFiles,
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

    const handleSendMessage = async (messageText, files, type = 'user', model = 'finance-agent') => {
        if (type === 'user') {
            // Normalize files to always be an array for processing
            const fileArray = files ? (Array.isArray(files) ? files : [files]) : [];
            
            // Show user message immediately
            const userMessage = {
                id: Date.now(),
                text: messageText,
                file: files, // Keep original format for display
                type: 'user',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMessage]);
            setIsLoading(true);

            try {
                // ✅ Upload files first if present
                const uploadedFiles = [];
                if (fileArray.length > 0) {
                    for (const file of fileArray) {
                        const formData = new FormData();
                        formData.append("file", file);

                        const uploadResponse = await fetch("http://localhost:8000/upload", {
                            method: "POST",
                            body: formData
                        });

                        const uploadResult = await uploadResponse.json();
                        console.log("Upload result:", uploadResult);
                        uploadedFiles.push({
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            path: `uploads/${file.name}`
                        });
                    }
                }

                // ✅ Then send message to chat endpoint
                const chatRequestBody = {
                    userId: user.id,
                    message: messageText,
                    model: model, // Include selected model
                    history: messages.filter(m => m.type !== "system").map(m => m.text)
                };

                // Add document information if files exist
                if (uploadedFiles.length > 0) {
                    // For multiple files, we'll send info about the first file for now
                    // You might want to modify your backend to handle multiple files
                    const primaryFile = uploadedFiles[0];
                    chatRequestBody.documentName = primaryFile.name;
                    chatRequestBody.documentType = primaryFile.type || primaryFile.name.split('.').pop();
                    chatRequestBody.documentSize = primaryFile.size;
                    chatRequestBody.documentPath = primaryFile.path;
                    
                    // Add info about additional files
                    if (uploadedFiles.length > 1) {
                        chatRequestBody.additionalFiles = uploadedFiles.slice(1);
                        chatRequestBody.totalFileCount = uploadedFiles.length;
                    }
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
                    // Display AI response to user immediately
                    const botResponse = {
                        id: Date.now() + 1,
                        text: data.reply,
                        file: null,
                        type: 'bot',
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, botResponse]);

                    // Save conversation to Node.js database
                    try {
                        // For multiple files, save info about the primary file
                        const primaryFile = fileArray.length > 0 ? fileArray[0] : null;
                        
                        const saveResponse = await fetch("http://localhost:3000/api/chat/ai", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                userMessage: messageText,
                                assistantReply: data.reply,
                                userId: user.id,
                                documentName: primaryFile?.name || null,
                                documentType: primaryFile?.type || primaryFile?.name?.split('.').pop() || null,
                                documentPath: primaryFile ? `uploads/${primaryFile.name}` : null,
                                documentSize: primaryFile?.size || null,
                                // Add metadata for multiple files
                                totalFiles: fileArray.length,
                                additionalFilesInfo: fileArray.length > 1 ? fileArray.slice(1).map(f => ({
                                    name: f.name,
                                    type: f.type,
                                    size: f.size
                                })) : null
                            })
                        });

                        if (saveResponse.ok) {
                            const saveResult = await saveResponse.json();
                            console.log("Chat saved successfully:", saveResult);
                        } else {
                            console.error("Failed to save chat to database");
                        }
                    } catch (saveError) {
                        console.error("Error saving chat:", saveError);
                        // Note: Don't show error to user since chat still works
                    }

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

    // Persist uploaded files to localStorage
    const persistUploadedFile = (files) => {
        if (files) {
            if (Array.isArray(files)) {
                // Multiple files
                const filesData = files.map(file => ({
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified
                }));
                localStorage.setItem(`fgpt_uploaded_files_${user.id}`, JSON.stringify(filesData));
            } else {
                // Single file (backward compatibility)
                const fileData = {
                    name: files.name,
                    type: files.type,
                    size: files.size,
                    lastModified: files.lastModified
                };
                localStorage.setItem(`fgpt_uploaded_file_${user.id}`, JSON.stringify(fileData));
            }
        } else {
            // Clear both single and multiple file storage
            localStorage.removeItem(`fgpt_uploaded_file_${user.id}`);
            localStorage.removeItem(`fgpt_uploaded_files_${user.id}`);
        }
    }

    // Restore uploaded files from localStorage
    const restoreUploadedFile = () => {
        try {
            // Try to restore multiple files first
            const storedFilesData = localStorage.getItem(`fgpt_uploaded_files_${user.id}`);
            if (storedFilesData) {
                const filesData = JSON.parse(storedFilesData);
                const mockFiles = filesData.map(fileData => ({
                    name: fileData.name,
                    type: fileData.type,
                    size: fileData.size,
                    lastModified: fileData.lastModified,
                    isPersisted: true
                }));
                setUploadedFile(mockFiles);
                return;
            }

            // Fallback to single file for backward compatibility
            const storedFileData = localStorage.getItem(`fgpt_uploaded_file_${user.id}`);
            if (storedFileData) {
                const fileData = JSON.parse(storedFileData);
                const mockFile = {
                    name: fileData.name,
                    type: fileData.type,
                    size: fileData.size,
                    lastModified: fileData.lastModified,
                    isPersisted: true
                };
                setUploadedFile(mockFile);
            }
        } catch (error) {
            console.error('Error restoring uploaded files:', error);
            localStorage.removeItem(`fgpt_uploaded_file_${user.id}`);
            localStorage.removeItem(`fgpt_uploaded_files_${user.id}`);
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
                    showBackButton={true}
                />
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
                {!hasMessages ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <div className="text-center mb-8">
                            <div className="text-2xl font-medium" style={{color: '#4A90E2'}}>{getTimeBasedGreeting()}, {userName || 'User'}</div>
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
