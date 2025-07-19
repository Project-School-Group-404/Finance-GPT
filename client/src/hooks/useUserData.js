import { useState, useEffect } from 'react'

function useUserData(user) {
    const [userName, setUserName] = useState('')

    useEffect(() => {
        // Prioritize user prop from parent component
        if (user && user.name) {
            setUserName(user.name);
        } else {
            // Get user data from localStorage as fallback
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUserName(userData.name || userData.username || userData.email || 'User');
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setUserName('User');
                }
            } else {
                // If no stored user, try to fetch from API
                fetchUserData();
            }
        }
    }, [user]);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
            
            if (response.ok) {
                const userData = await response.json();
                setUserName(userData.name || userData.username || userData.email || 'User');
                localStorage.setItem('user', JSON.stringify(userData));
            } else {
                setUserName('User');
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            setUserName('User');
        }
    };

    return { userName, setUserName }
}

export default useUserData
