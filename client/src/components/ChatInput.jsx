import { useRef } from 'react'

function ChatInput({ inputValue, setInputValue, uploadedFile, setUploadedFile, onSendMessage, isLoading, onFileChange }) {
    const fileInputRef = useRef(null)

    const handleSendMessage = () => {
        if (!inputValue.trim() && !uploadedFile) return;
        if (isLoading) return; // Prevent sending while loading

        const messageText = inputValue.trim();
        const file = uploadedFile;

        // Call parent callback to add message to chat
        if (onSendMessage) {
            onSendMessage(messageText, file);
        }

        // Clear input and uploaded file after sending
        setInputValue('');
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Clear persisted file
        if (onFileChange) {
            onFileChange(null);
        }
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedFile(file);
            // Persist file to localStorage
            if (onFileChange) {
                onFileChange(file);
            }
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage();
        }
    }

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* File upload preview */}
                {uploadedFile && (
                    <div className="mb-4 p-3 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" style={{color: 'var(--accent-primary)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span className="text-sm" style={{color: 'var(--text-primary)'}}>
                                    {uploadedFile.name}
                                    {uploadedFile.isPersisted && (
                                        <span className="ml-2 text-xs" style={{color: 'var(--accent-primary)'}}>(restored)</span>
                                    )}
                                </span>
                                <span className="text-sm" style={{color: 'var(--text-secondary)'}}>({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setUploadedFile(null);
                                    if (fileInputRef.current) {
                                        fileInputRef.current.value = '';
                                    }
                                    // Clear persisted file
                                    if (onFileChange) {
                                        onFileChange(null);
                                    }
                                }}
                                className="transition-colors"
                                style={{color: 'var(--text-secondary)'}}
                                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                <div className="rounded-[30px] card-shadow chat-input-container" style={{
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '2px solid var(--border-color)'
                }}>
                    <div className="flex items-center p-3">
                        {/* Upload Button */}
                        <button 
                            onClick={handleUploadClick}
                            className="p-3 rounded-full transition-colors button-hover"
                            style={{color: 'var(--text-primary)'}}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-bg)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            title="Upload file"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                        </button>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".txt,.pdf,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png,.gif"
                        />

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask Finance GPT"
                            className="flex-1 bg-transparent px-4 py-3 text-lg focus:outline-none focus:ring-0 focus:border-none"
                            style={{
                                border: 'none',
                                outline: 'none',
                                boxShadow: 'none',
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                appearance: 'none', 
                                color: 'var(--text-primary)'
                            }}
                        />

                        {/* Send Button */}
                        <div className="flex items-center gap-2 ml-4">
                            <button 
                                onClick={handleSendMessage}
                                disabled={(!inputValue.trim() && !uploadedFile) || isLoading}
                                className={`p-3 rounded-full transition-colors ${
                                    (!(inputValue.trim() || uploadedFile) || isLoading) ? 'cursor-not-allowed' : ''
                                }`}
                                style={{
                                    backgroundColor: (inputValue.trim() || uploadedFile) && !isLoading ? 'var(--accent-primary)' : 'var(--border-color)',
                                    color: (inputValue.trim() || uploadedFile) && !isLoading ? 'var(--bg-primary)' : 'var(--text-secondary)'
                                }}
                                title="Send message"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatInput
