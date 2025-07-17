import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ProfileMenu from './ProfileMenu'
import { createNewChat } from '../services/ChatService';

function Header({ userName, onLogout, onSettingsClick }) {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [hoverTimeout, setHoverTimeout] = useState(null)
    const navigate = useNavigate()

    const handleMouseEnter = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            setHoverTimeout(null)
        }
        setShowProfileMenu(true)
    }

    const handleMouseLeave = () => {
        const timeout = setTimeout(() => {
            setShowProfileMenu(false)
        }, 100)
        setHoverTimeout(timeout)
    }

    return (
        <header className="p-4" style={{backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)'}}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold" style={{color: 'var(--text-primary)'}}>Finance GPT</h1>
                    
                    {/* ✅ Chat Button */}
                    <button
                        onClick={() => {
                            const chatId = createNewChat();
                            navigate(`/chat?id=${chatId}`);
                        }}
                        className="text-sm px-3 py-1.5 rounded transition-all"
                        style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'var(--bg-primary)',}}
                    >
                        Chat
                    </button>
                </div>

                <div className="relative">
                    <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                        style={{ backgroundColor: 'var(--accent-primary)' }}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <span className="text-sm font-medium" style={{color: 'var(--bg-primary)'}}>
                            {userName ? userName.charAt(0).toUpperCase() : 'U'}
                        </span>
                    </div>
                    
                    <ProfileMenu 
                        showProfileMenu={showProfileMenu}
                        handleMouseEnter={handleMouseEnter}
                        handleMouseLeave={handleMouseLeave}
                        onSettingsClick={onSettingsClick}
                        onLogout={onLogout}
                    />
                </div>
            </div>
        </header>
    )
}

export default Header