import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthSuccess() {
    const navigate = useNavigate();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (error) {
            console.error('OAuth authentication failed:', error);
            navigate('/login?error=' + error);
            return;
        }

        if (token) {
            // Store the token
            localStorage.setItem('authToken', token);

            // Fetch user data
            fetch('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    if (data.user) {
                        // Store user data in the same format as the existing app
                        localStorage.setItem('fgpt_user', JSON.stringify(data.user));
                        localStorage.setItem('fgpt_isLoggedIn', 'true');

                        // Redirect to dashboard - this will trigger the app's state update
                        window.location.href = '/dashboard';
                    } else {
                        navigate('/login?error=profile_fetch_failed');
                    }
                })
                .catch(error => {
                    console.error('Error fetching user profile:', error);
                    navigate('/login?error=profile_fetch_failed');
                });
        } else {
            navigate('/login?error=no_token');
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--accent-primary)' }}></div>
                <p style={{ color: 'var(--text-primary)' }}>Completing authentication...</p>
            </div>
        </div>
    );
}
