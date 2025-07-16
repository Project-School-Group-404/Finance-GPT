import { useEffect, useRef } from 'react'

function ChatArea({ messages }) {
    const messagesEndRef = useRef(null)
    const containerRef = useRef(null)

    const scrollToBottom = () => {
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    if (!messages || messages.length === 0) {
        return null;
    }

    return (
        <div className="flex-1 min-h-0 flex flex-col">
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar"
                style={{ maxHeight: '100%' }}
            >
                <div className="max-w-4xl mx-auto space-y-6 w-full">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`${message.type === 'user' ? 'max-w-2xl' : 'max-w-xl'} rounded-lg p-4 ${message.type === 'user'
                                ? 'ml-auto chat-message-user'
                                : 'mr-auto chat-message-bot'
                            }`}
                            style={{
                                backgroundColor: message.type === 'user' ? '#6366f1' : 'var(--bg-secondary)',
                                border: message.type === 'user' ? 'none' : '1px solid var(--border-color)',
                                color: message.type === 'user' ? '#ffffff' : 'var(--text-primary)'
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
                            <div className="whitespace-pre-wrap">{message.text}</div>
                        </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </div>
    )
}

export default ChatArea
