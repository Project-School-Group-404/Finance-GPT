function ProfileMenu({ showProfileMenu, handleMouseEnter, handleMouseLeave, onSettingsClick, onLogout }) {
    const handleSettingsClick = () => {
        onSettingsClick()
    }

    const handleLogout = async () => {
        try {
            // Call logout API endpoint
            await fetch("/api/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Clear any stored user data
            localStorage.removeItem('fgpt_user');
            localStorage.removeItem('fgpt_isLoggedIn');
            localStorage.removeItem('authToken');
            sessionStorage.clear();
            
            // Use parent component's logout handler if available
            if (onLogout) {
                onLogout();
            } else {
                // Fallback: redirect to login
                window.location.href = '/';
            }
        }
    }

    if (!showProfileMenu) return null;

    return (
        <div 
            className="absolute right-4 top-10 rounded-xl shadow-lg py-2 min-w-[150px] z-10 card-shadow"
            style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)'}}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button 
                className="w-full text-left px-4 py-2 flex items-center gap-3 transition-colors rounded-lg button-hover"
                style={{color: 'var(--text-primary)'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                onClick={handleSettingsClick}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm">Settings</span>
            </button>
            <button 
                className="w-full text-left px-4 py-2 flex items-center gap-3 transition-colors rounded-lg button-hover"
                style={{color: 'var(--text-primary)'}}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                onClick={handleLogout}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="text-sm">Logout</span>
            </button>
        </div>
    )
}

export default ProfileMenu
