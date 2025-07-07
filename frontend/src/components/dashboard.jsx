import { useState, useEffect } from 'react';

export default function Dashboard({ user, onLogout }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeProjects: 0,
        completedTasks: 0,
        pendingTasks: 0
    });

    useEffect(() => {
        // Simulate fetching dashboard data
        setStats({
            totalUsers: 156,
            activeProjects: 12,
            completedTasks: 84,
            pendingTasks: 23
        });
    }, []);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            // Fallback logout
            window.location.reload();
        }
    };

    return (
        <div className="bg-[#221d11] min-h-screen" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
            {/* Header */}
            <header className="bg-[#342c19] border-b border-[#483e23] px-6 py-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-white text-2xl font-bold">FGPT Dashboard</h1>
                        <p className="text-[#caba91] text-sm">Welcome back, {user?.name || 'User'}!</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="bg-[#f4c653] text-[#221d11] px-4 py-2 rounded-xl font-medium hover:bg-[#f4c653]/90 transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="p-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-[#342c19] border border-[#483e23] rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#caba91] text-sm font-medium">Total Users</p>
                                <p className="text-white text-2xl font-bold">{stats.totalUsers}</p>
                            </div>
                            <div className="bg-[#f4c653] p-3 rounded-lg">
                                <svg className="w-6 h-6 text-[#221d11]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#342c19] border border-[#483e23] rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#caba91] text-sm font-medium">Active Projects</p>
                                <p className="text-white text-2xl font-bold">{stats.activeProjects}</p>
                            </div>
                            <div className="bg-[#f4c653] p-3 rounded-lg">
                                <svg className="w-6 h-6 text-[#221d11]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#342c19] border border-[#483e23] rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#caba91] text-sm font-medium">Completed Tasks</p>
                                <p className="text-white text-2xl font-bold">{stats.completedTasks}</p>
                            </div>
                            <div className="bg-[#f4c653] p-3 rounded-lg">
                                <svg className="w-6 h-6 text-[#221d11]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#342c19] border border-[#483e23] rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[#caba91] text-sm font-medium">Pending Tasks</p>
                                <p className="text-white text-2xl font-bold">{stats.pendingTasks}</p>
                            </div>
                            <div className="bg-[#f4c653] p-3 rounded-lg">
                                <svg className="w-6 h-6 text-[#221d11]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-[#342c19] border border-[#483e23] rounded-xl p-6">
                        <h2 className="text-white text-xl font-bold mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            {[
                                { action: "New user registered", time: "2 minutes ago", type: "user" },
                                { action: "Project deployment completed", time: "15 minutes ago", type: "success" },
                                { action: "Database backup created", time: "1 hour ago", type: "info" },
                                { action: "API endpoint updated", time: "2 hours ago", type: "update" },
                                { action: "Security scan completed", time: "3 hours ago", type: "security" }
                            ].map((activity, index) => (
                                <div key={index} className="flex items-center space-x-3 p-3 bg-[#221d11] rounded-lg">
                                    <div className="w-2 h-2 bg-[#f4c653] rounded-full"></div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm">{activity.action}</p>
                                        <p className="text-[#caba91] text-xs">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#342c19] border border-[#483e23] rounded-xl p-6">
                        <h2 className="text-white text-xl font-bold mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <button className="w-full bg-[#f4c653] text-[#221d11] py-3 px-4 rounded-xl font-medium hover:bg-[#f4c653]/90 transition-colors">
                                Create New Project
                            </button>
                            <button className="w-full bg-[#675832] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#675832]/80 transition-colors">
                                View All Users
                            </button>
                            <button className="w-full bg-[#675832] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#675832]/80 transition-colors">
                                Generate Report
                            </button>
                            <button className="w-full bg-[#675832] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#675832]/80 transition-colors">
                                System Settings
                            </button>
                        </div>

                        {/* User Profile Card */}
                        <div className="mt-6 pt-6 border-t border-[#483e23]">
                            <h3 className="text-white font-medium mb-3">Profile</h3>
                            <div className="bg-[#221d11] p-4 rounded-lg">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="w-10 h-10 bg-[#f4c653] rounded-full flex items-center justify-center">
                                        <span className="text-[#221d11] font-bold text-sm">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-white text-sm font-medium">{user?.name || 'User Name'}</p>
                                        <p className="text-[#caba91] text-xs">{user?.email || 'user@example.com'}</p>
                                    </div>
                                </div>
                                <button className="w-full bg-[#483e23] text-white py-2 px-3 rounded-lg text-sm hover:bg-[#483e23]/80 transition-colors">
                                    Edit Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-8 bg-[#342c19] border border-[#483e23] rounded-xl p-4">
                    <div className="flex flex-col md:flex-row justify-between items-center text-[#caba91] text-sm">
                        <p>FGPT Dashboard - Full Stack React Application</p>
                        <p>Last updated: {new Date().toLocaleString()}</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
