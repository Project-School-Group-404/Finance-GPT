import { useState } from 'react'
import Header from './Header'
import SettingsModal from './SettingsModal'
import UnifiedChatInterface from './UnifiedChatInterface'
import useUserData from '../hooks/useUserData'

function Dashboard({ user, onLogout }) {
    const [showSettingsModal, setShowSettingsModal] = useState(false)
    const { userName } = useUserData(user)

    const handleSettingsClick = () => setShowSettingsModal(true)
    const handleCloseSettings = () => setShowSettingsModal(false)

    return (
        <div className="h-screen flex flex-col" style={{backgroundColor: 'var(--bg-primary)', fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            <div className="flex-shrink-0">
                <Header 
                    userName={userName}
                    onLogout={onLogout}
                    onSettingsClick={handleSettingsClick}
                />
            </div>

            <div className="flex-1 min-h-0">
                <UnifiedChatInterface 
                    user={user} 
                    isLoggedIn={true} 
                    showSidebar={true} 
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
