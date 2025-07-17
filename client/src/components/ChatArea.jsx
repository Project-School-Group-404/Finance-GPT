import { useEffect, useRef, useState } from 'react'

function ChatArea({ messages }) {
    const messagesEndRef = useRef(null)
    const containerRef = useRef(null)
    const [displayedMessages, setDisplayedMessages] = useState([])
    const [currentTyping, setCurrentTyping] = useState(null)
    const lastUserMessageIdRef = useRef(null)
    const waitingForBotResponseRef = useRef(false)

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [displayedMessages])

    // Typewriter effect for AI messages
    useEffect(() => {
        if (!messages || messages.length === 0) {
            setDisplayedMessages([])
            waitingForBotResponseRef.current = false
            return
        }
        
        const lastMessage = messages[messages.length - 1]
        const lastDisplayedMessage = displayedMessages[displayedMessages.length - 1]
        
        // Check if this is a new user message
        if (lastMessage.type === 'user' && 
            (!lastDisplayedMessage || lastDisplayedMessage.id !== lastMessage.id)) {
            // Mark that we're waiting for a bot response after this user message
            lastUserMessageIdRef.current = lastMessage.id
            waitingForBotResponseRef.current = true
            setDisplayedMessages(messages)
            return
        }
        
        // If the last message is a bot message AND we're waiting for a response to a user message
        if (lastMessage.type === 'bot' && 
            waitingForBotResponseRef.current &&
            (!lastDisplayedMessage || lastDisplayedMessage.id !== lastMessage.id)) {
            
            // Show all messages except the last bot message immediately
            const messagesWithoutLast = messages.slice(0, -1)
            setDisplayedMessages(messagesWithoutLast)
            
            // Start typing animation for the new bot message
            setCurrentTyping({ ...lastMessage, displayedText: '' })
            
            // Reset the waiting flag - we've now handled the response to the user message
            waitingForBotResponseRef.current = false
            
            const fullText = lastMessage.text
            let currentIndex = 0
            
            const typeInterval = setInterval(() => {
                if (currentIndex < fullText.length) {
                    setCurrentTyping(prev => ({
                        ...prev,
                        displayedText: fullText.slice(0, currentIndex + 1)
                    }))
                    currentIndex++
                } else {
                    clearInterval(typeInterval)
                    setDisplayedMessages(messages)
                    setCurrentTyping(null)
                }
            }, 10)
            
            return () => clearInterval(typeInterval)
        } else {
            // For other messages or if we're not waiting for a bot response
            setDisplayedMessages(messages)
        }
    }, [messages])

    if (!messages || messages.length === 0) {
        return null;
    }

    const allMessages = [...displayedMessages]
    if (currentTyping) {
        allMessages.push(currentTyping)
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar"
                style={{ maxHeight: '100%' }}
            >
                <div className="max-w-4xl mx-auto w-full px-4">
                    {allMessages.map((message, index) => {
                        // Only add extra spacing after user messages, not before AI messages
                        const userToAiTransition = message.type === 'user' && 
                                                  index < allMessages.length - 1 && 
                                                  allMessages[index + 1]?.type === 'bot';
                                                  
                        // Standard spacing for same-speaker messages
                        const marginClass = userToAiTransition ? 'mb-10' : 'mb-3';
                        
                        return (
                            <div key={message.id || index} className={`message-container flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} ${marginClass}`}>
                                {message.type === 'user' ? (
                                    // User message with background
                                    <div className="user-message rounded-lg p-4 ml-auto mb-2"
                                        style={{
                                            backgroundColor: '#6366f1',
                                            color: '#ffffff',
                                            maxWidth: '65%'
                                        }}>
                                    {message.file && (
                                        <div className="mb-2 p-2 bg-black/10 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="text-sm">{message.file.name}</span>
                                                <span className="text-xs opacity-70">({(message.file.size / 1024).toFixed(1)} KB)</span>
                                            </div>
                                        </div>
                                    )}
                                    <div className="whitespace-pre-wrap text-base" style={{ lineHeight: '1.6' }}>{message.text}</div>
                                </div>
                            ) : (
                                // AI message without background, full width
                                <div className="ai-message w-full mt-4">
                                    <div className="ai-message-content whitespace-pre-wrap text-lg pl-2" 
                                        style={{ 
                                            lineHeight: '1.8',
                                            maxWidth: '90%'
                                        }}>
                                        {currentTyping && currentTyping.id === message.id 
                                            ? currentTyping.displayedText 
                                            : message.text}
                                        {currentTyping && currentTyping.id === message.id && (
                                            <span className="typewriter-cursor">|</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )})}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    )
}

export default ChatArea
