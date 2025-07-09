import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext.jsx'

function SettingsModal({ showSettingsModal, onClose, user, userName }) {
    const [activeSettingsTab, setActiveSettingsTab] = useState('profile')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordMessage, setPasswordMessage] = useState('')
    const { theme, toggleTheme, isDark } = useTheme()

    const handleCloseSettings = () => {
        onClose()
        setActiveSettingsTab('profile')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setPasswordMessage('')
    }

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage('All fields are required')
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage('New passwords do not match')
            return
        }

        if (newPassword.length < 6) {
            setPasswordMessage('Password must be at least 6 characters')
            return
        }

        try {
            const response = await fetch('/api/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            })

            if (response.ok) {
                setPasswordMessage('Password changed successfully!')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                const error = await response.json()
                setPasswordMessage(error.message || 'Failed to change password')
            }
        } catch (error) {
            setPasswordMessage('Network error. Please try again.')
        }
    }

    if (!showSettingsModal) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
            <div className="rounded-xl shadow-lg w-full max-w-3xl h-[600px] overflow-hidden flex modal-shadow" style={{backgroundColor: 'var(--bg-primary)'}}>
                {/* Sidebar */}
                <div className="w-64" style={{backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)'}}>
                    {/* Header */}
                    <div className="flex items-center gap-3 p-4" style={{borderBottom: '1px solid var(--border-color)'}}>
                        <button 
                            onClick={handleCloseSettings}
                            className="transition-colors"
                            style={{color: 'var(--text-secondary)'}}
                            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <h2 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Settings</h2>
                    </div>

                    {/* Sidebar Menu */}
                    <div className="p-2">
                        <button
                            onClick={() => setActiveSettingsTab('profile')}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                                activeSettingsTab === 'profile' 
                                    ? 'text-white' 
                                    : 'hover:text-white'
                            }`}
                            style={{
                                backgroundColor: activeSettingsTab === 'profile' ? 'var(--accent-primary)' : 'transparent',
                                color: activeSettingsTab === 'profile' ? 'var(--bg-primary)' : 'var(--text-secondary)'
                            }}
                            onMouseEnter={(e) => {
                                if (activeSettingsTab !== 'profile') {
                                    e.target.style.backgroundColor = 'var(--border-color)'
                                    e.target.style.color = 'var(--text-primary)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeSettingsTab !== 'profile') {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="text-sm">Profile Information</span>
                        </button>
                        
                        <button
                            onClick={() => setActiveSettingsTab('password')}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                                activeSettingsTab === 'password' 
                                    ? 'text-white' 
                                    : 'hover:text-white'
                            }`}
                            style={{
                                backgroundColor: activeSettingsTab === 'password' ? 'var(--accent-primary)' : 'transparent',
                                color: activeSettingsTab === 'password' ? 'var(--bg-primary)' : 'var(--text-secondary)'
                            }}
                            onMouseEnter={(e) => {
                                if (activeSettingsTab !== 'password') {
                                    e.target.style.backgroundColor = 'var(--border-color)'
                                    e.target.style.color = 'var(--text-primary)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeSettingsTab !== 'password') {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <span className="text-sm">Change Password</span>
                        </button>

                        <button
                            onClick={() => setActiveSettingsTab('theme')}
                            className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                                activeSettingsTab === 'theme' 
                                    ? 'text-white' 
                                    : 'hover:text-white'
                            }`}
                            style={{
                                backgroundColor: activeSettingsTab === 'theme' ? 'var(--accent-primary)' : 'transparent',
                                color: activeSettingsTab === 'theme' ? 'var(--bg-primary)' : 'var(--text-secondary)'
                            }}
                            onMouseEnter={(e) => {
                                if (activeSettingsTab !== 'theme') {
                                    e.target.style.backgroundColor = 'var(--border-color)'
                                    e.target.style.color = 'var(--text-primary)'
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeSettingsTab !== 'theme') {
                                    e.target.style.backgroundColor = 'transparent'
                                    e.target.style.color = 'var(--text-secondary)'
                                }
                            }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                            <span className="text-sm">Theme Settings</span>
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto" style={{backgroundColor: 'var(--bg-primary)'}}>
                    <div className="p-6">
                        {activeSettingsTab === 'profile' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-6" style={{color: 'var(--text-primary)'}}>Profile Information</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-center mb-6">
                                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{backgroundColor: 'var(--accent-primary)'}}>
                                            <span className="text-3xl font-bold" style={{color: 'var(--bg-primary)'}}>
                                                {userName ? userName.charAt(0).toUpperCase() : 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>Name</label>
                                        <div className="rounded-lg px-4 py-3" style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}}>
                                            {userName || 'Not available'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>Email</label>
                                        <div className="rounded-lg px-4 py-3" style={{backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-primary)'}}>
                                            {user?.email || 'Not available'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSettingsTab === 'password' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-6" style={{color: 'var(--text-primary)'}}>Change Password</h3>
                                <div className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3 focus:outline-none"
                                            style={{
                                                backgroundColor: 'var(--bg-secondary)', 
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-primary)'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                            placeholder="Enter current password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3 focus:outline-none"
                                            style={{
                                                backgroundColor: 'var(--bg-secondary)', 
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-primary)'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                            placeholder="Enter new password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{color: 'var(--text-secondary)'}}>Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="w-full rounded-lg px-4 py-3 focus:outline-none"
                                            style={{
                                                backgroundColor: 'var(--bg-secondary)', 
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-primary)'
                                            }}
                                            onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                            onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                            placeholder="Confirm new password"
                                        />
                                    </div>

                                    {passwordMessage && (
                                        <div className={`text-sm p-3 rounded-lg ${
                                            passwordMessage.includes('successfully') 
                                                ? 'text-green-400 bg-green-400/10 border border-green-400/20' 
                                                : 'text-red-400 bg-red-400/10 border border-red-400/20'
                                        }`}>
                                            {passwordMessage}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleChangePassword}
                                        className="font-medium py-3 px-6 rounded-lg transition-colors"
                                        style={{backgroundColor: 'var(--accent-primary)', color: 'var(--bg-primary)'}}
                                    >
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSettingsTab === 'theme' && (
                            <div>
                                <h3 className="text-xl font-semibold mb-6" style={{color: 'var(--text-primary)'}}>Theme Settings</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-4" style={{color: 'var(--text-secondary)'}}>
                                            Choose your preferred theme
                                        </label>
                                        <div className="space-y-3">
                                            {/* Dark Theme Option */}
                                            <div 
                                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                                                    isDark ? 'border-purple-500' : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                                style={{
                                                    backgroundColor: isDark ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                                    borderColor: isDark ? 'var(--accent-primary)' : 'var(--border-color)'
                                                }}
                                                onClick={() => !isDark && toggleTheme()}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-gray-800 border border-gray-600"></div>
                                                    <div>
                                                        <div className="font-medium" style={{color: isDark ? 'var(--bg-primary)' : 'var(--text-primary)'}}>Dark Mode</div>
                                                        <div className="text-sm" style={{color: isDark ? 'var(--bg-primary)' : 'var(--text-secondary)'}}>
                                                            Dark theme with purple accents
                                                        </div>
                                                    </div>
                                                </div>
                                                {isDark && (
                                                    <svg className="w-5 h-5" style={{color: 'var(--bg-primary)'}} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>

                                            {/* Light Theme Option */}
                                            <div 
                                                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                                                    !isDark ? 'border-purple-500' : 'border-gray-600 hover:border-gray-500'
                                                }`}
                                                style={{
                                                    backgroundColor: !isDark ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                                    borderColor: !isDark ? 'var(--accent-primary)' : 'var(--border-color)'
                                                }}
                                                onClick={() => isDark && toggleTheme()}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-300"></div>
                                                    <div>
                                                        <div className="font-medium" style={{color: !isDark ? 'var(--bg-primary)' : 'var(--text-primary)'}}>Light Mode</div>
                                                        <div className="text-sm" style={{color: !isDark ? 'var(--bg-primary)' : 'var(--text-secondary)'}}>
                                                            Light theme with purple accents
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isDark && (
                                                    <svg className="w-5 h-5" style={{color: 'var(--bg-primary)'}} fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4" style={{borderTop: '1px solid var(--border-color)'}}>
                                        <div className="text-sm" style={{color: 'var(--text-secondary)'}}>
                                            Your theme preference will be saved and applied across all sessions.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SettingsModal
